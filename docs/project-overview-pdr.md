# Project Overview / Product Development Requirements

## Product

**Quali Duel** is a pet-project F1 telemetry comparison app. The user picks a
historical qualifying session, selects two laps, and immediately sees where
each driver gained or lost time.

## Why this exists

- F1 broadcast graphics are great for the moment but bad for replay analysis.
- Existing telemetry sites lean toward dashboards for power users.
- This project leans toward an *editorial telemetry lab* aesthetic — one strong
  delta chart, supporting traces, clean track map, polished typography.

## Target user

A fan who:

- Reads /r/formula1 race threads.
- Already understands sector splits, DRS, and throttle traces.
- Wants to share a comparison link to a specific lap pair.

Not in scope: real-time strategists, paid race-engineering tools.

## Core flow

1. Land on `/`. See most recent qualifying weekends from the previous year.
2. Click a weekend → navigate to `/compare?sessionKey=…`.
3. Append `lapADriver`, `lapALap`, `lapBDriver`, `lapBLap` to the URL (or use
   the selectors when those are wired in a follow-up iteration).
4. See: hero delta number, two driver cards, delta-trace chart, four telemetry
   trace charts, track outline.
5. Share the URL — the full comparison is reproducible.

## Non-goals (explicitly out)

- Race / sprint sessions
- Live timing data
- User accounts, comments, fantasy
- Race-strategy tools
- Mobile-first or AMP layouts (mobile-safe is enough)

## Success criteria

- One page, two laps, immediate "where did the time go?" readability.
- Looks portfolio-grade, not internal-tool-grade.
- Modules reusable for a future `Stint Story` plan without rework.

## Risks

| Risk | Mitigation |
|---|---|
| OpenF1 lap alignment drifts visibly on some circuits | Recorded fixtures gate regressions; FastF1 preprocessing remains documented as the v2 fallback. |
| OpenF1 rate limits on Cloudflare cold start | Server-side fetch with intent to add edge caching when traffic warrants it. |
| Visual polish over-runs the schedule | Locked palette + tokens before Phase 3 to bound design iterations. |
