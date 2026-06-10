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

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    try {
      switch (message.type) {
        case "AMAZON_DETECTED": {
          await setSession(AMAZON_SESSION_KEY, {
            detected: true,
            product: message.product,
            url: message.url,
            hostname: message.hostname,
            at: Date.now(),
          });
          sendResponse({ ok: true });
          break;
        }
        case "COSTCO_DETECTED": {
          await setSession(COSTCO_SESSION_KEY, {
            detected: true,
            product: message.product,
            url: message.url,
            hostname: message.hostname,
            at: Date.now(),
          });
          sendResponse({ ok: true });
          break;
        }
        case "GET_AMAZON_SESSION": {
          const session = await getSession(AMAZON_SESSION_KEY);
          sendResponse({ ok: true, session });
          break;
        }
        case "GET_COSTCO_SESSION": {
          const session = await getSession(COSTCO_SESSION_KEY);
          sendResponse({ ok: true, session });
          break;
        }
        case "CLEAR_AMAZON_SESSION": {
          await chrome.storage.local.remove(AMAZON_SESSION_KEY);
          sendResponse({ ok: true });
          break;
        }
        case "CLEAR_COSTCO_SESSION": {
          await chrome.storage.local.remove(COSTCO_SESSION_KEY);
          sendResponse({ ok: true });
          break;
        }
        default:
          sendResponse({ ok: false, error: "Unknown message type" });
      }
    } catch (e) {
      sendResponse({ ok: false, error: e instanceof Error ? e.message : "Background error" });
    }
  })();
  return true; // keep channel open for async response
});