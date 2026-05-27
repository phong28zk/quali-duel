import { z } from 'zod';

// Raw OpenF1 records — keep snake_case to mirror the wire format and tolerate
// nulls/missing fields that real responses contain.

export const RawOpenF1SessionSchema = z.object({
  session_key: z.number().int(),
  session_name: z.string(),
  session_type: z.string(),
  meeting_key: z.number().int(),
  circuit_short_name: z.string(),
  country_name: z.string(),
  year: z.number().int(),
  date_start: z.string().datetime({ offset: true }),
  date_end: z.string().datetime({ offset: true }).optional(),
});

export const RawOpenF1DriverSchema = z.object({
  driver_number: z.number().int(),
  name_acronym: z.string(),
  full_name: z.string(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  team_name: z.string(),
  team_colour: z.string().nullable().optional(),
  session_key: z.number().int(),
  meeting_key: z.number().int(),
});

export const RawOpenF1LapSchema = z.object({
  session_key: z.number().int(),
  meeting_key: z.number().int(),
  driver_number: z.number().int(),
  lap_number: z.number().int(),
  lap_duration: z.number().nullable(),
  duration_sector_1: z.number().nullable().optional(),
  duration_sector_2: z.number().nullable().optional(),
  duration_sector_3: z.number().nullable().optional(),
  date_start: z.string().datetime({ offset: true }),
  is_pit_out_lap: z.boolean().optional(),
});

export const RawOpenF1CarDataSchema = z.object({
  session_key: z.number().int(),
  driver_number: z.number().int(),
  date: z.string(),
  speed: z.number(),
  throttle: z.number(),
  brake: z.number(),
  n_gear: z.number().int(),
  rpm: z.number(),
  drs: z.number().int(),
});

export const RawOpenF1LocationSchema = z.object({
  session_key: z.number().int(),
  driver_number: z.number().int(),
  date: z.string(),
  x: z.number(),
  y: z.number(),
  z: z.number().optional(),
});

export type RawOpenF1Session = z.infer<typeof RawOpenF1SessionSchema>;
export type RawOpenF1Driver = z.infer<typeof RawOpenF1DriverSchema>;
export type RawOpenF1Lap = z.infer<typeof RawOpenF1LapSchema>;
export type RawOpenF1CarData = z.infer<typeof RawOpenF1CarDataSchema>;
export type RawOpenF1Location = z.infer<typeof RawOpenF1LocationSchema>;
