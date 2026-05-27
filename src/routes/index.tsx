import { createFileRoute } from '@tanstack/react-router';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { qualiDuelPalette } from '~/theme/quali-duel-theme';

export const Route = createFileRoute('/')({
  component: HomeRoute,
});

function HomeRoute() {
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
            sx={{
              mt: 1.5,
              fontSize: { xs: 32, sm: 40, md: 56 },
              maxWidth: 18,
            }}
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
            p: { xs: 4, md: 6 },
            textAlign: 'center',
            background: qualiDuelPalette.panelCharcoal,
          }}
        >
          <Typography variant="h2" sx={{ fontSize: 22, mb: 1 }}>
            Select a session and two laps to begin.
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Phase 2 will wire up the OpenF1 selector flow.
          </Typography>
        </Paper>
      </Stack>
    </Container>
  );
}
