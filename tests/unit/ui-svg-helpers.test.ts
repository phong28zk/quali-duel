import { describe, expect, it } from 'vitest';
import {
  createLinearScale,
  buildSvgPolyline,
  buildSvgTrackPath,
} from '~/lib/ui/svg-helpers';

describe('createLinearScale', () => {
  it('maps domain to range linearly', () => {
    const scale = createLinearScale([0, 100], [0, 200]);
    expect(scale(0)).toBe(0);
    expect(scale(50)).toBe(100);
    expect(scale(100)).toBe(200);
  });

  it('inverts when range is reversed (SVG y axis)', () => {
    const scale = createLinearScale([0, 1], [200, 0]);
    expect(scale(0)).toBe(200);
    expect(scale(1)).toBe(0);
  });

  it('clamps to range edges by default', () => {
    const scale = createLinearScale([0, 1], [0, 100]);
    expect(scale(1.5)).toBe(100);
    expect(scale(-0.5)).toBe(0);
  });

  it('returns midpoint when domain is degenerate', () => {
    const scale = createLinearScale([5, 5], [0, 200]);
    expect(scale(5)).toBe(100);
  });
});

describe('buildSvgPolyline', () => {
  it('renders points as "x,y x,y ..."', () => {
    expect(
      buildSvgPolyline([
        [0, 0],
        [10, 20],
        [30, 5],
      ]),
    ).toBe('0,0 10,20 30,5');
  });

  it('rounds to 2 decimals', () => {
    expect(buildSvgPolyline([[1.23456, 9.876]])).toBe('1.23,9.88');
  });

  it('returns empty string for empty input', () => {
    expect(buildSvgPolyline([])).toBe('');
  });
});

describe('buildSvgTrackPath', () => {
  const samples = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 50 },
    { x: 0, y: 50 },
  ];

  it('emits a closed Mx,y Lx,y... Z path', () => {
    const out = buildSvgTrackPath(samples, { width: 200, height: 100, padding: 0 });
    expect(out).toMatch(/^M[\d.-]+,[\d.-]+ L[\d.-]+,[\d.-]+( L[\d.-]+,[\d.-]+)* Z$/);
  });

  it('fits the path into the viewport with y flipped so positive y is up', () => {
    // Bounding box is 100x50; scale = min(400/100, 200/50) = 4. So x in [0,400].
    // Y is flipped, so the first sample (0,0) lands at y=200, and (0,50) at y=0.
    const out = buildSvgTrackPath(samples, {
      width: 400,
      height: 200,
      padding: 0,
    });
    expect(out).toContain('M0,200');
    expect(out).toContain('L400,200');
    expect(out).toContain('L400,0');
    expect(out).toContain('L0,0');
  });

  it('applies padding so the path stays inside the viewport edges', () => {
    const out = buildSvgTrackPath(samples, {
      width: 200,
      height: 100,
      padding: 10,
    });
    // Path coordinates must all sit inside [10, 190] x [10, 90].
    const coords = [...out.matchAll(/[ML](-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)].map(
      (m) => [Number(m[1]), Number(m[2])] as const,
    );
    expect(coords.length).toBeGreaterThan(0);
    for (const [x, y] of coords) {
      expect(x).toBeGreaterThanOrEqual(10);
      expect(x).toBeLessThanOrEqual(190);
      expect(y).toBeGreaterThanOrEqual(10);
      expect(y).toBeLessThanOrEqual(90);
    }
  });

  it('throws on empty samples', () => {
    expect(() =>
      buildSvgTrackPath([], { width: 200, height: 100, padding: 0 }),
    ).toThrow();
  });
});
