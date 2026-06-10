import { isCostcoHost } from "./costco-host";
import { scrapeAmazonProduct, isProductPage } from "./scrape";
import { hideProductBanner, showProductBanner, watchPageNavigation } from "./banner";

const BANNER_ID = "kueski-costco-banner";

let lastUrl = "";
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let domObserver: MutationObserver | null = null;
let tornDown = false;

console.log("[Kueski Costco] 🚀 Script loaded on", location.hostname, location.pathname);

function isExtensionContextValid(): boolean {
  try {
    return typeof chrome !== "undefined" && !!chrome.runtime?.id;
  } catch {
    return false;
  }
}

function teardownContentScript() {
  if (tornDown) return;
  tornDown = true;
  domObserver?.disconnect();
  domObserver = null;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = null;
}

function dismissKey() {
  return `kueski-costco-banner-dismissed:${location.pathname}`;
}

function updateBanner() {
  if (!isProductPage()) {
    hideProductBanner(BANNER_ID);
    return;
  }

  showProductBanner({
    id: BANNER_ID,
    dismissKey: dismissKey(),
    title: "Beneficios disponibles en Costco",
    subtitle: "Financia tu compra con 3 meses sin intereses",
  });
}

function reportDetection() {
  if (!isCostcoHost(location.hostname)) {
    return;
  }
  if (!isExtensionContextValid()) {
    teardownContentScript();
    return;
  }

  const product = scrapeAmazonProduct();
  updateBanner();

  try {
    chrome.runtime.sendMessage(
      {
        type: "COSTCO_DETECTED",
        product,
        url: location.href,
        hostname: location.hostname,
      },
      (response) => {
        const err = chrome.runtime.lastError;
        if (err) {
          console.warn("[Kueski Costco] sendMessage error:", err.message);
          if (err.message?.includes("invalidated") || err.message?.includes("Invalid")) {
            teardownContentScript();
          }
        } else {
          console.log("[Kueski Costco] ✅ Message sent, response:", response);
        }
      }
    );
  } catch (e) {
    console.error("[Kueski Costco] sendMessage threw:", e);
    teardownContentScript();
  }
}

function scheduleDetection() {
  if (tornDown || !isExtensionContextValid()) {
    teardownContentScript();
    return;
  }
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (tornDown) return;
    if (location.href !== lastUrl) {
      lastUrl = location.href;
    }
    reportDetection();
  }, 400);
}

function init() {
  if (!isCostcoHost(location.hostname)) return;
  if (!isExtensionContextValid()) {
    teardownContentScript();
    return;
  }

  lastUrl = location.href;
  reportDetection();

  watchPageNavigation(scheduleDetection);
  domObserver = new MutationObserver(scheduleDetection);
  domObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

init();
