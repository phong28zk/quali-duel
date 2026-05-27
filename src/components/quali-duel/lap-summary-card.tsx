import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  formatLapTime,
  formatSector,
} from '~/lib/ui/format';
import { qualiDuelPalette } from '~/theme/quali-duel-theme';
import type { DriverOption, LapOption, NormalizedTelemetrySample } from '~/lib/contracts';

interface LapSummaryCardProps {
  driver: DriverOption;
  lap: LapOption;
  samples: ReadonlyArray<NormalizedTelemetrySample>;
  accent?: string;
}

function topSpeed(samples: ReadonlyArray<NormalizedTelemetrySample>): number {
  let max = 0;
  for (const s of samples) if (s.speedKph > max) max = s.speedKph;
  return max;
}

export function LapSummaryCard({
  driver,
  lap,
  samples,
  accent = qualiDuelPalette.telemetryBlue,
}: LapSummaryCardProps) {
  const teamColour = driver.teamColour ? `#${driver.teamColour}` : accent;
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        background: qualiDuelPalette.panelCharcoal,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          inset: '0 auto 0 0',
          width: 4,
          background: teamColour,
        }}
      />
      <Stack spacing={2} sx={{ pl: 1.5 }}>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'baseline' }}
        >
          <Typography
            variant="overline"
            sx={{ color: accent, letterSpacing: '0.2em' }}
          >
            #{driver.driverNumber} · {driver.nameAcronym}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Lap {lap.lapNumber}
          </Typography>
        </Stack>
        <Typography variant="h2" sx={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {formatLapTime(lap.lapDurationSeconds)}
        </Typography>
        <Stack direction="row" spacing={3}>
          <Sector label="S1" value={formatSector(lap.sector1Seconds)} />
          <Sector label="S2" value={formatSector(lap.sector2Seconds)} />
          <Sector label="S3" value={formatSector(lap.sector3Seconds)} />
        </Stack>
        <Stack direction="row" spacing={3}>
          <Stat label="Top speed" value={`${Math.round(topSpeed(samples))} km/h`} />
          <Stat
            label="Personal best"
            value={lap.isPersonalBest ? 'Yes' : 'No'}
            accent={lap.isPersonalBest ? qualiDuelPalette.gainLime : undefined}
          />
        </Stack>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary' }}
        >
          {driver.fullName} · {driver.teamName}
        </Typography>
      </Stack>
    </Paper>
  );
}

function Sector({ label, value }: { label: string; value: string }) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography
        variant="body1"
        sx={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography
        variant="body1"
        sx={{ fontWeight: 600, color: accent ?? 'text.primary' }}
      >
        {value}
      </Typography>
    </Stack>
  );
}
