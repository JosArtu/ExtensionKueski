import type { AmazonSession } from "./messages";
import type { ExtensionMessage, ExtensionResponse } from "./messages";

export function isExtensionContext(): boolean {
  return (
    typeof chrome !== "undefined" &&
    typeof chrome.runtime !== "undefined" &&
    !!chrome.runtime.id
  );
}

export function sendExtensionMessage<T extends ExtensionMessage>(
  message: T
): Promise<ExtensionResponse> {
  return new Promise((resolve) => {
    if (!isExtensionContext()) {
      resolve({ ok: false, error: "Not in extension context" });
      return;
    }
    chrome.runtime.sendMessage(message, (response: ExtensionResponse) => {
      if (chrome.runtime.lastError) {
        resolve({ ok: false, error: chrome.runtime.lastError.message ?? "Unknown error" });
        return;
      }
      resolve(response ?? { ok: false, error: "No response" });
    });
  });
}

export async function getAmazonSession(): Promise<AmazonSession | null> {
  const res = await sendExtensionMessage({ type: "GET_AMAZON_SESSION" });
  if (res.ok && "session" in res) return res.session;
  return null;
}

export async function clearAmazonSession(): Promise<void> {
  await sendExtensionMessage({ type: "CLEAR_AMAZON_SESSION" });
}
