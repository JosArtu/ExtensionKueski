# Kueski Account Integration App

Chrome extension **UI mockup** (v1) for Kueski: link an account, see available credit while shopping, review promotions at compatible stores, and walk through financing with a temporary digital card — all inside a compact extension popup.

> **Note:** This repository is a **frontend-only prototype**. There is no backend, real authentication, or production Chrome extension packaging in v1.

## What it is

A web app that simulates the popup experience of a Kueski browser extension (~360–400px wide), with eight screens and smooth transitions. It demonstrates the full financing journey from account link to checkout confirmation, using mock data and local screen state.

## Features (8 screens)

| # | Screen | Highlights |
|---|--------|------------|
| 1 | **Login / Link** | Sign in; link Kueski account |
| 2 | **Dashboard** | Available credit ($15,000 mock), active promos, compatible stores, digital card status |
| 3 | **Store detection** | Non-intrusive banner when visiting Amazon / AliExpress (simulated) |
| 4 | **Active offer** | Short promo (e.g. 3 MSI), financeable amount, interest estimate, validity |
| 5 | **Eligibility** | Purchase qualifies or not; available credit; payment conditions |
| 6 | **Digital card** | Temporary virtual card with reveal animation |
| 7 | **Confirmation** | Success state, transaction summary, next-promo suggestions |
| 8 | **Preferences** | Notifications, alert intensity, privacy controls (UI mock) |

## Design principles

- **Fintech trust:** Clean layout, restrained emerald/teal accents, strong readability
- **Utility copy:** Short messages focused on status and next action — not marketing fluff
- **User control:** Dismiss or ignore promotions; minimal friction and clicks
- **Prominent credit:** Available line and financeable amounts are the visual focus

## Tech stack (planned)

- React + TypeScript
- Tailwind CSS
- Motion (screen transitions, card reveal)
- Local state for screen navigation

## Getting started

Implementation is defined in [PRD.md](./PRD.md). Once the app scaffold exists:

```bash
npm install
npm run dev
```

Open the dev URL and resize the viewport or use the built-in popup frame to preview extension dimensions.

## Project structure (expected)

```
src/
  components/     # Shared UI (buttons, cards, credit display)
  screens/        # One folder per screen (1–8)
  mock/           # Static credit, offers, store detection data
  App.tsx         # Popup shell + screen router
```

## Documentation

- **[PRD.md](./PRD.md)** — Full requirements, user flow, acceptance criteria, and out-of-scope items for v1

## Usability & product goals

- Readable, non-intrusive notifications
- Clear available credit at a glance
- Full mock financing flow: detect store → offer → eligibility → digital card → confirm
- Preference management for alerts and privacy (UI only in v1)

## License & context

Academic / prototype project (TC2005B). Not affiliated with Kueski production systems unless explicitly stated by the course or sponsor.
