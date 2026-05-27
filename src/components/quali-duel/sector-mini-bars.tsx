import { qualiDuelPalette } from '~/theme/quali-duel-theme';
import { formatSector } from '~/lib/ui/format';
import type { LapOption } from '~/lib/contracts';

interface SectorMiniBarsProps {
  // The lap whose sectors are being displayed on this card.
  lap: LapOption;
  // The rival lap to compare each sector against.
  rival: LapOption;
}

interface SectorRow {
  label: string;
  self: number | undefined;
  rival: number | undefined;
}

// Render three short horizontal bars, one per sector. Bar length encodes the
// sector time delta against the rival lap: shorter than rival → green (gain),
// longer → red (loss). Bar grows from the left so the comparison reads at a
// glance.
export function SectorMiniBars({ lap, rival }: SectorMiniBarsProps) {
  const rows: SectorRow[] = [
    { label: 'S1', self: lap.sector1Seconds, rival: rival.sector1Seconds },
    { label: 'S2', self: lap.sector2Seconds, rival: rival.sector2Seconds },
    { label: 'S3', self: lap.sector3Seconds, rival: rival.sector3Seconds },
  ];

  // Maximum absolute sector delta across all three sectors — used to scale
  // every bar against a single reference so they stay visually comparable.
  let maxAbsDelta = 0.001;
  for (const row of rows) {
    if (row.self !== undefined && row.rival !== undefined) {
      const d = Math.abs(row.self - row.rival);
      if (d > maxAbsDelta) maxAbsDelta = d;
    }
  }

  return (
    <div
      role="group"
      aria-label="Sector delta vs rival lap"
      style={{ display: 'grid', rowGap: 6, marginTop: 4 }}
    >
      {rows.map((row) => (
        <SectorRowBar key={row.label} row={row} maxAbsDelta={maxAbsDelta} />
      ))}
    </div>
  );
}

function SectorRowBar({
  row,
  maxAbsDelta,
}: {
  row: SectorRow;
  maxAbsDelta: number;
}) {
  const hasBoth = row.self !== undefined && row.rival !== undefined;
  const delta = hasBoth ? (row.self as number) - (row.rival as number) : 0;
  const pct = hasBoth ? Math.min(100, (Math.abs(delta) / maxAbsDelta) * 100) : 0;
  const color =
    delta < 0 ? qualiDuelPalette.gainLime : qualiDuelPalette.alertRed;
  const deltaLabel = hasBoth
    ? `${delta < 0 ? '−' : '+'}${Math.abs(delta).toFixed(3)}`
    : '—';
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '28px 1fr 60px 64px',
        alignItems: 'center',
        gap: 10,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 12,
      }}
    >
      <span style={{ color: 'rgba(215,222,231,0.6)' }}>{row.label}</span>
      <div
        style={{
          height: 4,
          borderRadius: 2,
          background: qualiDuelPalette.quietLine,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: `${pct}%`,
            background: hasBoth ? color : qualiDuelPalette.quietLine,
            borderRadius: 2,
            transition: 'width 360ms cubic-bezier(0.2, 0.7, 0.2, 1)',
          }}
          aria-hidden
        />
      </div>
      <span style={{ color: qualiDuelPalette.textSmoke, textAlign: 'right' }}>
        {formatSector(row.self)}
      </span>
      <span style={{ color: hasBoth ? color : 'rgba(215,222,231,0.4)', textAlign: 'right' }}>
        {deltaLabel}
      </span>
    </div>
  );
}
