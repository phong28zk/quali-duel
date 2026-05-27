import { describe, expect, it } from 'vitest';
import { DriverOptionSchema } from '~/lib/contracts/driver-option';

describe('DriverOptionSchema', () => {
  const valid = {
    driverNumber: 16,
    nameAcronym: 'LEC',
    fullName: 'Charles Leclerc',
    teamName: 'Ferrari',
    teamColour: 'F91536',
  };

  it('accepts a complete driver record', () => {
    expect(DriverOptionSchema.parse(valid).nameAcronym).toBe('LEC');
  });

  it('requires three-letter uppercase acronym', () => {
    expect(() =>
      DriverOptionSchema.parse({ ...valid, nameAcronym: 'Lec' }),
    ).toThrow();
    expect(() =>
      DriverOptionSchema.parse({ ...valid, nameAcronym: 'LE' }),
    ).toThrow();
  });

  it('accepts missing team colour gracefully', () => {
    const { teamColour: _omit, ...withoutColour } = valid;
    void _omit;
    const parsed = DriverOptionSchema.parse(withoutColour);
    expect(parsed.teamColour).toBeUndefined();
  });
});
