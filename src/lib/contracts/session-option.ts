import { z } from 'zod';

export const SessionOptionSchema = z.object({
  sessionKey: z.number().int().positive(),
  sessionName: z.string().min(1),
  sessionType: z.literal('Qualifying'),
  meetingKey: z.number().int().positive(),
  circuitShortName: z.string().min(1),
  countryName: z.string().min(1),
  year: z.number().int().min(2018).max(2100),
  dateStart: z.string().datetime({ offset: true }),
});

export type SessionOption = z.infer<typeof SessionOptionSchema>;
