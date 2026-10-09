# ARCHITECTURE.md

## 1. Stack

`kids-masterclass-website` skilinin default stack-i, BRIEF §7-yə görə səbəbsiz dəyişdirilmir:

- **Runtime:** Node.js LTS
- **Server:** Express
- **Template:** Nunjucks (server-rendered HTML, auto-escape)
- **DB:** PostgreSQL + versiyalı miqrasiyalar, parametrli sorğular (lokal/test üçün PGlite, açıq şəkildə qeyd olunur)
- **Validasiya:** Zod — hər server sərhədində
- **Animasiya:** Motion (`motion` npm, vanilla JS API: `animate()`, `scroll()`, `inView()`, `stagger()`) — BRIEF §7
- **Sürükləmə/toxunma oyunları** (Plastilin yoğur, Gizlənqaç): Pointer Events, build aləti yoxdur

SPA/Next.js qurulmur.

## 2. Qatlar

```
routes/        → yalnız HTTP
services/       → biznes qaydaları (bron, tutum, loyallıq, kod-yoxlama)
repositories/   → yalnız SQL
views/          → Nunjucks şablonları + paylaşılan partiallar
public/         → statik CSS/JS/şrift/SVG
```

Bron/tutum qaydaları `services/booking.js`-də yaşayır, HTTP-dən asılı olmadan test edilir (BRIEF-in "son yer üçün yalnız bir bron" tələbi — əvvəlki sessiyada bu artıq tətbiq olunmuşdu, Mərhələ 3-də testlərlə **yenidən qurulacaq**, köhnə kod `git log`-da yoxdur, sıfırdan yazılacaq).

## 3. Dillər

`/az` (default), `/ru`, `/en`. Hər dil üçün ayrı dictionary, `hreflang`, bir Nunjucks şablonu + dictionary dəyişəni (təkrar yoxdur).

## 4. Səhifələr (12 ictimai + admin)

Hər biri `design/*.dc.html`-dən, tam komponent siyahısı `docs/PAGES.md`-də:

| # | Yol | Fayl | Şəhərdə yeri |
|---|---|---|---|
| 1 | `/` | Ana səhifə | Şəhər meydanı |
| 2 | `/m/<slug>` | Masterklass detalı | Evin içi |
| 3 | `/kassa` (seans ID ilə) | Qeydiyyat | Bilet kassası |
| 4 | `/teqvim` | Təqvim | Avtobus dayanacağı |
| 5 | `/oyun-parki` | Oyun parkı (hub) | Oyun parkı |
| 6 | `/oyun-parki/yogur` | Plastilin yoğur | Oyun parkının içi |
| 7 | `/oyun-parki/rengleme` | Rəngləmə (yeni) | — |
| 8 | (bütün səhifələrdə) | Gizlənqaç (yeni) | — |
| 9 | `/kampaniyalar` | Kampaniyalar | Bazar meydanı |
| 10 | `/ad-gunu` | Ad günü | Bayram meydanı |
| 11 | `/qalereya` | Qalereya | Şəhər muzeyi |
| 13 | `/suallar` | Valideyn sualları | Məlumat bürosu |
| 14 | `/elaqe` | Əlaqə | Şəhər poçtu |
| — | `/mexfilik`, `/sertler` | Statik | — |
| — | `/404`, `/500` | Xəta səhifələri | — |

`sitemap.xml`, `robots.txt`, `Event`/`LocalBusiness` JSON-LD (masterklass/seans səhifələrində).

**Admin** (`/admin`, autentifikasiya arxasında, `X-Robots-Tag: noindex`, `owner`/`staff` rolları — Mərhələ 5-də tətbiq olundu):
- Giriş (argon2id, DB-dəstəkli sessiya, HttpOnly/SameSite cookie, CSRF hər formda, login rate-limit), çıxış, dashboard
- Masterklass CRUD (yarat/redaktə/dərc et-gizlət) + seans CRUD (tutum/qiymət/erkən-quş/ünvan, ləğv et) — `src/routes/admin.js`, `src/repositories/admin.js`
- Bronlar: axtarış+status filtri, status dəyişikliyi (ləğv etmə mövcud `cancelBooking` servisini çağırır — yer azad olur, gözləmə siyahısı avtomatik köçürülür), daxili qeyd
- Müştərilər: siyahı/axtarış, detal, daxili qeyd, **anonimləşdirmə** (owner-yalnız, ad/telefonu silir, bron tarixçəsini saxlayır — BRIEF məxfilik tələbi)
- Sorğular (Əlaqə/Ad günü): filtrlə, status dəyişdir
- **Qalereya**: foto yüklə (`multer`, yaddaşda emal) → `sharp` ilə avtomatik WebP-ə çevrilir, maks. 1600px enə kiçildilir, EXIF/GPS **tam atılır** (BRIEF tələbi), fayl adı həmişə təsadüfi UUID. İstənilən adi giriş formatı qəbul olunur (JPEG/PNG/WebP/GIF/HEIC-iPhone/AVIF — sharp bunların hamısını oxuya bilir). Yükləndikdən sonra gizli qalır, `consent` bayrağı **məcburidir** (yoxdursa heç saxlanmır) — nəzərdən keçirib ayrıca "Dərc et". Silinəndə həm DB sətri, həm fayl diskdən silinir. `src/lib/imageUpload.js`, `src/views/admin/gallery.njk`. İctimai tərəfdə (`home.njk`, `qalereya.njk`, lightbox) əvvəlcə həmişə `[FOTO]` yer tutucusu göstərilirdi hətta real foto olanda belə — bu, düzəldildi, real `<img>` göstərilir.
- CSV ixrac (bronlar, UTF-8 BOM, owner-yalnız)
- İstifadəçi/rol idarəsi (owner yaradır, owner/staff), Audit jurnalı (owner-yalnız) — hər həssas əməliyyat (giriş/çıxış, dərc/gizlət, status dəyişikliyi, ixrac, anonimləşdirmə, istifadəçi yaratma, foto yükləmə/silmə) qeyd olunur

**Hələ tətbiq olunmayıb** (gələcək iş, bloklamır): ev (`houses`) CRUD, FAQ CRUD, endirim/referral kod idarəsi admin UI-dan — bunlar hələlik yalnız birbaşa DB/seed vasitəsilə dəyişdirilə bilər. Təlimçilər (instructors) funksiyası istifadəçi tələbi ilə ictimai saytdan tamamilə silindi (bax commit tarixçəsi), uyğun admin bölməsi də planlaşdırılmır.

## 5. Data modeli

**Baza (skill minimum):** `admin_users`, `customers` (unikal normallaşdırılmış telefon), `children`, `masterclasses`, `sessions` (starts_at, capacity, price, status, early_bird_price, early_bird_slots), `bookings` (session, customer, seats, status, reference, idempotency key), `booking_children`, `consents`, `audit_log`, `settings`.

**Bu layihəyə məxsus əlavələr** (`docs/PAGES.md`-dən):

| Cədvəl | Təyinat |
|---|---|
| `houses` | Ev/kateqoriya (ad, rəng, ikon) — `masterclasses.house_id` ilə əlaqəli |
| `loyalty_stamps` | Müştəri → möhür sayı (hər `attended`/`confirmed` bron +1), 5-də 1 pulsuz kupon yaradılır |
| `discount_codes` | Referral + erkən-quş + Gizlənqaç mükafatı ortaq infrastruktur: `code`, `type` (`referral`/`hide-seek`/`manual`), `owner_customer_id`, `percent`, `status`, `expires_at`, `redeemed_by` |
| `birthday_inquiries` | `inquiries`-in genişlənməsi: `package`, `guest_count`, `date`, `phone`, `status` |
| `gallery_photos` | `url`, `house_id`, `child_label` (ixtiyari, tam ad yox), `consent` (məcburi `true` olmalı ictimai görünmə üçün) |
| `instructors` | `name`, `photo`, `house_id`, `bio`, `experience`, `this_month_programs` |
| `instructor_applications` | Müraciət forması (ad, telefon, CV-link/mesaj) |
| `faq_items` | `tab`, `question`, `answer`, `order` |

**Qaydalar (baza skill-dən miras):**
- Telefon → E.164, server-side
- Timestamp UTC, `Asia/Baku`-da göstərilir, `DD.MM.YYYY`
- Bron statusları: `pending`, `confirmed`, `attended`, `cancelled`, `waitlist`
- Son yer: tranzaksiya daxilində atomik `UPDATE ... WHERE booked+n<=capacity`, idempotency key + unique constraint

## 6. Ödəniş və təsdiq (Phase 0 qərarları)

- **Ödəniş:** məkanda (pay-at-venue), onlayn inteqrasiya yoxdur. `sessions.price`/`bookings` sxemi gələcəkdə onlayn ödəniş üçün genişlənə bilən saxlanılır.
- **Təsdiq/xatırlatma:** yalnız **WhatsApp** (`wa.me/<nömrə>?text=...` prefilled link) — real SMS provayderi/OTP **yoxdur**. Usta pasportu (loyallıq) girişi real OTP əvəzinə sadə telefon+son-bron-kodu yoxlaması ilə işləyir (Mərhələ 3-də dəqiq axın yazılacaq, bu, tam autentifikasiya əvəzi deyil — aşağı-stake funksiya, güman: valideyn öz bron referansını bilir).

## 7. Oyunlar (texniki qeyd)

- **Yaddaş oyunu, Plastilin yoğur** — maketdə tam işlək, client-only, server state lazım deyil
- **Rəngləmə** (yeni) — SVG/`<canvas>`, client-only, PNG export (`canvas.toDataURL`), **data saxlanmır**
- **Gizlənqaç** (yeni) — 5 səhifədə gizli ulduz, `localStorage` progress, 5/5-də server endpoint (`POST /api/gizlenqach/mukafat`) telefon qəbul edib `discount_codes`-a `type=hide-seek` yazır, rate-limitli

## 8. Təhlükəsizlik bazası

**Admin panel üçün tətbiq olundu (Mərhələ 5):** argon2id parol hash, server-side sessiya (DB-də, 12 saat TTL), HttpOnly + SameSite=Lax + (production-da) Secure cookie, hər state-dəyişdirən formda CSRF tokeni, giriş üçün IP+email əsaslı rate-limit, rol-əsaslı icazə (`owner`/`staff`, server-side yoxlanılır, UI-da gizlətmə kifayət deyil), `X-Robots-Tag: noindex`, bütün həssas əməliyyatlar `audit_log`-a yazılır. Test: `tests/admin.test.js` (sessiyasız/səhv-parol/CSRF/rol yoxlamaları, CSV BOM).

Qalereya upload (EXIF/GPS təmizlənməsi daxil) Mərhələ 5-də tətbiq olundu (bax §4). Honeypot (`website` gizli sahə, server-side yoxlanılır `src/routes/public.js`-də), parametrli SQL, auto-escape, CSP, Helmet layihənin əvvəlindən mövcuddur.

**Qeyd (hosting seçərkən diqqət):** yüklənən fotolar `src/public/uploads/gallery/` qovluğunda yerli diskdə saxlanılır. Əgər hosting provayderi **ephemeral disk** istifadə edirsə (məs. Render-in pulsuz planı), server yenidən başlayanda bu qovluq **silinə bilər** — yüklənmiş fotolar itər (DB sətirləri qalar, amma fayl tapılmaz). Production-a keçməzdən əvvəl ya daimi disk (persistent volume) seçilməli, ya da S3-uyğun obyekt saxlama inteqrasiyası əlavə olunmalıdır. Hələlik development/kiçik miqyas üçün kifayətdir.

## 9. Hosting

Açıq sual (istifadəçi: Mərhələ 7-yə qədər gözlənilə bilər). Namizədlər: Render/Railway (Postgres, ephemeral-disk riski olmadan).

## 10. Açıq suallar (bloklamır)

Tam, yenilənən siyahı: `docs/CONTENT-TODO.md`. Qısa xülasə:
- ✅ Brend adı ("Masterklass Azerbaijan"), ünvan, telefon/WhatsApp — təsdiqləndi (2026-10-09)
- ❌ İş saatları hələ gözlənilir
- ❌ Qiymətlər, say həddləri, bəzi qayda mətnləri (ləğv qaydası, saxlama müddəti) hələ `SAMPLE`/placeholder
- Loqo/brend rəngləri (maketin rəngləri ilə davam edilir)
- Hosting büdcəsi/seçimi
