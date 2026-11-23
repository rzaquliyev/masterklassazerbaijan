# Təhvil qeydi (Handover) — yenilənib 2026-11-24

Bu sənəd layihəni ilk dəfə əlinə alan hər kəs üçün (studiya sahibi, başqa developer, **başqa bir AI söhbəti**) qısa, praktiki bələdçidir. Başqa bir chat-da işə davam etmək istəyirsinizsə, bu faylı ora yapışdırın/əlavə edin — kifayət qədər kontekst verir. Daha ətraflı: [`README.md`](../README.md) (quraşdırma), [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) (texniki quruluş), [`docs/DEPLOY.md`](DEPLOY.md) (Railway addımları), [`docs/QA.md`](QA.md) (keyfiyyət auditi), [`docs/CONTENT-TODO.md`](CONTENT-TODO.md) (real məzmun boşluqları).

## 0. İndi harada dayanmışıq (2026-11-24) — ƏN VACİB

1. **🔴 Production sayt hazırda OFFLINE-dır.** Railway-in Free/Trial planı ("30 gün, $5 kredit, kartsız") bitib (~2026-10-11-dən bəri), həm `masterklassazerbaijan` servisi, həm də Postgres bazası dayanıb (`railway status` → "○ Offline" hər ikisi üçün). **Bu kodun problemi deyil** — sadəcə kart əlavə edilməyib.
2. **Domen alındı: `masterklas.az`** — hələ heç bir hostinqə bağlanmayıb.
3. **Hostinq qərarı gözlənilir (sahibdən):** iki seçim müzakirə edildi:
   - **(Tövsiyə) Railway-də qal, kart əlavə et** → Hobby plan ($5/ay minimum), mövcud layihə/DB/volume/PITR backup saxlanılır, sıfır köçürmə işi.
   - Başqa provayderə keç (Render ~$13/ay, Fly.io) — yenidən qurma tələb edir.
   Qərar veriləndə növbəti addım: kart əlavə et → Railway Hobby plana keç → `masterklas.az`-ı Custom Domain kimi bağla (bax `docs/DEPLOY.md` §7).
4. **Tam kodbase təhlükəsizlik auditi edildi (2026-11-24)** — nəticə: kod ümumilikdə möhkəmdir (CSRF+auth bütün admin marşrutlarında, SQL-injection yoxdur, XSS-dən qorunma aktiv, `npm audit` 0 boşluq). 3 kiçik boşluq tapılıb düzəldildi və commit edildi (bax §6).
5. **Yeni funksiya əlavə edildi və commit edildi:** `/admin/sayt` — owner indi ana səhifə başlığı/alt mətni, bölmə başlıqları (Yol xəritəsi/Şəhər muzeyi/Şəhəri gəz/Valideynlər-Haqqımızda), Suallar səhifəsi başlığı/alt mətni və footer mətnlərini **kodsuz, 3 dildə (AZ/RU/EN)** dəyişə bilir. Bonus: aktiv/deaktiv edilə bilən "bayram zolağı" (bildiriş zolağı).
6. **Bütün dəyişikliklər lokal commit edilib, GitHub-a `push` edilməyib** (sayt offline olduğu üçün tələsik deyil, həm də push hər zaman sahibin təsdiqi ilə edilir).

## 1. Hansı fayldan başlamalı

- **İlk işə salma:** [`README.md`](../README.md) → "Quraşdırma və lokal işə salma" bölməsi (3 əmr: `npm install`, `.env` kopyala, `npm run dev`)
- **Admin yaratmaq (lokal):** [`README.md`](../README.md) → "Admin paneli" bölməsi (`scripts/create-admin.js`)
- **Sayt yenidən canlandırmaq:** §0.3 + `docs/DEPLOY.md`
- **Nəyin hazır, nəyin yarımçıq olduğunu görmək:** bu sənədin §3-4 bölmələri + `docs/CONTENT-TODO.md`

## 2. Müştəri məlumatı haradadır, kim görə bilər, necə ehtiyat nüsxə (backup) alınır

- **Lokal development:** bütün məlumat (bronlar, müştərilər, uşaqlar, sorğular, audit jurnalı) `.pglite-data/` qovluğunda, yalnız işlədiyiniz kompüterdə.
- **Production (Railway, hazırda offline — bax §0.1):** real Postgres-də idi — [`docs/DEPLOY.md`](DEPLOY.md). Kart əlavə edilib servis yenidən aktivləşəndə, mövcud data (DB + PITR backup) toxunulmamış qalır, itki yoxdur.
- **Kim görə bilər:** yalnız `/admin`-ə daxil olan `owner`/`staff` istifadəçilər (parol + sessiya ilə qorunur, argon2id hash, constant-time login). `owner` CSV ixrac edə bilər.
- **Backup:** PITR (Point-in-Time Recovery) aktivdir (bax `docs/DEPLOY.md` §8) — servis yenidən aktivləşəndə də qalır.
- **Silinmə/anonimləşdirmə tələbi gələrsə:** `/admin/customers/<id>` səhifəsində "Müştərini anonimləşdir" düyməsi var (yalnız owner).
- **Qalereya fotoları:** `src/public/uploads/gallery/` — persistent volume-da (Railway volume), server restart/deploy-da silinmir.

## 3. Məzmun boşluqları (real məlumat gözləyir)

Tam, yenilənən siyahı: [`docs/CONTENT-TODO.md`](CONTENT-TODO.md). Qısaca dəyişməyib — iş saatları, real qiymətlər, qrup ölçüsü həddləri, qaydalar mətni, real fotolar hələ SAMPLE/placeholder-dir.

**Yeni imkan (2026-11-24):** sabit səhifə başlıqları/alt mətinləri (ana səhifə, "Haqqımızda" tipli bölmələr, Suallar başlığı, footer) artıq `/admin/sayt`-dan birbaşa dəyişilə bilir — bunun üçün developerə ehtiyac yoxdur.

## 4. Bilinən məhdudiyyətlər və yoxlanılmayanlar

- **🔴 Hosting hazırda OFFLINE** — bax §0.1. Kod/data risk altında deyil, yalnız kart əlavə edilməlidir.
- **Domen `masterklas.az` alınıb, hələ bağlanmayıb.**
- **Backup qismən** — PITR aktivdir, cədvəlli snapshot-lar Pro plan tələb edir (bax `docs/DEPLOY.md` §8).
- **E-poçt/SMS bildirişi yoxdur** — Phase 0 qərarına görə yalnız WhatsApp (`wa.me` linki).
- **Onlayn ödəniş yoxdur** — yalnız məkanda ödəniş (pay-at-venue), Phase 0 qərarı.
- **Rate-limit yaddaş-daxilidir (tək-proses)** — bilinən, qəbul edilmiş məhdudiyyət (çox-proses miqyaslanma lazım olsa Redis-ə keçid tövsiyə olunur).
- **Real Postgres-lə (PGlite yox) tam inteqrasiya testi** production-da edilib (Railway-də işləyirdi, offline olana qədər), amma **real müştəri datası hələ yoxdur**.
- **Mobil cihazda (real telefon) əl ilə toxunma testi edilməyib** — yalnız brauzer emulyasiyası (375px) ilə yoxlanılıb.

## 5. Admin paneldə indi nə var (tam siyahı)

`/admin` altında: İdarə paneli, Masterklasslar, Bronlar, Müştərilər, Sorğular, Qalereya, Həftənin tapşırığı, Evlər, Suallar, Endirim kodları, **Sayt** (yeni — §0.5), İstifadəçilər (owner), Jurnal (audit log, owner), CSV ixrac (owner).

## 6. Təhlükəsizlik auditi (2026-11-24) — tapılan və düzəldilənlər

Tam statik kod auditi aparıldı (auth/sessiya, SQL-injection, input validasiyası, XSS, rate-limit, fayl yükləmə, HTTP başlıqları, sirr idarəetməsi, IDOR, asılılıqlar, xəta idarəetməsi). Nəticə: əsas təhlükəsizlik infrastrukturu (CSRF, auth, SQL parametrləşdirmə, XSS qorunması, şifrələmə) səhvsiz. Tapılan və düzəldilən 3 məsələ:

1. `/elaqe` və `/ad-gunu` formalarında Zod validasiyası yox idi (yalnız truthy yoxlama) → əlavə edildi + telefon normallaşdırıldı.
2. `/kampaniyalar/passport` axtarışı yalnız IP-yə görə rate-limitlənirdi → telefon üzrə də əlavə edildi.
3. `.ics` bilet endirmə marşrutunda (PII ehtiva edir) rate-limit yox idi → əlavə edildi.

Commit-lər: `Təhlükəsizlik auditi: ...` (2 commit) + `Mərhələ 8: Admin panelinə "Sayt" bölməsi ...` (1 commit). Hamısı lokal `master`-də, GitHub-a push edilməyib.

## 7. Növbəti addımlar (tövsiyə sırası ilə)

1. **Railway-ə kart əlavə et, Hobby plana keç** (bax §0.3) — sayt yenidən canlanır.
2. **`masterklas.az` domenini Railway-ə bağla** (bax `docs/DEPLOY.md` §7).
3. **Commit edilmiş dəyişiklikləri GitHub-a push et** (`git push`) ki, Railway avtomatik deploy etsin.
4. **`docs/CONTENT-TODO.md`-dəki qalan real məlumatları ver** (iş saatları, real qiymətlər və s.).
5. (İxtiyari) `/admin/sayt`-dan sabit mətinləri real/son variantları ilə yenilə.
