import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { z } from 'zod';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { fetchLapComparison } from '~/server/fetch-lap-comparison';
import { fetchSessionDetails } from '~/server/fetch-session-details';
import { LapSummaryCard } from '~/components/quali-duel/lap-summary-card';
import { DeltaTraceChart } from '~/components/quali-duel/delta-trace-chart';
import { TelemetryTraceChart } from '~/components/quali-duel/telemetry-trace-chart';
import { TrackProgressMap } from '~/components/quali-duel/track-progress-map';
import {
  LapSelector,
  type LapPickOption,
} from '~/components/quali-duel/lap-selector';
import { formatDeltaSeconds } from '~/lib/ui/format';
import { qualiDuelPalette } from '~/theme/quali-duel-theme';
import type {
  DriverOption,
  LapComparisonPayload,
  LapOption,
} from '~/lib/contracts';
import type { SessionDetailsPayload } from '~/server/fetch-session-details-impl';

const SearchSchema = z.object({
  sessionKey: z.coerce.number().int().positive(),
  lapADriver: z.coerce.number().int().positive().optional(),
  lapALap: z.coerce.number().int().min(1).optional(),
  lapBDriver: z.coerce.number().int().positive().optional(),
  lapBLap: z.coerce.number().int().min(1).optional(),
});

type CompareSearch = z.infer<typeof SearchSchema>;

interface LoaderData {
  details: SessionDetailsPayload;
  comparison: LapComparisonPayload | null;
}

export const Route = createFileRoute('/compare')({
  validateSearch: (search): CompareSearch => SearchSchema.parse(search),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }: { deps: CompareSearch }): Promise<LoaderData> => {
    const details = await fetchSessionDetails({
      data: { sessionKey: deps.sessionKey },
    });
    if (
      deps.lapADriver === undefined ||
      deps.lapALap === undefined ||
      deps.lapBDriver === undefined ||
      deps.lapBLap === undefined
    ) {
      return { details, comparison: null };
    }
    const comparison = await fetchLapComparison({
      data: {
        sessionKey: deps.sessionKey,
        lapA: { driverNumber: deps.lapADriver, lapNumber: deps.lapALap },
        lapB: { driverNumber: deps.lapBDriver, lapNumber: deps.lapBLap },
      },
    });
    return { details, comparison };
  },
  component: CompareRoute,
  errorComponent: ({ error }) => (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h2" sx={{ mb: 2 }}>
        Couldn't load this comparison
      </Typography>
      <Typography sx={{ color: 'text.secondary', maxWidth: 60 }}>
        {humanReadableError(error)}
      </Typography>
    </Container>
  ),
  pendingComponent: () => (
    <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
      <CircularProgress />
    </Container>
  ),
});

function humanReadableError(error: unknown): string {
  if (!(error instanceof Error)) return 'Unknown error.';
  // Zod errors print as a JSON array; surface the first message instead.
  if (error.message.trim().startsWith('[')) {
    try {
      const issues = JSON.parse(error.message) as Array<{ message?: string }>;
      const first = issues.find((i) => i.message)?.message;
      if (first) return first;
    } catch {
      // fall through
    }
  }
  return error.message;
}

function toLapPickOptions(
  laps: ReadonlyArray<LapOption>,
  drivers: ReadonlyArray<DriverOption>,
): LapPickOption[] {
  const acronymByNumber = new Map(
    drivers.map((d) => [d.driverNumber, d.nameAcronym] as const),
  );
  return laps.map((lap) => ({
    driverNumber: lap.driverNumber,
    driverAcronym: acronymByNumber.get(lap.driverNumber) ?? '???',
    lapNumber: lap.lapNumber,
    lapDurationSeconds: lap.lapDurationSeconds,
    isPersonalBest: lap.isPersonalBest,
  }));
}

function CompareRoute() {
  const { details, comparison } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: '/compare' });

  const lapOptions = toLapPickOptions(details.laps, details.drivers);
  const [lapA, setLapA] = useState<
    { driverNumber: number; lapNumber: number } | null
  >(
    search.lapADriver !== undefined && search.lapALap !== undefined
      ? { driverNumber: search.lapADriver, lapNumber: search.lapALap }
      : null,
  );
  const [lapB, setLapB] = useState<
    { driverNumber: number; lapNumber: number } | null
  >(
    search.lapBDriver !== undefined && search.lapBLap !== undefined
      ? { driverNumber: search.lapBDriver, lapNumber: search.lapBLap }
      : null,
  );

  const onPickLapA = (pick: { driverNumber: number; lapNumber: number }) => {
    setLapA(pick);
    if (lapB) {
      void navigate({
        search: {
          sessionKey: search.sessionKey,
          lapADriver: pick.driverNumber,
          lapALap: pick.lapNumber,
          lapBDriver: lapB.driverNumber,
          lapBLap: lapB.lapNumber,
        },
      });
    }
  };
  const onPickLapB = (pick: { driverNumber: number; lapNumber: number }) => {
    setLapB(pick);
    if (lapA) {
      void navigate({
        search: {
          sessionKey: search.sessionKey,
          lapADriver: lapA.driverNumber,
          lapALap: lapA.lapNumber,
          lapBDriver: pick.driverNumber,
          lapBLap: pick.lapNumber,
        },
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Stack spacing={4}>
        <Box>
          <Typography variant="overline" sx={{ color: qualiDuelPalette.telemetryBlue }}>
            {details.session.year} · {details.session.circuitShortName} ·{' '}
            {details.session.countryName}
          </Typography>
          {comparison ? (
            <>
              <Typography variant="h1" sx={{ mt: 1, fontSize: { xs: 28, md: 40 } }}>
                {comparison.lapA.driver.nameAcronym} vs{' '}
                {comparison.lapB.driver.nameAcronym}
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  mt: 1,
                  fontFamily: 'JetBrains Mono, monospace',
                  color:
                    comparison.summary.totalDeltaSeconds < 0
                      ? qualiDuelPalette.gainLime
                      : qualiDuelPalette.alertRed,
                }}
              >
                {formatDeltaSeconds(comparison.summary.totalDeltaSeconds)} s
              </Typography>
            </>
          ) : (
            <Typography variant="h1" sx={{ mt: 1, fontSize: { xs: 28, md: 40 } }}>
              Pick two laps to compare
            </Typography>
          )}
        </Box>

        <Paper elevation={0} sx={{ p: 3, background: qualiDuelPalette.panelCharcoal }}>
          <Stack spacing={2}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {details.laps.length} valid laps · {details.drivers.length} drivers
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              }}
            >
              <LapSelector
                label="Lap A"
                laps={lapOptions}
                value={lapA}
                onChange={onPickLapA}
              />
              <LapSelector
                label="Lap B"
                laps={lapOptions}
                value={lapB}
                onChange={onPickLapB}
              />
            </Box>
          </Stack>
        </Paper>

        {comparison ? <ComparisonBody payload={comparison} /> : null}
      </Stack>
    </Container>
  );
}

function ComparisonBody({ payload }: { payload: LapComparisonPayload }) {
  const trackSamples = payload.lapA.samples
    .filter(
      (s): s is typeof s & { x: number; y: number } =>
        s.x !== undefined && s.y !== undefined,
    )
    .map((s) => ({ x: s.x, y: s.y }));

  return (
    <>
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

      <Paper elevation={0} sx={{ p: 2, background: qualiDuelPalette.graphite }}>
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
    </>
  );
}
