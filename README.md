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
- `live` — `src/api/live/liveApiClient.ts` is a **hybrid** client. It routes machine assessment,
  copilot Q&A, and what-if analysis to a real classifier backend (`saxon_machine_health_api` — a
  separate FastAPI service running a CatBoost multi-label classifier + templated/SLM explainer, not
  part of this repo). Everything else (`getOverviewSummary`, `getAlerts`, `getWorkOrders`, `getReports`,
  `getModelConfidenceTrend`, `getSystemStatus`) has no real backend yet and stays on
  `mockApiClient` — see `DataSourceTag` (`src/components/common/DataSourceTag.tsx`), which marks
  every page as either "Live model", "Demo data (mock)", or "Demo data — live integration coming
  soon" so it's never ambiguous which is which.

Copy `.env.example` to `.env` and set:

```
VITE_API_MODE=live
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

`VITE_API_BASE_URL` must point at the real backend's versioned API root (include the `/api/v1`
prefix). No API keys live in the frontend — that backend doesn't require one for local/pilot use;
if a future deployment adds auth, put it behind a proxy that holds the credential server-side.

### How the live adapter works (`src/api/live/`)

- `backendTypes.ts` — TypeScript mirrors of the backend's exact Pydantic request/response schemas.
- `backendClient.ts` — thin `fetch` wrapper calling `/health`, `/assess`, `/explain`, `/what-if`.
- `machineRoster.ts` — the backend has no concept of a "fleet"; it only scores whatever reading you
  send it. Since there's no live plant sensor feed for this pilot, this file holds a small fixed
  roster of machine IDs/locations paired with **real sensor readings sampled from the training
  dataset** (`ai4i_augmented_classifier_dataset_v2.csv`), not synthetic values. The prediction shown
  in the UI is always a live call to the real trained model — only the input readings are frozen
  demo data pending a real sensor feed.
- `mapAssessment.ts` — maps the backend's response shapes onto this app's UI contract
  (`src/types/contract.ts`), e.g. `overall_risk_band: "critical"` → `risk_band: "CRITICAL"`. Every
  value here originates from the real backend call; nothing is invented.
- `liveApiClient.ts` — implements `ApiClient`, delegating the non-integrated methods straight through
  to `mockApiClient` (re-exported, not reimplemented) so mock and live never silently diverge on
  logic, only on which data source backs each method.

`src/api/httpApiClient.ts` still exists as a plain 1:1 REST reference implementation matching the
originally-documented contract — useful if a future unified backend implements all twelve
`ApiClient` methods directly — but `index.ts` currently wires `live` mode to `liveApiClient.ts`, not
this file.

## API contract

The full typed contract (`ClassifierOutput`, `CopilotMessage`, `MachineSummary`, `OverviewSummary`,
`SystemStatus`, `WhatIfRequest/Result`, `Alert`, `WorkOrder`, `Report`, `ModelConfidenceTrendPoint`,
etc.) lives in `src/types/contract.ts`. All API clients (`mockApiClient`, `liveApiClient`,
`httpApiClient`) implement the same `ApiClient` interface (`src/api/client.ts`):

- `getOverviewSummary()`
- `getMachineQueue()`
- `getMachineDetail(machineId)`
- `postCopilotMessage(req)`
- `getSystemStatus()`
- `runWhatIf(req)`
- `getAlerts()`
- `acknowledgeAlert(id)`
- `getModelConfidenceTrend()`
- `getReports()`
- `getWorkOrders()`
- `createWorkOrder(input)`

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

All nav routes are fully built: `/overview`, `/machines`, `/what-if`, `/copilot`, `/alerts`,
`/model-confidence`, `/reports`, `/work-orders`, `/administration`. Data source varies by page and by
`VITE_API_MODE` — see the `DataSourceTag` next to each page title, or the mock ↔ live section above.

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
