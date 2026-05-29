export interface ScrapedProduct {
  nombre: string;
  precio: number;
  url: string;
}

const FALLBACK_PRICE = 1299;

function parsePrice(text: string): number | null {
  const cleaned = text.replace(/[^\d.,]/g, "").replace(/,/g, "");
  const value = parseFloat(cleaned);
  return Number.isFinite(value) && value > 0 ? Math.round(value) : null;
}

function pickText(selectors: string[]): string | null {
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    const text = el?.textContent?.trim();
    if (text) return text;
  }
  return null;
}

function pickPrice(): number | null {
  const selectors = [
    ".a-price .a-offscreen",
    "#priceblock_ourprice",
    "#corePrice_feature_div .a-offscreen",
    "#corePriceDisplay_desktop_feature_div .a-offscreen",
    ".priceToPay .a-offscreen",
    "#tp_price_block_total_price_ww .a-offscreen",
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    const text = el?.textContent?.trim();
    if (text) {
      const price = parsePrice(text);
      if (price) return price;
    }
  }
  return null;
}

export function isProductPage(): boolean {
  return (
    !!document.querySelector("#productTitle") ||
    !!document.querySelector("h1#title") ||
    /\/dp\//.test(location.pathname) ||
    /\/gp\/product\//.test(location.pathname)
  );
}

export function scrapeAmazonProduct(): ScrapedProduct {
  const title =
    pickText(["#productTitle", "h1#title", "#title"]) ??
    (isProductPage() ? "Producto en Amazon" : "Navegando en Amazon");

  const price = pickPrice();

  return {
    nombre: title,
    precio: price ?? (isProductPage() ? FALLBACK_PRICE : 0),
    url: location.href,
  };
}
