# Təhvil qeydi (Handover) — 2026-10-09

Bu sənəd layihəni ilk dəfə əlinə alan hər kəs üçün (studiya sahibi, başqa developer) qısa, praktiki bələdçidir. Daha ətraflı: [`README.md`](../README.md) (quraşdırma), [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) (texniki quruluş), [`docs/QA.md`](QA.md) (keyfiyyət auditi), [`docs/CONTENT-TODO.md`](CONTENT-TODO.md) (real məzmun boşluqları).

## 1. Hansı fayldan başlamalı

- **İlk işə salma:** [`README.md`](../README.md) → "Quraşdırma və lokal işə salma" bölməsi (3 əmr: `npm install`, `.env` kopyala, `npm run dev`)
- **Admin yaratmaq:** [`README.md`](../README.md) → "Admin paneli" bölməsi (`scripts/create-admin.js`)
- **Nəyin hazır, nəyin yarımçıq olduğunu görmək:** bu sənədin §3-4 bölmələri + `docs/CONTENT-TODO.md`

## 2. Müştəri məlumatı haradadır, kim görə bilər, necə ehtiyat nüsxə (backup) alınır

- **Hazırda (lokal development):** bütün məlumat (bronlar, müştərilər, uşaqlar, sorğular, audit jurnalı) `.pglite-data/` qovluğunda, yalnız işlədiyiniz kompüterdə. İnternetdən əlçatan deyil, başqa heç kim görə bilməz.
- **Production-a keçəndə:** `DATABASE_URL` mühit dəyişəni real Postgres bazasına yönəldilməlidir (hosting seçimi hələ edilməyib — istifadəçinin öz qərarına saxlanılıb, bax §5).
- **Kim görə bilər:** yalnız `/admin`-ə daxil olan `owner`/`staff` istifadəçilər (parol + sessiya ilə qorunur). `owner` həm də CSV ixrac edə bilər (bütün bronların siyahısı, UTF-8 BOM ilə, Excel-də Azərbaycan hərfləri düzgün görünür).
- **Backup:** hazırda **avtomatik backup mexanizmi QURULMAYIB**. PGlite üçün ən sadə üsul — `.pglite-data/` qovluğunu vaxtaşırı başqa yerə kopyalamaq. Real Postgres-ə keçəndə, seçilən hosting provayderinin öz backup xidmətindən (adətən gündəlik avtomatik) istifadə edilməlidir — bu, hosting seçimi ilə birlikdə qurulmalı bir addımdır.
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

- **Hosting seçildi (Railway), amma hələ real deploy edilməyib** — layihə kodu hazırdır (`DATABASE_URL` dəstəyi var), addım-addım təlimat [`docs/DEPLOY.md`](DEPLOY.md)-dədir, lakin kod hələ yalnız PGlite (yerli) ilə sınanıb, real Postgres-də hələ yoxlanılmayıb.
- **Backup mexanizmi qurulmayıb** (bax §2 və `docs/DEPLOY.md` §8) — Railway-ə keçəndə aktivləşdirilməlidir.
- **E-poçt/SMS bildirişi yoxdur** — Phase 0 qərarına görə yalnız WhatsApp (`wa.me` linki) istifadə olunur, real SMS/OTP provayderi yoxdur.
- **Onlayn ödəniş yoxdur** — yalnız məkanda ödəniş (pay-at-venue), Phase 0 qərarı.
- **Admin UI-da hələ yoxdur:** ev (`houses`) idarəsi, FAQ (Suallar) idarəsi, endirim/referral kodu idarəsi — bunlar hələlik yalnız birbaşa DB/seed vasitəsilə dəyişdirilə bilər.
- **Qalereya foto yükləmə** real brauzerdə, real şəkil faylı ilə test edilib (JPEG→WebP çevrilmə, EXIF silinmə, HEIC dəstəyi) — amma **real istifadəçi tərəfindən hələ heç bir real foto yüklənməyib**, yalnız test şəkli (silinib).
- **Real Postgres-lə (PGlite yox) tam inteqrasiya testi edilməyib** — kod səviyyəsində eyni interfeys istifadə olunur, amma BRIEF-in özü də qeyd etdiyi kimi, "production Postgres sınanmadı" aydın yazılmalıdır.
- **Mobil cihazda (real telefon) əl ilə toxunma testi edilməyib** — yalnız brauzer emulyasiyası (375px) ilə yoxlanılıb.

## 5. Növbəti addımlar (tövsiyə sırası ilə)

1. **`docs/CONTENT-TODO.md`-dəki qalan məlumatları verin** (iş saatları, real qiymətlər) — bunlar ən sürətli, ən vacib addımdır.
2. ~~Hosting seçin~~ ✅ **TƏSDİQLƏNDİ (2026-10-10): Railway.** Addım-addım quraşdırma, Postgres, persistent volume, ilk admin yaradılması, backup: [`docs/DEPLOY.md`](DEPLOY.md).
3. **Real admin hesabınızı yaradın** (`docs/DEPLOY.md` §6, Railway üzərində) və real qalereya fotolarınızı yükləyin.
4. (İxtiyari, daha sonra) Ev/FAQ/endirim kodu admin UI-ları — hazırda DB-seed ilə idarə olunur, UI-ya ehtiyac yarandıqda əlavə edilə bilər.
