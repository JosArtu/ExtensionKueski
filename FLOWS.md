# Prototype — Information flows coverage

## Implemented screens (9 views)

1. Login (credentials + 2FA verification)  
2. Dashboard  
3. Store detection (Amazon)  
4. Active offer  
5. Payment simulation (optional / dev panel)  
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
| 5 | Store detection → Dismiss → Dashboard | ✅ Full |
| 6 | Active offer → Dismiss → Dashboard | ✅ Full |
| 7 | Amazon expensive product → Not eligible → Dashboard | ✅ Full |
| 8 | Eligibility → Back → Offer | ✅ Full |
| 9 | Digital card → Reveal → Confirm checkout | ✅ Full |
| 10 | Confirmation → Dashboard (reset Amazon flow) | ✅ Full |
| 11 | Amazon.com.mx tab → content script → open popup → auto store detection | ✅ Full (Chrome) |

**Not implemented (out of prototype scope):**

- Full floating checkout widget on merchant page (Flow B)  
- `GET /api/tiendas` network call  
- AliExpress live detection (listed as “próximamente”)  
- Real auth / PCI card issuance  

## Amazon (Chrome)

- **Content script** runs on `amazon.com` and `amazon.com.mx`, scrapes product title/price, shows an on-page banner.
- **Background** stores the session; **popup** reads it on open and routes to store detection.
- Manual dashboard simulation remains for web dev mode (`npm run dev`).

## Brand

Primary accent color: **#4648e8**
