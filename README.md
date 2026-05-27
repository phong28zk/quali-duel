# Quali Duel

Historical F1 qualifying lap comparison. Pick a session, compare two laps, see
where each driver gained or lost time.

Built on [OpenF1](https://openf1.org/docs/). No live timing, no auth, no paid
infrastructure.

## Stack

- [TanStack Start](https://tanstack.com/start) on Vite 8 + Nitro 3
- React 19 + TypeScript
- [MUI v9](https://mui.com/) + Emotion (dark editorial theme)
- [Zod](https://zod.dev/) for all data contracts
- [Vitest 4](https://vitest.dev/) — 95 unit + integration tests
- Deploys to [Cloudflare Workers](https://developers.cloudflare.com/workers/)
  via the Nitro `cloudflare_module` preset

## Quickstart

```bash
pnpm install
pnpm dev          # http://localhost:8112
pnpm test         # 95 tests
pnpm typecheck    # tsc --noEmit
pnpm build        # generates .output/ + wrangler.json
```

## Deploy to Cloudflare Workers

```bash
pnpm exec wrangler login
pnpm deploy
```

`pnpm build` emits a worker bundle at `.output/server/index.mjs` plus a
generated `wrangler.json`. The `deploy` script chains `vite build` and
`wrangler deploy`.

See [docs/deployment-guide.md](./docs/deployment-guide.md) for details.

## Project layout

```
src/
├── routes/                 # File-based TanStack routes
│   ├── __root.tsx          # Theme + Emotion cache wrappers
│   ├── index.tsx           # Session list (server fn loader)
│   └── compare.tsx         # /compare?sessionKey=…&lapADriver=…
├── server/                 # createServerFn handlers + pure impls
├── lib/
│   ├── contracts/          # Zod schemas (SessionOption, LapOption, …)
│   ├── openf1/             # Raw OpenF1 types, mappers, HTTP client
│   ├── telemetry/          # Merge, normalize, build-comparison
│   └── ui/                 # Format helpers + SVG geometry
├── components/quali-duel/  # Cards, charts, selectors, track map
└── theme/                  # MUI theme + Emotion cache
tests/
├── fixtures/openf1/        # Hand-crafted Monza 2023 fixture
├── unit/
└── integration/
```

## How it works (one page)

1. **Selectors** call `fetchSessions` (server fn) → returns
   `SessionOption[]` filtered to Qualifying.
2. URL search params on `/compare` carry `sessionKey`, `lapADriver`, `lapALap`,
   `lapBDriver`, `lapBLap`. The route loader validates with Zod and calls
   `fetchLapComparison`.
3. The lap-comparison server function:
   1. Resolves the session + drivers + laps via OpenF1.
   2. Fetches `car_data` + `location` for each lap window.
   3. **Merges** the two streams nearest-neighbor by timestamp.
   4. **Normalizes** elapsed time into `[0, 1]` lap progress.
   5. **Builds** a delta series via piecewise-linear interpolation and
      summarizes gain/loss peaks.
4. The UI renders a delta-trace chart, telemetry overlays (speed, throttle,
   brake, gear), summary cards, and a racing-line track map — all as inline
   SVG with the design tokens in [`src/theme/quali-duel-theme.ts`](src/theme/quali-duel-theme.ts).

## Scope (v1)

| Included | Excluded |
|---|---|
| Historical Qualifying sessions | Race or sprint sessions |
| Two-lap delta + telemetry overlays | Three+ lap multi-compare |
| Shareable URL state | Auth, comments, persistence |
| Cloudflare Workers deploy | Paid live-timing feeds |

Next plan in the backlog: `Stint Story` — stint-level analysis reusing this
data layer.

## License

MIT (pet project).
