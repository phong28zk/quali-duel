---
phase: 3
title: "Build lap comparison experience"
status: pending
priority: P1
effort: "3d"
dependencies: [2]
---

# Phase 3: Build lap comparison experience

## Context Links

- Plan overview: [./plan.md](./plan.md)
- Previous phase: [./phase-02-build-data-access-layer.md](./phase-02-build-data-access-layer.md)
- Idea doc: [../../docs/f1-pet-project-ideas.md](../../docs/f1-pet-project-ideas.md)

## Overview

Turn the normalized payload into a distinctive product experience: session selection, lap selection, telemetry overlays, track context, and instant readability.

## Key Insights

- This project wins on presentation, not only on data correctness.
- A good first screen should answer “who was faster where?” without making the user decode five charts manually.
- URL-driven state matters because shareable comparisons increase the project’s portfolio value.

## Requirements

- Functional:
  - session, driver, and lap selectors
  - side-by-side summary cards
  - delta chart across lap progress
  - speed, throttle, brake, gear, RPM traces
  - mini track map or progress strip highlighting gain/loss areas
  - shareable URL state
- Non-functional:
  - desktop-first but mobile-safe
  - charts remain readable on slower devices
  - loading and empty states feel polished

## Architecture

Suggested UI slices:
- `ComparisonPageShell`
- `SessionAndLapSelectors`
- `LapSummaryCards`
- `DeltaTraceChart`
- `TelemetryStackCharts`
- `TrackProgressMap`
- `InsightCallouts`

State strategy:
- use URL search params as the main shareable state
- keep route fetches server-driven where possible
- isolate chart rendering from selector state to reduce rerender noise

Visual direction:
- editorial telemetry dashboard, not a generic admin panel
- expressive type choices
- dark graphite background with sharp accent colors
- motion limited to meaningful transitions only

## Related Code Files

- Create: `src/app/page.tsx`
- Create: `src/components/quali-duel/*`
- Create: `src/components/charts/*`
- Create: `src/components/track-map/*`
- Create: `src/lib/ui/*`
- Create: `src/styles/tokens.css`
- Create: `src/styles/globals.css`

## Implementation Steps

1. Build the page shell and selector flow on top of the Phase 2 route contracts.
2. Implement summary cards for lap time, sector times, top speed, and compound/context fields that are available.
3. Build the delta chart first, then stack the core telemetry charts under it.
4. Add a compact track-progress visualization or simplified map with colored gain/loss segments.
5. Make comparison state shareable via URL parameters.
6. Add polished loading, error, and no-data states that still feel on-brand.
7. Review layout density on mobile and reduce clutter without removing the core story.

## Todo List

- [ ] Build page shell and selectors
- [ ] Build summary metrics strip
- [ ] Build delta chart
- [ ] Build telemetry trace charts
- [ ] Build progress-map view
- [ ] Add shareable URL state
- [ ] Add loading and error states

## Success Criteria

- [ ] A user can compare two laps end to end from a single page
- [ ] Gain/loss zones are visually obvious without tooltips
- [ ] UI looks portfolio-grade rather than internal-tool grade
- [ ] Shared URL fully restores the viewed comparison

## Risk Assessment

- Risk: the UI becomes chart-heavy and overwhelming
  - Mitigation: prioritize one hero chart, then stack supporting views
- Risk: mobile layout collapses under data density
  - Mitigation: simplify chart count and use progressive disclosure on small screens
- Risk: a custom visual style slows delivery
  - Mitigation: lock a restrained design system early and reuse chart primitives

## Security Considerations

- Sanitize all URL-driven state before use
- Avoid any unsafe client-side HTML rendering
- Keep third-party asset loading minimal and explicit

## Next Steps

Phase 4 focuses on confidence: tests, accessibility, performance polish, and enough docs for future expansion into `Stint Story`.
