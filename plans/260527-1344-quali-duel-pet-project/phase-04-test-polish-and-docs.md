---
phase: 4
title: "Test polish and docs"
status: pending
priority: P2
effort: "2d"
dependencies: [3]
---

# Phase 4: Test polish and docs

## Context Links

- Plan overview: [./plan.md](./plan.md)
- Previous phase: [./phase-03-build-lap-comparison-experience.md](./phase-03-build-lap-comparison-experience.md)

## Overview

Make the MVP reliable, explainable, and ready for public sharing. This phase converts a cool prototype into a strong pet-project artifact.

## Key Insights

- The app only needs a few strong test layers, not a giant test matrix.
- Real recorded fixtures matter more than synthetic mocked telemetry for this project.
- Good docs increase the project’s value because the product is partly a research artifact.

## Requirements

- Functional:
  - add tests around telemetry normalization and comparison routes
  - verify one complete compare flow in the UI
  - write concise setup and architecture docs
- Non-functional:
  - no obvious accessibility failures
  - route and page performance stay acceptable for hobby hosting
  - future contributor can understand the data pipeline quickly

## Architecture

Test layers:
- unit tests for lap merge and normalization helpers
- integration tests for API route handlers with real fixtures
- one browser flow for session select -> lap select -> comparison render

Documentation targets:
- repo README for setup and product summary
- short architecture notes for OpenF1-first design and fallback strategy
- update idea doc if product direction shifts during implementation

## Related Code Files

- Create: `tests/unit/*`
- Create: `tests/integration/*`
- Create: `tests/e2e/*`
- Modify: `README.md`
- Modify: `docs/f1-pet-project-ideas.md`
- Modify: `docs/system-architecture.md`
- Modify: `docs/codebase-summary.md`

## Implementation Steps

1. Add unit coverage for telemetry merge, progress normalization, and delta calculations.
2. Add integration tests for route handlers using recorded OpenF1 fixtures.
3. Add one end-to-end flow for selecting a session and rendering a comparison.
4. Audit loading states, keyboard navigation, color contrast, and chart labeling.
5. Write or update setup docs, architecture notes, and follow-up roadmap notes.
6. Trim dead UI paths and refactor any files that grow beyond the repo’s file-size guidance.

## Todo List

- [ ] Add unit tests for telemetry math
- [ ] Add integration tests for compare route
- [ ] Add one e2e comparison flow
- [ ] Run accessibility and performance checks
- [ ] Update README and docs
- [ ] Record next-step backlog for `Stint Story`

## Success Criteria

- [ ] Core telemetry math has regression coverage
- [ ] One full comparison flow is verified end to end
- [ ] Setup docs are good enough for a future cold start
- [ ] Remaining v2 ideas are documented without polluting v1 scope

## Risk Assessment

- Risk: tests become brittle because third-party data changes
  - Mitigation: use recorded real fixtures for deterministic runs
- Risk: docs lag behind implementation
  - Mitigation: treat docs as completion criteria, not optional cleanup
- Risk: visual polish never ends
  - Mitigation: stop when the product is coherent and stable, then move to v2

## Security Considerations

- Never commit secrets or paid API credentials
- Keep fixture files scrubbed of unnecessary metadata
- Confirm third-party request errors do not leak internal traces to end users

## Next Steps

After this phase, the natural follow-on plan is `Stint Story`, reusing the session model, telemetry modules, chart primitives, and design tokens from Quali Duel.
