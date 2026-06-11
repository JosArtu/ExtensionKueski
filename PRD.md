# Product Requirements Document (PRD)

## Kueski Pay Extension — Version 1

## 1. Project Overview

**Name:** Kueski Pay Extension (Kueski Account Integration App)  
**Description:** A browser extension that integrates Kueski Pay into compatible e-commerce sites. Users link their account, see available credit while shopping, receive non-intrusive store and offer notifications, simulate installments, and complete purchases via a temporary digital card — backed by a REST API and relational database.

**System components:**

| Layer | Role |
|-------|------|
| **Extension UI (popup)** | 9-screen flow: login, dashboard, store detection, offers, simulation, eligibility, digital card, confirmation, preferences |
| **Content scripts** | Amazon and Costco detection, DOM scraping, on-page banners |
| **Background service worker** | Session storage bridging content scripts and popup |
| **Supabase client** | Direct queries for users, stores, products, offers; credit updates on checkout |
| **Database** | PostgreSQL (hosted on Supabase) |

**Tech stack:**

- **Frontend:** React 18, TypeScript, Tailwind CSS, Chrome Extension API (Manifest V3), Framer Motion
- **Data:** Supabase (`@supabase/supabase-js`)
- **Build:** Vite 7

## 2. Target Audience & Personas

**Use cases:**

- Finance online purchases without leaving the merchant site
- Quick checkout experience bypassing long merchant forms
- Transparent deferred payments with clear credit visibility

**Personas:**

1. **The Analytical Buyer (Carlos Martinez, 38):** Wants fast, accessible payments; abandons checkout if forms are tedious.
2. **The Flexible Buyer (Andrea Lopez, 24):** Manages budget through transparent installments; shops frequently from mobile.

**Usability goals:**

- Simple, readable, non-intrusive interface
- Short, actionable copy (utility tone, not marketing)
- Prominent display of available credit
- Minimal clicks through the financing flow
- User control to close or ignore promotions

**Trust goals (fintech):**

- Clean, professional visual design
- Critical numbers and conditions clearly visible
- Restrained color palette with strong readability
- CTAs that are clear without being aggressive

## 3. Core Features

### Extension & widget

1. **Account link / login** — Connect Kueski account from popup (Screen 1)
2. **Credit dashboard** — Summary, promos, compatible stores, digital card status (Screen 2)
3. **Store detection** — Notify when entering Amazon or Costco (live); AliExpress and Mercado Libre shown as upcoming (Screen 3 + content script)
4. **Active offers** — Short promotions with financeable amount, interest, validity (Screen 4)
5. **Eligibility check** — Qualification status, available credit, payment conditions (Screen 5)
6. **Digital card** — Temporary virtual card with reveal for checkout (Screen 6)
7. **Confirmation / tracking** — Success state, transaction summary, next promos (Screen 7)
8. **Preferences** — Notifications, alert intensity, privacy (Screen 8)
9. **On-page banners** — Dismissible Kueski banner on Amazon and Costco product pages
10. **Payment simulator** — Calculates installments from scraped product price and active offer
11. **Frictionless checkout** — Mock digital card; updates user credit in Supabase on confirmation

### Data layer (Supabase)

12. **Store catalog** — `tienda` table with `compatibilidad_kueski` flag
13. **Offers & promotions** — `oferta` table (`tipo` 1 = financing, 2 = dashboard promos)
14. **User credit** — `usuario.limite_de_credito` read on login, updated after purchase
15. **Fallback mocks** — In-memory defaults when Supabase is unavailable

> **Note:** A separate Node.js REST API was planned in v1 specs but is **not implemented**. The extension queries Supabase directly from `src/mock/data.ts`.

## 4. Extension Screens & Requirements

### Screen 1 — Login / Link account

- Sign in with email; demo 6-digit verification code shown in popup
- On success, user profile loaded from Supabase `usuario` (or `createUser()` fallback)

### Screen 2 — Main dashboard

- Credit summary from `usuario.limite_de_credito`
- Active promotions from `oferta` where `tipo = 2`
- Compatible stores from `tienda` where `compatibilidad_kueski = true`
- Digital card status; shortcuts to simulate Amazon/Costco flows in dev
- Navigation to preferences and financing flow

### Screen 3 — Store detection

- Shown when popup opens on an Amazon or Costco product tab (via `StoreBootstrap` + background session)
- Displays scraped product name and price; store-specific branding (Amazon orange / Costco blue)
- Dismissible; returns to dashboard and clears re-detection for that session

### Screen 4 — Active offer

- Promotion headline (e.g., 3 months without interest; 12 MSI for premium users)
- Financeable amount, estimated interest, validity period
- Data from Supabase `oferta` table via `getActiveOfferForUser(tipo_usuario)`

### Screen 5 — Eligibility & details

- Qualification for current purchase and product price
- Available credit and payment conditions
- May create `Simulacion Pago` record before proceeding

### Screen 6 — Digital card

- Temporary virtual card with masked reveal animation
- Issued in context of active loan / checkout session (mock token in v1)

### Screen 7 — Confirmation / tracking

- Success after mock checkout completion
- Transaction summary (store, amount, term, product)
- Optional next-promo suggestion from Supabase `oferta` (tipo=2)

### Screen 5 — Payment simulation (optional)

- Installment calculator using `calculateSimulation()` and active offer rates
- Optional step between offer and eligibility when user views simulation

### Screen 8 — Preferences

- Notification on/off, alert intensity, privacy controls, dark theme toggle
- Stored in local React state (not yet persisted to Supabase)

## 5. User Flows

### Flow A — Popup financing journey (8 screens)

1. User opens extension popup → **Login / Link**
2. After auth → **Dashboard** (credit, promos, stores, card status)
3. User visits compatible store → **Store detection** banner
4. User views promotion → **Active offer**
5. User checks purchase → **Eligibility & details**
6. User obtains card → **Digital card**
7. Checkout completes → **Confirmation / tracking**
8. User adjusts behavior via **Preferences**

### Flow B — On-page detection (implemented subset)

1. User navigates to a product page on Amazon or Costco (e.g., `amazon.com.mx`)
2. Content script parses DOM → product name, price, URL (`src/content/scrape.ts`)
3. Content script shows dismissible banner and sends `AMAZON_DETECTED` / `COSTCO_DETECTED` to background
4. Background stores session in `chrome.storage.local` (30 min TTL)
5. User opens popup → `StoreBootstrap` reads session → **Store detection** screen
6. User continues financing flow in popup (offer → eligibility → digital card → confirmation)

> Full floating widget with inline simulate/pay buttons on the merchant page is **not implemented** in the current prototype.

## 6. Interface & UX Requirements

| Requirement | Detail |
|-------------|--------|
| Popup layout | ~360–400px wide; vertical scroll if needed |
| Widget | Minimizable, movable; light/dark theme (per preferences) |
| Copy | Utility language: orientation, status, action |
| Hierarchy | Credit amounts and financeable totals most prominent |
| Notifications | Subtle; always dismissible |
| Contrast | WCAG-friendly contrast for text and CTAs |

## 7. Visual Design Direction

- Clean, minimal fintech aesthetic
- Brand accent: Kueski purple `#4648e8` (Tailwind `kueski-500`; gradients on banners and CTAs)
- Store-specific accents on detection screen: Amazon (orange), Costco (blue)
- Clear typography scale; prominent numeric credit display
- Smooth screen transitions; card reveal on digital card screen

## 8. Database Schema

Relational model (PostgreSQL). Expand column definitions as migrations are written.

### Usuario (User)

| Column | Type | Notes |
|--------|------|-------|
| `id_usuario` | INT | PK |
| `nombre` | VARCHAR | |
| `apellidos` | VARCHAR | |
| `correo` | VARCHAR | UNIQUE |
| `edad` | INT | |
| `foto_de_perfil` | VARCHAR / TEXT | URL |
| `tipo_usuario` | VARCHAR | Optional role |

### Tienda (Store)

| Column | Type | Notes |
|--------|------|-------|
| `id_tienda` | INT | PK |
| `dominio` | VARCHAR | e.g., `amazon.com.mx` |
| `nombre` | VARCHAR | Display name |
| `compatible_kueski` | BOOLEAN | |

### Producto (Product)

| Column | Type | Notes |
|--------|------|-------|
| `id_producto` | INT | PK |
| `id_tienda` | INT | FK → Tienda |
| `nombre` | VARCHAR | Scraped product name |
| `precio` | DECIMAL | |
| `url_producto` | TEXT | |
| `fecha_deteccion` | TIMESTAMP | |

### Prestamo (Loan)

| Column | Type | Notes |
|--------|------|-------|
| `id_prestamo` | INT | PK |
| `id_usuario` | INT | FK → Usuario |
| `id_tienda` | INT | FK → Tienda |
| `id_producto` | INT | FK → Producto |
| `monto_total` | DECIMAL | |
| `pago_restante` | DECIMAL | |
| `interes` | DECIMAL | |
| `fecha_creacion` | TIMESTAMP | |
| `fecha_corte` | DATE | Optional |

### Oferta (Offer)

| Column | Type | Notes |
|--------|------|-------|
| `id_oferta` | INT | PK |
| `id_tienda` | INT | FK → Tienda (nullable for global offers) |
| `titulo` | VARCHAR | e.g., "3 MSI" |
| `meses_sin_interes` | INT | |
| `tasa_interes` | DECIMAL | |
| `monto_financiable_max` | DECIMAL | |
| `fecha_inicio` | DATE | |
| `fecha_fin` | DATE | |
| `activa` | BOOLEAN | |

### Simulacion Pago (Payment Simulation)

| Column | Type | Notes |
|--------|------|-------|
| `id_simulacion` | INT | PK |
| `id_usuario` | INT | FK → Usuario |
| `id_producto` | INT | FK → Producto |
| `monto` | DECIMAL | |
| `num_pagos` | INT | |
| `pago_mensual` | DECIMAL | |
| `fecha_simulacion` | TIMESTAMP | |

### Evento Uso (Usage Event)

| Column | Type | Notes |
|--------|------|-------|
| `id_evento` | INT | PK |
| `id_usuario` | INT | FK → Usuario |
| `tipo_evento` | VARCHAR | e.g., `store_validated`, `checkout_initiated`, `checkout_completed` |
| `metadata` | JSONB | Optional context |
| `fecha_evento` | TIMESTAMP | |

### Preferencias Widget (Widget Preferences)

| Column | Type | Notes |
|--------|------|-------|
| `id_preferencia` | INT | PK |
| `id_usuario` | INT | FK → Usuario |
| `notificaciones_activas` | BOOLEAN | |
| `intensidad_alerta` | VARCHAR | e.g., `subtle`, `standard` |
| `tema` | VARCHAR | `light` / `dark` |
| `minimizado` | BOOLEAN | |
| `posicion` | VARCHAR | Widget position |

## 9. API Endpoints Reference

> **Status:** Not implemented. The extension uses the Supabase client directly. This section documents the original REST design for a future backend service.

Base URL: `/api` (e.g., `http://localhost:3000/api`)

### Usuarios

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/usuarios/{id}` | User details and available balance / credit summary |
| `POST` | `/usuarios` | Create user. Body: `{ nombre, apellidos, edad, correo, foto_de_perfil }` |

### Préstamos

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/prestamos/{id_usuario}` | Active loans, remaining payments, cutoff dates |
| `POST` | `/prestamos` | Create loan after purchase. Body: `{ id_usuario, id_tienda, id_producto, monto_total, pago_restante, interes, ... }` |

### Ofertas

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/ofertas` | Active promotions; optional query: `?id_tienda=` |

### Tiendas

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/tiendas` | List stores compatible with Kueski; optional query: `?dominio=` |

### Productos (recommended)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/productos` | Register scraped product. Body: `{ id_tienda, nombre, precio, url_producto }` |
| `GET` | `/productos/{id}` | Product detail |

### Simulaciones (recommended)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/simulaciones` | Create payment simulation. Body: `{ id_usuario, id_producto, monto, num_pagos }` |
| `GET` | `/simulaciones/{id_usuario}` | User simulation history |

### Eventos (recommended)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/eventos` | Log usage event. Body: `{ id_usuario, tipo_evento, metadata }` |

### Preferencias (recommended)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/preferencias/{id_usuario}` | Widget and notification preferences |
| `PUT` | `/preferencias/{id_usuario}` | Update preferences |

## 10. Technical Implementation Plan

### Frontend (extension + popup app) — **implemented**

```
ExtensionKueski/
  public/manifest.json
  popup.html
  src/
    App.tsx                  # Screen router
    screens/                 # Screens 1–9
    components/
      StoreBootstrap.tsx     # Tab session → store detection
      layout/                # PopupShell, FlowDevPanel
    content/
      amazon.ts, costco.ts   # Per-store content scripts
      banner.ts, scrape.ts   # Shared helpers
    background/
      service-worker.ts      # Session persistence
    extension/
      messages.ts, session.ts
    context/AppContext.tsx   # Reducer + actions
    mock/data.ts             # Supabase client + fallbacks
```

- Popup: `AppContext` reducer drives `screen` navigation
- Content scripts: bundled to `dist/content.js` and `dist/costco.js`
- `StoreBootstrap`: on popup open, queries active tab + background session

### Data layer (Supabase) — **implemented**

- `@supabase/supabase-js` client in `src/mock/data.ts`
- Tables: `usuario`, `tienda`, `producto`, `oferta`
- Seed scripts documented in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- Fallback constants when queries fail or return empty

### Backend REST API — **not implemented**

A Node.js + Express layer was originally specified but superseded by direct Supabase access. Section 9 endpoint reference remains as a design artifact for a future service layer.

## 11. Acceptance Criteria (v1)

### Frontend

- [x] All 9 popup screens implemented and reachable
- [x] Popup width within 360–400px target
- [x] On-page banners on Amazon and Costco product pages
- [ ] Full floating widget on merchant pages (banners only in prototype)
- [x] Store detection via content script + background session
- [x] Digital card reveal interaction
- [x] Preferences UI (local state; not persisted to Supabase)
- [x] Amazon and Costco content scripts with shared scrape/banner modules

### Data layer (Supabase)

- [x] Core tables: `usuario`, `tienda`, `producto`, `oferta`
- [x] Compatible stores loaded from `tienda.compatibilidad_kueski`
- [x] Active offers and dashboard promotions from `oferta`
- [x] User credit read on login; updated via `updateUserCredit()` after checkout
- [x] Seed SQL documented in SUPABASE_SETUP.md
- [ ] Separate REST API endpoints (Section 9 — not built)

### Integration

- [x] Content script → background → popup session pipeline
- [x] Checkout updates user credit in Supabase (with mock fallback)
- [x] Dashboard reads live Supabase data (with fallbacks)
- [ ] Usage event logging to database

## 12. Out of Scope (What NOT to build)

- **Real Kueski banking / credit approval** — No integration with production Kueski credit decisioning APIs
- **Real payment processing** — Digital card is simulated; no PCI card issuance
- **Production Chrome Web Store deployment** — Optional for course prototype
- **Mobile native apps**

The team **will** build the extension UI, REST API, and PostgreSQL persistence. Credit approval logic remains mocked or rule-based for the academic prototype.

## 13. Documentation & Next Steps

**Completed:**

1. Extension popup with 9 screens and full financing flow
2. Amazon + Costco content scripts, banners, and session bridge
3. Supabase integration with documented seed data
4. README, FLOWS, and SUPABASE_SETUP documentation

**Remaining (optional / future):**

1. Full floating widget on merchant pages (Flow B complete)
2. AliExpress and Mercado Libre live detection
3. Node.js REST API layer (if separating data access from extension)
4. Persist preferences and usage events to Supabase
5. Environment-based Supabase credentials (no hardcoded keys in builds)
6. Chrome Web Store packaging
