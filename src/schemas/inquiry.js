import { z } from 'zod';

export const contactInquirySchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(5).max(20),
  message: z.string().trim().min(1).max(1000),
});

export const birthdayInquirySchema = z.object({
  package: z.string().trim().min(1).max(80),
  phone: z.string().trim().min(5).max(20),
  kids: z.coerce.number().int().min(1).max(100).optional(),
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
});
