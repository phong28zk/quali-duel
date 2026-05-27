import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import type { SelectChangeEvent } from '@mui/material/Select';
import { formatLapTime } from '~/lib/ui/format';

export interface LapPickOption {
  driverNumber: number;
  driverAcronym: string;
  lapNumber: number;
  lapDurationSeconds: number;
  isPersonalBest: boolean;
}

interface LapSelectorProps {
  label: string;
  laps: ReadonlyArray<LapPickOption>;
  value: { driverNumber: number; lapNumber: number } | null;
  onChange: (pick: { driverNumber: number; lapNumber: number }) => void;
}

// Encode the pair (driverNumber, lapNumber) as a single string in the option
// value because <Select> needs a primitive value. Decode in the change handler.
function encode(p: { driverNumber: number; lapNumber: number }): string {
  return `${p.driverNumber}:${p.lapNumber}`;
}

function decode(value: string): {
  driverNumber: number;
  lapNumber: number;
} | null {
  const [a, b] = value.split(':');
  if (!a || !b) return null;
  const driverNumber = Number(a);
  const lapNumber = Number(b);
  if (!Number.isFinite(driverNumber) || !Number.isFinite(lapNumber)) return null;
  return { driverNumber, lapNumber };
}

export function LapSelector({
  label,
  laps,
  value,
  onChange,
}: LapSelectorProps) {
  const handle = (event: SelectChangeEvent<string>) => {
    const decoded = decode(event.target.value);
    if (decoded) onChange(decoded);
  };
  return (
    <FormControl fullWidth size="small">
      <InputLabel id={`lap-selector-${label}`}>{label}</InputLabel>
      <Select<string>
        labelId={`lap-selector-${label}`}
        label={label}
        value={value ? encode(value) : ''}
        onChange={handle}
      >
        {laps.map((lap) => (
          <MenuItem key={encode(lap)} value={encode(lap)}>
            #{lap.driverNumber} {lap.driverAcronym} · Lap {lap.lapNumber} ·{' '}
            {formatLapTime(lap.lapDurationSeconds)}
            {lap.isPersonalBest ? ' · PB' : ''}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
