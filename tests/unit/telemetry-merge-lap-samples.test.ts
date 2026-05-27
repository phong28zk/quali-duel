import { describe, expect, it } from 'vitest';
import { mergeLapSamples } from '~/lib/telemetry/merge-lap-samples';

const carData = [
  { date: '2023-09-02T14:30:00.000Z', speed: 100, throttle: 50, brake: 0, n_gear: 3, rpm: 8000, drs: 0, session_key: 1, driver_number: 16 },
  { date: '2023-09-02T14:30:00.500Z', speed: 200, throttle: 100, brake: 0, n_gear: 5, rpm: 10000, drs: 0, session_key: 1, driver_number: 16 },
  { date: '2023-09-02T14:30:01.000Z', speed: 300, throttle: 100, brake: 0, n_gear: 7, rpm: 11800, drs: 12, session_key: 1, driver_number: 16 },
  { date: '2023-09-02T14:30:01.500Z', speed: 250, throttle: 0, brake: 100, n_gear: 5, rpm: 9000, drs: 0, session_key: 1, driver_number: 16 },
];

const location = [
  { date: '2023-09-02T14:30:00.050Z', x: 100, y: 100, z: 0, session_key: 1, driver_number: 16 },
  { date: '2023-09-02T14:30:00.550Z', x: 200, y: 150, z: 0, session_key: 1, driver_number: 16 },
  { date: '2023-09-02T14:30:01.100Z', x: 300, y: 200, z: 0, session_key: 1, driver_number: 16 },
  { date: '2023-09-02T14:30:01.450Z', x: 350, y: 250, z: 0, session_key: 1, driver_number: 16 },
];

describe('mergeLapSamples', () => {
  it('returns one merged sample per car_data point within the lap window', () => {
    const merged = mergeLapSamples({
      carData,
      location,
      lapStart: '2023-09-02T14:30:00.000Z',
      lapEnd: '2023-09-02T14:30:01.500Z',
    });
    expect(merged).toHaveLength(4);
    expect(merged[0]).toMatchObject({ speed: 100, x: 100, y: 100 });
  });

  it('snaps each car_data sample to the nearest location sample', () => {
    const merged = mergeLapSamples({
      carData,
      location,
      lapStart: '2023-09-02T14:30:00.000Z',
      lapEnd: '2023-09-02T14:30:01.500Z',
    });
    // car @ 1.000 should pick location @ 1.100 (closer than 0.550)
    expect(merged[2]).toMatchObject({ speed: 300, x: 300 });
    // car @ 1.500 should pick location @ 1.450 (closest)
    expect(merged[3]).toMatchObject({ speed: 250, x: 350 });
  });

  it('drops car_data outside the lap window', () => {
    const merged = mergeLapSamples({
      carData,
      location,
      lapStart: '2023-09-02T14:30:00.400Z',
      lapEnd: '2023-09-02T14:30:01.200Z',
    });
    expect(merged.map((m) => m.speed)).toEqual([200, 300]);
  });

  it('exposes elapsedSeconds relative to lapStart, sorted ascending', () => {
    const merged = mergeLapSamples({
      carData,
      location,
      lapStart: '2023-09-02T14:30:00.000Z',
      lapEnd: '2023-09-02T14:30:01.500Z',
    });
    expect(merged.map((m) => m.elapsedSeconds)).toEqual([0, 0.5, 1, 1.5]);
  });

  it('returns empty array when carData is empty', () => {
    expect(
      mergeLapSamples({
        carData: [],
        location,
        lapStart: '2023-09-02T14:30:00.000Z',
        lapEnd: '2023-09-02T14:30:01.500Z',
      }),
    ).toEqual([]);
  });

  it('throws when lapEnd <= lapStart', () => {
    expect(() =>
      mergeLapSamples({
        carData,
        location,
        lapStart: '2023-09-02T14:30:01.500Z',
        lapEnd: '2023-09-02T14:30:00.000Z',
      }),
    ).toThrow();
  });
});
