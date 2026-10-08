# BRIEF — Uşaqlar üçün masterklass saytı (sıfırdan)

> Bu faylı yeni layihə qovluğunun kökünə `BRIEF.md` adı ilə qoy. Claude Code, bu sənəd layihənin əsas tapşırığıdır. Hər mərhələdən əvvəl yenidən oxu.

---

## 0. Əsas məqsəd (bir cümlə)

Bakıda uşaq masterklassları keçirən studiya üçün **"AI hazırlayıb" deyə bilinməyən**, uşaqların "mən də gedim!" deyəcəyi, valideynlərin isə 1 dəqiqəyə telefonla qeydiyyatdan keçəcəyi, çoxsəhifəli, real backend-li sayt.

Instagram: `@masterklassazerbaijan` (brend, rəng və məzmun tonu üçün əsas mənbə — bax §3).

---

## 1. Hansı skillər, hansı ardıcıllıqla

İşə başlamazdan əvvəl `~/.claude/skills/` qovluğunda bu skillərin olduğunu yoxla və hər birinin `SKILL.md`-sini oxu. Biri yoxdursa, dayan və mənə de.

| Skill | Rolu bu layihədə |
|---|---|
| `kids-masterclass-website` | **Əsas mühəndislik standartı**: arxitektura, səhifələr, data modeli, bron/yer sayı qaydaları, təhlükəsizlik, admin panel. Onun bütün qaydaları qüvvədədir. |
| `design-taste-frontend` | Dizayn istiqaməti, "design read", dial-lar, anti-slop qaydaları. Rejim: **Greenfield**. |
| `awesome-design-md` | Yalnız struktur ilhamı üçün referans. Layihənin **öz** `DESIGN.md`-sini yazmaq üçün. |
| `design-motion-principles` | Bütün animasiyalar: Create rejimi qurarkən, Audit rejimi sonda. Uşaq məhsulu olduğu üçün Jhey Tompkins (oynaq) yanaşması əsas, Jakub Krehel (cilalı) ikinci. |
| `ui-ux-pro-max` | **UX yoxlama siyahısı və axtarış bazası**: toxunma sahələri, formalar, naviqasiya, əlçatanlıq qaydaları; rəng və şrift axtarışı. **Diqqət:** onun avtomatik "design system" tövsiyəsi uşaq studiyası üçün generic nəticə verir (mavi + çəhrayı, Claymorphism, "Contact Sales" CTA, Comic Neue). Bu tövsiyəni **istifadə etmə**; vizual istiqaməti bu BRIEF və `design-taste-frontend` müəyyən edir. Ondan yalnız UX qaydaları və `--domain` axtarışları üçün istifadə et. |
| `redesign-existing-projects` | Yalnız sonda **"generic AI naxışı" yoxlaması** üçün: hazır saytı bu skillin siyahısı ilə audit et. |
| `web-design-guidelines` | Son keyfiyyət auditi (əlçatanlıq, formalar, fokus, performans). |

Konflikt olarsa prioritet: **təhlükəsizlik və bron düzgünlüyü → əlçatanlıq → bu BRIEF → dizayn skilləri**.

---

## 2. Dizayn: "Plastilin şəhəri" (SEÇİLİB, maketlər hazırdır)

Vizual istiqamət artıq seçilib və 11 səhifənin hamısı maket kimi hazırdır. **Yeni istiqamət təklif etmə, maketləri tətbiq et.**

- Maketlər layihədə `design/` qovluğundadır (`*.dc.html`). Bunlar HTML + şablon sintaksisi (`{{...}}`, `<sc-for>`, `<sc-if>`, `class Component extends DCLogic`) ilə yazılmış **vizual referansdır**, birbaşa kopyalanacaq kod deyil. Rəngləri, ölçüləri, kölgələri, animasiya `@keyframes`-lərini və davranışı oradan götür, öz stack-inə (server-rendered şablonlar + vanilla JS) köçür.
- Konsepsiya: sayt kiçik plastilin şəhəridir, hər səhifə şəhərin bir yeridir:

| Səhifə | Maket faylı | Şəhərdə yeri |
|---|---|---|
| Ana səhifə | `Plastilin.dc.html` | Şəhər meydanı (evlərə toxunub masterklass seçmək, yol xəritəsi, "Şəhəri gəz", menyu) |
| Masterklass detalı | `Detal.dc.html` | Evin içi |
| Qeydiyyat | `Kassa.dc.html` | Bilet kassası |
| Təqvim | `Teqvim.dc.html` | Avtobus dayanacağı (reys tablosu) |
| Oyun parkı | `OyunParki.dc.html` | Oyun parkı |
| Oyun: Plastilin yoğur | `Yogur.dc.html` | Oyun parkının içi |
| Oyun: Rəngləmə guşəsi | `Rengleme.dc.html` | Oyun parkının içi (6 şəkil) |
| Kampaniyalar | `Kampaniyalar.dc.html` | Bazar meydanı |
| Ad günü | `AdGunu.dc.html` | Bayram meydanı |
| Qalereya | `Qalereya.dc.html` | Şəhər muzeyi |
| Təlimçilər | `Telimciler.dc.html` | Şəhər sakinləri |
| Valideyn sualları | `Suallar.dc.html` | Məlumat bürosu |
| Əlaqə | `Elaqe.dc.html` | Şəhər poçtu |

**Dizayn tokenləri (maketlərdən):**
- Rənglər: fon krem `#FFF4E2`, mətn/gecə `#1B2A4A`, əsas narıncı `#E8682A` (kölgəsi `#B44E1D`), yağ sarısı `#FFE08A`, günəş `#FFC23D`, yaşıl `#7BC67E`, mavi `#6FA8DC`, çəhrayı `#F28AA6`, kart kölgəsi `#EAD9BE`, ikinci mətn `#3C4B6B`.
- "Plastilin" effekti (imza): `box-shadow: inset -6px -7px 0 rgba(0,0,0,.16), inset 6px 6px 0 rgba(255,255,255,.35)` + basıla bilən elementlərdə alt sərt kölgə (`0 6px 0 <tünd ton>`). Bunu bir CSS utility kimi çıxar.
- Şriftlər: başlıqlar **Fredoka** (500–700), mətn **Nunito** (500–800), reys tablosu **Space Mono**. Self-host et. ə, ğ, ı, ş, ç, ö, ü hərflərini render edib yoxla, dəstəkləmirsə mənə de.
- Künclər böyük və yumşaq (16–32px), toxunma sahələri ≥ 44px.
- Hər animasiya `prefers-reduced-motion`-da söndürülür və ya statik versiyaya keçir.

Mərhələ 2-də maketlərə əsasən layihənin `DESIGN.md` faylını yaz (tokenlər, komponentlər, hərəkət qaydaları) və təsdiqimi gözlə.

## 3. Brend və məzmun mənbəyi

1. Instagram səhifəsinə (`@masterklassazerbaijan`) giriş login tələb edə bilər. **Səhifəni scrape etməyə cəhd etmə.** Əvəzinə məndən istə:
   - loqo faylı (SVG/PNG), brend rəngləri (varsa),
   - masterklasslardan seçilmiş fotolar (`/assets/raw/` qovluğuna mən qoyacam),
   - 5–10 post mətni (tonu tutmaq üçün).
2. Bu materiallar gələnə qədər **görünən SAMPLE placeholder-lar** istifadə et (boz kağız üzərində "FOTO BURAYA" kimi), heç vaxt stok foto yox.
3. Uşaq üzü olan fotoları yalnız mən təsdiqləsəm istifadə et (valideyn razılığı mənim məsuliyyətimdədir). EXIF/GPS məlumatlarını sil.
4. Qiymət, təlimçi adı, rəy, ünvan, telefon uydurma. Hamısı `SAMPLE` kimi işarələnsin.

### 3.1 Bazar konteksti (araşdırmadan)

- **Ad və domen riski:** "Masterclass Azerbaijan" adı və `masterclass.az` domeni Bakıda artıq başqa, əlaqəsiz bir biznesə (avtomobil mövzulu media səhifəsi, Facebook-da ~146K izləyici) məxsusdur. Google axtarışında qarışıqlıq yarana bilər. Mərhələ 0-da məndən **dəqiq brend adını və domeni** soruş. SEO üçün başlıqlarda və meta mətnlərdə "uşaqlar üçün", "Bakı" və masterklass növü kimi fərqləndirici sözləri mütləq istifadə et.
- **Rəqabət:** Bakıda uşaq masterklassları əsasən Instagram və iticket.az kimi bilet platformalarında satılır (rəsm, gil, robototexnika və s.). Saytın üstünlüyü bunlar olmalıdır: (1) bilet platformasından daha sürətli və şəxsi qeydiyyat, (2) real vaxtda qalan yer, (3) valideyn üçün aydın təhlükəsizlik və "nə gətirməli" məlumatı, (4) uşaq üçün oyun kimi hiss olunan təcrübə.
- **Instagram → sayt əlaqəsi:** trafikin əsas hissəsi Instagram bio linkindən, telefondan gələcək. Ana səhifənin ilk ekranı (375px) dərhal bunu göstərməlidir: ən yaxın masterklass, tarix, qalan yer, "Qeydiyyat" düyməsi. Hər masterklass səhifəsinin Instagram hekayəsində paylaşılan qısa linki olsun (`/m/<slug>`), Open Graph şəkli avtomatik yaradılsın.
- WhatsApp düyməsi qalır, amma əsas axın saytdakı qeydiyyatdır. WhatsApp yalnız sual vermək üçündür.

---

## 4. Başqa saytlardan nə götürmək olar, nə olmaz (VACİB)

İlham üçün öyrənilə biləcək saytlar (Awwwards-da qeyd olunub): **Kidwonder** (intro animasiyası, scroll + mouse interaksiyası, animasiyalı loqo), **Goodkids** (əlaqə forması, 404 səhifəsi), **Agencia Kids** (yükləmə animasiyası), **MEplace Childcare** (rəngli formalar, tipoqrafiya, mətn marquee).

**Olar:**
- Texnikanı, ideyanı, ritmi öyrənmək və **öz kodunla sıfırdan yenidən qurmaq** (məsələn: "SVG xətt özünü çəkir" effekti, marquee, kursor izi). Effekt ideyaları heç kimin mülkiyyəti deyil.
- Açıq lisenziyalı resurslar: Google Fonts / Fontsource (OFL), MIT/Apache lisenziyalı kitabxanalar, CC0 illüstrasiya və ikonlar.
- Mənim öz fotolarım və öz Instagram məzmunum.

**Olmaz:**
- Başqa saytın şəkillərini, illüstrasiyalarını, videolarını, Lottie fayllarını, loqosunu, mətnini və ya JS/CSS kodunu yükləyib kopyalamaq. Bunlar müəllif hüququ ilə qorunur və saytı hüquqi riskə salır.
- Lisenziyası aydın olmayan istənilən resurs.

**Qayda:** istifadə olunan hər xarici resursu `docs/ASSETS.md` faylında qeyd et: ad, mənbə linki, lisenziya, harada istifadə olunur. Lisenziyanı tapa bilmirsənsə, istifadə etmə və mənə de.

İllüstrasiyaları özün **inline SVG** kimi çək (əl ilə çəkilmiş hiss: bir az qeyri-düzgün xətlər, `stroke-linecap: round`, yüngül `feTurbulence` kağız teksturası). Bu, saytı unikal edən əsas şeydir.

---

## 5. Maketdən işləyən sayta: HEÇ BİR ÖLÜ ELEMENT QALMAMALIDIR

Maketlərdə bəzi elementlər yalnız görünüşdür: düymə heç yerə aparmır, forma göndərilmir, rəqəmlər nümunədir, bəzi oyunlar hələ yoxdur. **Real saytda hər görünən interaktiv element işləməlidir.** Qayda: `href="#"`, boş `onClick`, göndərilməyən forma, sabit (hardcode) nümunə rəqəm qalmamalıdır. Hər birini `docs/QA.md`-də bir-bir yoxla.

**Bütün səhifələr:** loqo ana səhifəyə; "← Şəhərə" ana səhifəyə; menyu (≡) bütün səhifələrə; WhatsApp `https://wa.me/<nömrə>`; telefon `tel:`; Instagram profilə; məxfilik siyasəti səhifəsi mövcud olsun.

| Səhifə | İşləməli olan (maketdə nümunə/boş olan) |
|---|---|
| Ana səhifə | Ev seçimi və panel real masterklass datasından; qalan yer DB-dən; "Yer tut" seçilmiş masterklassın detalına; "Şəhəri gəz" plitələri və menyu linkləri; qalereya önizləmə real fotolardan |
| Masterklass detalı | Seanslar DB-dən; dolu seans seçilmir; qalan yer real; "Kassaya →" seçilmiş seansla qeydiyyata; qonşu ev linkləri; təlimçi admin-dən |
| Qeydiyyat | Real bron: validasiya (ad, yaş, +994 telefon), razılıq qutusu məcburi, **son yer üçün yarışda yalnız bir bron keçir** (tranzaksiya/lock), unikal bilet nömrəsi, SMS/WhatsApp təsdiqi, "Təqvimə əlavə et" `.ics` faylı, pasporta möhür real bronla bağlı |
| Təqvim | Reyslər DB-dən; yaş və gün filtrləri real data üzərində; boş gün mesajı; **gözləmə siyahısı forması işləyir** (yer açılanda bildiriş) |
| Oyun parkı | Yaddaş oyunu (maketdə işləyir, port et); **Plastilin yoğur** (`Yogur.dc.html`, işləyir, port et: pointer events, `touch-action: none`); **Rəngləmə** (`Rengleme.dc.html`, işləyir, port et: 6 orijinal şəkil — Plastilin şəhəri, Kosmos, Dəniz altı, Buta naxışı, Bakı gecəsi, Dost dinozavr; hər hissə ayrıca `<path>`, 14 rəngli palitra + pozan, geri al, nümunə, təmizlə, irəliləyiş sayğacı; real saytda "Şəkli yüklə" PNG versiyası ver; yeni şəkilləri admin-dən əlavə etmək imkanı arzuolunandır); **Gizlənqaç** (maketdə YOXDUR — qur: saytın 5 səhifəsində gizli ulduz, tapılanlar `localStorage`-da, başlıqdakı "★ N / 5" sayğacı real, 5/5-də valideyn telefonu ilə kod alma) |
| Kampaniyalar | Usta pasportu real bronlardan hesablanır (valideyn telefonu ilə giriş/OTP); "Dostunu gətir" kodu hər valideyn üçün unikal yaradılır, "Kopyala" düyməsi həqiqətən `navigator.clipboard` ilə kopyalayır; erkən quş qiyməti avtomatik tətbiq olunur; bütün kod qaydaları serverdə yoxlanır (bir telefon = bir kod, müddət) |
| Ad günü | Şam üfürmə (işləyir, port et); paket seçimi, qonaq sayğacı, tarix, telefon → **admin-ə sorğu** + təsdiq mesajı |
| Qalereya | Fotolar admin paneldən yüklənir, **hər fotoda valideyn razılığı bayrağı**; filtrlər və lightbox (klaviatura: Esc, ← →) |
| Təlimçilər | Admin-dən idarə; kart çevrilməsi; "Müraciət et" forması işləyir |
| Valideyn sualları | Suallar admin-dən idarə olunur; akkordeon `aria-expanded` ilə |
| Əlaqə | Forma backend-ə göndərilir (rate limit, spam qoruması); "Xəritədə aç" real Google Maps linki; ünvan və saatlar admin-dən |

**Admin paneldə idarə olunmalı:** masterklasslar və seanslar, qiymətlər (erkən quş daxil), bronlar və gözləmə siyahısı, pasport möhürləri, endirim/dost kodları, ad günü sorğuları, qalereya (razılıq bayrağı ilə), təlimçilər, suallar, əlaqə mesajları.

**Məzmun boşluqları:** maketlərdəki bütün `[...]` yerlərini (`[QİYMƏT]`, `[Ünvan]`, ləğv qaydası, qrup ölçüsü və s.) `docs/CONTENT-TODO.md` siyahısına yaz və məndən soruş. Uydurma.

**Uşaq məlumatı:** oyunlar qeydiyyatsız işləyir, uşaqdan məlumat toplanmır; kodlar və pasport valideynin telefonuna bağlıdır. Şans oyunu (çarx və s.) yoxdur.

## 6. Qadağalar — "AI şablonu" əlamətləri

Bunlardan heç biri olmamalıdır. Sonda `redesign-existing-projects` skillinin siyahısı ilə bir-bir yoxla:

- bənövşəyi/çəhrayı qradiyent fon, qaranlıq mesh üzərində mərkəzləşdirilmiş hero
- eyni ölçülü 3 "feature" kartı yan-yana
- emoji-ləri ikon kimi istifadə etmək
- hər yerdə glassmorphism, hər elementdə sonsuz dövr edən mikroanimasiya
- Inter + slate-900 standart cütlüyü
- stok fotolar, uydurma rəylər, "10 000+ xoşbəxt uşaq" kimi uydurma rəqəmlər
- generic mətnlər: "Uşağınızın potensialını kəşf edin", "Yaradıcılıq dünyasına xoş gəlmisiniz"
- hər bölmədə eyni "sol mətn / sağ şəkil" düzülüşü

**Mətn tonu:** qısa, isti, konkret. "Şənbə 11:00. 6–9 yaş. Gil boşqab düzəldirik, evə özünüz aparırsınız." Mətnlər Azərbaycan dilində, uşaqla danışanda sadə, valideynlə danışanda dəqiq.

---

## 7. Texniki çərçivə

- **Stack:** `kids-masterclass-website` skillinin default stack-i (Node.js LTS, Express/Fastify, server-rendered şablonlar, PostgreSQL, Zod). Səbəbsiz SPA və ya Next.js qurma.
- **Animasiya alətləri:** əsas kitabxana **Motion** (`motion` npm paketi, MIT lisenziyası, Framer Motion-un müəllifləri). Bu layihə React deyil, server-rendered olduğu üçün Framer Motion-un React versiyasını (`motion/react`) **yox**, vanilla JS API-ni istifadə et: `animate()` (spring fizikası, stiker "yaylanması", düymə "squish"), `scroll()` (scroll ilə bağlı karandaş xətti, parallaks), `inView()` (bölmələrin görünmə anı), `stagger()` (kartların ardıcıl gəlişi). Sadə keçidlər üçün CSS kifayətdir. Motion modullarını yalnız lazım olan səhifələrdə yüklə. Sürükləmə üçün Pointer Events ilə öz kiçik modulunu yaz. Hər kitabxananı lisenziyası ilə `docs/ASSETS.md`-yə yaz.
- **JS büdcəsi:** skilldəki ~60 KB gzip hədəfi qalır. Ana səhifədə animasiyalar üçün maksimum ~90 KB-a icazə var, amma əsaslandır və ölç.
- **Şriftlər:** self-host. Seçilən hər şrift **ə, ı, ğ, ş, ç, ö, ü** hərflərini dəstəkləməlidir. Hər namizədi render edib yoxla, dəstəkləmirsə istifadə etmə. Bir display şrift (xarakterli), bir oxunaqlı mətn şrifti, istəsən vurğular üçün əl yazısı şrifti.
- **Mobil:** 375px-dən başla. Toxunma sahələri ≥ 44px. Qeydiyyat axını telefonda 60 saniyədən az.
- **Əlçatanlıq:** dekorativ animasiyalar `aria-hidden`, `prefers-reduced-motion` hər effektdə, kontrast ≥ 4.5:1 (kağız fonunda xüsusilə yoxla), fokus görünən.
- **Performans:** LCP < 2.5 s, CLS < 0.1. Şəkillər WebP/AVIF, responsive `srcset`, ölçüləri göstərilmiş.

**Köhnə layihə:** əvvəlki sayt silinmir və ona toxunulmur. Yeni layihəni ayrıca qovluqda qur. Köhnə layihədəki işləyən backend məntiqini (bron, yer sayı, müştəri bazası) **oxuyub** yenisinə köçürə bilərsən, amma testlərlə yenidən yoxla.

---

## 8. İş axını (hər mərhələdən sonra DAYAN və hesabat ver)

| # | Mərhələ | Nəticə | Mən nə edirəm |
|---|---|---|---|
| 0 | Skilləri oxu, mənə qısa suallar ver (skilldəki 6 sual + §3 materialları) | suallar | cavab verirəm |
| 1 | `design/` maketlərini öyrən, hər səhifənin komponent və davranış siyahısını çıxar | `docs/PAGES.md` | təsdiqləyirəm |
| 2 | `DESIGN.md` (tokenlər, şriftlər, komponentlər, hərəkət qaydaları, qadağalar) + `docs/ARCHITECTURE.md` | 2 fayl | təsdiqləyirəm |
| 3 | Data modeli, miqrasiyalar, bron servisi + testlər | işləyən backend nüvəsi | — |
| 4 | Dizayn sistemi + 13 səhifə maketlərə uyğun + §5 cədvəlindəki hər element işlək | sayt | baxıram, rəy verirəm |
| 5 | Qeydiyyat axını + admin panel | tam funksionallıq | test edirəm |
| 6 | Keyfiyyət: Playwright ilə 375px və 1440px ekran şəkilləri, `web-design-guidelines` auditi, `design-motion-principles` Audit rejimi, `redesign-existing-projects` ilə AI-naxış yoxlaması | `docs/QA.md` | — |
| 7 | Düzəlişlər, sənədlər, təhvil qeydi | README, DEPLOY | — |

**Kontekst idarəsi:** hər mərhələnin nəticəsini fayla yaz, `git commit` et, sonra mənə `/clear` etməyi təklif et. Söhbətdə qalan qərarlar itə bilər, fayllar itmir. Daimi qaydaları (§6 qadağalar, §4 kopyalama qaydası, Azərbaycan dili / AZN / DD.MM.YYYY) `CLAUDE.md`-yə də yaz.

---

## 9. "Hazırdır" meyarları

Sayt yalnız bunların hamısı ödənəndə hazır sayılır:

- [ ] Qeydiyyat telefonda 60 saniyədən az çəkir, son yer üçün iki eyni anda bron testindən yalnız biri keçir
- [ ] §6-dakı qadağalardan heç biri yoxdur (`docs/QA.md`-də bir-bir qeyd olunub)
- [ ] 13 səhifənin hamısı maketlərə uyğundur, `docs/QA.md`-də hər səhifə ≥ 8/10 bal alıb
- [ ] §5 cədvəlindəki hər element işləyir: saytda `href="#"`, boş düymə, göndərilməyən forma, hardcode nümunə rəqəm yoxdur (grep ilə yoxla)
- [ ] Rəngləmə portu və Gizlənqaç oyunu qurulub və test edilib, hamısı reduced-motion və klaviatura ilə yoxlanılıb
- [ ] Bütün xarici resurslar `docs/ASSETS.md`-də lisenziyası ilə qeyd olunub, başqa saytdan kopyalanmış heç nə yoxdur
- [ ] Azərbaycan hərfləri bütün şriftlərdə düzgün görünür
- [ ] `web-design-guidelines` auditində kritik problem qalmayıb
- [ ] Nəyin yoxlanıldığı və nəyin yoxlanılmadığı açıq yazılıb
