const EM_DASH = '—';

// Render lap duration as "M:SS.mmm" (e.g. "1:20.143"). Sub-minute laps render
// with a "0:" prefix so columns line up vertically in summary cards.
export function formatLapTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return EM_DASH;
  const totalMs = Math.round(seconds * 1000);
  const minutes = Math.floor(totalMs / 60_000);
  const secs = Math.floor((totalMs % 60_000) / 1000);
  const ms = totalMs % 1000;
  return `${minutes}:${pad2(secs)}.${pad3(ms)}`;
}

// Render delta seconds with explicit sign so leading "-" / "+" tells the user
// whether the reference lap (lapA) is ahead or behind.
export function formatDeltaSeconds(delta: number): string {
  if (!Number.isFinite(delta)) return EM_DASH;
  const abs = Math.abs(delta);
  const totalMs = Math.round(abs * 1000);
  const secs = Math.floor(totalMs / 1000);
  const ms = totalMs % 1000;
  const sign = delta < 0 ? '-' : '+';
  return `${sign}${secs}.${pad3(ms)}`;
}

// Render a sector split as "SS.mmm". Sector times are always under a minute
// in qualifying, so omit the minute prefix to keep cards tight.
export function formatSector(seconds: number | undefined | null): string {
  if (seconds === undefined || seconds === null) return EM_DASH;
  if (!Number.isFinite(seconds) || seconds <= 0) return EM_DASH;
  const totalMs = Math.round(seconds * 1000);
  const secs = Math.floor(totalMs / 1000);
  const ms = totalMs % 1000;
  return `${secs}.${pad3(ms)}`;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function pad3(n: number): string {
  if (n < 10) return `00${n}`;
  if (n < 100) return `0${n}`;
  return String(n);
}
