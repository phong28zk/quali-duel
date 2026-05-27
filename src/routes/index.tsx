import { createFileRoute, Link } from '@tanstack/react-router';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { fetchSessions } from '~/server/fetch-sessions';
import { qualiDuelPalette } from '~/theme/quali-duel-theme';

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
    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
      <Stack spacing={6}>
        <Box>
          <Typography
            variant="overline"
            sx={{ color: qualiDuelPalette.telemetryBlue }}
          >
            Quali Duel
          </Typography>
          <Typography
            variant="h1"
            sx={{ mt: 1.5, fontSize: { xs: 32, sm: 40, md: 56 } }}
          >
            Compare two qualifying laps. See where the time goes.
          </Typography>
          <Typography
            variant="body1"
            sx={{ mt: 2, maxWidth: 60, color: 'text.secondary' }}
          >
            Historical OpenF1 telemetry. No live timing. No clutter.
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            background: qualiDuelPalette.panelCharcoal,
          }}
        >
          <Stack spacing={3}>
            <Typography variant="h2" sx={{ fontSize: 22 }}>
              Pick a qualifying weekend
            </Typography>
            <Stack spacing={1.5}>
              {sessions.slice(0, 10).map((session) => (
                <Link
                  key={session.sessionKey}
                  to="/compare"
                  search={{ sessionKey: session.sessionKey }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: `1px solid ${qualiDuelPalette.quietLine}`,
                    color: qualiDuelPalette.textSmoke,
                    textDecoration: 'none',
                    transition: 'border-color 160ms, background 160ms',
                  }}
                >
                  <span>
                    {session.circuitShortName} · {session.countryName}
                  </span>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    {session.dateStart.slice(0, 10)}
                  </Typography>
                </Link>
              ))}
              {sessions.length === 0 ? (
                <Typography sx={{ color: 'text.secondary' }}>
                  No qualifying sessions found for the selected year.
                </Typography>
              ) : null}
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
