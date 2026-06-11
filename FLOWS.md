# Prototype — Information flows coverage

## Implemented screens (9 views)

1. Login (credentials + 2FA verification)  
2. Dashboard  
3. Store detection (Amazon or Costco)  
4. Active offer  
5. Payment simulation (optional step in financing flow)  
6. Eligibility  
7. Digital card  
8. Confirmation  
9. Preferences  

## Execution paths

| # | Path | Status |
|---|------|--------|
| 1 | Login → 2FA code → Dashboard | ✅ Full |
| 2 | Dashboard → Preferences → Save → Dashboard | ✅ Full |
| 3 | Dashboard → Logout → Login | ✅ Full |
| 4 | Dashboard → Amazon visit → Store detection → Offer → Eligibility (ok) → Card → Confirm | ✅ Full |
| 5 | Dashboard → Costco visit → Store detection → Offer → Eligibility → Card → Confirm | ✅ Full |
| 6 | Store detection → Dismiss → Dashboard | ✅ Full |
| 7 | Active offer → Dismiss → Dashboard | ✅ Full |
| 8 | Amazon expensive product → Not eligible → Dashboard | ✅ Full |
| 9 | Eligibility → Back → Offer | ✅ Full |
| 10 | Digital card → Reveal → Confirm checkout | ✅ Full |
| 11 | Confirmation → Dashboard (reset store flow) | ✅ Full |
| 12 | Amazon.com.mx tab → content script → open popup → auto store detection | ✅ Full (Chrome) |
| 13 | Costco.com.mx tab → content script → open popup → auto store detection | ✅ Full (Chrome) |
| 14 | Offer → Simulation → Eligibility | ✅ Full |
| 15 | Premium user (`tipo_usuario: premium`) → 12 MSI offer | ✅ Full (Supabase or fallback) |

**Not implemented (out of prototype scope):**

- Full floating checkout widget on merchant page (Flow B) — on-page **banners** only  
- Separate Node.js REST API (`GET /api/tiendas`, etc.) — data via **Supabase client**  
- AliExpress / Mercado Libre live detection (listed as “próximamente” on dashboard)  
- Real auth / PCI card issuance  

## Supported stores (Chrome)

| Store | Domains | Content script | Session key |
|-------|---------|----------------|-------------|
| **Amazon** | `amazon.com`, `amazon.com.mx` | `content.js` | `amazonSession` |
| **Costco** | `costco.com`, `costco.com.mx` | `costco.js` | `costcoSession` |

### Amazon

- Content script scrapes product title/price, shows a dismissible on-page banner.
- Background stores the session; **StoreBootstrap** reads it when the popup opens and routes to store detection.
- Manual dashboard simulation remains for web dev mode (`npm run dev`).

### Costco

- Same pipeline as Amazon with Costco-specific banner copy and branding on the store detection screen.
- Detecting one store clears the other store’s session in the background worker.

## Extension messaging

| Message | Direction | Purpose |
|---------|-----------|---------|
| `AMAZON_DETECTED` | content → background | Store scraped product + URL |
| `COSTCO_DETECTED` | content → background | Store scraped product + URL |
| `GET_AMAZON_SESSION` | popup → background | Read Amazon session |
| `GET_COSTCO_SESSION` | popup → background | Read Costco session |
| `CLEAR_AMAZON_SESSION` | popup → background | Reset after flow complete |
| `CLEAR_COSTCO_SESSION` | popup → background | Reset after flow complete |

Sessions expire after **30 minutes** (`SESSION_TTL_MS`).

## Data layer

- **`src/mock/data.ts`** — Supabase client; loads stores, products, offers, promotions at module init.
- **Fallbacks** — If Supabase is unreachable or tables are empty, hardcoded defaults are used (no runtime failure).
- **Credit update** — `updateUserCredit()` writes `limite_de_credito` back to `usuario` after checkout.

## Dev tooling

- **`npm run dev`** — Vite preview with **FlowDevPanel** (screen jumper, Amazon simulate buttons).
- **Dashboard cards** — Simulate Amazon (qualifies / does not qualify) and Costco without a real tab.

## Brand

Primary accent color: **#4648e8** (`kueski-500` in Tailwind)
