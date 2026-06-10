import { isAmazonHost } from "./amazon-host";
import { scrapeAmazonProduct, isProductPage } from "./scrape";

const BANNER_ID = "kueski-amazon-banner";

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let domObserver: MutationObserver | null = null;
let tornDown = false;

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

function showBanner() {
  if (document.getElementById(BANNER_ID)) return;
  if (sessionStorage.getItem("kueski-banner-dismissed") === "1") return;

  const iconUrl = chrome.runtime.getURL("icons/icon48.png");
  const banner = document.createElement("div");
  banner.id = BANNER_ID;
  banner.setAttribute(
    "style",
    [
      "position:fixed", "top:16px", "right:16px", "z-index:2147483646",
      "max-width:300px", "background:linear-gradient(135deg,#4648e8,#3a3cd4)",
      "border-radius:14px", "font-family:system-ui,sans-serif", "font-size:13px",
      "box-shadow:0 8px 24px rgba(70,72,232,.35)", "overflow:hidden",
      "line-height:1.4", "color:#fff", "opacity:0", "transform:translateX(20px)",
      "transition:opacity 0.3s ease, transform 0.3s ease"
    ].join(";")
  );

  banner.innerHTML = `
    <div style="padding:14px 14px 12px;">
      <div style="display:flex;align-items:flex-start;gap:10px;">
        <img src="${iconUrl}" width="36" height="36" style="border-radius:8px;flex-shrink:0;background:rgba(255,255,255,.15);" />
        <div style="flex:1;min-width:0;">
          <p style="margin:0;font-weight:700;color:#fff;font-size:13px;">Beneficios disponibles en Amazon</p>
          <p style="margin:4px 0 0;color:rgba(255,255,255,.85);font-size:12px;">Financia tu compra con 3 meses sin intereses</p>
        </div>
        <button type="button" id="kueski-banner-close" aria-label="Cerrar" style="flex-shrink:0;background:rgba(255,255,255,.2);border:none;color:#fff;width:22px;height:22px;border-radius:6px;cursor:pointer;font-size:14px;line-height:1;padding:0;">×</button>
      </div>
      <p style="margin:10px 0 0;font-size:12px;color:rgba(255,255,255,.8);">Abre la extensión Kueski Pay para ver tu oferta.</p>
    </div>
  `;

  document.body.appendChild(banner);
  requestAnimationFrame(() => {
    banner.style.opacity = "1";
    banner.style.transform = "translateX(0)";
  });
  
  document.getElementById("kueski-banner-close")?.addEventListener("click", () => {
    sessionStorage.setItem("kueski-banner-dismissed", "1");
    banner.remove();
  });
}

function reportDetection() {
  if (!isAmazonHost(location.hostname) || !isExtensionContextValid()) {
    teardownContentScript();
    return;
  }

  const product = scrapeAmazonProduct();
  
  if (isProductPage()) {
    showBanner();
  }

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
    reportDetection();
  }, 500);
}

function init() {
  if (!isAmazonHost(location.hostname)) return;
  
  reportDetection();

  domObserver = new MutationObserver(scheduleDetection);
  domObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

init();