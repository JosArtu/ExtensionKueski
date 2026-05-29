# Kueski Pay Extension — E-commerce Payment System

Browser extension that integrates **Kueski Pay** into compatible online stores. Users link their account, see available credit, get non-intrusive offer notifications, simulate installments on product pages, and complete purchases with a temporary digital card — powered by a **Node.js REST API** and **PostgreSQL** database.

## Project overview

The system combines:

- **Extension popup (8 screens)** — Account link, dashboard, store detection, offers, eligibility, digital card, confirmation, preferences (~360–400px)
- **Floating widget** — Injected on compatible merchant pages for simulation and checkout
- **Backend API** — Users, stores, products, loans, offers, simulations, events, preferences
- **Database** — Relational persistence for all domain entities

Full requirements: **[PRD.md](./PRD.md)**

## Main features

### Extension UI (8 screens)

| # | Screen | Highlights |
|---|--------|------------|
| 1 | **Login / Link** | Sign in; link Kueski account |
| 2 | **Dashboard** | Available credit, active promos, compatible stores, digital card status |
| 3 | **Store detection** | Banner when visiting Amazon / AliExpress (via `/api/tiendas`) |
| 4 | **Active offer** | MSI promos, financeable amount, interest estimate, validity |
| 5 | **Eligibility** | Purchase qualification, available credit, payment conditions |
| 6 | **Digital card** | Temporary virtual card with reveal animation |
| 7 | **Confirmation** | Success state, transaction summary, next-promo suggestions |
| 8 | **Preferences** | Notifications, alert intensity, privacy controls |

### Widget & checkout

- **Smart floating widget** — Visible on compatible store product pages
- **Payment simulation** — Real-time installment estimates from product price
- **Checkout integration** — Pay with Kueski; creates loan via API
- **Widget customization** — Minimize, move, light/dark theme (preferences)
- **Multisite compatibility** — Domain check against registered tiendas

## Target audience (personas)

1. **The Analytical Buyer (Carlos Martinez, 38):** Quick payments; abandons checkout if forms are tedious.
2. **The Flexible Buyer (Andrea Lopez, 24):** Budget management through transparent deferred payments.

## Tech stack

| Layer | Stack |
|-------|--------|
| Extension / popup | React, TypeScript, Tailwind CSS, Chrome Extension API (MV3), Motion |
| Backend | Node.js, Express |
| Database | PostgreSQL |

## Project structure

```
ExtensionKueski/
├── PRD.md
├── README.md
├── public/manifest.json       # Copied to dist/ on build
├── popup.html                 # Extension popup entry
├── dist/                      # Load this folder in Chrome
├── src/
│   ├── screens/
│   ├── content/               # Amazon content script
│   ├── background/            # MV3 service worker
│   └── extension/             # Popup ↔ background bridge
└── server/                    # REST API (planned)
```

## Getting started

### Chrome extension (load from `dist/`)

```bash
npm install
npm run build
```

After build, `dist/` contains everything Chrome needs:

```
dist/
  manifest.json
  popup.html
  content.js
  background.js
  icons/
  assets/
```

**Load in Google Chrome:**

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the **`dist`** folder (not the project root)

**Test on Amazon:**

1. Open [amazon.com.mx](https://www.amazon.com.mx) (any product page works best)
2. You should see a small **Kueski** banner on the page (dismissible)
3. Click the extension icon → **Iniciar sesión** → enter the 6-digit verification code (shown in the popup for demo)
4. The popup should open on **Amazon detectada** with the scraped product
5. Continue: Oferta → Elegibilidad → Tarjeta → Confirmación

| Flow | Steps |
|------|--------|
| **Happy path** | Login + 2FA → auto Amazon detection → Oferta → Elegibilidad → Tarjeta → Confirmación |
| **No califica** | Dashboard → *Amazon producto $38,999* (manual fallback) → Elegibilidad denegada |

### Web preview (development)

```bash
npm run dev
```

Opens at `http://localhost:5173` for UI work without reloading the extension. Use dashboard buttons to simulate Amazon when not in Chrome.

### Full stack (planned)

- Node.js 18+, PostgreSQL 14+, Chrome for extension packaging
- Backend: see PRD Section 13 (`server/` — not scaffolded yet)

## Database structure

| Table | Purpose |
|-------|---------|
| **Usuario** | User identifiers, name, email, profile |
| **Tienda** | E-commerce domains and Kueski compatibility |
| **Producto** | Scraped product name, price, URL, detection date |
| **Prestamo** | Loan linking user, store, product; amounts and interest |
| **Oferta** | Promotions, MSI months, validity dates |
| **Simulacion Pago** | Payment estimates requested by users |
| **Evento Uso** | Interaction traceability (checkout initiated, store validated, etc.) |
| **Preferencias Widget** | Notification, theme, position, minimized state per user |

See [PRD.md § Database Schema](./PRD.md#8-database-schema) for column details.

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/usuarios/{id}` | User info and balance / credit summary |
| `POST` | `/api/usuarios` | Create user |
| `GET` | `/api/prestamos/{id_usuario}` | Active loans and remaining payments |
| `POST` | `/api/prestamos` | Create loan after purchase |
| `GET` | `/api/ofertas` | Active promotions |
| `GET` | `/api/tiendas` | Compatible stores (optional `?dominio=`) |
| `POST` | `/api/productos` | Register scraped product |
| `POST` | `/api/simulaciones` | Create payment simulation |
| `POST` | `/api/eventos` | Log usage event |
| `GET` / `PUT` | `/api/preferencias/{id_usuario}` | Read / update widget preferences |

Full request bodies and additional routes: **[PRD.md § API](./PRD.md#9-api-endpoints-reference)**

## User flows

**Popup journey:** Login → Dashboard → Store detection → Offer → Eligibility → Digital card → Confirmation (+ Preferences anytime)

**On-page widget:** Product page → DOM scrape → `GET /api/tiendas` → widget → Simulate → `POST /api/prestamos`

## Design principles

- **Fintech trust:** Clean layout, emerald/teal accents, strong readability
- **Utility copy:** Short status and action messages
- **User control:** Dismiss promotions; minimal friction
- **Prominent credit:** Available line and financeable amounts as visual focus

## Out of scope

- Production Kueski credit approval / real banking APIs
- Real payment card issuance (digital card is simulated)
- Chrome Web Store production release (optional for course)

The project **does** include extension UI, REST API, and PostgreSQL — with mocked credit decisioning for the academic prototype.