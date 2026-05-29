# Product Requirements Document (PRD)

## Kueski Pay Extension — Version 1

## 1. Project Overview

**Name:** Kueski Pay Extension (Kueski Account Integration App)  
**Description:** A browser extension that integrates Kueski Pay into compatible e-commerce sites. Users link their account, see available credit while shopping, receive non-intrusive store and offer notifications, simulate installments, and complete purchases via a temporary digital card — backed by a REST API and relational database.

**System components:**

| Layer | Role |
|-------|------|
| **Extension UI (popup)** | 8-screen flow: login, dashboard, store detection, offers, eligibility, digital card, confirmation, preferences |
| **Content / floating widget** | Detects compatible stores, surfaces payment options on merchant pages |
| **Backend API** | User, store, product, loan, offer, simulation, event, and preference management |
| **Database** | PostgreSQL persistence for all domain entities |

**Tech stack:**

- **Frontend:** React, TypeScript, Tailwind CSS, Chrome Extension API (Manifest V3), Motion (transitions / card reveal)
- **Backend:** Node.js, Express
- **Database:** PostgreSQL

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
3. **Store detection** — Notify when entering Amazon, AliExpress, or compatible domains (Screen 3 + content script)
4. **Active offers** — Short promotions with financeable amount, interest, validity (Screen 4)
5. **Eligibility check** — Qualification status, available credit, payment conditions (Screen 5)
6. **Digital card** — Temporary virtual card with reveal for checkout (Screen 6)
7. **Confirmation / tracking** — Success state, transaction summary, next promos (Screen 7)
8. **Preferences** — Notifications, alert intensity, privacy (Screen 8)
9. **Floating widget** — Injects UI on compatible store product pages
10. **Payment simulator** — Calculates installments from scraped product price
11. **Frictionless checkout** — Creates loan record and guides user through Kueski payment flow

### Backend

12. **REST API** — CRUD and query endpoints for users, stores, products, loans, offers, simulations, events, preferences
13. **Store compatibility** — Domain lookup via `/api/tiendas`
14. **Usage telemetry** — Event logging for analytics and flow traceability

## 4. Extension Screens & Requirements

### Screen 1 — Login / Link account

- Sign in and link account actions
- Calls `POST /api/usuarios` on registration; session ties to `GET /api/usuarios/{id}`

### Screen 2 — Main dashboard

- Credit summary (e.g., available credit from user / loan data)
- Active promotions (`GET /api/ofertas`)
- Compatible stores (`GET /api/tiendas`)
- Digital card status
- Navigation to preferences and financing flow

### Screen 3 — Store detection

- Banner when visiting a compatible domain (Amazon, AliExpress, etc.)
- Triggered after `GET /api/tiendas` confirms compatibility
- Dismissible; logs `Evento Uso` (store validated)

### Screen 4 — Active offer

- Promotion headline (e.g., 3 months without interest)
- Financeable amount, estimated interest, validity period
- Data from `GET /api/ofertas` filtered by store / user

### Screen 5 — Eligibility & details

- Qualification for current purchase and product price
- Available credit and payment conditions
- May create `Simulacion Pago` record before proceeding

### Screen 6 — Digital card

- Temporary virtual card with masked reveal animation
- Issued in context of active loan / checkout session (mock token in v1)

### Screen 7 — Confirmation / tracking

- Success after `POST /api/prestamos`
- Transaction summary; suggestion for next promotions
- Logs checkout-completed event

### Screen 8 — Preferences

- Notification on/off, alert intensity, privacy controls
- Persisted via `Preferencias Widget` (and/or dedicated preferences endpoint)

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

### Flow B — On-page widget (original e-commerce flow)

1. User navigates to a product page on a supported domain (e.g., `amazon.com.mx`)
2. Extension content script parses DOM → `Product Name`, `Price`, `URL`
3. Extension calls `GET /api/tiendas` to verify domain compatibility
4. If compatible, floating widget appears on page
5. User clicks **Simulate Payment** → backend creates / returns simulation
6. User clicks **Pay with Kueski** → `POST /api/prestamos` → confirmation

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
- Brand accent: emerald / teal (gradients acceptable, restrained)
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

### Frontend (extension + popup app)

```
extension/
  manifest.json          # Manifest V3
  popup/                   # React popup (~360–400px)
    src/
      screens/             # Screens 1–8
      components/          # Shared UI
      services/api.ts      # REST client
  content/                 # Content scripts + floating widget
  background/              # Service worker (store detection, API calls)
```

- Popup: `currentScreen` state or router; fetch dashboard data from API
- Content script: DOM scrape → `POST /productos` → widget inject
- Shared API module with base URL from env

### Backend

```
server/
  src/
    routes/                # Express routers per resource
    controllers/
    models/                # DB access layer
    db/                    # Pool, migrations, seeds
  migrations/
```

- Express + `pg` (or ORM e.g. Prisma / Drizzle)
- CORS enabled for extension origin
- Seed data: compatible tiendas (Amazon, AliExpress), sample ofertas, demo usuario

### Environment variables (planned)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | API server port (default 3000) |
| `CORS_ORIGIN` | Allowed extension / dev frontend origin |

## 11. Acceptance Criteria (v1)

### Frontend

- [ ] All 8 popup screens implemented and reachable
- [ ] Popup width within 360–400px target
- [ ] Floating widget on compatible store pages (dev / stub domain)
- [ ] Store detection and offer flows call backend (or mock server)
- [ ] Digital card reveal interaction
- [ ] Preferences UI wired to API when available

### Backend

- [ ] PostgreSQL schema migrated for all core tables
- [ ] `GET /api/tiendas` returns compatible domains
- [ ] `GET /api/ofertas` returns active promotions
- [ ] `GET /api/usuarios/{id}` returns user + credit summary
- [ ] `POST /api/prestamos` creates loan record
- [ ] `POST /api/simulaciones` returns installment breakdown
- [ ] Seed script for demo data

### Integration

- [ ] Extension verifies store via `/api/tiendas` before showing widget / banner
- [ ] Checkout flow persists loan and logs usage event
- [ ] Dashboard reads live (or seeded) API data

## 12. Out of Scope (What NOT to build)

- **Real Kueski banking / credit approval** — No integration with production Kueski credit decisioning APIs
- **Real payment processing** — Digital card is simulated; no PCI card issuance
- **Production Chrome Web Store deployment** — Optional for course prototype
- **Mobile native apps**

The team **will** build the extension UI, REST API, and PostgreSQL persistence. Credit approval logic remains mocked or rule-based for the academic prototype.

## 13. Documentation & Next Steps

1. Scaffold monorepo or `extension/` + `server/` folders
2. Define DB migrations from Section 8
3. Implement core API routes (Section 9)
4. Build popup screens consuming API
5. Add content script + floating widget
6. Seed demo data and document local run instructions in README
