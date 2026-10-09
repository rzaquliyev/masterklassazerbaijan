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
const MAX_WIDTH = 1600;

export class UnsupportedImageError extends Error {
  constructor() { super('Şəkil formatı tanınmadı və ya fayl zədələnib. JPEG, PNG, WebP və ya HEIC sınayın.'); this.name = 'UnsupportedImageError'; }
}

export async function saveGalleryImage(buffer) {
  await mkdir(GALLERY_DIR, { recursive: true });

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
  await writeFile(path.join(GALLERY_DIR, filename), output);
  return { url: `/uploads/gallery/${filename}`, filename };
}

export async function deleteGalleryImage(url) {
  if (!url || !url.startsWith('/uploads/gallery/')) return;
  const filename = path.basename(url);
  await unlink(path.join(GALLERY_DIR, filename)).catch(() => {});
}
