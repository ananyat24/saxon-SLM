# Saxon.AI Machine Health Copilot

Predictive-maintenance dashboard for CNC milling machines. Frontend + typed API contract only — the
scikit-learn classifier and the fine-tuned Qwen3-1.7B SLM are separate backend services.

## Stack

React + TypeScript (Vite), Tailwind CSS v4, Recharts, TanStack Query, Zustand, React Router.

## Getting started

```bash
npm install
npm run dev
```

## Switching mock ↔ live mode

The app talks to a single `apiClient` (`src/api/index.ts`), which picks an implementation based on
`VITE_API_MODE`:

- `mock` (default) — `src/api/mock/mockApiClient.ts` returns fixture data (`src/api/mock/fixtures.ts`)
  with artificial latency, so the UI is fully demoable with no backend.
- `live` — `src/api/httpApiClient.ts` makes real `fetch` calls against `VITE_API_BASE_URL`.

Copy `.env.example` to `.env.local` and set:

```
VITE_API_MODE=live
VITE_API_BASE_URL=https://your-backend-proxy.example.com
```

No API keys live in the frontend. `httpApiClient` always calls a backend proxy that holds any
credentials — never point `VITE_API_BASE_URL` at a service that expects a key from the browser.

## API contract

The full typed contract (`ClassifierOutput`, `CopilotMessage`, `MachineSummary`, `OverviewSummary`,
`SystemStatus`, `WhatIfRequest/Result`, etc.) lives in `src/types/contract.ts`. Both the mock and live
API clients implement the same `ApiClient` interface (`src/api/client.ts`):

- `getOverviewSummary()`
- `getMachineQueue()`
- `getMachineDetail(machineId)`
- `postCopilotMessage(req)`
- `getSystemStatus()`
- `runWhatIf(req)`

A real backend should implement matching REST endpoints (see `httpApiClient.ts` for the exact paths)
returning JSON that satisfies these types.

The frontend never constructs or sends fabricated classifier numbers — `CopilotRequest` only carries
`machine_id` and `question`; the backend is responsible for embedding the current classifier output
into the SLM prompt server-side.

## Adding a new client / plant deployment

Everything client-facing is centralized so a new deployment is a config change, not a code change:

- **Branding & copy** — `src/config/client.config.ts` (company name, product name, plant name, logo
  initials, footer branding, Copilot disclaimer).
- **Failure-code taxonomy** — `src/config/taxonomy.config.ts` maps `hdf/pwf/osf/twf` to labels,
  descriptions, and status colors, plus sensor field labels/units used in Copilot "why flagged"
  explanations. A different plant using different failure codes only needs this file changed.
- **Theme colors** — CSS variables in `src/index.css` (`--status-critical`, `--accent`, etc.). Swap
  values to match a client's brand without touching any component.

## Pages

`/overview` and `/copilot` are fully built against mock data for the v1 pilot demo. All other nav
routes (`/machines`, `/live-assessment`, `/what-if`, `/alerts`, `/model-confidence`, `/reports`,
`/work-orders`, `/administration`) are routed with a "coming soon" placeholder so the information
architecture is complete end to end.

## Auth / RBAC

A mock SSO sign-in screen (`src/components/common/SignInGate.tsx`) gates the app and lets you pick a
role for the demo. Permission checks go through `useHasPermission(permission)`
(`src/hooks/useHasPermission.ts`) against a role→permission map in `src/store/authStore.ts`, so wiring
up a real RBAC backend later doesn't require touching call sites.

## Security notes

- Copilot messages are rendered through a minimal safe-markdown component
  (`src/components/copilot/SafeMarkdown.tsx`) that builds React elements directly — no
  `dangerouslySetInnerHTML` — so model output can never inject HTML/scripts.
- Copilot submissions are client-side debounced (`src/hooks/useCopilotThread.ts`) to avoid hammering
  the SLM endpoint.
- No secrets/API keys are read or stored in frontend code.

## Build

```bash
npm run build
npm run preview
```
