import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(1).max(200),
});

export const masterclassSchema = z.object({
  houseId: z.string().uuid().optional().or(z.literal('')),
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9-]+$/, 'yalnız kiçik hərf, rəqəm, tire'),
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  ageMin: z.coerce.number().int().min(0).max(18),
  ageMax: z.coerce.number().int().min(0).max(18),
}).refine((v) => v.ageMin <= v.ageMax, { message: 'yaş aralığı səhvdir', path: ['ageMax'] });

export const sessionSchema = z.object({
  startsAt: z.string().min(1),
  capacity: z.coerce.number().int().min(1).max(200),
  priceAzn: z.coerce.number().min(0).max(100000),
  earlyBirdPriceAzn: z.coerce.number().min(0).max(100000).optional().or(z.literal('')),
  earlyBirdSlots: z.coerce.number().int().min(0).max(200).optional().or(z.literal('')),
  location: z.string().trim().min(2).max(200),
});

export const notesSchema = z.object({
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
});

export const createAdminUserSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(10).max(200),
  role: z.enum(['owner', 'staff']),
});
