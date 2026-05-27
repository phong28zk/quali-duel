// Realistic OpenF1-shaped fixture for a Monza 2023 qualifying mini-window.
// Hand-crafted to match the wire shape and exercise the full data pipeline.

export const SESSION_KEY = 9472;
export const MEETING_KEY = 1217;

export const session = {
  session_key: SESSION_KEY,
  session_name: 'Qualifying',
  session_type: 'Qualifying',
  meeting_key: MEETING_KEY,
  circuit_short_name: 'Monza',
  country_name: 'Italy',
  year: 2023,
  date_start: '2023-09-02T14:00:00+00:00',
  date_end: '2023-09-02T15:00:00+00:00',
};

export const driverLeclerc = {
  driver_number: 16,
  name_acronym: 'LEC',
  full_name: 'Charles LECLERC',
  first_name: 'Charles',
  last_name: 'Leclerc',
  team_name: 'Ferrari',
  team_colour: 'F91536',
  session_key: SESSION_KEY,
  meeting_key: MEETING_KEY,
};

export const driverSainz = {
  driver_number: 55,
  name_acronym: 'SAI',
  full_name: 'Carlos SAINZ',
  first_name: 'Carlos',
  last_name: 'Sainz',
  team_name: 'Ferrari',
  team_colour: 'F91536',
  session_key: SESSION_KEY,
  meeting_key: MEETING_KEY,
};

export const lapLeclerc18 = {
  session_key: SESSION_KEY,
  meeting_key: MEETING_KEY,
  driver_number: 16,
  lap_number: 18,
  lap_duration: 80.143,
  duration_sector_1: 24.501,
  duration_sector_2: 27.998,
  duration_sector_3: 27.644,
  date_start: '2023-09-02T14:30:00+00:00',
  is_pit_out_lap: false,
};

export const lapSainz19 = {
  session_key: SESSION_KEY,
  meeting_key: MEETING_KEY,
  driver_number: 55,
  lap_number: 19,
  lap_duration: 80.512,
  duration_sector_1: 24.701,
  duration_sector_2: 28.103,
  duration_sector_3: 27.708,
  date_start: '2023-09-02T14:32:00+00:00',
  is_pit_out_lap: false,
};

// Generate per-quarter-second samples spanning a lap, with a believable
// speed/throttle/brake/gear profile shaped like a Monza-ish lap (long straights
// + a few braking zones).
function generateCarData(
  driverNumber: number,
  startIso: string,
  durationSec: number,
): Array<{
  session_key: number;
  driver_number: number;
  date: string;
  speed: number;
  throttle: number;
  brake: number;
  n_gear: number;
  rpm: number;
  drs: number;
}> {
  const startMs = Date.parse(startIso);
  const samples = [];
  const stepMs = 270; // ~3.7 Hz
  const n = Math.floor((durationSec * 1000) / stepMs);
  for (let i = 0; i <= n; i++) {
    const t = (i * stepMs) / (durationSec * 1000);
    const date = new Date(startMs + i * stepMs).toISOString();
    // Composite waveform with two braking zones
    const brakingZone1 = Math.exp(-Math.pow((t - 0.25) / 0.04, 2));
    const brakingZone2 = Math.exp(-Math.pow((t - 0.7) / 0.05, 2));
    const brake = brakingZone1 + brakingZone2 > 0.5 ? 100 : 0;
    const baseSpeed = 240 + 60 * Math.sin(t * Math.PI * 2);
    const slowdown = (brakingZone1 + brakingZone2) * 120;
    samples.push({
      session_key: SESSION_KEY,
      driver_number: driverNumber,
      date,
      speed: Math.max(60, baseSpeed - slowdown),
      throttle: brake > 0 ? 0 : 100,
      brake,
      n_gear: brake > 0 ? 3 : 7,
      rpm: 9000 + 2000 * Math.sin(t * Math.PI * 6),
      drs: t > 0.4 && t < 0.6 ? 12 : 0,
    });
  }
  return samples;
}

function generateLocation(
  driverNumber: number,
  startIso: string,
  durationSec: number,
): Array<{
  session_key: number;
  driver_number: number;
  date: string;
  x: number;
  y: number;
  z: number;
}> {
  const startMs = Date.parse(startIso);
  const samples = [];
  const stepMs = 280;
  const n = Math.floor((durationSec * 1000) / stepMs);
  for (let i = 0; i <= n; i++) {
    const t = (i * stepMs) / (durationSec * 1000);
    const date = new Date(startMs + i * stepMs).toISOString();
    // Stadium-ish racing line so the track map output is visually plausible
    const x = Math.cos(t * Math.PI * 2) * 2200 + Math.cos(t * Math.PI * 4) * 600;
    const y = Math.sin(t * Math.PI * 2) * 1200 + Math.sin(t * Math.PI * 4) * 400;
    samples.push({
      session_key: SESSION_KEY,
      driver_number: driverNumber,
      date,
      x,
      y,
      z: 0,
    });
  }
  return samples;
}

export const carDataLeclerc = generateCarData(
  16,
  lapLeclerc18.date_start,
  lapLeclerc18.lap_duration,
);
export const locationLeclerc = generateLocation(
  16,
  lapLeclerc18.date_start,
  lapLeclerc18.lap_duration,
);
export const carDataSainz = generateCarData(
  55,
  lapSainz19.date_start,
  lapSainz19.lap_duration,
);
export const locationSainz = generateLocation(
  55,
  lapSainz19.date_start,
  lapSainz19.lap_duration,
);
