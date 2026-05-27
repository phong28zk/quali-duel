import { defineNitroConfig } from 'nitro/config';

export default defineNitroConfig({
  compatibilityDate: '2024-11-06',
  preset: 'cloudflare_module',
  cloudflare: {
    deployConfig: true,
    nodeCompat: true,
    // Pin the worker name so it stays stable across env / git remote changes.
    wrangler: { name: 'quali-duel' },
  },
});
