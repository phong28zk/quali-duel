# F1 Pet Project Ideas

## Overview

This doc saves the current shortlist for the repo direction.

Primary recommendation:
- Build `Quali Duel` first
- Expand later into `Stint Story`

Why:
- fastest path to a beautiful MVP
- high replay value for an F1 fan
- clear research depth without live-data pain
- strong portfolio signal

## Selection Lens

- Must be fun to obsess over
- Must look good on desktop and mobile
- Must be explainable in 10 seconds
- Must be buildable with real public data
- Must leave room for future expansion

## Idea 1: Quali Duel

Compare any two qualifying laps corner by corner.

Core experience:
- pick session
- pick two drivers and laps
- compare speed, throttle, brake, RPM, gear, DRS, mini sectors
- show delta over lap progress
- show mini track map with highlighted gain/loss zones

Why it fits:
- strongest first MVP
- instant visual payoff
- easy to understand for non-F1 people
- endless replay value for an F1 fan

Main risk:
- distance alignment must feel trustworthy

Best v1 scope:
- historical qualifying sessions only
- two-lap comparison
- no live timing

## Idea 2: Stint Story

Turn a race stint into a visual strategy story.

Core experience:
- choose driver and stint
- show tyre age, pace drop, traffic, pit window, incidents, weather, radio
- explain why pace changed

Why it fits:
- more unique than another telemetry dashboard
- feels like race-engineering storytelling

Main risk:
- UX harder than raw charts
- needs strong context modeling to avoid noise

Best follow-up after Quali Duel:
- reuse session picker, telemetry pipeline, chart system

## Idea 3: Pit Wall Replay

Replay a full race as an animated control-room timeline.

Core experience:
- timeline of lap-by-lap positions
- pit stops, gaps, tyre compounds, safety car, incidents
- click any lap to inspect context

Why it fits:
- cinematic
- strong demo value

Main risk:
- more moving state
- broader scope than needed for first build

## Idea 4: Team Radio Atlas

Map team radio moments to race events and telemetry context.

Core experience:
- browse radio clips by session and driver
- align clip timestamps with pace, incidents, tyre phase, track position

Why it fits:
- strong emotional hook
- mixes data with drama

Main risk:
- less clean as a first project than lap comparison
- radio context must be curated well

## Idea 5: Tyre Window Lab

Explore tyre degradation, stint evolution, and undercut windows.

Core experience:
- compare stints across drivers
- visualize tyre life, pace decay, and likely undercut moments

Why it fits:
- very nerdy in the right way
- useful stepping stone toward strategy tooling

Main risk:
- easier to make correct than exciting

## Recommendation

### First build

`Quali Duel`

### Second build

`Stint Story`

### Expansion path

1. `Quali Duel`
2. add saved comparisons and shareable URLs
3. add track-map gain/loss overlays
4. expand into `Stint Story`
5. optionally add `Pit Wall Replay`

## Product Direction

Brand feel:
- technical
- sharp
- modern
- not a copy of official F1 red-black styling

Visual language:
- graphite base
- ice blue telemetry accents
- lime gain indicators
- amber warning/high-brake indicators
- dense but readable editorial layout

Tone:
- calm
- analytical
- fan-made but serious

## Data Direction

Preferred v1 data direction:
- historical sessions only
- OpenF1 as primary source
- optional FastF1 fallback later if lap alignment quality needs improvement

Avoid in v1:
- live timing
- auth
- social features
- fantasy scoring
- race prediction

## References

- [OpenF1 docs](https://openf1.org/docs/)
- [FastF1 docs](https://docs.fastf1.dev/)
- [FastF1 telemetry examples](https://docs.fastf1.dev/gen_modules/examples_gallery/plot_speed_traces.html)
- [2025 Global F1 Fan Survey](https://www.formula1.com/en/latest/article/formula-1-and-motorsport-network-unveil-2025-global-fan-survey.4YqMebNy8BLaapyJfjzDXO)

## Unresolved Questions

- Do we want a pure TypeScript stack first, or a TS frontend plus Python analysis worker later?
- Do we want v1 to compare fastest laps only, or any selected qualifying lap?
