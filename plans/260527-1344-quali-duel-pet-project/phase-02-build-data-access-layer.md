---
phase: 2
title: "Build data access layer"
status: pending
priority: P1
effort: "2d"
dependencies: [1]
---

# Phase 2: Build data access layer

## Context Links

- Plan overview: [./plan.md](./plan.md)
- Previous phase: [./phase-01-research-and-scope.md](./phase-01-research-and-scope.md)
- OpenF1 docs: [https://openf1.org/docs/](https://openf1.org/docs/)

## Overview

Build the data layer that turns raw OpenF1 session responses into a stable comparison payload for the UI. This is the highest technical risk in the project.

## Key Insights

- OpenF1 provides historical `car_data` and `location` at roughly 3.7 Hz, enough for a smooth pet-project visualization.
- `laps` gives sector and lap timing context, while `sessions` and `drivers` populate the selectors.
- The hardest problem is not fetching data. It is aligning two laps by relative progress so the overlay feels honest.

## Requirements

- Functional:
  - fetch available meetings/sessions for qualifying weekends
  - fetch drivers and lap options for a chosen session
  - fetch lap-level telemetry inputs for two chosen laps
  - normalize data into one `LapComparisonPayload`
- Non-functional:
  - avoid duplicate fetch logic
  - keep route handlers cacheable
  - handle missing telemetry slices and partial OpenF1 responses gracefully

## Architecture

Suggested modules:
- `src/lib/openf1/openf1-client.ts`
- `src/lib/openf1/openf1-types.ts`
- `src/lib/openf1/openf1-mappers.ts`
- `src/lib/telemetry/merge-lap-samples.ts`
- `src/lib/telemetry/normalize-lap-progress.ts`
- `src/lib/telemetry/build-lap-comparison-payload.ts`
- `createServerFn` handlers in `src/server/*` as the app-facing boundary (TanStack Start)

Normalization strategy:
1. resolve session and lap metadata
2. fetch `car_data` and `location` for each selected lap window
3. merge nearest samples by timestamp
4. derive relative lap progress and approximate distance
5. compute delta, max/min metrics, and gain/loss segments

Fallback rule:
- If OpenF1-only progress alignment produces visibly wrong overlays on multiple circuits, introduce a later FastF1-backed adapter instead of complicating v1 immediately.

## Related Code Files

- Create: `src/lib/openf1/openf1-client.ts`
- Create: `src/lib/openf1/openf1-types.ts`
- Create: `src/lib/openf1/openf1-mappers.ts`
- Create: `src/lib/telemetry/build-lap-comparison-payload.ts`
- Create: `src/lib/telemetry/merge-lap-samples.ts`
- Create: `src/lib/telemetry/normalize-lap-progress.ts`
- Create: `src/server/fetch-sessions.ts`
- Create: `src/server/fetch-lap-comparison.ts`
- Create: `tests/fixtures/openf1/*`

## Implementation Steps

1. Implement a typed OpenF1 client with endpoint-specific helpers for sessions, drivers, laps, car data, and location.
2. Create route handlers that return app-specific selector data and comparison payloads.
3. Build the timestamp merge and lap-progress normalization pipeline.
4. Add schema validation for inbound query params and outbound normalized payloads.
5. Record a small set of real qualifying-session fixtures for repeatable tests.
6. Measure where alignment breaks on edge cases such as invalid laps, out laps, or sparse data windows.

## Todo List

- [ ] Implement OpenF1 client
- [ ] Implement typed route handlers
- [ ] Build telemetry merge pipeline
- [ ] Build lap-progress normalization
- [ ] Build comparison payload mapper
- [ ] Capture real fixtures for tests

## Success Criteria

- [ ] A route can return compare-ready data for two laps in one qualifying session
- [ ] Invalid or incomplete lap selections fail with clear errors
- [ ] Payload shape is stable enough for UI work to proceed independently
- [ ] At least a few real sessions confirm that overlays are readable and not obviously wrong

## Risk Assessment

- Risk: OpenF1 sample timing differs enough to make overlays jittery
  - Mitigation: nearest-sample merge, smoothing thresholds, and explicit fallback path
- Risk: rate limits or response slowness hurt UX
  - Mitigation: cache route output and keep selector fetches separate from heavy compare fetches
- Risk: qualifying laps with traffic or invalidated times create confusing results
  - Mitigation: filter unsupported laps in selector UI and flag unusual laps clearly

## Security Considerations

- Validate all user-controlled query params server-side
- Reject unbounded session and date queries
- Avoid exposing raw third-party failures directly to the UI

## Next Steps

Phase 3 uses this payload to build the actual comparison experience, charts, and branded interface.
