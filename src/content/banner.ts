export interface ProductBannerOptions {
  id: string;
  dismissKey: string;
  title: string;
  subtitle: string;
}

function whenBodyReady(run: () => void) {
  if (document.body) {
    run();
    return;
  }
  const observer = new MutationObserver(() => {
    if (document.body) {
      observer.disconnect();
      run();
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

export function showProductBanner(options: ProductBannerOptions) {
  if (document.getElementById(options.id)) return;
  if (sessionStorage.getItem(options.dismissKey) === "1") return;

  const iconUrl = chrome.runtime.getURL("icons/icon48.png");
  const banner = document.createElement("div");
  banner.id = options.id;
  banner.setAttribute(
    "style",
    [
      "position:fixed",
      "bottom:16px",
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
      "transform:translateY(20px)",
      "transition:opacity 0.3s ease, transform 0.3s ease",
    ].join(";")
  );

  const closeId = `${options.id}-close`;
  banner.innerHTML = `
    <div style="padding:14px 14px 12px;">
      <div style="display:flex;align-items:flex-start;gap:10px;">
        <img src="${iconUrl}" width="36" height="36" style="border-radius:8px;flex-shrink:0;background:rgba(255,255,255,.15);" />
        <div style="flex:1;min-width:0;">
          <p style="margin:0;font-weight:700;color:#fff;font-size:13px;">${options.title}</p>
          <p style="margin:4px 0 0;color:rgba(255,255,255,.85);font-size:12px;">${options.subtitle}</p>
        </div>
        <button type="button" id="${closeId}" aria-label="Cerrar" style="flex-shrink:0;background:rgba(255,255,255,.2);border:none;color:#fff;width:22px;height:22px;border-radius:6px;cursor:pointer;font-size:14px;line-height:1;padding:0;">×</button>
      </div>
      <p style="margin:10px 0 0;font-size:12px;color:rgba(255,255,255,.8);">Abre la extensión Kueski Pay para ver tu oferta.</p>
    </div>
  `;

  whenBodyReady(() => {
    if (document.getElementById(options.id)) return;
    document.body.appendChild(banner);
    requestAnimationFrame(() => {
      banner.style.opacity = "1";
      banner.style.transform = "translateY(0)";
    });
    document.getElementById(closeId)?.addEventListener("click", () => {
      sessionStorage.setItem(options.dismissKey, "1");
      banner.remove();
    });
  });
}

export function hideProductBanner(id: string) {
  document.getElementById(id)?.remove();
}

export function watchPageNavigation(onNavigate: () => void) {
  window.addEventListener("popstate", onNavigate);
  window.addEventListener("pageshow", onNavigate);

  const wrap =
    (original: History["pushState"]) =>
    (...args: Parameters<History["pushState"]>) => {
      original.apply(history, args);
      onNavigate();
    };

  history.pushState = wrap(history.pushState.bind(history));
  history.replaceState = wrap(history.replaceState.bind(history));
}
