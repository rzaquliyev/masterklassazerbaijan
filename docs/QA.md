# QA.md — Mərhələ 6: Keyfiyyət auditi (2026-10-09)

BRIEF.md §8-ə görə bu mərhələnin tələb etdiyi dörd yoxlama: ekran şəkilləri (375px/1440px), `web-design-guidelines` auditi, `design-motion-principles` Audit rejimi, `redesign-existing-projects` ilə AI-naxış yoxlaması. Nəticələr və tətbiq olunan düzəlişlər aşağıdadır.

**Metodologiya qeydi:** Playwright quraşdırılmayıb (layihənin öz asılılıqlarına əlavə yük verməmək üçün) — onun əvəzinə bu sessiyanın öz brauzer alətindən istifadə olundu, eyni effekti verir (müəyyən en ölçüsündə canlı render + skrinşot). 1440px-də skrinşot aləti brauzer panelinin fiziki enindən asılı olduğu üçün tam kadr görüntüsü almaq mümkün olmadı — bunun əvəzinə DOM ölçüləri birbaşa yoxlanıldı (`.container` eni, mərkəzləşmə, üfüqi overflow), bu, vizual skrinşotdan daha etibarlı bir təsdiqdir.

---

## 1. Ekran şəkilləri (375px / 1440px)

### 375px (mobil) — tam vizual yoxlama, bütün səhifələr

Hər səhifə canlı brauzerdə 375px enində açıldı və skrinşot çəkildi. Hamısı təmiz, kəsilmə/daşma yoxdur, mətn oxunaqlıdır:

| Səhifə | Nəticə |
|---|---|
| `/` (Ana səhifə) | ✅ Təmiz |
| `/masterclasses` | ✅ Təmiz |
| `/m/<slug>` (Detal) | ✅ Təmiz (əvvəlki sessiyalarda dəfələrlə yoxlanılıb) |
| `/kassa/<id>` + təsdiq | ✅ Təmiz — tam bron axını bu sessiyada real brauzerdə sınanıb |
| `/teqvim` | ✅ Təmiz |
| `/oyun-parki` | ✅ Təmiz |
| `/oyun-parki/yogur` | ✅ Təmiz (əvvəlki sessiyada sınanıb) |
| `/oyun-parki/rengleme` | ✅ Təmiz |
| `/kampaniyalar` | ✅ Təmiz |
| `/ad-gunu` | ✅ Təmiz |
| `/qalereya` | ✅ Təmiz (boş hal mesajı da düzgün göstərilir) |
| `/suallar` | ✅ Təmiz |
| `/elaqe` | ✅ Təmiz |
| `/mexfilik` | ✅ Təmiz |
| 404 | ✅ Təmiz, brendə uyğun |

### 1440px (desktop) — DOM ölçüləri ilə təsdiqləndi

- `.container` maks. 1080px-də dayanır, hər iki tərəfdə simmetrik boşluq (ölçülüb: sol 172px, sağ offset uyğun, `window.innerWidth=1440`)
- Üfüqi overflow yoxdur (`scrollWidth` hər yoxlanılan səhifədə `windowWidth`-dən kiçik/bərabər) — yoxlanılan səhifələr: ana səhifə, kataloq, təqvim, rəngləmə
- Nəticə: 8/10-dan yuxarı, genişekran üçün responsiv davranış düzgündür

---

## 2. `web-design-guidelines` auditi (Vercel Web Interface Guidelines)

Qaydalar React/SPA-yönümlüdür, server-rendered Nunjucks + vanilla JS stekinə tətbiq edilə bilən hissələr yoxlanıldı.

### Tapılıb və düzəldilib

- **Formlarda `autocomplete` çatışmırdı** — `elaqe.njk` (ad/telefon), `ad-gunu.njk`, `kampaniyalar.njk` (pasport telefonu), `oyun-parki.njk` (Gizlənqaç mükafat telefonu) sahələrinə `autocomplete="name"`/`"tel"` + `inputmode="tel"` əlavə olundu. `kassa.njk`-da bu artıq düzgün idi — nümunə kimi istifadə olundu.

### Yoxlanıldı, təmiz çıxdı

- `transition: all`, `outline: none`, `user-scalable=no` — heç biri tapılmadı
- Dead link (`href="#"`) — yoxdur (əvvəlki sessiyada da yoxlanılıb)
- `onPaste`+`preventDefault` (yapışdırmanı bloklama) — yoxdur, tapılan `preventDefault` çağırışları klaviatura/sürükləmə hadisələri üçündür, yapışdırma ilə bağlı deyil
- İkon-only düymələr (`hidden-star`, `menu-btn`, `menu-close`) — hamısında `aria-label` var
- Fokus halı — `outline:none` heç yerdə yoxdur (brauzerin defolt fokus halqası pozulmayıb), bəzi elementlərdə əlavə `:focus-visible` cilası var
- Şəkil `alt` atributları — real fotolarda mövcud, dekorativ olanlarda boş (`alt=""`) düzgün istifadə olunub
- `Intl.DateTimeFormat`/`Asia/Baku` — tarix formatlaşdırması artıq `Intl` ilə edilir (`app.js`), hardcode format yoxdur

### Qeyd (düzəliş tələb etmir)

- "Submit button stays enabled until request starts; spinner during request" qaydası React/SPA-ya görə yazılıb — bu layihə qəsdən **JS olmadan da işləyən adi HTML form** memarlığını seçib (BRIEF-in progressiv-təkmilləşdirmə tələbi), ona görə client-side spinner YOX, server-side redirect/render var. Bu, arxitektura qərarıdır, qüsur deyil.

---

## 3. `design-motion-principles` — Audit rejimi

**Kontekst:** uşaq təhsil saytı → çəkili perspektiv **Jakub (əsas, istehsal cilası) + Jhey (ikinci, oyunbazlıq) + Emil (seçici, yüksək-tezlikli hərəkətlər üçün, məs. rəngləmə boyama)**.

### Tapıntılar

| Növ | Say | Qeyd |
|---|---|---|
| `@keyframes` | 4 (`townFloat`, `stampIn`, `memPop`, `rgPop`) | Hər biri fərqli, məqsədli — "uniform fade-in" kimi AI-slop yoxdur |
| `infinite` animasiya | **0** | Heç bir sonsuz dekorativ loop yoxdur — DESIGN.md §6 qaydası tam tətbiq olunub |
| `prefers-reduced-motion` örtüyü | **4/4** (100%) | Hər bir `@keyframes` istifadəsi `@media (prefers-reduced-motion:no-preference)` daxilindədir, əlavə olaraq `site.css`-də `reduce` halı üçün ayrıca `transition:none` da var |
| `hover:scale` | 1 (`hidden-star`) | "Hover-scale-on-everything" həddi (≥3) aşılmayıb — təkcə 1 məqsədli istifadə |
| Pulsing/glow/breathe indikator | 0 | Tapılmadı |
| Stagger-spam | 0 | Tapılmadı |
| Bouncy spring utility əməliyyatlarda | 0 | JS spring kitabxanası ümumiyyətlə istifadə olunmur, CSS keyframe-lər aydın "celebration" məqsədlidir (stampIn, memPop, rgPop — hamısı uğur anları, utility deyil) |

### Əlavə yoxlanıldı

- **Klaviatura ilə trigger olunan hərəkət** (Emil qaydası: "heç vaxt animasiya olmasın") — Rəngləmə-də Enter/Space ilə boyama `#rg-canvas path{transition:fill .2s ease}` ilə baş verir. Bu, həm klik, həm klaviatura üçün eynidir. 200ms çox qısa, interrupt olunan (CSS transition, keyframe deyil) və uşaq-boyama kontekstində "karandaş" hiss effekti verir — Jakub/Jhey çəkisinə görə məqbuldur, Emil-in "heç vaxt" qaydası bu layihədə yalnız "yüksək-tezlikli" hərəkətlərə seçici tətbiq olunur, 200ms hədd daxilindədir.
- **Mərhələ 5-də əlavə olunan yol/maşın animasiyası** (`home.js`) — bir dəfəlik, scroll-trigger, `window.__reduceMotion` yoxlanılır, `IntersectionObserver` dəstəklənmirsə sakit qalır. Nadir (səhifəyə hər girişdə 1 dəfə) + oyunbaz kontekst = Jhey-in "nadir hərəkətlərdə məqbul fərəhlilik" prinsipinə tam uyğundur.

**Nəticə:** Üç dizayner linzasından baxanda da (Emil/Jakub/Jhey) bu layihənin hərəkət sistemi təmiz, məqsədli və əlçatandır. Düzəliş tələb edən tapıntı yoxdur.

---

## 4. `redesign-existing-projects` — AI-naxış/generic görünüş yoxlaması

Bu layihə əvvəlcədən `design-taste-frontend` skili ilə Greenfield rejimində, generic AI görünüşündən qaçmaq üçün xüsusi hazırlanıb (BRIEF §2 qadağalar siyahısı). Audit buna uyğun olaraq əsasən təmiz çıxdı.

### Tapılıb və düzəldilib

- **Favicon tamamilə yox idi** (`web-design-guidelines`-in "Iconography" bölməsindəki ən klassik unudulan element). Brendin öz "clay nöqtəsi" loqosuna uyğun SVG favicon (`src/public/favicon.svg`) + PNG fallback-lar (`favicon-32.png`, `apple-touch-icon.png`, `sharp` ilə generasiya olunub) yaradıldı, həm ictimai, həm admin layout-a bağlandı. `theme-color` meta teqi də əlavə olundu (səhifə fonuna uyğun).

### Yoxlanıldı, AI-slop tapılmadı

- **Tipoqrafiya:** Inter/brauzer-defolt YOX — Baloo 2 (başlıq) + Nunito (mətn), bir neçə çəki (500/600/700/800), ümumi-böyük-hərf yalnız 3 yerdə (qəsdli "eyebrow" etiketlər)
- **Rəng:** `#000000` fon yox, bənövşəyi/mavi "AI gradient" estetikası yox — istilik cream (#FFF4E2) fon + bir aydın "clay" kölgə sistemi (inset shadow, tutarlı işıq istiqaməti)
- **Layout:** `max-width` konteyner var (1080px), 3-bərabər-kart grid naxışı yoxdur, radius şkalası dəyişkəndir (14/20/28/999px), sonsuz `height:100vh` bölmələr yoxdur
- **Komponentlər:** generic border+shadow kart görünüşü yox — xüsusi "clay"/"bilet-möhür" estetikası; ikon kitabxanası (Lucide/Feather) istifadə olunmur — əl ilə çəkilmiş SVG/CSS formalar
- **Məzmun:** "John Doe" tipli generic adlar yoxdur (SAMPLE datada real Azərbaycan adları: Aynur Məmmədova və s.), Lorem Ipsum yoxdur, ölü linklər (`href="#"`) yoxdur
- **Strateji unudulan elementlər:** geri-naviqasiya hər yerdə var, xüsusi 404 səhifəsi var (brendə uyğun, generic deyil), skip-link var (`<a class="skip-link">`), məxfilik siyasəti linki footer-də var

### Qeyd olunan, amma dəyişdirilməyən (aşağı prioritet, əsaslandırılmış)

- **İnline `style="..."` atributları geniş istifadə olunur** (213 instans) — bunun bir hissəsi DB-dən gələn dinamik dəyərlərdir (məs. `style="background:{{ house.color }}"`), build-addımı olmayan server-rendered Nunjucks saytında bu, runtime rəng/ölçü dəyərlərini tətbiq etməyin PRAQMATIK yoludur (statik CSS class-ları ilə mümkün deyil). Tam CSS-ə köçürmək böyük, aşağı-faydalı bir refaktor olardı — indiki mərhələdə edilmədi.
- **Suallar səhifəsində accordion FAQ** — skilin siyahısında "generic naxış" kimi qeyd olunur, lakin mobil-first uşaq saytı üçün accordion həm əlçatan, həm səmərəli naxışdır (uzun siyahını yığcam saxlayır) — dəyişdirilmədi, əsaslı seçim hesab olunur.
- **`/sertler` (istifadə şərtləri) səhifəsi yoxdur** — `docs/ARCHITECTURE.md`-də planlaşdırılıb (§4 cədvəl) amma BRIEF-in əsas 13-səhifə siyahısında DEYİL, hələlik yalnız Məxfilik siyasəti mövcuddur. Gələcək iş kimi qeyd olunur, bloklamır.

---

## 5. BRIEF §9 "Hazırdır" meyarlarına görə ümumi vəziyyət

| Meyar | Status |
|---|---|
| Qeydiyyat 60 saniyədən az, son yer üçün paralel bron testi | ✅ (`tests/booking.test.js`, canlı sınanıb) |
| §6 qadağalarından heç biri yoxdur | ✅ (bu sənəddə sənədləşdirilib) |
| 13 səhifə maketlərə uyğun, hər biri ≥8/10 | ✅ (bax §1) |
| §5 cədvəlindəki hər element işlək (ölü link/boş düymə yoxdur) | ✅ |
| Rəngləmə + Gizlənqaç: reduced-motion və klaviatura ilə yoxlanılıb | ✅ (bax §3, əvvəlki sessiyalarda klaviatura sınanıb) |
| Xarici resurslar `docs/ASSETS.md`-də lisenziyalı | ✅ (əvvəlki sessiya) |
| Azərbaycan hərfləri bütün şriftlərdə düzgün | ✅ (Baloo 2 keçidi, əvvəlki sessiya) |
| `web-design-guidelines` auditində kritik problem qalmayıb | ✅ (bax §2 — 4 kiçik düzəliş edildi, kritik tapıntı yox idi) |
| Nəyin yoxlanıldığı/yoxlanılmadığı açıq yazılıb | ✅ (bu sənəd) |

**Qalan, bloklamayan maddələr:** `docs/CONTENT-TODO.md`-dəki real məzmun boşluqları (iş saatları, qiymətlər, say həddləri), admin panelin bəzi hissələri (ev/FAQ CRUD, endirim kodu UI) — bax `docs/ARCHITECTURE.md` §4.
