# DEPLOY.md — Railway-a köçürmə

**Qərar (2026-10-10):** hosting — **Railway**, `docs/ARCHITECTURE.md` §9-dakı iki namizəddən (Render/Railway) seçildi. Səbəb: qalereya fotoları hazırda yerli diskdə saxlanılır (S3 inteqrasiyası yoxdur, bax `docs/ARCHITECTURE.md` §8) — Railway-in persistent volume dəstəyi bu riski Render-in pulsuz/ephemeral-disk planına nisbətən daha sadə həll edir.

## 1. Ön şərt: GitHub-a push

Layihənin hazırda uzaq (remote) repository-si yoxdur. Railway GitHub-dan avtomatik deploy üçün buna ehtiyac duyur:

```bash
# GitHub-da boş repo yaradın (adı: masterklassazerbaijan və ya seçdiyiniz ad), sonra:
git remote add origin https://github.com/<istifadəçi-adınız>/masterklassazerbaijan.git
git push -u origin master
```

## 2. Railway-da layihə yaradın

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo** → yuxarıda push etdiyiniz repo-nu seçin.
2. Railway `package.json`-u Nixpacks ilə avtomatik aşkarlayır — əlavə build konfiqurasiyası (Procfile, Dockerfile) **lazım deyil**. Build: `npm install`, start: `npm start` (= `node src/server.js`, artıq `package.json`-da tərif olunub).

## 3. Postgres əlavə edin

1. Layihənin Railway lövhəsində **+ New** → **Database** → **PostgreSQL**.
2. Sayt servisinin **Variables** bölməsinə keçin. Railway adətən "Suggested Variables" altında `DATABASE_URL`-i özü aşkarlayıb boş sətir kimi göstərir — "VALUE or ${{REF}}" sahəsinə klikləyib Postgres-i seçin (nəticədə `${{Postgres.DATABASE_URL}}` kimi bir istinad yaranır, əl ilə yazmayın).
3. **Vacib:** bu dəyişəni əlavə etdikdən sonra ekranın yuxarısındakı **"Apply changes" / "Deploy"** düyməsinə mütləq basın — Railway-in interfeysi dəyişiklikləri dərhal tətbiq etmir, "gözləmə" vəziyyətində saxlayır.
4. Server hər başlayanda miqrasiyaları (`migrations/*.sql`) özü tətbiq edir (`scripts/migrate.js`, `src/server.js`-dən çağırılır) — əl ilə miqrasiya addımı **lazım deyil**.

**Gotcha (canlı təcrübədən):** `DATABASE_URL` əlavə olunmadan/tətbiq olunmadan server işə düşərsə, kod avtomatik **PGlite**-ə (WASM-əsaslı, yaddaş tələb edən ehtiyat Postgres) keçir — bu, Railway-in konteyner yaddaş limitini dərhal aşıb prosesi "Killed" statusu ilə öldürür, sonsuz crash-loop yaranır (loglarda stack trace YOXDUR, sadəcə "Killed" sözü görünür — bu, OOM kill əlamətidir). Server "Killed" ilə dönə-dönə crash edirsə, ilk yoxlanacaq şey budur.

## 4. Persistent volume (qalereya fotoları üçün)

**Qeyd:** "Settings → Volumes" bəzi Railway hesablarında/UI versiyalarında görünmür. İşləyən üsul — əsas kanvas görünüşü:

1. Əsas kanvas görünüşünə qayıdın (layihənin bütün servislərini bir yerdə gördüyünüz yer)
2. Boş yerə sağ-klikləyin və ya sol kənardakı **"+"** düyməsinə basın → **"Volume"** seçin
3. Yaranan volume node-unu sürükləyib `masterklassazerbaijan` servisinin üzərinə buraxın (bağlamaq üçün) — eynən Postgres-in öz volume-unun bağlandığı kimi
4. Onun ayarlarında **Mount Path:** `/app/src/public/uploads/gallery`
   (Railway-in Nixpacks build-i repo-nu `/app`-a qoyur; `src/lib/imageUpload.js`-dəki `GALLERY_DIR` məhz bu yola yazır/oxuyur.)
5. Bundan sonra server yenidən başlasa (deploy, restart) belə, yüklənmiş fotolar **silinmir**.

## 5. Mühit dəyişənləri (Variables)

Sayt servisinin **Variables** bölməsinə:

| Dəyişən | Dəyər |
|---|---|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (§3) |
| `NODE_ENV` | `production` |
| `PORT` | `3000` — **əl ilə əlavə edin.** (Nəzəri cəhətdən Railway bunu avtomatik vermir/uyğunlaşdırmır; "Generate Domain" dialoqu hansı porta yönləndirəcəyini soruşanda, bura yazdığınız **eyni rəqəmi** (`3000`) orada da yazın — uyğunsuzluq health-check-in uğursuz olub servisin dönə-dönə restart edilməsinə (crash-loop effekti) səbəb olur.) |

`PGLITE_DATA_DIR` production-da lazım deyil (yalnız `DATABASE_URL` boş olanda, yəni yerli development-də işə düşür) — istəsəniz silə bilərsiniz, zərəri yoxdur (reach olunmur).

Hər dəyişiklikdən sonra **"Apply changes" / "Deploy"** düyməsinə basmağı unutmayın (§3-dəki qeydə bax).

## 6. İlk admin hesabını yaradın

**Vacib (canlı təcrübədən):** `railway run` əmri komandanı **yerli kompüterinizdə** işə salır, Railway-in dəyişənlərini ora "ötürür" — amma `DATABASE_URL` Railway-in **daxili** şəbəkə ünvanını (`postgres.railway.internal`) istifadə edir, bu da yalnız Railway-in öz şəbəkəsinin İÇİNDƏN əlçatandır. Ona görə `railway run node scripts/create-admin.js` yerli kompüterdən **işləməyəcək** (`ENOTFOUND postgres.railway.internal` xətası verəcək). Əvəzinə `railway ssh` ilə birbaşa Railway-in öz konteynerinin içinə girib, əmri **orada** işə salmaq lazımdır:

```bash
npm i -g @railway/cli
railway login              # brauzer açılır, təsdiqləyin
railway link                # layihəni seçin
railway ssh                 # ilk dəfədirsə SSH açarı istəyə bilər: ssh-keygen -t ed25519, sonra yenidən railway ssh
```

`railway ssh` sizi Railway-in konteynerinin içinə (`/app` qovluğuna) salacaq — **bu, Windows PowerShell deyil, Linux shell-dir**, ona görə orada bu əmri birbaşa (bash sintaksisi ilə, `bash -c` SARMAĞA EHTİYAC YOXDUR) yazın:

```bash
ADMIN_EMAIL=siz@numune.az ADMIN_PASSWORD="ən azı 10 simvoldan ibarət güclü parol" node scripts/create-admin.js
```

Uğurlu olarsa, `https://<railway-domeniniz>/admin/login`-dən daxil ola bilərsiniz.

## 7. Domen

Railway avtomatik `*.up.railway.app` domeni verir, amma ilk dəfə **manual aktivləşdirmə tələb edir**: servis → **Settings** → **Networking** → **"Generate Domain"** (layihənin ümumi/project-level Settings-i YOX, servisin ÖZ Settings-i — bunlar fərqli yerlərdir, qarışdırmayın). Generate edəndə port soruşsa, §5-dəki `PORT` dəyəri ilə (`3000`) eyni rəqəmi yazın.

Öz domeninizi (`masterklassazerbaijan.az` və ya oxşar — bax `docs/CONTENT-TODO.md` §1, **"masterclass.az" YOX**, başqasına məxsusdur) bağlamaq üçün: eyni Networking bölməsində **Custom Domain**, sonra domen provayderinizdə göstərilən CNAME qeydini əlavə edin.

## 8. Backup — QURULDU (2026-10-10), qismən

Railway CLI ilə **PITR (Point-in-Time Recovery)** aktivləşdirildi:

```bash
railway postgres pitr enable --service postgres
railway postgres pitr status --service postgres   # yoxlamaq üçün
```

Bu, bazanın davamlı arxivləndiyi və istənilən keçmiş ana (saniyə dəqiqliyi ilə) geri qaytarıla biləcəyi mənasına gəlir — əsas qoruma artıq **işləkdir**.

**Qismən məhdudiyyət:** ayrıca, adlı/cədvəlli snapshot-lar yaradan "backup schedule" funksiyası (`railway postgres pitr schedule set --daily --weekly`) sınanıb, amma **yalnız Railway Pro planında mövcuddur** ("Manual backups and backup schedules are only available for Pro workspaces" xətası) — hazırkı planda bağlıdır. Pro-ya keçilərsə, yuxarıdakı əmri yenidən sınayın.

## 9. Yoxlama siyahısı (hər deploy-dan sonra)

- [ ] `/az/`, `/ru/`, `/en/` ana səhifələr açılır
- [ ] `/admin/login` açılır, yaradılmış admin hesabı ilə giriş mümkündür
- [ ] Bir sınaq bron tam axını (PIN→say→eksport əvəzinə bura üçün: masterklass seç→kassa→təsdiq) xətasız keçir
- [ ] Qalereyaya bir sınaq foto yükləyib, server restart edilib (Railway → Deployments → Redeploy), foto **hələ orada** olduğu yoxlanılır (volume-un işlədiyinin sübutu)
