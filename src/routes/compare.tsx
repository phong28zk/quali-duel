import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { fetchLapComparison } from '~/server/fetch-lap-comparison';
import { LapSummaryCard } from '~/components/quali-duel/lap-summary-card';
import { DeltaTraceChart } from '~/components/quali-duel/delta-trace-chart';
import { TelemetryTraceChart } from '~/components/quali-duel/telemetry-trace-chart';
import { TrackProgressMap } from '~/components/quali-duel/track-progress-map';
import { formatDeltaSeconds } from '~/lib/ui/format';
import { qualiDuelPalette } from '~/theme/quali-duel-theme';
import type { LapComparisonPayload } from '~/lib/contracts';

const SearchSchema = z.object({
  sessionKey: z.coerce.number().int().positive(),
  lapADriver: z.coerce.number().int().positive().optional(),
  lapALap: z.coerce.number().int().min(1).optional(),
  lapBDriver: z.coerce.number().int().positive().optional(),
  lapBLap: z.coerce.number().int().min(1).optional(),
});

type CompareSearch = z.infer<typeof SearchSchema>;

export const Route = createFileRoute('/compare')({
  validateSearch: (search): CompareSearch => SearchSchema.parse(search),
  loaderDeps: ({ search }) => search,
  loader: async ({
    deps,
  }: {
    deps: CompareSearch;
  }): Promise<LapComparisonPayload | null> => {
    if (
      deps.lapADriver === undefined ||
      deps.lapALap === undefined ||
      deps.lapBDriver === undefined ||
      deps.lapBLap === undefined
    ) {
      return null;
    }
    return fetchLapComparison({
      data: {
        sessionKey: deps.sessionKey,
        lapA: { driverNumber: deps.lapADriver, lapNumber: deps.lapALap },
        lapB: { driverNumber: deps.lapBDriver, lapNumber: deps.lapBLap },
      },
    });
  },
  component: CompareRoute,
  errorComponent: ({ error }) => (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h2" sx={{ mb: 2 }}>
        Comparison failed
      </Typography>
      <Typography sx={{ color: 'text.secondary' }}>
        {error instanceof Error ? error.message : 'Unknown error'}
      </Typography>
    </Container>
  ),
  pendingComponent: () => (
    <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
      <CircularProgress />
    </Container>
  ),
});

function CompareRoute() {
  const payload = Route.useLoaderData();

  if (!payload) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Stack spacing={4}>
          <Typography variant="overline" sx={{ color: qualiDuelPalette.telemetryBlue }}>
            Quali Duel
          </Typography>
          <Typography variant="h1" sx={{ fontSize: { xs: 28, md: 40 } }}>
            Choose two laps to compare
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            Append <code>lapADriver</code>, <code>lapALap</code>, <code>lapBDriver</code>,
            <code> lapBLap</code> to the URL to load a comparison. Selector UI lands in the
            next iteration.
          </Typography>
        </Stack>
      </Container>
    );
  }

  const trackSamples = payload.lapA.samples
    .filter(
      (s): s is typeof s & { x: number; y: number } =>
        s.x !== undefined && s.y !== undefined,
    )
    .map((s) => ({ x: s.x, y: s.y }));

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Stack spacing={4}>
        <Box>
          <Typography variant="overline" sx={{ color: qualiDuelPalette.telemetryBlue }}>
            {payload.session.year} · {payload.session.circuitShortName} ·{' '}
            {payload.session.countryName}
          </Typography>
          <Typography variant="h1" sx={{ mt: 1, fontSize: { xs: 28, md: 40 } }}>
            {payload.lapA.driver.nameAcronym} vs {payload.lapB.driver.nameAcronym}
          </Typography>
          <Typography
            variant="h2"
            sx={{
              mt: 1,
              fontFamily: 'JetBrains Mono, monospace',
              color:
                payload.summary.totalDeltaSeconds < 0
                  ? qualiDuelPalette.gainLime
                  : qualiDuelPalette.alertRed,
            }}
          >
            {formatDeltaSeconds(payload.summary.totalDeltaSeconds)} s
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          }}
        >
          <LapSummaryCard
            driver={payload.lapA.driver}
            lap={payload.lapA.lap}
            samples={payload.lapA.samples}
            accent={qualiDuelPalette.telemetryBlue}
          />
          <LapSummaryCard
            driver={payload.lapB.driver}
            lap={payload.lapB.lap}
            samples={payload.lapB.samples}
            accent={qualiDuelPalette.brakingAmber}
          />
        </Box>

        <Paper
          elevation={0}
          sx={{ p: 2, background: qualiDuelPalette.graphite }}
        >
          <DeltaTraceChart deltaSeries={payload.deltaSeries} />
        </Paper>

        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          }}
        >
          <Stack spacing={2}>
            <Paper elevation={0} sx={{ p: 2, background: qualiDuelPalette.panelCharcoal }}>
              <TelemetryTraceChart
                samplesA={payload.lapA.samples}
                samplesB={payload.lapB.samples}
                accessor={(s) => s.speedKph}
                label="Speed"
                unit="km/h"
              />
            </Paper>
            <Paper elevation={0} sx={{ p: 2, background: qualiDuelPalette.panelCharcoal }}>
              <TelemetryTraceChart
                samplesA={payload.lapA.samples}
                samplesB={payload.lapB.samples}
                accessor={(s) => s.throttlePct}
                label="Throttle"
                unit="%"
                yDomain={[0, 100]}
              />
            </Paper>
            <Paper elevation={0} sx={{ p: 2, background: qualiDuelPalette.panelCharcoal }}>
              <TelemetryTraceChart
                samplesA={payload.lapA.samples}
                samplesB={payload.lapB.samples}
                accessor={(s) => s.brakePct}
                label="Brake"
                unit="on/off"
                yDomain={[0, 100]}
                colorA={qualiDuelPalette.alertRed}
                colorB={qualiDuelPalette.brakingAmber}
              />
            </Paper>
            <Paper elevation={0} sx={{ p: 2, background: qualiDuelPalette.panelCharcoal }}>
              <TelemetryTraceChart
                samplesA={payload.lapA.samples}
                samplesB={payload.lapB.samples}
                accessor={(s) => s.gear}
                label="Gear"
                yDomain={[0, 8]}
              />
            </Paper>
          </Stack>
          <Stack spacing={2}>
            <TrackProgressMap pathSamples={trackSamples} />
            <Paper elevation={0} sx={{ p: 2, background: qualiDuelPalette.panelCharcoal }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Gain peak
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: 'JetBrains Mono, monospace',
                  color: qualiDuelPalette.gainLime,
                }}
              >
                {(payload.summary.maxGainAtProgress * 100).toFixed(0)}% of lap
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', mt: 1, display: 'block' }}
              >
                Loss peak
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: 'JetBrains Mono, monospace',
                  color: qualiDuelPalette.alertRed,
                }}
              >
                {(payload.summary.maxLossAtProgress * 100).toFixed(0)}% of lap
              </Typography>
            </Paper>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
