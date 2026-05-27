import { createFileRoute, Link } from '@tanstack/react-router';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { fetchSessions } from '~/server/fetch-sessions';
import { qualiDuelPalette } from '~/theme/quali-duel-theme';
import type { SessionOption } from '~/lib/contracts';

export const Route = createFileRoute('/')({
  loader: () =>
    fetchSessions({ data: { year: new Date().getUTCFullYear() - 1 } }),
  component: HomeRoute,
  errorComponent: ({ error }) => (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h2" sx={{ mb: 2 }}>
        Couldn't load sessions
      </Typography>
      <Typography sx={{ color: 'text.secondary' }}>
        {error instanceof Error ? error.message : 'Unknown error'}
      </Typography>
    </Container>
  ),
});

function HomeRoute() {
  const sessions = Route.useLoaderData();

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 5, md: 9 } }}>
      <Stack spacing={{ xs: 5, md: 7 }}>
        <Box className="qd-rise">
          <Typography
            variant="overline"
            sx={{ color: qualiDuelPalette.telemetryBlue }}
          >
            Telemetry · Lab
          </Typography>
          <Typography
            variant="h1"
            sx={{
              mt: 1.5,
              fontSize: { xs: 36, sm: 52, md: 76 },
              lineHeight: 1.02,
              maxWidth: 16,
            }}
          >
            Where{' '}
            <Box
              component="span"
              sx={{
                color: qualiDuelPalette.telemetryBlue,
                fontStyle: 'italic',
              }}
            >
              did
            </Box>{' '}
            the time go?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mt: 3,
              maxWidth: 56,
              color: 'text.secondary',
              fontSize: { xs: 16, md: 18 },
            }}
          >
            Compare two qualifying laps side by side. Telemetry overlays,
            sector splits, a delta curve that tells you exactly where each
            driver gained or lost.
          </Typography>
        </Box>

        <Box className="qd-rise qd-rise-delay-1">
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: 'baseline', mb: 2 }}
          >
            <Typography variant="h2" sx={{ fontSize: 24 }}>
              Pick a weekend
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {sessions.length} qualifying sessions · {sessions[0]?.year}
            </Typography>
          </Stack>
          <Box
            sx={{
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
              },
            }}
          >
            {sessions.slice(0, 12).map((session, i) => (
              <SessionCard
                key={session.sessionKey}
                session={session}
                delayMs={i * 30}
              />
            ))}
            {sessions.length === 0 ? (
              <Typography sx={{ color: 'text.secondary' }}>
                No qualifying sessions found.
              </Typography>
            ) : null}
          </Box>
        </Box>
      </Stack>
    </Container>
  );
}

function SessionCard({
  session,
  delayMs,
}: {
  session: SessionOption;
  delayMs: number;
}) {
  return (
    <Link
      to="/compare"
      search={{ sessionKey: session.sessionKey }}
      style={{
        textDecoration: 'none',
        animation: `qd-rise 320ms cubic-bezier(0.2, 0.7, 0.2, 1) ${delayMs}ms both`,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          p: 2.5,
          borderRadius: 3,
          border: `1px solid ${qualiDuelPalette.quietLine}`,
          background: qualiDuelPalette.panelCharcoal,
          color: 'text.primary',
          transition: 'border-color 180ms, transform 180ms, background 180ms',
          overflow: 'hidden',
          '&:hover': {
            borderColor: qualiDuelPalette.telemetryBlue,
            transform: 'translateY(-2px)',
            background: 'rgba(110, 200, 255, 0.04)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: '0 auto 0 0',
            width: 3,
            background: qualiDuelPalette.telemetryBlue,
            opacity: 0.5,
          },
        }}
      >
        <Stack spacing={0.5} sx={{ pl: 1 }}>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.08em',
            }}
          >
            {session.dateStart.slice(0, 10)}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {session.circuitShortName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {session.countryName}
          </Typography>
        </Stack>
      </Box>
    </Link>
  );
}
