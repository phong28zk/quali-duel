---
title: "Quali Duel MVP"
description: "Historical F1 qualifying lap comparison pet project with a comparison-first UI."
status: pending
priority: P1
branch: ""
tags: ["f1", "telemetry", "pet-project", "frontend"]
blockedBy: []
blocks: []
created: "2026-05-27T06:45:00.561Z"
createdBy: "ck:plan"
source: skill
---

# Quali Duel MVP

## Overview

Build a beautiful F1 qualifying comparison app that lets a user pick a session, compare two laps, and understand where time was won or lost. Start with historical qualifying only, OpenF1-first data access, and no live timing.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Research and scope](./phase-01-research-and-scope.md) | Complete |
| 2 | [Build data access layer](./phase-02-build-data-access-layer.md) | Complete |
| 3 | [Build lap comparison experience](./phase-03-build-lap-comparison-experience.md) | Pending |
| 4 | [Test polish and docs](./phase-04-test-polish-and-docs.md) | Pending |

## Dependencies

- No overlapping unfinished implementation plans found in `./plans/`
- Primary data source: [OpenF1](https://openf1.org/docs/)
- Analysis reference and fallback option: [FastF1](https://docs.fastf1.dev/)

## Scope Guardrails

- Include: qualifying sessions, two-lap comparison, telemetry charts, delta view, mini track map, shareable URL state
- Exclude: live timing, race strategy, auth, comments, fantasy features, paid infra

## Success Criteria

- A user can open one page, choose a qualifying session, compare two laps, and immediately see where each driver gained or lost time
- UI looks intentional enough to stand alone as a portfolio-quality pet project
- Data layer is modular enough to support later expansion into `Stint Story`
