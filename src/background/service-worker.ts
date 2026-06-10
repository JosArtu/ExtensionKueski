const AMAZON_SESSION_KEY = "amazonSession";
const COSTCO_SESSION_KEY = "costcoSession";
const SESSION_TTL_MS = 30 * 60 * 1000;

interface StoredSession {
  detected: boolean;
  product: { nombre: string; precio: number; url: string };
  url: string;
  hostname: string;
  at: number;
}

function isSessionValid(session: StoredSession | null | undefined): boolean {
  if (!session?.detected) return false;
  return Date.now() - session.at < SESSION_TTL_MS;
}

async function getSession(key: string): Promise<StoredSession | null> {
  const data = await chrome.storage.local.get(key);
  const session = data[key] as StoredSession | undefined;
  if (isSessionValid(session)) return session ?? null;
  if (session) await chrome.storage.local.remove(key);
  return null;
}

async function setSession(key: string, session: StoredSession): Promise<void> {
  await chrome.storage.local.set({ [key]: session });
}

function debugLog(
  location: string,
  message: string,
  data: Record<string, unknown>,
  hypothesisId: string
): void {
  // #region agent log
  fetch("http://127.0.0.1:7886/ingest/5ef5ffa8-2bf4-4ad7-84e0-911796d4af42", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "d50a65" },
    body: JSON.stringify({
      sessionId: "d50a65",
      runId: "post-fix-v2",
      location,
      message,
      data,
      timestamp: Date.now(),
      hypothesisId,
    }),
  }).catch(() => {});
  // #endregion
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    try {
      console.log("[Service Worker] Message received:", message.type);
      
      switch (message.type) {
        case "AMAZON_DETECTED": {
          console.log("[Service Worker] Storing Amazon session:", message.product);
          await chrome.storage.local.remove(COSTCO_SESSION_KEY);
          await setSession(AMAZON_SESSION_KEY, {
            detected: true,
            product: message.product,
            url: message.url,
            hostname: message.hostname,
            at: Date.now(),
          });
          debugLog(
            "service-worker.ts:AMAZON_DETECTED",
            "amazon stored, costco cleared",
            { url: message.url },
            "B"
          );
          console.log("[Service Worker] ✅ Amazon session stored");
          sendResponse({ ok: true });
          break;
        }
        case "COSTCO_DETECTED": {
          console.log("[Service Worker] Storing Costco session:", message.product);
          await chrome.storage.local.remove(AMAZON_SESSION_KEY);
          await setSession(COSTCO_SESSION_KEY, {
            detected: true,
            product: message.product,
            url: message.url,
            hostname: message.hostname,
            at: Date.now(),
          });
          debugLog(
            "service-worker.ts:COSTCO_DETECTED",
            "costco stored, amazon cleared",
            { url: message.url },
            "B"
          );
          console.log("[Service Worker] ✅ Costco session stored");
          sendResponse({ ok: true });
          break;
        }
        case "GET_AMAZON_SESSION": {
          const session = await getSession(AMAZON_SESSION_KEY);
          console.log("[Service Worker] GET_AMAZON_SESSION:", session);
          sendResponse({ ok: true, session });
          break;
        }
        case "GET_COSTCO_SESSION": {
          const session = await getSession(COSTCO_SESSION_KEY);
          console.log("[Service Worker] GET_COSTCO_SESSION:", session);
          sendResponse({ ok: true, session });
          break;
        }
        case "CLEAR_AMAZON_SESSION": {
          await chrome.storage.local.remove(AMAZON_SESSION_KEY);
          console.log("[Service Worker] Amazon session cleared");
          sendResponse({ ok: true });
          break;
        }
        case "CLEAR_COSTCO_SESSION": {
          await chrome.storage.local.remove(COSTCO_SESSION_KEY);
          console.log("[Service Worker] Costco session cleared");
          sendResponse({ ok: true });
          break;
        }
        default:
          console.warn("[Service Worker] Unknown message type:", message.type);
          sendResponse({ ok: false, error: "Unknown message type" });
      }
    } catch (e) {
      console.error("[Service Worker] Error:", e);
      sendResponse({ ok: false, error: e instanceof Error ? e.message : "Background error" });
    }
  })();
  return true; // keep channel open for async response
});
