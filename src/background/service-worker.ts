const STORAGE_KEY = "amazonSession";
const SESSION_TTL_MS = 30 * 60 * 1000;

interface AmazonProduct {
  nombre: string;
  precio: number;
  url: string;
}

interface AmazonSession {
  detected: boolean;
  product: AmazonProduct;
  url: string;
  hostname: string;
  at: number;
}

type ExtensionMessage =
  | {
      type: "AMAZON_DETECTED";
      product: AmazonProduct;
      url: string;
      hostname: string;
    }
  | { type: "GET_AMAZON_SESSION" }
  | { type: "CLEAR_AMAZON_SESSION" };

type ExtensionResponse =
  | { ok: true; session: AmazonSession | null }
  | { ok: true }
  | { ok: false; error: string };

function isSessionValid(session: AmazonSession | null | undefined): boolean {
  if (!session?.detected) return false;
  return Date.now() - session.at < SESSION_TTL_MS;
}

async function getStoredSession(): Promise<AmazonSession | null> {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  const session = data[STORAGE_KEY] as AmazonSession | undefined;
  if (!isSessionValid(session)) {
    if (session) await chrome.storage.local.remove(STORAGE_KEY);
    return null;
  }
  return session ?? null;
}

async function saveSession(session: AmazonSession): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: session });
}

chrome.runtime.onMessage.addListener(
  (
    message: ExtensionMessage,
    _sender,
    sendResponse: (response: ExtensionResponse) => void
  ) => {
    (async () => {
      try {
        if (message.type === "AMAZON_DETECTED") {
          const session: AmazonSession = {
            detected: true,
            product: message.product,
            url: message.url,
            hostname: message.hostname,
            at: Date.now(),
          };
          await saveSession(session);
          sendResponse({ ok: true });
          return;
        }

        if (message.type === "GET_AMAZON_SESSION") {
          const session = await getStoredSession();
          sendResponse({ ok: true, session });
          return;
        }

        if (message.type === "CLEAR_AMAZON_SESSION") {
          await chrome.storage.local.remove(STORAGE_KEY);
          sendResponse({ ok: true });
          return;
        }

        sendResponse({ ok: false, error: "Unknown message type" });
      } catch (e) {
        sendResponse({
          ok: false,
          error: e instanceof Error ? e.message : "Background error",
        });
      }
    })();

    return true;
  }
);
