# PAGES.md — maketlərin komponent/davranış siyahısı (Mərhələ 1)

Mənbə: `design/*.dc.html` (12 maket, hamısı oxunub). Format qeydi: maketlər `{{...}}`/`<sc-for>`/`<sc-if>`/`class Component extends DCLogic` sintaksisi ilə — vizual/davranış referansıdır, server-rendered Nunjucks + vanilla JS-ə portlanacaq (BRIEF §2). Hər bölmədə: məqsəd, maketdəki komponentlər, imza animasiyalar, **real olmalı olan data/davranış** (BRIEF §5-ə görə) və bu zaman ortaya çıxan açıq suallar.

Ortaq "plastilin" effekti (bütün səhifələrdə): `box-shadow: inset -Xpx -Ypx 0 rgba(0,0,0,.14-.18), inset Xpx Ypx 0 rgba(255,255,255,.3-.45)` — CSS utility kimi çıxarılacaq (`.clay`), parametrik dərinlik üçün 1-2 variant (kiçik/böyük).

Ortaq chrome (hər səhifədə): loqo → ana səhifə, "← Şəhərə/Geri" → müvafiq valideyn səhifə, menyu (≡) overlay (ana səhifədə qurulub, bütün səhifələrə əlavə olunmalı), fokus halqası (`outline:3px solid #E8682A`), `prefers-reduced-motion`-da bütün `.on` siniflər söndürülür (maketlərdə `motion` prop kimi, real saytda media query).

---

## 1. Ana səhifə — `Plastilin.dc.html` → Şəhər meydanı

**Komponentlər:**
- Nav: loqo (squish-animasiyalı dairə) + menyu düyməsi (overlay: 8 yer siyahısı)
- Hero başlıq + "clay town" interaktiv səhnə: 4 ev (günəş/təpə/ağac dekorları `float`/`sway` ilə), hər ev klikləndə seçilir (`translateY+scale` keçid), seçili evin "chip" rəngi dəyişir
- Seçili ev paneli: ad/vaxt/başlıq/təsvir, **muncuq qabı** (tutum göstəricisi, 10 kürə), qiymət, "Yer tut" → Detal
- "Yol xəritəsi": SVG `offset-path` ilə avtomobilin 4 dayanacaq arasında sürməsi (`@keyframes drive`, `animation-timeline` əvəzinə sadə `infinite` dövr — BRIEF §5 "sonsuz mikroanimasiya olmasın" qadağasına görə **bir dəfəlik scroll-trigger-ə çevrilməlidir**, aşağı bax)
- "Şəhər muzeyi" qalereya-teaser: 4 müxtəlif-formalı "clay frame" kart
- "Şəhəri gəz": 8 yerin hamısına grid kartları
- Etibar lövhəsi: 3 trust-badge (təhlükəsiz material, kiçik qrup, asan ləğv)
- Footer CTA + WhatsApp + ünvan

**İmza animasiyalar:** `float` (bulud/günəş), `sway` (ağac), `squish` (loqo/düymə basımı), `drive` (avtobus/maşın yolu) — hazırkı mockup-da **sonsuz dövr** edir, bu BRIEF §6 qadağasını pozur. Real saytda: `drive` yalnız bölmə görünəndə bir dəfə işləməli (`IntersectionObserver`/Motion `inView()`), `float`/`sway` kiçik dekorlarda **yalnız 2-3 dövr** edib dayanmalı və ya tamamilə `hover`-ə bağlanmalıdır (dizayn qərarı Mərhələ 2-də `design-motion-principles` Audit rejimi ilə yenidən yoxlanacaq).

**Real olmalıdır (BRIEF §5):**
- Ev seçimi real masterklass+ev datasından (hazırda 4 hardcode `data[]`)
- Qalan yer DB-dən (`sessions.capacity - sessions.booked`)
- "Yer tut" seçilmiş masterklassın həqiqi detalına (`/m/<slug>` və ya ev-slug + masterklass-slug)
- "Şəhəri gəz" plitələri və menyu — real route-lara (statik, kodda)
- Qalereya önizləmə — real fotolardan (admin-yüklənmiş, `gallery_photos`)

**Açıq sual:** "Ev" (Gil evi, Rəsm evi, Mətbəx, Elm evi) data modelində ayrıca kateqoriya/table olmalıdırmı, yoxsa `masterclasses.house_id`/`category` sahəsi kifayətdirmi? → Mərhələ 2 ARCHITECTURE qərarı.

---

## 2. Masterklass detalı — `Detal.dc.html` → Evin içi

**Komponentlər:**
- "Ev interyeri" səhnəsi: pəncərə, rəf üzərində dekorativ fiqurlar, masa, **hərəkətli hero-obyekt** (boşqab `spinY` + buxar `steam`)
- Başlıq + 3 info-çip (yaş, müddət, "materiallar bizdən")
- Seans seçici: üfüqi scroll button-lar (gün+saat), dolu seans "Dolub" göstərir və seçilmir
- Muncuq qabı + "N yerdən M yer qalıb"
- "90 dəqiqədə nə olur" — 4 addımlı proses (yoğur→forma→naxış→bişir)
- "Nə gətirməli? Heç nə" vurğu kartı
- Təlimçi kartı (foto+ad+ixtisas)
- "Qonşu evlər" — 3 əlaqəli masterklass linki
- Sticky-tərzi alt CTA bar: seçili seans + qiymət + "Kassaya →"

**İmza animasiya:** `spinY` (boşqab yellənməsi) + `steam` (buxar) — hazırda sonsuz, real saytda ilk görünüşdə bir neçə dövrdən sonra dayanmalı və ya `prefers-reduced-motion`-da tamamilə statik (bu obyekt dekorativdir, `aria-hidden`).

**Real olmalıdır:** seanslar DB-dən; dolu seans seçilmir (server + client hər ikisində yoxlanır); qalan yer real; "Kassaya →" seçilmiş seans ID-si ilə Kassa-ya; qonşu ev linkləri real masterklass-lara (eyni ev və ya əlaqəli); təlimçi admin-dən.

**Məzmun boşluğu:** `[Təsviri dəqiqləşdirin]`, `[Dəqiqləşdirin]` (nə gətirməli təfərrüatı) → `docs/CONTENT-TODO.md`.

---

## 3. Qeydiyyat — `Kassa.dc.html` → Bilet kassası

**Komponentlər:**
- "Kassa budkası" səhnəsi (dekorativ)
- Çap olunan bilet kartı (addımlarla doldurulur, təsdiqlənəndə "TƏSDİQLƏNDİ" möhürü + konfeti)
- 3 addımlı forma: (1) uşağın adı+yaşı, (2) valideynin adı+telefon+razılıq checkbox, (3) təsdiq ekranı
- Təsdiqdə: Usta pasportuna möhür önizləməsi (5 dairədən neçəsi dolu), "Təqvimə əlavə et" düyməsi
- Alt action bar: Geri/Növbəti, addım nömrəsi göstəricisi

**İmza animasiya:** `stamp` (möhür), `printIn` (bilet çıxması), `confetti` — bir dəfəlik, hadisəyə bağlı (funksional, reduced-motion-da statik TƏSDİQLƏNDİ qalır).

**Real olmalıdır (ən kritik hissə, BRIEF §5):**
- Validasiya: ad, yaş, `+994` telefon formatı (server + client)
- Razılıq checkbox məcburi (consent qeydi `consents` cədvəlinə)
- **Son yer üçün yarışda yalnız bir bron keçir** — atomik tranzaksiya/lock (skill-in "Never oversell" qaydası, artıq əvvəlki backend-də var idi — köçürülüb testlə yenidən yoxlanacaq)
- Unikal bilet nömrəsi (`bookings.reference`)
- **SMS əvəzinə WhatsApp təsdiqi** (Phase 0 qərarı) — bron təsdiqlənəndə `wa.me` linki/mesaj hazırlanır, avtomatik "göndərilmir" (WhatsApp API-sız mümkün deyil), ekranda "WhatsApp-da təsdiq mesajını göndər" düyməsi kimi göstərilə bilər — Mərhələ 2-3-də dəqiqləşdirilir
- `.ics` fayl generasiyası ("Təqvimə əlavə et")
- Pasport möhürü **real bronla bağlı** (uğurlu bron → müştərinin möhür sayı +1, server-side hesablanır, client-side sadəcə göstərir)

**Açıq sual:** real SMS/OTP yoxdursa, "Usta pasportu" girişi necə təhlükəsiz olsun? Phase 0 cavabı: sadə telefon+bron-kodu yoxlaması (əsl OTP yox) — Mərhələ 3-də dəqiq axın yazılacaq.

---

## 4. Təqvim — `Teqvim.dc.html` → Avtobus dayanacağı

**Komponentlər:**
- "Dayanacaq" səhnəsi: avtobus `busIn` animasiyası ilə girir (bir dəfəlik — bu artıq düzgün yazılıb, dövr etmir)
- Marşrut (yaş qrupu) filtri + gün tabları (4 gün göstərilir)
- "Reyslər lövhəsi": qaranlıq fon, split-flap üslubda saat rəqəmləri, hər sətir masterklass+ev+yaş+qalan yer (rəng-kodlu: yaşıl/sarı/boz)
- Boş gün mesajı
- Gözləmə siyahısı CTA kartı

**İmza animasiya:** `busIn` (bir dəfəlik giriş, düzgün), `bounce` (avtobus yüngül yırğalanma — davamlı, kiçik, qəbul edilə bilər), `blink` ("● CANLI" göstəricisi — davamlı yanıb-sönmə, BRIEF §6 "sonsuz mikroanimasiya" qadağasına formal olaraq aiddir, amma funksional məlumat göstəricisidir (canlı status) — Mərhələ 6 auditində qərar veriləcək: ya statik "yenilənir" mətninə keçir, ya saxlanılır çünki mənalı status indikatorudur, dekorativ deyil).

**Real olmalıdır:** reyslər (sessions) DB-dən; yaş+gün filtrləri real data üzərində server/client; boş-gün mesajı real nəticəyə görə; **gözləmə siyahısı forması işləyir** (DB-yə yazılır, yer açılanda WhatsApp/bildiriş — SMS yox, Phase 0 qərarına görə).

---

## 5. Oyun parkı — `OyunParki.dc.html` → Oyun parkı (hub)

**Komponentlər:**
- Park səhnəsi: fırlanan carousel (`spin`, davamlı — dekorativ, OK), yellənən yelləncək (`swing`, davamlı — dekorativ)
- ★ N/5 ulduz sayğacı (header-də, Gizlənqaç oyunundan)
- "Usta cütləri" yaddaş oyunu: 12 kart (6 cüt), klikləmə/uyğunlaşdırma məntiqi **artıq işlək** (maketin öz state-i), port edilməli
- "Daha nə oynayaq" grid: Plastilin yoğur (link), Rəngləmə (**maketdə yoxdur, qurulmalı**), Gizlənqaç (**maketdə yoxdur, qurulmalı**)

**Real olmalıdır:** yaddaş oyunu (işləyir, portlanır) · Plastilin yoğur (işləyir, portlanır) · **Rəngləmə — sıfırdan qurulmalı**: SVG şəhər evləri konturu, rəng palitrası, toxunanda/klikləndə boyama, PNG kimi yükləmə, data saxlanmır (client-only, `<canvas>` və ya SVG fill + `canvas.toDataURL` export) · **Gizlənqaç — sıfırdan qurulmalı**: saytın 5 səhifəsində gizli ulduz (hansı 5 səhifədə olacağı Mərhələ 2-də qərarlaşdırılacaq — namizədlər: Ana, Detal, Təqvim, Qalereya, Suallar), tapılanlar `localStorage`-da saxlanır, header-dəki "★ N/5" bütün səhifələrdə bu state-i oxuyur, 5/5 olanda valideyn telefonu daxil edib endirim kodu alır (server endpoint, rate-limitli, `referral_codes`/`discount_codes` infrastrukturu ilə paylaşıla bilər).

---

## 6. Oyun: Plastilin yoğur — `Yogur.dc.html` → Oyun parkının içi

**Komponentlər:** Pointer Events ilə "blob" obyekti sürükləyib dartmaq (stretch/squash fizikası, kölgə sinxron hərəkəti), rəng seçimi (6), forma seçimi (4: top/damla/kub/yumurta), üz aç/gizlət, sayğac ("N dəfə yoğruldu"), sıfırla.

**Status:** **tam işlək maket** (öz state məntiqi var), BRIEF §5-ə görə birbaşa port edilir — `touch-action:none`, Pointer Events artıq doğru istifadə olunub. Əlavə: `prefers-reduced-motion`-da `transition` müddətləri qısaldılmalı (funksional interaksiya olduğu üçün tam söndürülmür).

---

## 7. Kampaniyalar — `Kampaniyalar.dc.html` → Bazar meydanı

**Komponentlər:**
- Bazar səhnəsi: bayraqcıqlar (`flag` — davamlı yırğalanma, dekorativ), endirim çadırı (`wiggle`)
- **Usta pasportu** kartı: N/5 möhür, möhür dairələri (`stampIn` animasiyası), "möhür vur" düyməsi (maketdə demo, real saytda bron zamanı avtomatik)
- **Dostunu gətir** referral kartı: kod qutusu + "Kopyala" (`navigator.clipboard`, maketdə `copy`/`copied` state-i artıq var)
- **Erkən quş** kartı: "N gün qalıb" + 3/10 dairə göstəricisi + köhnə/yeni qiymət
- Ad günü ayı + Gizlənqaç teaser kartları (linklər)
- Qaydalar qeydi (bir telefon = bir kod və s.)

**Real olmalıdır (ən çox backend-məntiqli səhifə):**
- Pasport möhürü sayı — real bron sayından hesablanır, **valideyn telefonu ilə giriş/OTP** (Phase 0: OTP yox, sadə telefon-yoxlaması) tələb edir
- "Dostunu gətir" kodu — hər valideyn üçün server-side unikal yaradılır (bron tarixçəsindən/qeydiyyatdan), "Kopyala" **həqiqətən** `navigator.clipboard.writeText()` işlədir (maketdəki kimi)
- Erkən-quş qiyməti — avtomatik tətbiq olunur (hər seansın ilk 3 yeri, server-side, bron zamanı sessiya tutumuna görə hesablanır)
- **Bütün kod qaydaları serverdə yoxlanılır**: bir telefon = bir kod, müddət bitmə, endirimlərin birləşməməsi

**Açıq sual (Mərhələ 2 memarlıq qərarı):** endirim faizləri (`[X]%`), erkən-quş "ilk 3 yer" qaydası, möhür→pulsuz masterklass konvertasiyası real pul/admin təsdiqi tələb edirmi, yoxsa avtomatik tətbiq olunsun? → `docs/CONTENT-TODO.md` + admin panelində konfiqurasiya sahələri.

---

## 8. Ad günü — `AdGunu.dc.html` → Bayram meydanı

**Komponentlər:**
- Uçan şarlar (`rise`, davamlı — dekorativ)
- İnteraktiv tort: şamlar yanır/sönür (`blow` toggle, `flicker`+`smoke`+konfeti) — **işlək, port edilir**
- 3 paket seçimi (Mini/Usta/Super), seçili fərqli rəng
- Qonaq sayğacı (−/+ düymələri, 4-20 aralığı, baş-ikonları grid-i)
- Tarix + telefon input-ları
- Alt bar: xülasə + "Sorğu göndər"

**Real olmalıdır:** şam üfürmə (işləyir, portlanır) · paket seçimi, qonaq sayğacı, tarix, telefon → **admin-ə sorğu** (yeni `birthday_inquiries` və ya `inquiries` + tip sahəsi) + təsdiq mesajı (ekranda, + WhatsApp link).

**Məzmun boşluğu:** `[N]` (maks qonaq), paket qiymətləri `[QİYMƏT]` → `docs/CONTENT-TODO.md`.

---

## 9. Qalereya — `Qalereya.dc.html` → Şəhər muzeyi

**Komponentlər:**
- Muzey fasadı (dekorativ SVG/div-kolaj)
- Ev-filtri (5 düymə)
- "Divar": asma çərçivələr (`swingS` — davamlı yüngül yırğalanma, hər kart fərqli `animation-delay`), kliklə böyüdülür
- Lightbox: böyük foto + başlıq + uşaq adı/yaş + ev + ←/→ naviqasiya + bağla

**Real olmalıdır:** fotolar admin paneldən yüklənir, **hər fotoda valideyn razılığı bayrağı** (yalnız `consent=true` olanlar ictimai qalereyada görünür); filtrlər real kateqoriyaya görə; lightbox **klaviatura ilə** işləməlidir (Esc=bağla, ←/→=naviqasiya — maketdə yalnız klik, əlavə edilməli).

**Uşaq məlumatı qaydası:** uşağın tam adı göstərilməməlidir (BRIEF ümumi qaydası) — "[Uşağın adı]" yerinə ya heç nə, ya yalnız ilk hərf/yaş, admin formasında seçim.

---

## 10. Təlimçilər — `Telimciler.dc.html` → Şəhər sakinləri

**Komponentlər:**
- Yellənərək əl yelləyən maskot (`wave`+göz `blinkEye`)
- 4 təlimçi kartı: klikləndə 3D-flip (`flipIn`) arxa üzə keçir (ad/ev/rol ön üzdə, təhsil+təcrübə+bu ayki proqram arxa üzdə)
- Alt CTA: "Sakin olmaq istəyirsiniz?" + müraciət linki

**Real olmalıdır:** admin-dən idarə olunur (ad, foto, ev/ixtisas, bio, bu ayki proqram); kart çevrilməsi (işləyir, portlanır, `aria-pressed`/`aria-expanded` əlavə edilməli əlçatanlıq üçün); "Müraciət et" forması **real** (ada/telefon/CV-link, backend-ə göndərilir, `inquiries` tipi `instructor-application`).

---

## 11. Valideyn sualları — `Suallar.dc.html` → Məlumat bürosu

**Komponentlər:**
- "i" məlumat guşəsi maskotu (`bob`)
- 4 tab (Qeydiyyat/Ödəniş/Təhlükəsizlik/Gün özü)
- Akkordeon sual-cavab, `aria-expanded` **artıq maketdə var** (yaxşı əlamət)
- Alt CTA: WhatsApp / Əlaqə səhifəsi

**Real olmalıdır:** suallar admin-dən idarə olunur (tab, sual, cavab, sıra); akkordeon `aria-expanded` ilə (mövcud davranış qorunur, server-render + progressive JS).

**Məzmun boşluğu:** çoxlu `[...]` (ləğv qaydası, ödəniş üsulları, qrup ölçüsü, iş saatları) → `docs/CONTENT-TODO.md`-nin ən böyük hissəsi burdan gələcək.

---

## 12. Əlaqə — `Elaqe.dc.html` → Şəhər poçtu

**Komponentlər:**
- Poçt qutusu: məktub göndəriləndə zərf "uçur" (`flyIn`) + bayraqcıq qalxır (`flagUp`)
- "Zərf" forması: ad, telefon, mesaj (xətli textarea effekti) → göndər
- Uğur ekranı: "Məktub çatdı!" + "Yeni məktub"
- Sadə SVG xəritə (dekorativ) + "Xəritədə aç" linki
- Ünvan/iş saatları/telefon kartları + WhatsApp/Instagram düymələri
- Footer: © il, studiya adı, Instagram, Məxfilik siyasəti linki

**Real olmalıdır:** forma backend-ə göndərilir (**rate limit + spam qoruması/honeypot**, BRIEF-in təhlükəsizlik bazası); "Xəritədə aç" **real Google Maps linki** (admin-dən ünvan koordinatı); ünvan/saatlar admin-dən; Məxfilik siyasəti səhifəsi mövcud olmalıdır (yeni statik səhifə, bütün footer-lərdə).

---

## Ortaq qeydlər və yeni data-modeli ehtiyacları (Mərhələ 2 ARCHITECTURE-ə aparılacaq)

Əsas skill-in minimum data modelinə (§ `kids-masterclass-website`) əlavə olaraq bu layihə üçün lazım olan yeni/genişləndirilmiş cədvəllər:
- `houses` (və ya `masterclasses.category`) — ev/mövzu qruplaşdırması, rəng/ikon
- `loyalty` — pasport möhür sayı (hesablanmış və ya loglanmış), pulsuz-masterklass kuponu
- `referral_codes` / `discount_codes` — "dostunu gətir" + Gizlənqaç mükafatı + erkən-quş eyni infrastruktur ola bilər
- `birthday_inquiries` (və ya `inquiries` + `type` sahəsi) — paket, qonaq sayı, tarix
- `gallery_photos` — foto, ev/kateqoriya, uşaq adı (ixtiyari/qismən), **razılıq bayrağı**
- `instructors` — ad, foto, ev, bio, bu ayki proqram
- `faq_items` — tab, sual, cavab, sıra
- Gizlənqaç/Rəngləmə/Yaddaş oyunu üçün DB lazım deyil (client-only, `localStorage`), yalnız 5/5 mükafat kodu üçün bir server endpoint.

**Hərəkət siyasəti xatırlatması (Mərhələ 2-də DESIGN.md-ə köçürüləcək):** maketlərdə bir neçə dekorativ animasiya (`float`, `sway`, `spin`, `swing`, `flag`, `wiggle`, `swingS`, `blink`) hazırda **sonsuz dövr** edir — bu, BRIEF §6-nın birbaşa qadağasıdır ("hər elementdə sonsuz dövr edən mikroanimasiya"). Dizayn sistemi qurularkən bunların hər biri üçün qərar veriləcək: (a) tamamilə statikə keçir, (b) 2-3 dövrdən sonra dayanır, (c) yalnız hover/scroll-görünmə ilə işə düşür. Bu, `design-motion-principles` Audit mərhələsinin əsas işi olacaq.

**Növbəti addım:** Mərhələ 2 — bu sənəd təsdiqlənəndən sonra `DESIGN.md` (tokenlər, "plastilin" CSS utility, şrift miqyası, hərəkət qaydaları, §6 qadağa-yoxlama) və `docs/ARCHITECTURE.md` (yuxarıdakı data-modeli qərarları ilə) yazılacaq.
