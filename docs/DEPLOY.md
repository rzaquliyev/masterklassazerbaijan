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
2. Railway avtomatik `DATABASE_URL` dəyişənini Postgres servisinə yaradır. Sayt servisinin **Variables** bölməsində:
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (Railway-in "reference variable" funksiyası — Postgres servisini seçəndə dropdown-dan avtomatik gəlir, əl ilə yazmayın).
3. Server hər başlayanda miqrasiyaları (`migrations/*.sql`) özü tətbiq edir (`scripts/migrate.js`, `src/server.js`-dən çağırılır) — əl ilə miqrasiya addımı **lazım deyil**.

## 4. Persistent volume (qalereya fotoları üçün)

1. Sayt servisinin **Settings** → **Volumes** → **+ New Volume**.
2. **Mount path:** `/app/src/public/uploads/gallery`
   (Railway-in Nixpacks build-i repo-nu `/app`-a qoyur; `src/lib/imageUpload.js`-dəki `GALLERY_DIR` məhz bu yola yazır/oxuyur.)
3. Bundan sonra server yenidən başlasa (deploy, restart) belə, yüklənmiş fotolar **silinmir**.

## 5. Mühit dəyişənləri (Variables)

Sayt servisinin **Variables** bölməsinə:

| Dəyişən | Dəyər |
|---|---|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (§3) |
| `NODE_ENV` | `production` |
| `PORT` | Railway avtomatik təyin edir — **əl ilə yazmayın**, `src/server.js` `process.env.PORT`-u özü oxuyur. |

`PGLITE_DATA_DIR` production-da lazım deyil (yalnız `DATABASE_URL` boş olanda, yəni yerli development-də işə düşür).

## 6. İlk admin hesabını yaradın

Server işə düşdükdən sonra, **bir dəfəlik**, Railway-in öz mühitində (yerli maşınınızda yox — `DATABASE_URL` yalnız Railway daxilində əlçatandır):

```bash
# Railway CLI quraşdırın: npm i -g @railway/cli, sonra:
railway login
railway link   # layihəni seçin
railway run node scripts/create-admin.js
```

`ADMIN_EMAIL` və `ADMIN_PASSWORD`-u əvvəlcədən Railway Variables-a əlavə etməyin (bir dəfəlik istifadə üçündür, daimi saxlanmasın) — əvəzinə birbaşa `railway run` əmrinin qarşısına yazın:

```bash
railway run bash -c 'ADMIN_EMAIL=siz@numune.az ADMIN_PASSWORD="ən azı 10 simvoldan ibarət güclü parol" node scripts/create-admin.js'
```

Uğurlu olarsa, `https://<railway-domeniniz>/admin/login`-dən daxil ola bilərsiniz.

## 7. Domen

Railway avtomatik `*.up.railway.app` domeni verir (pulsuz, dərhal işləyir). Öz domeninizi (`masterklassazerbaijan.az` və ya oxşar — bax `docs/CONTENT-TODO.md` §1, **"masterclass.az" YOX**, başqasına məxsusdur) bağlamaq üçün: Railway → Settings → Networking → **Custom Domain**, sonra domen provayderinizdə göstərilən CNAME qeydini əlavə edin.

## 8. Backup (hələ qurulmayıb — tövsiyə)

`docs/HANDOVER.md` §2-də qeyd olunduğu kimi, avtomatik backup hələ qurulmayıb. Railway-in Postgres servisi daxilində **Backups** bölməsi var (planınıza görə avtomatik gündəlik backup təklif edə bilər) — Railway lövhəsində Postgres servisi → **Backups** sekmesini yoxlayın və aktivləşdirin. Əlavə təhlükəsizlik üçün, həftəlik `pg_dump`-ı xarici yerə (məs. özəl bulud saxlama) köçürən sadə bir cron tapşırığı da əlavə edilə bilər — hazırda **qurulmayıb**, tələb olunarsa ayrıca addım kimi edilə bilər.

## 9. Yoxlama siyahısı (hər deploy-dan sonra)

- [ ] `/az/`, `/ru/`, `/en/` ana səhifələr açılır
- [ ] `/admin/login` açılır, yaradılmış admin hesabı ilə giriş mümkündür
- [ ] Bir sınaq bron tam axını (PIN→say→eksport əvəzinə bura üçün: masterklass seç→kassa→təsdiq) xətasız keçir
- [ ] Qalereyaya bir sınaq foto yükləyib, server restart edilib (Railway → Deployments → Redeploy), foto **hələ orada** olduğu yoxlanılır (volume-un işlədiyinin sübutu)
