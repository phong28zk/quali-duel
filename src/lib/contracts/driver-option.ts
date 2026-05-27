import { z } from 'zod';

export const DriverOptionSchema = z.object({
  driverNumber: z.number().int().positive(),
  nameAcronym: z.string().regex(/^[A-Z]{3}$/, 'expect 3 uppercase letters'),
  fullName: z.string().min(1),
  teamName: z.string().min(1),
  teamColour: z
    .string()
    .regex(/^[0-9A-Fa-f]{6}$/, 'expect 6 hex chars without #')
    .optional(),
});

export type DriverOption = z.infer<typeof DriverOptionSchema>;
