# Quali Duel Supplement: SVG, Motion, Imagegen, and Tech Stack

## Context

Use this file as the visual-and-technical appendix for:
- [plan.md](./plan.md)
- [phase-01-research-and-scope.md](./phase-01-research-and-scope.md)
- [phase-03-build-lap-comparison-experience.md](./phase-03-build-lap-comparison-experience.md)
- [../../docs/f1-pet-project-ideas.md](../../docs/f1-pet-project-ideas.md)

## Purpose

Define the SVG illustration system, SVG animation strategy, image-generation prompts, and the final stack recommendation before implementation starts.

## Visual Direction

Mood:
- precision
- speed
- tension
- cold data with warm race drama

Do not copy official F1 broadcast graphics.
Build a fan-made telemetry lab aesthetic instead.

Core palette:
- graphite `#0b0f14`
- panel charcoal `#121821`
- telemetry blue `#6ec8ff`
- gain lime `#b7ff2a`
- braking amber `#ffb02e`
- alert red `#ff5a5f`
- text smoke `#d7dee7`
- quiet line `#2a3442`

## SVG System

Use SVG where the product benefits from sharp vector control:
- track map
- sector badges
- telemetry icons
- comparison markers
- empty-state illustrations
- export/share card ornaments
- logo mark

System rules:
- keep `viewBox` tight to content bounds
- use one consistent stroke system, target `3px`
- use rounded joins and caps
- use one consistent container radius, target `16px`
- prefer grouped elements and reusable defs for gradients and shadows
- keep file size lean; no decorative clutter that does not improve meaning

Suggested SVG deliverables:
1. `quali-duel-wordmark.svg`
2. `track-progress-shell.svg`
3. `sector-gain-loss-badges.svg`
4. `telemetry-icons.svg`
5. `empty-state-no-lap-selected.svg`
6. `share-card-frame.svg`

## SVG Animation Strategy

Use motion as explanation, not decoration.

Recommended animation patterns:
- path draw reveal for track-progress map on first load
- delta-chart fade and line sweep on first successful comparison
- sector markers pulse only when gain/loss changes are highlighted
- throttle/brake legends use tiny opacity changes, not bouncing
- share-card export can use one quick progress sweep if exported in-browser

Avoid:
- constant looping motion across the entire screen
- morphing for the sake of showing off
- blurred glow overload
- physics-heavy motion that slows chart interaction

Timing rules:
- micro transitions: `120ms` to `180ms`
- panel/chart reveals: `240ms` to `420ms`
- hero path draw: `700ms` to `1200ms`, first load only

Implementation bias:
- CSS or Framer Motion for UI transitions
- inline SVG with CSS animation for simple pulses and stroke-draw reveals
- only use JS-driven SVG animation when the visual depends on live data values

## SVG Scenes Needed For Quali Duel

### Scene 1: Track Progress Map

Purpose:
- show lap progress
- highlight where driver A gained or lost

Structure:
- base track outline
- progress overlay
- sector labels
- 3-5 highlighted gain/loss nodes

### Scene 2: Telemetry Legend Icon Set

Icons:
- speed
- throttle
- brake
- gear
- DRS
- sector split

Style:
- outline icons
- minimal geometry
- same stroke width across all icons

### Scene 3: Empty State Illustration

Purpose:
- page should still look intentional before a comparison is loaded

Concept:
- simplified wireframe track map
- stacked telemetry traces in ghost lines
- quiet prompt to select a session and two laps

### Scene 4: Share Card Frame

Purpose:
- future export asset for X/Reddit posts

Concept:
- left driver panel
- right driver panel
- center delta badge
- bottom mini telemetry strip or track map

## Imagegen Prompts

### Prompt 1: Main App Concept

Create a premium F1 telemetry web app called "Quali Duel". Editorial motorsport dashboard, graphite and black base, ice-blue telemetry traces, lime gain highlights, amber braking accents. Large delta chart across the center, stacked speed/throttle/brake traces below, compact track-progress map on the side, sharp typography, cinematic but analytical, premium control-room feeling, desktop product screenshot, minimal clutter, vector-friendly shapes.

### Prompt 2: Empty State Illustration

Create a clean SVG-friendly illustration for an F1 telemetry app empty state. Minimal track outline, ghost telemetry traces, subtle motorsport panel framing, graphite background, blue and lime accents, technical and elegant, no cartoon style, no mascots, clean vector geometry.

### Prompt 3: Share Card Concept

Create a social share card for an F1 lap comparison app. Two drivers side by side, center delta time, mini track map and sector highlights, dark premium motorsport aesthetic, compact editorial layout, sharp data-visualization styling, designed for X and Reddit sharing.

## Imagegen Output In This Session

Generated concept direction:
- one main Quali Duel dashboard concept image created in-session
- use it as mood reference, not final UI spec

## Tech Stack Decision

Short answer:
- yes, we can use Rust, Go, or Python
- no, they should not replace the frontend stack decision

Reality:
- the UI still lives in the browser
- for this product, frontend quality matters more than backend raw speed in v1
- the expensive work is data shaping, not massive throughput

### Option A: TypeScript Frontend + TypeScript Server

Shape:
- Next.js app
- route handlers as BFF
- OpenF1-first integration

Pros:
- fastest MVP
- one language across app and server edge
- easiest to keep momentum

Cons:
- less analytical power than Python if you later go deep into telemetry science
- not the fastest runtime, but good enough for v1

Verdict:
- best v1 choice if speed of building matters most

### Option B: TypeScript Frontend + Python Analysis Worker

Shape:
- Next.js for product UI
- Python worker or scripts for telemetry alignment, FastF1 experiments, offline data prep

Pros:
- strongest combo for F1 nerd happiness
- Python is the old king for data analysis and motorsport tooling
- easiest path if we later use FastF1 heavily

Cons:
- two runtimes
- more project wiring

Verdict:
- best long-term combo if you want both beautiful product UI and serious telemetry research

### Option C: TypeScript Frontend + Go Service

Shape:
- Next.js frontend
- Go API or precompute service for normalized comparison payloads

Pros:
- simple compiled backend
- good performance and deployment story
- cleaner than Rust for quick backend iteration

Cons:
- weaker ecosystem for motorsport analysis than Python
- still need TS for frontend

Verdict:
- sensible if you want a compiled backend without overcomplicating the project

### Option D: TypeScript Frontend + Rust Service

Shape:
- Next.js frontend
- Rust service for telemetry preprocessing or export pipeline

Pros:
- fastest and most robust low-level option
- fun if you personally want the challenge

Cons:
- highest implementation drag for this use case
- worst fit for an early pet-project MVP unless the Rust part itself is the hobby

Verdict:
- not recommended for v1 unless your main joy is writing Rust, not shipping Quali Duel

## Recommendation

Recommended path for this repo:
1. start with `Next.js + TypeScript` for the full app shell
2. keep OpenF1 as the live project data source for v1
3. add `Python` later as an optional analysis worker if lap alignment or offline comparison logic needs FastF1 depth
4. only add `Go` or `Rust` if a real bottleneck appears, not preemptively

Metaphor version:
- old king: `Python` for analysis and deeper race research
- new prince: `TypeScript` for product experience and frontend velocity
- useful general: `Go` if you later want a neat compiled service
- overpowered war engine: `Rust`, only if you truly want that war

## Build Consequence

If you choose the recommended path:
- Phase 1 stays mostly unchanged
- Phase 2 stays OpenF1-first
- Python becomes a later adapter, not an up-front dependency
- SVG track maps and animation work slot into Phase 3 cleanly

If you choose Go early:
- add a service boundary in Phase 2
- keep UI plan unchanged

If you choose Rust early:
- expect Phase 2 effort to increase
- do it only for personal fun, not because the app needs it yet

## Unresolved Questions

- Do you want the first shipped version to be pure TS, or do you want Python included from day one for telemetry experiments?
- Do you want SVG assets hand-authored in code, or generated once and then refined manually?
