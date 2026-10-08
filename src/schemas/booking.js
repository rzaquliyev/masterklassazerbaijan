import { z } from 'zod';

export const bookingInputSchema = z.object({
  sessionId: z.string().uuid(),
  idempotencyKey: z.string().min(8).max(100),
  child: z.object({
    firstName: z.string().trim().min(1).max(80),
    birthYear: z.number().int().min(new Date().getFullYear() - 18).max(new Date().getFullYear()).optional(),
    allergyNote: z.string().trim().max(500).optional(),
  }),
  parent: z.object({
    fullName: z.string().trim().min(2).max(120),
    phone: z.string().trim().min(5).max(20),
  }),
  consent: z.literal(true, { errorMap: () => ({ message: 'Qaydalarla razılıq məcburidir' }) }),
  marketingConsent: z.boolean().default(false),
  discountCode: z.string().trim().max(40).optional(),
});
