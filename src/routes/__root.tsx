/// <reference types="vite/client" />
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { qualiDuelTheme } from '~/theme/quali-duel-theme';
import { createEmotionCache } from '~/theme/emotion-cache';
import { SiteFrame } from '~/components/quali-duel/site-frame';
import tokensStylesheet from '~/styles/tokens.css?url';
import globalsStylesheet from '~/styles/globals.css?url';

const emotionCache = createEmotionCache();

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Quali Duel — F1 qualifying lap comparison' },
      {
        name: 'description',
        content:
          'Side-by-side telemetry comparison for two qualifying laps. Built on OpenF1.',
      },
      {
        name: 'theme-color',
        content: '#0b0f14',
      },
    ],
    links: [
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap',
      },
      { rel: 'stylesheet', href: tokensStylesheet },
      { rel: 'stylesheet', href: globalsStylesheet },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <CacheProvider value={emotionCache}>
          <ThemeProvider theme={qualiDuelTheme}>
            <CssBaseline />
            <SiteFrame>{children ?? <Outlet />}</SiteFrame>
          </ThemeProvider>
        </CacheProvider>
        <Scripts />
      </body>
    </html>
  );
}
