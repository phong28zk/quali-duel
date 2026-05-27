import { describe, expect, it } from 'vitest';
import {
  formatLapTime,
  formatDeltaSeconds,
  formatSector,
} from '~/lib/ui/format';

describe('formatLapTime', () => {
  it('renders minutes:seconds.thousandths', () => {
    expect(formatLapTime(80.143)).toBe('1:20.143');
    expect(formatLapTime(125.001)).toBe('2:05.001');
  });

  it('handles sub-minute laps with leading 0:', () => {
    expect(formatLapTime(45.6)).toBe('0:45.600');
  });

  it('rounds at the thousandth', () => {
    expect(formatLapTime(80.1239)).toBe('1:20.124');
  });

  it('returns em-dash for non-finite input', () => {
    expect(formatLapTime(Number.NaN)).toBe('—');
    expect(formatLapTime(Infinity)).toBe('—');
  });
});

describe('formatDeltaSeconds', () => {
  it('renders with leading sign and thousandths', () => {
    expect(formatDeltaSeconds(0.369)).toBe('+0.369');
    expect(formatDeltaSeconds(-1.025)).toBe('-1.025');
  });

  it('uses plus zero for exact zero', () => {
    expect(formatDeltaSeconds(0)).toBe('+0.000');
  });

  it('returns em-dash for non-finite input', () => {
    expect(formatDeltaSeconds(Number.NaN)).toBe('—');
  });
});

describe('formatSector', () => {
  it('renders seconds.thousandths without minute prefix', () => {
    expect(formatSector(24.501)).toBe('24.501');
    expect(formatSector(9.5)).toBe('9.500');
  });

  it('returns em-dash for missing sector', () => {
    expect(formatSector(undefined)).toBe('—');
    expect(formatSector(0)).toBe('—');
  });
});
