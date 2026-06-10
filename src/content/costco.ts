import { isCostcoHost } from "./costco-host";
import { scrapeAmazonProduct, isProductPage } from "./scrape";

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

function reportDetection() {
  console.log("[Kueski Costco] reportDetection() called");
  console.log("[Kueski Costco] isCostcoHost:", isCostcoHost(location.hostname));
  console.log("[Kueski Costco] isExtensionContextValid:", isExtensionContextValid());

  if (!isCostcoHost(location.hostname)) {
    console.warn("[Kueski Costco] ❌ Host not recognized:", location.hostname);
    return;
  }
  if (!isExtensionContextValid()) {
    teardownContentScript();
    return;
  }

  const product = scrapeAmazonProduct();
  console.log("[Kueski Costco] 🛒 Scraped product:", product);

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
    if (isProductPage()) showBanner();
  }, 400);
}

function showBanner() {
  console.log("[Kueski Costco] showBanner() called");
  if (document.getElementById(BANNER_ID)) {
    console.log("[Kueski Costco] Banner already exists, skipping");
    return;
  }
  if (sessionStorage.getItem("kueski-costco-banner-dismissed") === "1") {
    console.log("[Kueski Costco] Banner dismissed, skipping");
    return;
  }

  const iconUrl = chrome.runtime.getURL("icons/icon48.png");
  const banner = document.createElement("div");
  banner.id = BANNER_ID;
  banner.setAttribute(
    "style",
    [
      "position:fixed",
      "top:16px",
      "right:16px",
      "z-index:2147483646",
      "max-width:300px",
      "background:linear-gradient(135deg,#4648e8,#3a3cd4)",
      "border-radius:14px",
      "font-family:system-ui,sans-serif",
      "font-size:13px",
      "box-shadow:0 8px 24px rgba(70,72,232,.35)",
      "overflow:hidden",
      "line-height:1.4",
      "color:#fff",
      "opacity:0",
      "transform:translateX(20px)",
      "transition:opacity 0.3s ease, transform 0.3s ease",
    ].join(";")
  );

  banner.innerHTML = `
    <div style="padding:14px 14px 12px;">
      <div style="display:flex;align-items:flex-start;gap:10px;">
        <img src="${iconUrl}" width="36" height="36" style="border-radius:8px;flex-shrink:0;background:rgba(255,255,255,.15);" />
        <div style="flex:1;min-width:0;">
          <p style="margin:0;font-weight:700;color:#fff;font-size:13px;">Beneficios disponibles en Costco</p>
          <p style="margin:4px 0 0;color:rgba(255,255,255,.85);font-size:12px;">Financia tu compra con 3 meses sin intereses</p>
        </div>
        <button type="button" id="kueski-costco-banner-close" aria-label="Cerrar" style="flex-shrink:0;background:rgba(255,255,255,.2);border:none;color:#fff;width:22px;height:22px;border-radius:6px;cursor:pointer;font-size:14px;line-height:1;padding:0;">×</button>
      </div>
      <p style="margin:10px 0 0;font-size:12px;color:rgba(255,255,255,.8);">Abre la extensión Kueski Pay para ver tu oferta.</p>
    </div>
  `;

  document.body.appendChild(banner);
  requestAnimationFrame(() => {
    banner.style.opacity = "1";
    banner.style.transform = "translateX(0)";
  });
  document.getElementById("kueski-costco-banner-close")?.addEventListener("click", () => {
    sessionStorage.setItem("kueski-costco-banner-dismissed", "1");
    banner.remove();
  });
}

function init() {
  console.log("[Kueski Costco] init() called, hostname:", location.hostname);

  if (!isCostcoHost(location.hostname)) {
    console.warn("[Kueski Costco] ❌ Not a Costco host, aborting. hostname:", location.hostname);
    return;
  }
  if (!isExtensionContextValid()) {
    console.warn("[Kueski Costco] ❌ Extension context invalid");
    teardownContentScript();
    return;
  }

  console.log("[Kueski Costco] ✅ Initializing on", location.href);
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