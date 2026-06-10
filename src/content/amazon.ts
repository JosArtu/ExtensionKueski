import { isAmazonHost } from "./amazon-host";
import { scrapeAmazonProduct, isProductPage } from "./scrape";
import { hideProductBanner, showProductBanner, watchPageNavigation } from "./banner";

const BANNER_ID = "kueski-amazon-banner";

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let domObserver: MutationObserver | null = null;
let tornDown = false;
let lastUrl = "";

console.log("[Kueski Amazon] 🚀 Script loaded on", location.hostname, location.pathname);

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
  return `kueski-banner-dismissed:${location.pathname}`;
}

function updateBanner() {
  if (!isProductPage()) {
    hideProductBanner(BANNER_ID);
    return;
  }

  showProductBanner({
    id: BANNER_ID,
    dismissKey: dismissKey(),
    title: "Beneficios disponibles en Amazon",
    subtitle: "Financia tu compra con 3 meses sin intereses",
  });
}

function reportDetection() {
  if (!isAmazonHost(location.hostname) || !isExtensionContextValid()) {
    teardownContentScript();
    return;
  }

  const product = scrapeAmazonProduct();
  updateBanner();

  try {
    chrome.runtime.sendMessage({
      type: "AMAZON_DETECTED",
      product,
      url: location.href,
      hostname: location.hostname,
    });
  } catch (e) {
    console.warn("[Kueski Amazon] Message error:", e);
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
    if (location.href !== lastUrl) {
      lastUrl = location.href;
    }
    reportDetection();
  }, 500);
}

function init() {
  if (!isAmazonHost(location.hostname)) return;

  lastUrl = location.href;
  reportDetection();

  watchPageNavigation(scheduleDetection);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") scheduleDetection();
  });
  domObserver = new MutationObserver(scheduleDetection);
  domObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

init();
