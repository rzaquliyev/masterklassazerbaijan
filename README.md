# Masterklass Azerbaijan — sayt

Bakıda uşaq masterklassları keçirən studiya üçün çoxsəhifəli, real backend-li sayt (ictimai sayt + bron sistemi + admin panel). Konsepsiya: "Plastilin şəhəri" — sayt kiçik bir plastilin şəhəridir, hər səhifə şəhərin bir yeridir. Ətraflı: [`BRIEF.md`](BRIEF.md), [`DESIGN.md`](DESIGN.md), [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Tələblər

- Node.js 20+ (LTS tövsiyə olunur)
- Postgres **ixtiyaridir** — yoxdursa, layihə avtomatik PGlite-ə (fayl-əsaslı, yerli) keçir

## Quraşdırma və lokal işə salma

```bash
npm install
cp .env.example .env
npm run dev
```

Sayt `http://localhost:3000` ünvanında açılır. İlk dəfə boş baza aşkarlansa (yalnız `NODE_ENV=development`-də), avtomatik `SAMPLE` nümunə məlumatla doldurulur — qiymətlər, ünvanlar və s. `SAMPLE` bayrağı ilə işarələnib, real deyil.

### `.env` dəyişənləri

| Dəyişən | Təyinat |
|---|---|
| `DATABASE_URL` | Boş qalsa, PGlite (yerli, fayl-əsaslı) istifadə olunur — **yalnız development üçün kifayətdir**. Production-da real Postgres bağlantı sətri buraya yazılmalıdır. |
| `PGLITE_DATA_DIR` | PGlite-in məlumatı harada saxlayacağı qovluq (default: `.pglite-data`). Boş qalsa, yaddaşda saxlanır və server dayananda itir. |
| `NODE_ENV` | `development` / `production` |
| `PORT` | Server portu (default: 3000) |

Miqrasiyalar (`migrations/*.sql`) server hər başlayanda avtomatik tətbiq olunur (`scripts/migrate.js`).

## Admin paneli

Admin panel `/admin` ünvanındadır (girişsiz görünmür, axtarış motorlarına indekslənmir). **Default parol yoxdur** — ilk `owner` istifadəçisini özünüz yaratmalısınız:

```bash
ADMIN_EMAIL=siz@nümunə.az ADMIN_PASSWORD="ən azı 10 simvoldan ibarət güclü parol" node scripts/create-admin.js
```

Bundan sonra `/admin/login` ünvanından daxil olun. `owner` rolu hər şeyə (o cümlədən CSV ixrac, istifadəçi yaratma, audit jurnalı, müştəri anonimləşdirmə) çatır; `owner` paneldən əlavə `staff` istifadəçilər yarada bilər (bronlar/masterklasslar üzərində işləyir, amma ixrac/istifadəçi/jurnal/anonimləşdirmə yoxdur).

Admin panelin nə etdiyi/etmədiyi: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) §4.

## Testlər

```bash
npm test
```

Node-un daxili test runner-i ilə işləyir (`node --test`), hər test faylı öz təcrid olunmuş PGlite nümunəsini yaradır (paylaşılan vəziyyət yoxdur). Bron/tutum məntiqi və admin autentifikasiyası/icazələri üçün test var (`tests/booking.test.js`, `tests/admin.test.js`).

## Layihə strukturu

```
src/
  routes/        → yalnız HTTP (public.js, admin.js)
  services/       → biznes qaydaları (bron, tutum, kodlar)
  repositories/   → yalnız SQL
  schemas/        → Zod validasiya sxemləri
  middleware/     → admin autentifikasiya/CSRF
  views/          → Nunjucks şablonları (admin/ ayrı alt-qovluqda)
  public/         → statik CSS/JS/şrift
migrations/       → versiyalı SQL miqrasiyalar
scripts/          → create-admin.js, migrate.js, seed-data.js
tests/            → node:test testləri
docs/             → ARCHITECTURE.md, PAGES.md, ASSETS.md, CONTENT-TODO.md
```

## Hələ görülməli işlər

- [`docs/CONTENT-TODO.md`](docs/CONTENT-TODO.md): real məzmun boşluqları (iş saatları, qiymətlər, say həddləri, fotolar)
- Deploy sənədi (`docs/DEPLOY.md`) hələ yazılmayıb — hosting seçimi gözlənilir
- Qalereya foto yükləmə admin UI-dan hələ yoxdur (bax `docs/ARCHITECTURE.md` §4 "hələ tətbiq olunmayıb")
