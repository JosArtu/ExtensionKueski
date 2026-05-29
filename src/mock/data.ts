import type { AmazonProduct, UserProfile } from "../types";

export const AMAZON_STORE = {
  nombre: "Amazon",
  dominio: "amazon.com.mx",
  logo: "🛒",
} as const;

export const AMAZON_PRODUCT: AmazonProduct = {
  nombre: "Echo Dot (5.ª gen) — Altavoz inteligente",
  precio: 1299,
  url: "https://www.amazon.com.mx/dp/example-echo-dot",
};

export const HIGH_PRICE_PRODUCT: AmazonProduct = {
  nombre: "MacBook Air M3 15\" — 24 GB RAM",
  precio: 38999,
  url: "https://www.amazon.com.mx/dp/example-macbook",
};

export const CREDIT_LIMIT = 15000;

export const ACTIVE_OFFER = {
  titulo: "3 meses sin intereses",
  mesesSinInteres: 3,
  tasaInteres: 0,
  tasaEstimadaConInteres: 28.9,
  montoFinanciableMax: 15000,
  validoHasta: "2026-06-30",
};

export const COMPATIBLE_STORES = [
  { nombre: "Amazon", dominio: "amazon.com.mx", activa: true },
  { nombre: "AliExpress", dominio: "aliexpress.com", activa: false },
  { nombre: "Mercado Libre", dominio: "mercadolibre.com.mx", activa: false },
];

export const PROMOTIONS = [
  { id: "1", titulo: "3 MSI en Amazon", tienda: "Amazon", activa: true },
  { id: "2", titulo: "Envío gratis + Kueski", tienda: "Amazon", activa: true },
];

export const NEXT_PROMO_SUGGESTION = {
  titulo: "6 MSI en electrónicos",
  tienda: "Amazon",
  vigencia: "Próximos 15 días",
};

export function createUser(correo = "usuario@email.com"): UserProfile {
  return {
    id: "u-1",
    nombre: "Usuario",
    apellidos: "Kueski",
    correo,
    creditoDisponible: CREDIT_LIMIT,
  };
}

export const CARD_MOCK = {
  numero: "4532 8801 2294 7816",
  cvv: "482",
  exp: "05/26",
  titular: "KUESKI DIGITAL",
};

export function formatMXN(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateSimulation(
  monto: number,
  numPagos: number,
  sinInteres: boolean
): { pagoMensual: number; total: number } {
  if (sinInteres && numPagos <= ACTIVE_OFFER.mesesSinInteres) {
    const pagoMensual = Math.ceil(monto / numPagos);
    return { pagoMensual, total: monto };
  }
  const rate = ACTIVE_OFFER.tasaEstimadaConInteres / 100 / 12;
  const total = monto * Math.pow(1 + rate, numPagos);
  const pagoMensual = Math.ceil(total / numPagos);
  return { pagoMensual, total: Math.round(total) };
}
