import { createClient } from "@supabase/supabase-js";
import type { AmazonProduct, UserProfile } from "../types";

// ─── Supabase client ───────────────────────────────────────────────────────────
const supabase = createClient(
  "https://ydldbyqxcznrgrroxxdl.supabase.co",
  // Usando la connection string como referencia; para el JS client se necesita la anon/service key.
  // Reemplaza por tu Service Role Key de Supabase → Settings > API
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "sb_publishable_JFGwgPM0uok9ix9vZGmEoA_FaImHo4u"
);

// Initialize Supabase connection on extension load
console.log('🚀 Extension loading...');

const { data: usuario, error } = await supabase
  .from('usuario')
  .select('*');

if (error) {
  console.error('❌ Supabase connection failed:', error.message);
} else {
  console.log('✅ Supabase connected! Usuarios table:');
  console.table(usuario);
}

// ─── AMAZON_STORE ──────────────────────────────────────────────────────────────
const { data: amazonStoreRows } = await supabase
  .from("tienda")
  .select("*")
  .ilike("nombre", "amazon")
  .limit(1);

const amazonStoreData = amazonStoreRows?.[0] ?? null;

export const AMAZON_STORE = amazonStoreData ?? {
  nombre: "Amazon",
  dominio: "amazon.com.mx",
  logo: "🛒",
};

// ─── COSTCO_STORE ──────────────────────────────────────────────────────────────
const { data: costcoStoreRows } = await supabase
  .from("tienda")
  .select("*")
  .ilike("nombre", "costco")
  .limit(1);

const costcoStoreData = costcoStoreRows?.[0] ?? null;

export const COSTCO_STORE = costcoStoreData ?? {
  nombre: "Costco",
  dominio: "costco.com.mx",
  logo: "🏪",
};
// ─── AMAZON_PRODUCT ────────────────────────────────────────────────────────────
const amazonTiendaId: number = amazonStoreData?.id_tienda ?? 2;

const { data: amazonProductRows } = await supabase
  .from("producto")
  .select("*")
  .eq("id_tienda", amazonTiendaId)
  .limit(1);

const amazonProductData = amazonProductRows?.[0] ?? null;

export const AMAZON_PRODUCT: AmazonProduct = amazonProductData
  ? {
      nombre: amazonProductData.nombre,
      precio: amazonProductData.precio,
      url: amazonProductData.url_producto,
    }
  : {
      nombre: "Echo Dot (5.ª gen) — Altavoz inteligente",
      precio: 1299,
      url: "https://www.amazon.com.mx/dp/example-echo-dot",
    };

// ─── HIGH_PRICE_PRODUCT ────────────────────────────────────────────────────────
const { data: highPriceRows } = await supabase
  .from("producto")
  .select("*")
  .gt("precio", 10000)
  .limit(1);

const highPriceData = highPriceRows?.[0] ?? null;

export const HIGH_PRICE_PRODUCT: AmazonProduct = highPriceData
  ? {
      nombre: highPriceData.nombre,
      precio: highPriceData.precio,
      url: highPriceData.url_producto,
    }
  : {
      nombre: 'MacBook Air M3 15" — 24 GB RAM',
      precio: 38999,
      url: "https://www.amazon.com.mx/dp/example-macbook",
    };

// ─── CREDIT_LIMIT + primer usuario ────────────────────────────────────────────
const { data: firstUserRows } = await supabase
  .from("usuario")
  .select("id_usuario, nombre, apellidos, correo, limite_de_credito")
  .limit(1);

const firstUserData = firstUserRows?.[0] ?? null;

export const CREDIT_LIMIT: number = firstUserData?.limite_de_credito ?? 15000;

// ─── ACTIVE_OFFER ─────────────────────────────────────────────────────────────
// Oferta estándar: tipo=1, estado=true, meses_sin_intereses=3
const { data: activeOfferRows } = await supabase
  .from("oferta")
  .select("*")
  .eq("tipo", 1)
  .eq("estado", true)
  .eq("meses_sin_intereses", 3)
  .limit(1);

const activeOfferData = activeOfferRows?.[0] ?? null;

export const ACTIVE_OFFER = activeOfferData
  ? {
      titulo: activeOfferData.nombre,
      mesesSinInteres: activeOfferData.meses_sin_intereses,
      tasaInteres: activeOfferData.tasa_intereses,
      // La columna es integer en BD; si el valor es entero lo usamos tal cual
      // para cálculos (diferencia mínima vs 28.9%)
      tasaEstimadaConInteres: Number(activeOfferData.tasa_estimada_con_intereses),
      montoFinanciableMax: activeOfferData.monto_financiable_max,
      validoHasta: activeOfferData.fecha_fin,
    }
  : {
      titulo: "3 meses sin intereses",
      mesesSinInteres: 3,
      tasaInteres: 0,
      tasaEstimadaConInteres: 28.9,
      montoFinanciableMax: 15000,
      validoHasta: "2026-06-30",
    };


// ─── getOrCreatePremiumOffer ──────────────────────────────────────────────────
// Busca en BD la oferta premium (tipo=1, 12 MSI).
// Si no existe, devuelve valores en memoria (sin INSERT —
// id_oferta no tiene secuencia automática en esta BD).
export async function getOrCreatePremiumOffer() {
  const { data: existing } = await supabase
    .from("oferta")
    .select("*")
    .eq("tipo", 1)
    .eq("meses_sin_intereses", 12)
    .eq("estado", true)
    .limit(1);

  if (existing && existing.length > 0) {
    const o = existing[0];
    return {
      titulo: o.nombre,
      mesesSinInteres: o.meses_sin_intereses,
      tasaInteres: o.tasa_intereses,
      tasaEstimadaConInteres: Number(o.tasa_estimada_con_intereses),
      montoFinanciableMax: o.monto_financiable_max,
      validoHasta: o.fecha_fin,
    };
  }

  // Oferta no existe en BD → usar valores en memoria
  console.warn("⚠️ Oferta premium no encontrada en BD, usando valores por defecto.");
  return {
    titulo: "12 meses sin intereses",
    mesesSinInteres: 12,
    tasaInteres: 0,
    tasaEstimadaConInteres: 28.9,
    montoFinanciableMax: 50000,
    validoHasta: "2026-12-31",
  };
}
// ─── getActiveOfferForUser ────────────────────────────────────────────────────
// Devuelve la oferta correcta según el tipo_usuario:
//   "premium"  → oferta de 12 MSI (crea en BD si no existe)
//   "standard" → ACTIVE_OFFER estándar (3 MSI)
export async function getActiveOfferForUser(tipoUsuario: string) {
  if (tipoUsuario === "premium") {
    return getOrCreatePremiumOffer();
  }
  return ACTIVE_OFFER;
}

// ─── COMPATIBLE_STORES ────────────────────────────────────────────────────────
// Tiendas con compatibilidad_kueski = true
const { data: compatibleStoresData } = await supabase
  .from("tienda")
  .select("*")
  .eq("compatibilidad_kueski", true);

export const COMPATIBLE_STORES =
  compatibleStoresData && compatibleStoresData.length > 0
    ? compatibleStoresData.map((t) => ({
        nombre: t.nombre,
        dominio: t.dominio,
        url: `https://${t.dominio}`,
        activa: t.estado,
      }))
    : [
        { nombre: "Amazon", dominio: "amazon.com.mx", url: "https://amazon.com.mx", activa: true },
        { nombre: "AliExpress", dominio: "aliexpress.com", url: "https://aliexpress.com", activa: false },
        {
          nombre: "Mercado Libre",
          dominio: "mercadolibre.com.mx",
          url: "https://mercadolibre.com.mx",
          activa: false,
        },
      ];

// ─── PROMOTIONS ───────────────────────────────────────────────────────────────
// Primeras 2 ofertas con tipo = 2 y estado = true
const { data: promotionsData } = await supabase
  .from("oferta")
  .select("*")
  .eq("tipo", 2)
  .eq("estado", true)
  .limit(2);

export const PROMOTIONS =
  promotionsData && promotionsData.length > 0
    ? promotionsData.map((p) => ({
        id: String(p.id_oferta),
        titulo: p.nombre,
        tienda: "Amazon",
        activa: p.estado,
      }))
    : [
        { id: "1", titulo: "3 MSI en Amazon", tienda: "Amazon", activa: true },
        {
          id: "2",
          titulo: "Envío gratis + Kueski",
          tienda: "Amazon",
          activa: true,
        },
      ];

// ─── NEXT_PROMO_SUGGESTION ────────────────────────────────────────────────────
const { data: nextPromoRows } = await supabase
  .from("oferta")
  .select("*")
  .eq("tipo", 2)
  .eq("estado", true)
  .range(2, 2);

const nextPromoData = nextPromoRows?.[0] ?? null;

export const NEXT_PROMO_SUGGESTION = nextPromoData
  ? {
      titulo: nextPromoData.nombre,
      tienda: "Amazon",
      vigencia: nextPromoData.fecha_fin
        ? `Hasta ${nextPromoData.fecha_fin}`
        : "Próximos 15 días",
    }
  : {
      titulo: "6 MSI en electrónicos",
      tienda: "Amazon",
      vigencia: "Próximos 15 días",
    };

// ─── createUser ───────────────────────────────────────────────────────────────
// Primer usuario de la BD; creditoDisponible = CREDIT_LIMIT
export function createUser(correo = "usuario@email.com"): UserProfile {
  return {
    id: firstUserData ? String(firstUserData.id_usuario ?? "u-1") : "u-1",
    nombre: firstUserData?.nombre ?? "Usuario",
    apellidos: firstUserData?.apellidos ?? "Kueski",
    correo: firstUserData?.correo ?? correo,
    creditoDisponible: CREDIT_LIMIT,
  };
}

// ─── updateUserCredit ─────────────────────────────────────────────────────────
// Actualiza el limite_de_credito del usuario en Supabase tras una compra.
export async function updateUserCredit(userId: string, newCredit: number): Promise<void> {
  const { error } = await supabase
    .from("usuario")
    .update({ limite_de_credito: newCredit })
    .eq("id_usuario", userId);

  if (error) {
    console.error("❌ Error actualizando crédito:", error.message);
  } else {
    console.log(`✅ Crédito actualizado → $${newCredit} para usuario ${userId}`);
  }
}

// ─── CARD_MOCK — sin modificar ────────────────────────────────────────────────
export const CARD_MOCK = {
  numero: "4532 8801 2294 7816",
  cvv: "482",
  exp: "05/26",
  titular: "KUESKI DIGITAL",
};

// ─── formatMXN — sin modificar ────────────────────────────────────────────────
export function formatMXN(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ─── calculateSimulation ─────────────────────────────────────────────────────
// Acepta una oferta explícita para soportar tanto standard (3 MSI)
// como premium (12 MSI). Si no se pasa, cae al ACTIVE_OFFER global.
export function calculateSimulation(
  monto: number,
  numPagos: number,
  sinInteres: boolean,
  offer = ACTIVE_OFFER
): { pagoMensual: number; total: number } {
  if (sinInteres && numPagos <= offer.mesesSinInteres) {
    const pagoMensual = monto / numPagos;
    return { pagoMensual, total: monto };
  }
  const rate = offer.tasaEstimadaConInteres / 100 / 12;
  const total = monto * Math.pow(1 + rate, numPagos);
  const pagoMensual = total / numPagos;
  return { pagoMensual, total };
}