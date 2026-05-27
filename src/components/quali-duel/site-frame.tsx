import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link } from '@tanstack/react-router';
import { Wordmark } from './wordmark';
import { qualiDuelPalette } from '~/theme/quali-duel-theme';

interface SiteFrameProps {
  children: ReactNode;
}

// Shared chrome: sticky-translucent top bar with wordmark, footer with credit.
// Keeps every route consistent without each one reinventing the layout.
export function SiteFrame({ children }: SiteFrameProps) {
  return (
    <>
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'rgba(11, 15, 20, 0.72)',
          backdropFilter: 'saturate(140%) blur(10px)',
          borderBottom: `1px solid ${qualiDuelPalette.quietLine}`,
        }}
      >
        <Box
          sx={{
            maxWidth: 1200,
            mx: 'auto',
            px: { xs: 2.5, md: 4 },
            py: 1.75,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link to="/" style={{ display: 'flex', textDecoration: 'none' }}>
            <Wordmark height={26} />
          </Link>
          <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
              }}
            >
              v0.1
            </Typography>
          </Stack>
        </Box>
      </Box>
      <Box component="main" sx={{ minHeight: 'calc(100vh - 140px)' }}>
        {children}
      </Box>
      <Box
        component="footer"
        sx={{
          borderTop: `1px solid ${qualiDuelPalette.quietLine}`,
          py: 4,
          mt: 8,
        }}
      >
        <Box
          sx={{
            maxWidth: 1200,
            mx: 'auto',
            px: { xs: 2.5, md: 4 },
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Built on{' '}
            <a
              href="https://openf1.org"
              style={{ color: qualiDuelPalette.telemetryBlue }}
            >
              OpenF1
            </a>
            . Historical qualifying data only.
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            telemetry · lab
          </Typography>
        </Box>
      </Box>
    </>
  );
}
