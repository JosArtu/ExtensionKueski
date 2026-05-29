import { isAmazonHost } from "./amazon-host";
import { scrapeAmazonProduct, isProductPage } from "./scrape";

const BANNER_ID = "kueski-amazon-banner";
let lastUrl = "";
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let domObserver: MutationObserver | null = null;
let tornDown = false;

/** Chrome throws when extension was reloaded but this tab still has the old content script. */
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

function reportDetection() {
  if (!isAmazonHost(location.hostname)) return;

  if (!isExtensionContextValid()) {
    teardownContentScript();
    return;
  }

  const product = scrapeAmazonProduct();
  try {
    chrome.runtime.sendMessage(
      {
        type: "AMAZON_DETECTED",
        product,
        url: location.href,
        hostname: location.hostname,
      },
      () => {
        const err = chrome.runtime.lastError;
        if (
          err &&
          (err.message?.includes("invalidated") || err.message?.includes("Invalid"))
        ) {
          teardownContentScript();
        }
      }
    );
  } catch {
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
    if (isProductPage()) showBanner();
  }, 400);
}

function showBanner() {
  if (document.getElementById(BANNER_ID)) return;
  if (sessionStorage.getItem("kueski-banner-dismissed") === "1") return;

  const banner = document.createElement("div");
  banner.id = BANNER_ID;
  banner.setAttribute(
    "style",
    [
      "position:fixed",
      "bottom:16px",
      "right:16px",
      "z-index:2147483646",
      "max-width:280px",
      "padding:12px 14px",
      "border-radius:12px",
      "background:linear-gradient(135deg,#4648e8,#3a3cd4)",
      "color:#fff",
      "font-family:system-ui,sans-serif",
      "font-size:13px",
      "box-shadow:0 8px 24px rgba(70,72,232,.25)",
      "line-height:1.4",
    ].join(";")
  );

  banner.innerHTML = `
    <div style="display:flex;align-items:flex-start;gap:8px;">
      <span style="font-weight:700;">Kueski</span>
      <button type="button" id="kueski-banner-close" aria-label="Cerrar" style="margin-left:auto;background:rgba(255,255,255,.2);border:none;color:#fff;width:24px;height:24px;border-radius:6px;cursor:pointer;font-size:14px;">×</button>
    </div>
    <p style="margin:8px 0 0;">Promoción disponible en Amazon. Abre la extensión Kueski Pay.</p>
  `;

  document.body.appendChild(banner);
  document.getElementById("kueski-banner-close")?.addEventListener("click", () => {
    sessionStorage.setItem("kueski-banner-dismissed", "1");
    banner.remove();
  });
}

function init() {
  if (!isAmazonHost(location.hostname)) return;

  if (!isExtensionContextValid()) {
    teardownContentScript();
    return;
  }

  lastUrl = location.href;
  reportDetection();
  if (isProductPage()) showBanner();

  window.addEventListener("pageshow", scheduleDetection);
  domObserver = new MutationObserver(scheduleDetection);
  domObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

init();
