// Qalereya foto yükləmə: istənilən adi format (JPEG/PNG/WebP/GIF/HEIC-HEIF/AVIF/TIFF) qəbul edilir,
// avtomatik WebP-ə çevrilir (ölçü + müasir format), EXIF/GPS metadatası ATILIR (sharp defolt olaraq
// .withMetadata() çağırılmayınca heç bir EXIF saxlamır — BRIEF-in "qalereya upload EXIF/GPS
// təmizlənməsi" tələbi), fayl adı həmişə təsadüfi UUID-dir (orijinal ad etibarlı deyil).
import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GALLERY_DIR = path.join(__dirname, '..', 'public', 'uploads', 'gallery');
const TASKS_DIR = path.join(__dirname, '..', 'public', 'uploads', 'tasks');
const MAX_WIDTH = 1600;

export class UnsupportedImageError extends Error {
  constructor() { super('Şəkil formatı tanınmadı və ya fayl zədələnib. JPEG, PNG, WebP və ya HEIC sınayın.'); this.name = 'UnsupportedImageError'; }
}

async function saveImageTo(dir, urlPrefix, buffer) {
  await mkdir(dir, { recursive: true });

  let output;
  try {
    output = await sharp(buffer)
      .rotate() // EXIF orientasiyasına görə avtomatik düzəldir, sonra EXIF atılır
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    throw new UnsupportedImageError();
  }

  const filename = `${randomUUID()}.webp`;
  await writeFile(path.join(dir, filename), output);
  return { url: `${urlPrefix}/${filename}`, filename };
}

export async function saveGalleryImage(buffer) {
  return saveImageTo(GALLERY_DIR, '/uploads/gallery', buffer);
}

export async function deleteGalleryImage(url) {
  if (!url || !url.startsWith('/uploads/gallery/')) return;
  const filename = path.basename(url);
  await unlink(path.join(GALLERY_DIR, filename)).catch(() => {});
}

export async function saveTaskPhoto(buffer) {
  return saveImageTo(TASKS_DIR, '/uploads/tasks', buffer);
}

export async function deleteTaskPhoto(url) {
  if (!url || !url.startsWith('/uploads/tasks/')) return;
  const filename = path.basename(url);
  await unlink(path.join(TASKS_DIR, filename)).catch(() => {});
}
