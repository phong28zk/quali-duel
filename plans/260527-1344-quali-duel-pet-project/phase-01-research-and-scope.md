---
phase: 1
title: "Research and scope"
status: pending
priority: P1
effort: "1d"
dependencies: []
---

# Phase 1: Research and scope

## Context Links

- Idea doc: [../../docs/f1-pet-project-ideas.md](../../docs/f1-pet-project-ideas.md)
- Plan overview: [./plan.md](./plan.md)
- Data source: [OpenF1 docs](https://openf1.org/docs/)
- Analysis reference: [FastF1 telemetry docs](https://docs.fastf1.dev/api_reference/telemetry.html)
- Overlay example: [FastF1 speed-trace example](https://docs.fastf1.dev/gen_modules/examples_gallery/plot_speed_traces.html)

## Overview

Define the MVP boundaries, lock the stack, and turn the repo from empty shell into a clear build target. This phase prevents the project from drifting into a generic dashboard.

## Key Insights

- Historical OpenF1 data is free from 2023 onward; real-time access is paid. That makes historical qualifying the right v1 scope.
- OpenF1 exposes `sessions`, `drivers`, `laps`, `car_data`, and `location`, which is enough for a browser-first comparison workflow.
- FastF1 already documents distance-based lap overlays. Keep that as a fallback reference if OpenF1-only alignment looks weak.
- Repo is effectively greenfield. There is no existing app structure to preserve.

## Requirements

- Functional:
  - define one-page MVP around qualifying lap comparison
  - choose app stack and charting approach
  - define comparison payload contract before UI work
  - document what v1 excludes
- Non-functional:
  - keep first pass deployable by one developer
  - avoid paid services in v1
  - optimize for strong visual quality and maintainable modules

## Architecture

Recommended stack:
- TanStack Start + TypeScript for app shell, file-based routes, and server functions
- Vitest for unit/integration tests; Playwright for one e2e flow
- Cloudflare Workers (via Nitro `cloudflare_module` preset) for deployment
- Tokenized CSS variables for custom styling (no framework runtime cost)
- D3-driven SVG charts for full control over telemetry traces
- OpenF1-first server-side fetch via `createServerFn` with normalized response types

Core contract to define in this phase:
- `SessionOption`
- `DriverOption`
- `LapOption`
- `NormalizedTelemetrySample`
- `LapComparisonPayload`

## Related Code Files

- Create: `package.json`
- Create: `tsconfig.json`
- Create: `app.config.ts`
- Create: `wrangler.toml`
- Create: `src/router.tsx`
- Create: `src/routes/__root.tsx`
- Create: `src/routes/index.tsx`
- Create: `src/lib/contracts/*`
- Create: `src/lib/openf1/*`
- Create: `src/lib/telemetry/*`
- Create: `src/styles/*`
- Modify: `docs/f1-pet-project-ideas.md`

## Implementation Steps

1. Bootstrap the project with the chosen React/TypeScript stack and folder structure.
2. Write a short architecture note inside the repo docs for the chosen OpenF1-first approach.
3. Define the MVP data contract for session, driver, lap, telemetry, and comparison summary.
4. Decide the first visual direction: typography, color tokens, spacing rules, telemetry chart style.
5. Lock v1 boundaries: qualifying only, historical only, two-lap compare only.
6. Record the fallback rule: if OpenF1-only lap alignment is visually misleading, add a FastF1 preprocessing adapter in a later phase.

## Todo List

- [ ] Pick stack and charting library
- [ ] Define lap-comparison payload
- [ ] Define route map and module boundaries
- [ ] Define design tokens and UI direction
- [ ] Freeze v1 scope

## Success Criteria

- [ ] Scope is narrow enough to finish as a first pet-project release
- [ ] Stack and module layout are decided before feature coding starts
- [ ] Core payload contract exists and is understandable without implementation guesswork
- [ ] FastF1 fallback is documented as optional, not part of the initial build

## Risk Assessment

- Risk: stack indecision burns time before product work starts
  - Mitigation: choose Next.js + TS now unless a blocking constraint appears
- Risk: design references drift into “generic dashboard”
  - Mitigation: lock a sharper visual direction before building charts
- Risk: scope expands into live timing or race-strategy features
  - Mitigation: explicitly keep those out of v1

## Security Considerations

- Route all third-party requests through server-side modules when possible
- Do not rely on browser-only secrets or paid live-data credentials
- Add safe error states for missing or partial data

## Next Steps

Phase 2 builds the OpenF1 access layer and the telemetry normalization pipeline that every later screen depends on.
