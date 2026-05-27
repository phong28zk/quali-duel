# Deployment Guide

Target: Cloudflare Workers via the Nitro `cloudflare_module` preset.

## One-time setup

```bash
pnpm install
pnpm exec wrangler login
```

Wrangler stores credentials in `~/.wrangler/`. Confirm with:

```bash
pnpm exec wrangler whoami
```

## Local dev

```bash
pnpm dev      # http://localhost:8112  (Vite dev server with HMR)
```

Vite is the dev server, not Wrangler. Server functions and route handlers run
under Node during dev with the same Nitro adapter loaded.

## Production build

```bash
pnpm build
```

Outputs:

- `.output/server/index.mjs` — the Worker entry
- `.output/server/wrangler.json` — generated config (don't edit by hand)
- `.output/public/_headers` — Cloudflare Pages-style headers
- `.wrangler/deploy/config.json` — points `wrangler deploy` at the right
  config path

The `wrangler.json` is regenerated on every build; if you need to override the
worker name, set it in `nitro.config.ts` instead of editing the generated
file.

## Deploy

```bash
pnpm deploy
```

The `deploy` npm script chains `vite build` + `wrangler deploy`. Wrangler
reads `.wrangler/deploy/config.json` → `.output/server/wrangler.json` and
uploads the bundle.

First deploy will prompt to create the worker (default name is taken from the
git repo / cwd). Subsequent deploys update it in place.

## Configuration

### `nitro.config.ts`

```ts
import { defineNitroConfig } from 'nitro/config';

export default defineNitroConfig({
  compatibilityDate: '2024-11-06',
  preset: 'cloudflare_module',
  cloudflare: {
    deployConfig: true,   // generate .wrangler/deploy/config.json
    nodeCompat: true,     // enable node:async_hooks + friends
  },
});
```

- `compatibilityDate` pins the Workers runtime contract — bump it cautiously.
- `nodeCompat: true` is required so that TanStack Start's SSR machinery
  (Web streams, async hooks) works on Workers.

### `vite.config.ts`

The `nitro()` plugin reads `nitro.config.ts`. The `tanstackStart()` plugin
generates `routeTree.gen.ts` on dev/build. Order matters:

```ts
plugins: [
  tanstackStart({ srcDirectory: 'src' }),
  viteReact(),
  nitro(),
],
```

## Environment variables

None required for v1. OpenF1 is a public API; the worker calls it directly.

If you add secrets later:

```bash
pnpm exec wrangler secret put SOME_KEY
```

…and read via `process.env.SOME_KEY` in server functions (Nitro polyfills this
on Workers).

## Troubleshooting

- **`@emotion/styled` missing at runtime** — add it as an explicit dependency
  alongside `@emotion/react`. MUI's styled-engine peer-imports it but pnpm's
  strict hoisting doesn't surface it automatically.
- **`vite build` reports stale routeTree** — delete `src/routeTree.gen.ts` and
  rebuild; the plugin regenerates on the first dev/build invocation.
- **`wrangler deploy` complains about overridden config** — Nitro warns when
  `wrangler.toml` exists alongside generated config. Delete the local
  `wrangler.toml` and let Nitro own it.
- **Worker times out fetching OpenF1** — add `compatibility_flags = ["nodejs_compat"]`
  to ensure DNS and fetch agents resolve correctly; this is on by default with
  `nodeCompat: true` but verify in the generated `wrangler.json`.

## Rollback

Wrangler keeps deployment history. To roll back to the previous version:

```bash
pnpm exec wrangler deployments list
pnpm exec wrangler rollback <deployment-id>
```
