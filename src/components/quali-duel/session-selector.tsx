import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { SessionOption } from '~/lib/contracts';

interface SessionSelectorProps {
  sessions: ReadonlyArray<SessionOption>;
  value: number | null;
  onChange: (sessionKey: number) => void;
}

export function SessionSelector({
  sessions,
  value,
  onChange,
}: SessionSelectorProps) {
  const handle = (event: SelectChangeEvent<number | ''>) => {
    const next = event.target.value;
    if (typeof next === 'number') onChange(next);
  };
  return (
    <FormControl fullWidth size="small">
      <InputLabel id="session-selector-label">Qualifying session</InputLabel>
      <Select<number | ''>
        labelId="session-selector-label"
        label="Qualifying session"
        value={value ?? ''}
        onChange={handle}
      >
        {sessions.map((session) => (
          <MenuItem key={session.sessionKey} value={session.sessionKey}>
            {session.year} · {session.circuitShortName} · {session.countryName}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
