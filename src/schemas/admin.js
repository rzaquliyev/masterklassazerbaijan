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

export const galleryUploadSchema = z.object({
  houseId: z.string().uuid().optional().or(z.literal('')),
  childLabel: z.string().trim().max(80).optional().or(z.literal('')),
  // BRIEF: razılıq bayrağı məcburi sahədir — işarələnməyibsə, foto heç saxlanmır.
  consent: z.literal('on', { errorMap: () => ({ message: 'Valideyn razılığı qeyd olunmadan foto yüklənə bilməz' }) }),
});

export const weeklyTaskSchema = z.object({
  weekNumber: z.coerce.number().int().min(1).max(999),
  title: z.string().trim().min(2).max(160),
  instructions: z.string().trim().max(2000).optional().or(z.literal('')),
  // Admin formunda vergüllə ayrılmış sahə kimi doldurulur, routda array-ə çevrilir.
  materials: z.string().trim().max(500).optional().or(z.literal('')),
  unlockDate: z.string().min(1),
  relatedMasterclassId: z.string().uuid().optional().or(z.literal('')),
});

export const taskParticipantSchema = z.object({
  phone: z.string().trim().min(5).max(30),
  ageGroup: z.enum(['4-6', '7-9', '10-12']),
  childLabel: z.string().trim().max(80).optional().or(z.literal('')),
  instagramHandle: z.string().trim().max(80).optional().or(z.literal('')),
  consentPublic: z.literal('on').optional(),
});
