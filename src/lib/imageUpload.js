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
// Tapşırıq şəkilləri qalereya qovluğunun İÇİNDƏ saxlanılır: Railway volume-u yalnız
// `/app/src/public/uploads/gallery`-ə bağlıdır (mount yolunu dəyişmək mövcud qalereya fayllarının
// yolunu pozardı). Köhnə `/uploads/tasks/` URL-ləri yalnız silmə üçün tanınır.
const TASKS_DIR = path.join(GALLERY_DIR, 'tasks');
const LEGACY_TASKS_DIR = path.join(__dirname, '..', 'public', 'uploads', 'tasks');
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
  return saveImageTo(TASKS_DIR, '/uploads/gallery/tasks', buffer);
}

export async function deleteTaskPhoto(url) {
  if (!url) return;
  const filename = path.basename(url);
  if (url.startsWith('/uploads/gallery/tasks/')) await unlink(path.join(TASKS_DIR, filename)).catch(() => {});
  else if (url.startsWith('/uploads/tasks/')) await unlink(path.join(LEGACY_TASKS_DIR, filename)).catch(() => {});
}
