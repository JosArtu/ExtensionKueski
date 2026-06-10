export interface ScrapedProduct {
  nombre: string;
  precio: number;
  url: string;
}

const FALLBACK_PRICE = 1299;

function parsePrice(text: string): number | null {
  const t = text.replace(/[^\d.,]/g, "");
  const lastDot = t.lastIndexOf(".");
  const lastComma = t.lastIndexOf(",");
  let clean: string;
  if (lastDot > lastComma) {
    // dot is decimal separator → strip commas (e.g. "$1,299.87")
    clean = t.replace(/,/g, "");
  } else if (lastComma > lastDot) {
    // comma is decimal separator → strip dots, replace comma with dot
    clean = t.replace(/\./g, "").replace(",", ".");
  } else {
    clean = t;
  }
  const value = parseFloat(clean);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function pickText(selectors: string[]): string | null {
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    const text = el?.textContent?.trim();
    if (text) return text;
  }
  return null;
}

/** Tries both property="" and name="" meta attributes. */
function pickMeta(...keys: string[]): string | null {
  for (const key of keys) {
    const el =
      document.querySelector(`meta[property="${key}"]`) ??
      document.querySelector(`meta[name="${key}"]`);
    const val = (el as HTMLMetaElement | null)?.content?.trim();
    if (val) return val;
  }
  return null;
}

// ─── Amazon ───────────────────────────────────────────────────────────────────

function pickAmazonPrice(): number | null {
  // Strategy 1: read integer + fraction spans separately — always exact
  const wholeSels = [
    "#corePriceDisplay_desktop_feature_div .a-price-whole",
    "#corePrice_feature_div .a-price-whole",
    ".priceToPay .a-price-whole",
    ".a-price .a-price-whole",
  ];
  const fracSels = [
    "#corePriceDisplay_desktop_feature_div .a-price-fraction",
    "#corePrice_feature_div .a-price-fraction",
    ".priceToPay .a-price-fraction",
    ".a-price .a-price-fraction",
  ];
  for (let i = 0; i < wholeSels.length; i++) {
    const wEl = document.querySelector(wholeSels[i]);
    const fEl = document.querySelector(fracSels[i]);
    if (wEl) {
      // a-price-whole sometimes has a trailing dot/comma — strip it
      const whole = wEl.textContent?.replace(/[.,\s]/g, "").trim();
      const frac = fEl?.textContent?.replace(/[.,\s]/g, "").trim();
      if (whole) {
        const combined = frac ? `${whole}.${frac}` : whole;
        const val = parseFloat(combined);
        if (Number.isFinite(val) && val > 0) return val;
      }
    }
  }

  // Strategy 2: .a-offscreen fallback — skip price ranges (contain " - " or "–")
  const offscreenSels = [
    ".a-price .a-offscreen",
    "#priceblock_ourprice",
    "#corePrice_feature_div .a-offscreen",
    "#corePriceDisplay_desktop_feature_div .a-offscreen",
    ".priceToPay .a-offscreen",
    "#tp_price_block_total_price_ww .a-offscreen",
  ];
  for (const sel of offscreenSels) {
    const els = document.querySelectorAll(sel);
    for (const el of els) {
      const text = el.textContent?.trim();
      if (!text || text.includes(" - ") || text.includes("–")) continue;
      const price = parsePrice(text);
      if (price) return price;
    }
  }
  return null;
}

export function isProductPage(): boolean {
  const path = location.pathname;

  // Amazon — URL patterns and product DOM markers
  if (
    !!document.querySelector("#productTitle") ||
    !!document.querySelector("h1#title") ||
    /\/dp\/[A-Z0-9]{10}/i.test(path) ||
    /\/gp\/product\/[A-Z0-9]{10}/i.test(path) ||
    /\/gp\/aw\/d\/[A-Z0-9]{10}/i.test(path) ||
    !!document.querySelector("#ppd #add-to-cart-button, #addToCart, #buybox")
  ) {
    return true;
  }

  // Costco — product URLs end with /p/<itemNumber>
  if (/\/p\/\d+/.test(path)) return true;

  return false;
}

export function scrapeAmazonProduct(): ScrapedProduct {
  if (/costco\.com/.test(location.hostname)) {
    return scrapeCostcoProduct();
  }

  const title =
    pickText(["#productTitle", "h1#title", "#title"]) ??
    (isProductPage() ? "Producto en Amazon" : "Navegando en Amazon");

  const price = pickAmazonPrice();

  return {
    nombre: title,
    precio: price ?? (isProductPage() ? FALLBACK_PRICE : 0),
    url: location.href,
  };
}

// ─── Costco ───────────────────────────────────────────────────────────────────

function scrapeCostcoProduct(): ScrapedProduct {
  // Title: og:title is in static HTML and already clean ("Product Name | Costco México")
  const rawTitle =
    pickMeta("og:title", "twitter:title") ??
    document.title;
  const nombre = rawTitle.replace(/\s*\|\s*Costco.*$/i, "").trim() || "Producto en Costco";

  // Price: meta tag is in static HTML, no need to wait for Spartacus to render
  const priceRaw =
    pickMeta("product:price:amount", "og:price:amount") ??
    // Spartacus DOM selectors as secondary attempt (may not exist yet)
    pickText([
      "cx-price .value",
      "cx-product-price .value",
      ".price-value",
      "[itemprop='price']",
    ]);

  const precio =
    (priceRaw ? parsePrice(priceRaw) : null) ??
    (isProductPage() ? FALLBACK_PRICE : 0);

  return { nombre, precio, url: location.href };
}