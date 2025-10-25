# NOVA

A local-first, story-driven web app that helps adolescents practice refusal skills and protective strategies through short interactive scenarios.

## Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS (custom light theme) + Framer Motion
- IndexedDB (client storage) via simple helpers
- Recharts (radar/bar charts)

## Key Features
- 10-step scenario loop with choices, micro-feedback, and achievements
- Pre/Post quick quizzes (2 questions each)
- Outcome report: radar metrics, key choices timeline, reflection
- Teacher dashboard: import JSON, demo data, charts, risk signals, tags, achievements
- Accessibility: keyboard focus, dyslexia-friendly option (toggleable via CSS class)
- Privacy: anonymous by default, data stays on-device; export/delete anytime

## Run Locally
1) Install
```
npm i
```
2) Dev
```
npm run dev
```
Open http://localhost:3000

3) Build
```
npm run build && npm run start
```

## Scripts
- `dev` – run dev server
- `build` – production build
- `start` – run production server

## Project Structure (trimmed)
```
app/
  page.tsx           # Landing
  play/              # Scenario loop
  onboarding/        # Name, age, avatar
  quiz/[type]/       # Pre/Post quizzes
  outcome/           # Results
  dashboard/         # Teacher dashboard
components/          # UI + game components
lib/                 # engine, types, db, i18n
content/             # seed content (JSON)
public/avatars/      # avatar images
public/badges/       # badge images
```

## Data & Content
- Game content is loaded from `content/seed.en.json`.
- Sessions are saved to IndexedDB; export/import via dashboard or outcome page.

## Deployment Notes
- Requires Node >= 20.9 for Next.js 16.
- If RSC/network fails during outcome redirect, app still navigates (defensive try/finally).

## License
MIT
