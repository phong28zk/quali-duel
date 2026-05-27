# System Architecture

## Runtime topology

```
Browser
   │
   │ HTTP (SSR + hydration)
   ▼
Cloudflare Worker (Nitro cloudflare_module preset)
   │
   ├── TanStack Start router
   │     ├── /        → loader: fetchSessions
   │     └── /compare → loader: fetchLapComparison
   │
   └── createServerFn handlers
         ├── fetchSessions  ──┐
         └── fetchLapComparison ─► OpenF1 HTTP client ─► api.openf1.org/v1/*
```

No database. No auth. No queue. The Worker is stateless; every request
re-fetches OpenF1 directly.

## Data pipeline

The hard work happens in `src/lib/telemetry/` + `src/server/`. Pure functions,
testable without React or fetch.

```
OpenF1 raw responses                Domain contracts
─────────────────────                ────────────────
sessions       ──map──►              SessionOption
drivers        ──map──►              DriverOption
laps           ──map──►              LapOption (filtered to valid completed laps)
car_data + location ─merge─► MergedSample[]
                                     │ elapsedSeconds, speed/throttle/brake/gear/rpm/drs, x/y
                                     ▼
                       normalizeLapProgress(samples, lapDurationSeconds)
                                     │ progress ∈ [0,1], brake binarized, gear clamped
                                     ▼
                              NormalizedTelemetrySample[]
                                     │
                       buildLapComparisonPayload({lapA, lapB, session})
                                     │ piecewise-linear interp on common progress grid
                                     ▼
                          LapComparisonPayload (schema-validated)
                                     │ deltaSeries + summary {totalDelta, maxGain, maxLoss}
                                     ▼
                                    UI
```

### Merge step (`merge-lap-samples.ts`)

OpenF1 emits `car_data` and `location` as independent streams at ~3.7 Hz with
non-aligned timestamps. We binary-search the sorted location array for the
nearest sample to each `car_data` point.

Output: `MergedSample[]` with elapsed-seconds (relative to lap start), all
telemetry channels, and absolute track position.

### Normalize step (`normalize-lap-progress.ts`)

Maps wall-clock elapsed time into lap-progress space `[0, 1]`. Side effects:

- Brake binarized (OpenF1 brake is 0/100 on the wire; we treat anything > 0 as
  on).
- Throttle, gear, drs clamped to physical ranges.
- Negative or NaN values dropped to zero.

### Compare step (`build-lap-comparison-payload.ts`)

Resamples both laps onto a 101-point common progress grid using
piecewise-linear interpolation of `timeSeconds`. The delta series is
`tA(p) - tB(p)` at each grid point. The summary identifies the progress values
where lapA is most ahead (gain peak, min delta) and most behind (loss peak,
max delta).

Schema-validated through `LapComparisonPayloadSchema` so downstream consumers
can trust the shape, monotonic delta progress, and same-session invariants.

## Server functions

`createServerFn` from `@tanstack/react-start` is the only interface the UI
uses to reach OpenF1. The pattern:

```ts
export const fetchSomething = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => SomeSchema.parse(data))
  .handler(async ({ data }) => doImpl(createOpenF1Client(), data));
```

Pure orchestration lives in a sibling `*-impl.ts` file so it can be unit-tested
with an in-memory `OpenF1Client` stub.

## OpenF1 client

`src/lib/openf1/openf1-client.ts` is a small typed wrapper over `fetch`. Key
details:

- Sorted, deterministic querystrings (so tests can assert exact URLs).
- OpenF1's operator-bearing keys (`date>=`, `date<=`) emitted verbatim instead
  of percent-encoding the operator.
- Every response item parsed through a Zod schema — bad shapes fail fast.

The client accepts an optional `fetchImpl` for tests; in production it uses the
global `fetch` from the Workers runtime.

## UI architecture

- **Routes** (`src/routes/`): one file per URL. Route loaders return the data
  the component needs; TanStack handles SSR + hydration.
- **Components** (`src/components/quali-duel/`): pure functional components.
  No client-side data fetching. SVG-first charts for full control of styling.
- **Theme** (`src/theme/quali-duel-theme.ts`): single MUI theme + Emotion
  cache. All colours flow through `qualiDuelPalette`.
- **Utilities** (`src/lib/ui/`): pure formatters and SVG geometry helpers,
  TDD-covered.

## Why not a chart library

We need exactly four trace shapes (delta with gain/loss fill, generic
telemetry overlay, track outline). A 200-line `svg-helpers.ts` covers all of
them without dragging in a charting library's bundle weight.

## Future hooks

- Add a FastF1 preprocessing adapter as a second OpenF1 client implementation
  if lap-progress alignment drifts visibly.
- Layer `TanStack Query` caching on top of the server functions when traffic
  warrants — the server-fn handlers already isolate the boundary.
- A `stint-comparison-payload` schema can sit next to `lap-comparison-payload`
  for the planned `Stint Story` plan.
