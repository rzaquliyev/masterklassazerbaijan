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
| 12 | `/telimciler` | Təlimçilər | Şəhər sakinləri |
| 13 | `/suallar` | Valideyn sualları | Məlumat bürosu |
| 14 | `/elaqe` | Əlaqə | Şəhər poçtu |
| — | `/mexfilik`, `/sertler` | Statik | — |
| — | `/404`, `/500` | Xəta səhifələri | — |

`sitemap.xml`, `robots.txt`, `Event`/`LocalBusiness` JSON-LD (masterklass/seans səhifələrində).

**Admin** (autentifikasiya arxasında, indekslənmir, tək `owner` rolu — Phase 0 cavabı):
- Giriş, dashboard
- Masterklass/seans/ev idarəetməsi (yarat/redaktə/ləğv/tutum/qiymət, erkən-quş qaydası)
- Bronlar (axtarış, status, qeyd, gözləmə siyahısından köçürmə)
- Müştərilər (valideyn+uşaq, tarixçə, loyallıq möhür sayı)
- Ad günü sorğuları
- Qalereya (yüklə, **razılıq bayrağı** məcburi sahə)
- Təlimçilər (CRUD) + müraciətlər siyahısı
- Suallar (CRUD, tab-görə qruplaşdırma)
- Əlaqə mesajları
- Endirim/referral kodları (yarat/ləğv et, qayda parametrləri: faiz, müddət)
- CSV ixrac (UTF-8 BOM)
- Audit jurnalı

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

## 8. Təhlükəsizlik bazası (icra Mərhələ 5-6, qaydalar indidən qeyd olunur)

argon2id/bcrypt, HttpOnly+Secure+SameSite cookie, CSRF, login/form rate-limit + honeypot (Əlaqə forması xüsusilə), parametrli SQL, auto-escape template, CSP, Helmet başlıqları, qalereya foto upload EXIF/GPS təmizlənməsi, minimal data toplama (uşaq tam adı yox, ixtiyari label), silinmə/anonimləşdirmə skripti. Tam siyahı: skilin "Security baseline" bölməsi.

## 9. Hosting

Açıq sual (istifadəçi: Mərhələ 7-yə qədər gözlənilə bilər). Namizədlər: Render/Railway (Postgres, ephemeral-disk riski olmadan).

## 10. Açıq suallar (bloklamır, Phase 0 mesajında soruşulub, cavab gözlənilir)

- Dəqiq brend adı və domen (`[Studio adı]` placeholder davam edir)
- Ünvan/rayon, WhatsApp nömrəsi, Instagram hesabı (SAMPLE davam edir)
- Loqo/brend rəngləri (maketin rəngləri ilə davam edilir)
- Hosting büdcəsi/seçimi
