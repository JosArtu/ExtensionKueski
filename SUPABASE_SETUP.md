# Supabase Setup Guide

The extension reads catalog and user data from Supabase at startup via `src/mock/data.ts`. If the connection fails or tables are empty, the extension continues with in-memory fallbacks.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project.
2. Wait for the database to finish provisioning.

## 2. Get credentials

In **Project Settings → API**, copy:

- **Project URL** (e.g. `https://your-project.supabase.co`)
- **Anon public key** (for client-side use) or **service role key** (only for trusted local dev — never ship in a public extension)

## 3. Configure the extension

Credentials are currently set in `src/mock/data.ts`:

```typescript
const supabase = createClient(
  "https://your-project.supabase.co",
  "your-anon-or-service-key"
);
```

For local development you can also use `process.env.SUPABASE_SERVICE_ROLE_KEY` if you inject env at build time. Replace the hardcoded values before distributing the extension.

## 4. Create database tables

Run the following in the Supabase **SQL Editor**. Table and column names match what `src/mock/data.ts` queries.

### usuario

```sql
CREATE TABLE usuario (
  id_usuario SERIAL PRIMARY KEY,
  nombre TEXT,
  apellidos TEXT,
  correo TEXT UNIQUE,
  limite_de_credito NUMERIC(10, 2) DEFAULT 15000,
  tipo_usuario TEXT DEFAULT 'standard'  -- 'standard' | 'premium'
);
```

### tienda

```sql
CREATE TABLE tienda (
  id_tienda SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  dominio TEXT NOT NULL,
  compatibilidad_kueski BOOLEAN DEFAULT true,
  estado BOOLEAN DEFAULT true
);
```

### producto

```sql
CREATE TABLE producto (
  id_producto SERIAL PRIMARY KEY,
  id_tienda INTEGER REFERENCES tienda(id_tienda),
  nombre TEXT NOT NULL,
  precio NUMERIC(10, 2) NOT NULL,
  url_producto TEXT
);
```

### oferta

```sql
CREATE TABLE oferta (
  id_oferta SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo INTEGER NOT NULL,              -- 1 = financing offer, 2 = dashboard promotion
  estado BOOLEAN DEFAULT true,
  meses_sin_intereses INTEGER,
  tasa_intereses NUMERIC(5, 2),
  tasa_estimada_con_intereses NUMERIC(5, 2),
  monto_financiable_max NUMERIC(10, 2),
  fecha_fin DATE
);
```

## 5. Seed demo data

```sql
INSERT INTO tienda (nombre, dominio, compatibilidad_kueski, estado) VALUES
  ('Amazon', 'amazon.com.mx', true, true),
  ('Costco', 'costco.com.mx', true, true),
  ('AliExpress', 'aliexpress.com', true, false),
  ('Mercado Libre', 'mercadolibre.com.mx', true, false);

INSERT INTO usuario (nombre, apellidos, correo, limite_de_credito, tipo_usuario) VALUES
  ('Usuario', 'Kueski', 'usuario@email.com', 15000, 'standard');

INSERT INTO producto (id_tienda, nombre, precio, url_producto) VALUES
  (1, 'Echo Dot (5.ª gen) — Altavoz inteligente', 1299, 'https://www.amazon.com.mx/dp/example-echo-dot'),
  (1, 'MacBook Air M3 15" — 24 GB RAM', 38999, 'https://www.amazon.com.mx/dp/example-macbook');

INSERT INTO oferta (nombre, tipo, estado, meses_sin_intereses, tasa_intereses, tasa_estimada_con_intereses, monto_financiable_max, fecha_fin) VALUES
  ('3 meses sin intereses', 1, true, 3, 0, 28.9, 15000, '2026-06-30'),
  ('12 meses sin intereses', 1, true, 12, 0, 28.9, 50000, '2026-12-31'),
  ('3 MSI en Amazon', 2, true, NULL, NULL, NULL, NULL, NULL),
  ('Envío gratis + Kueski', 2, true, NULL, NULL, NULL, NULL, NULL),
  ('6 MSI en electrónicos', 2, true, NULL, NULL, NULL, NULL, NULL);
```

Adjust `id_tienda` values if your serial IDs differ after insert.

## 6. Row Level Security (optional)

For production, enable RLS and add policies per table. For the academic prototype, RLS can remain disabled during development.

```sql
ALTER TABLE usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE tienda ENABLE ROW LEVEL SECURITY;
ALTER TABLE producto ENABLE ROW LEVEL SECURITY;
ALTER TABLE oferta ENABLE ROW LEVEL SECURITY;
```

## 7. Build and test

```bash
npm run build
```

Load `dist/` in Chrome. Open the extension popup and check the browser console:

- `✅ Supabase connected!` — tables reachable
- `❌ Supabase connection failed` — extension uses fallback mock data

## Data access in code

| Export | Source | Purpose |
|--------|--------|---------|
| `AMAZON_STORE` / `COSTCO_STORE` | `tienda` | Store metadata for detection UI |
| `AMAZON_PRODUCT` / `HIGH_PRICE_PRODUCT` | `producto` | Demo and eligibility-test products |
| `ACTIVE_OFFER` | `oferta` (tipo=1, 3 MSI) | Default financing offer |
| `getActiveOfferForUser(tipo)` | `oferta` | Premium users get 12 MSI |
| `COMPATIBLE_STORES` | `tienda` | Dashboard store chips |
| `PROMOTIONS` | `oferta` (tipo=2) | Dashboard promotion cards |
| `createUser()` | `usuario` | Login profile + credit limit |
| `updateUserCredit(id, amount)` | `usuario` | Post-checkout credit update |
| `calculateSimulation(...)` | in-memory | Installment math from offer rates |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Console shows connection failed | Verify URL and API key in `src/mock/data.ts` |
| Empty dashboard promos | Seed `oferta` rows with `tipo = 2` and `estado = true` |
| Store not detected in popup | Confirm you are on a product page; session TTL is 30 min |
| CORS errors | Supabase projects allow browser clients by default; check project status |
| Still seeing fallback data | Table/column names must match exactly (Spanish singular names) |
