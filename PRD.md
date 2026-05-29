# Product Requirements Document (PRD)

## Kueski Account Integration App — Version 1

## 1. Project Overview

**Name:** Kueski Account Integration App  
**Type:** Chrome extension UI mockup / prototype  
**Description:** A frontend-only simulation of a Chrome extension popup for Kueski financial services. The app surfaces credit offers while users shop online, guides them through eligibility and checkout with a digital card, and keeps notifications non-intrusive and user-controlled.

**Classification:** Pure frontend — no backend, API, or database requirements for v1.

**Tech stack (recommended):**

- React + TypeScript
- Tailwind CSS (or equivalent utility CSS)
- Motion (or similar) for screen transitions and card reveal
- Local state for navigation between 8 screens (no persistence required for mockup)

## 2. Target Audience & Goals

**Primary users:** Online shoppers who already have or want to link a Kueski account and finance purchases at compatible merchants (e.g., Amazon, AliExpress).

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
- CTAs that are clear without feeling aggressive

## 3. Scope

### In scope (v1)

- Popup container mimicking Chrome extension dimensions (~360–400px wide)
- Eight navigable screens with state-based routing
- Sample data (e.g., $15,000 available credit, Amazon detection, 3 MSI offer)
- Smooth transitions between screens
- Digital card reveal animation
- Preference toggles (UI only)

### Out of scope (v1)

- Real Chrome Extension Manifest / content scripts / DOM scraping
- Kueski API integration, authentication, or loan approval
- Backend, database, or REST endpoints
- Production banking or credit decisioning

## 4. Screens & Requirements

### Screen 1 — Login / Link account

**Purpose:** Initial entry to link or sign in to a Kueski account.

**Requirements:**

- Sign in and link account actions
- Clear orientation for first-time users
- Path to main dashboard after link (mock)

### Screen 2 — Main dashboard

**Purpose:** Home view after account is linked.

**Requirements:**

- Credit summary (e.g., available credit: **$15,000**)
- Active promotions list
- Compatible stores
- Digital card status
- Navigation to preferences and flow entry points

### Screen 3 — Store detection

**Purpose:** Notify user when entering a compatible store.

**Requirements:**

- Subtle notification when visiting Amazon, AliExpress, or other compatible stores
- Short message; dismissible / ignorable
- Does not block browsing context (mock banner in popup)

### Screen 4 — Active offer

**Purpose:** Show a short-term promotion applicable on the current store.

**Requirements:**

- Promotion headline (e.g., 3 months without interest)
- Financeable amount
- Estimated interest
- Validity period
- Primary CTA to continue eligibility check

### Screen 5 — Eligibility & details

**Purpose:** Confirm whether the current purchase qualifies.

**Requirements:**

- Qualification status for current purchase
- Credit amount available for this transaction
- Payment conditions (installments, terms)
- CTA to proceed to digital card

### Screen 6 — Digital card

**Purpose:** Temporary virtual card for checkout.

**Requirements:**

- Masked card display with reveal interaction
- Expiry / security cues appropriate for a temporary card
- Reveal animation (Motion or equivalent)
- Copy or guidance for use at merchant checkout

### Screen 7 — Confirmation / tracking

**Purpose:** Post-use confirmation and light engagement.

**Requirements:**

- Success confirmation of financing use
- Transaction summary (amount, merchant, terms)
- Suggestion for next promotions
- Return to dashboard or dismiss

### Screen 8 — Preferences

**Purpose:** User control over extension behavior.

**Requirements:**

- Notification on/off settings
- Alert intensity (e.g., subtle / standard)
- Privacy-related controls (mock labels; no real data handling in v1)

## 5. User Flow (Happy path)

1. User opens extension popup → **Login / Link**
2. After link (mock) → **Dashboard** (credit, promos, stores, card status)
3. User visits compatible store (simulated) → **Store detection** banner
4. User views promotion → **Active offer**
5. User checks purchase → **Eligibility & details**
6. User obtains card → **Digital card** (reveal)
7. User completes checkout (mock) → **Confirmation / tracking**
8. User adjusts behavior anytime via **Preferences**

## 6. Interface & UX Requirements

| Requirement | Detail |
|-------------|--------|
| Layout | Chrome popup width ~360–400px; vertical scroll if needed |
| Copy | Utility language: orientation, status, action |
| Hierarchy | Credit amounts and financeable totals most prominent |
| Cards | Use only when grouping related actions or data |
| Notifications | Subtle; always dismissible |
| Interaction | Reduce steps; avoid decorative chrome |
| Contrast | WCAG-friendly contrast for text and CTAs |

## 7. Visual Design Direction

- Clean, minimal fintech aesthetic
- Brand accent: emerald / teal (gradients acceptable, restrained)
- Clear typography scale (title, body, caption, numeric emphasis)
- Smooth screen transitions; card reveal on digital card screen
- Professional, trustworthy tone — no aggressive sales patterns

## 8. Technical Implementation Notes

1. **Shell:** Root layout fixed to extension popup dimensions with consistent padding and header/footer patterns.
2. **Navigation:** Single source of truth for `currentScreen` (enum or route map); optional dev-only screen picker for demos.
3. **Components:** One module per screen; shared primitives (Button, Card, CreditAmount, NotificationBanner, Toggle).
4. **Data:** Static fixtures in `constants` or `mockData` — no fetch layer in v1.
5. **Animations:** Page enter/exit; card number reveal on Screen 6 only where motion adds clarity.

## 9. Acceptance Criteria (v1)

- [ ] All 8 screens implemented and reachable
- [ ] Popup width within 360–400px target
- [ ] Dashboard shows $15,000 available credit (mock)
- [ ] Store detection references Amazon (and optionally AliExpress)
- [ ] Active offer shows MSI-style promo with amount, interest estimate, validity
- [ ] Eligibility screen shows qualify/deny state and payment conditions
- [ ] Digital card supports reveal interaction
- [ ] Confirmation shows success + transaction summary + next promo hint
- [ ] Preferences expose notification and intensity controls
- [ ] User can dismiss/ignore promotional UI elements
- [ ] Design uses emerald/teal accent with readable contrast

## 10. Future Considerations (Post-v1)

- Manifest V3 extension packaging (background, content scripts)
- Real domain detection and product price parsing
- Kueski API auth and loan APIs
- Persistent user preferences via `chrome.storage`
- Backend alignment with legacy schema (Usuario, Tienda, Prestamo, Oferta) if product expands beyond mockup
