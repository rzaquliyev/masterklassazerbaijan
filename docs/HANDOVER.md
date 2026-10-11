# Təhvil qeydi (Handover) — 2026-10-09

Bu sənəd layihəni ilk dəfə əlinə alan hər kəs üçün (studiya sahibi, başqa developer) qısa, praktiki bələdçidir. Daha ətraflı: [`README.md`](../README.md) (quraşdırma), [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) (texniki quruluş), [`docs/QA.md`](QA.md) (keyfiyyət auditi), [`docs/CONTENT-TODO.md`](CONTENT-TODO.md) (real məzmun boşluqları).

## 1. Hansı fayldan başlamalı

- **İlk işə salma:** [`README.md`](../README.md) → "Quraşdırma və lokal işə salma" bölməsi (3 əmr: `npm install`, `.env` kopyala, `npm run dev`)
- **Admin yaratmaq:** [`README.md`](../README.md) → "Admin paneli" bölməsi (`scripts/create-admin.js`)
- **Nəyin hazır, nəyin yarımçıq olduğunu görmək:** bu sənədin §3-4 bölmələri + `docs/CONTENT-TODO.md`

## 2. Müştəri məlumatı haradadır, kim görə bilər, necə ehtiyat nüsxə (backup) alınır

- **Hazırda (lokal development):** bütün məlumat (bronlar, müştərilər, uşaqlar, sorğular, audit jurnalı) `.pglite-data/` qovluğunda, yalnız işlədiyiniz kompüterdə. İnternetdən əlçatan deyil, başqa heç kim görə bilməz.
- **Production (2026-10-10-dan etibarən canlı):** Railway-də, real Postgres-də işləyir — [`docs/DEPLOY.md`](DEPLOY.md)-də addım-addım təsvir olunub. Hazırda sayt yalnız SAMPLE (nümunə) data ilə doldurulub, real məzmun §3-ə görə gözlənilir.
- **Kim görə bilər:** yalnız `/admin`-ə daxil olan `owner`/`staff` istifadəçilər (parol + sessiya ilə qorunur). `owner` həm də CSV ixrac edə bilər (bütün bronların siyahısı, UTF-8 BOM ilə, Excel-də Azərbaycan hərfləri düzgün görünür).
- **Backup:** **PITR (Point-in-Time Recovery) aktivdir** (`docs/DEPLOY.md` §8-ə görə 2026-10-10-da quruldu) — baza davamlı arxivlənir, istənilən keçmiş ana geri qaytarıla bilər. Ayrıca, adlı/cədvəlli snapshot-lar (gündəlik/həftəlik) hazırkı Railway planında **mövcud deyil** (yalnız Pro planında) — Pro-ya keçilərsə aktivləşdirilə bilər.
- **Silinmə/anonimləşdirmə tələbi gələrsə:** `/admin/customers/<id>` səhifəsində "Müştərini anonimləşdir" düyməsi var (yalnız owner) — ad və telefon silinir, bron tarixçəsi (statistika üçün) qalır.
- **Qalereya fotoları:** `src/public/uploads/gallery/` qovluğunda, yerli diskdə. **Diqqət:** ephemeral-disk hostingdə (məs. bəzi pulsuz planlar) server yenidən başlayanda bu qovluq silinə bilər — DB sətirləri qalar, amma faylın özü itər. Production seçərkən bu, nəzərə alınmalıdır (daimi disk və ya S3-uyğun saxlama).

## 3. Məzmun boşluqları (real məlumat gözləyir)

Tam, yenilənən siyahı: [`docs/CONTENT-TODO.md`](CONTENT-TODO.md). Qısaca:

| Verilmiş | Hələ gözlənilir |
|---|---|
| ✅ Brend adı (Masterklass Azerbaijan) | ❌ İş saatları |
| ✅ Ünvan (Nərimanov r., Təbriz küç.) | ❌ Real qiymətlər (hazırda SAMPLE) |
| ✅ Telefon/WhatsApp | ❌ Qrup ölçüsü həddləri (ad günü paketləri və s.) |
| | ❌ Qaydalar mətni (ləğv qaydası, sertifikat məlumatı, məlumatların saxlanma müddəti) |
| | ❌ Real fotolar (yükləmə mexanizmi hazırdır, `/admin/qalereya`) |

## 4. Bilinən məhdudiyyətlər və yoxlanılmayanlar

Açıq və dürüst siyahı (BRIEF-in öz tələbinə görə):

- **Hosting: Railway-də canlıdır (2026-10-10-dan)** — real Postgres-lə deploy edilib və yoxlanılıb (`docs/DEPLOY.md`).
- **Backup qismən quruldu** (bax §2 və `docs/DEPLOY.md` §8) — PITR aktivdir, cədvəlli snapshot-lar Pro plan tələb edir.
- **E-poçt/SMS bildirişi yoxdur** — Phase 0 qərarına görə yalnız WhatsApp (`wa.me` linki) istifadə olunur, real SMS/OTP provayderi yoxdur.
- **Onlayn ödəniş yoxdur** — yalnız məkanda ödəniş (pay-at-venue), Phase 0 qərarı.
- **Admin UI-da hələ yoxdur:** ev (`houses`) idarəsi, FAQ (Suallar) idarəsi, endirim/referral kodu idarəsi — bunlar hələlik yalnız birbaşa DB/seed vasitəsilə dəyişdirilə bilər.
- **Qalereya foto yükləmə** real brauzerdə, real şəkil faylı ilə test edilib (JPEG→WebP çevrilmə, EXIF silinmə, HEIC dəstəyi) — amma **real istifadəçi tərəfindən hələ heç bir real foto yüklənməyib**, yalnız test şəkli (silinib).
- **Real Postgres-lə (PGlite yox) tam inteqrasiya testi edilməyib** — kod səviyyəsində eyni interfeys istifadə olunur, amma BRIEF-in özü də qeyd etdiyi kimi, "production Postgres sınanmadı" aydın yazılmalıdır.
- **Mobil cihazda (real telefon) əl ilə toxunma testi edilməyib** — yalnız brauzer emulyasiyası (375px) ilə yoxlanılıb.

## 5. Növbəti addımlar (tövsiyə sırası ilə)

1. **`docs/CONTENT-TODO.md`-dəki qalan məlumatları verin** (iş saatları, real qiymətlər) — bunlar ən sürətli, ən vacib addımdır. Hazırda admin paneldə görünən 4 masterklass **SAMPLE** data-dır (bax aşağı), real qiymət/təsvirlə əvəz edilməlidir.
2. ~~Hosting seçin~~ ✅ **TƏSDİQLƏNDİ (2026-10-10): Railway.** Canlıdır: [`docs/DEPLOY.md`](DEPLOY.md).
3. ~~Real admin hesabınızı yaradın~~ ✅ **EDİLDİ (2026-10-10)** — `/admin/login`-dən daxil ola bilərsiniz. Real qalereya fotolarınızı yükləmək qalır.
4. ~~Backup~~ ✅ **QİSMƏN EDİLDİ (2026-10-10)** — PITR aktivdir (`docs/DEPLOY.md` §8).
5. ~~Ev/FAQ/endirim kodu admin UI-ları~~ ✅ **EDİLDİ (2026-10-11)** — `/admin/evler`, `/admin/suallar-idare`, `/admin/kodlar`.
6. (İxtiyari) Öz domen (`masterklassazerbaijan.az` və ya `.com`) alıb Railway-ə bağlamaq — bax `docs/DEPLOY.md` §7.
