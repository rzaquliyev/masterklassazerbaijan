# DESIGN.md — "Plastilin şəhəri"

> Dizayn **seçilib** (BRIEF §2), maketlər `design/*.dc.html`-də hazırdır. Bu sənəd maketlərdən çıxarılan tək-mənbə dizayn sistemidir — tokenlər, komponentlər və hərəkət qaydaları buradan götürülür, `prototypes/` yox, birbaşa `src/public/css/` və Nunjucks şablonlarına köçürülür. Dəyişiklik lazım olsa əvvəlcə bu fayl yenilənir.

## 0. Design read

Uşaq yaradıcılıq studiyası üçün çoxsəhifəli sayt: sayt kiçik bir **plastilin şəhəridir**, hər səhifə şəhərin bir yeridir (ev, kassa, dayanacaq, bazar, muzey və s.). Valideynlər (qərarverici) üçün hər yerdə aydın qiymət/tarix/yer-sayı, uşaqlar (həvəsləndirilən) üçün toxunulan, "yoğrula bilən" interfeys hissi. Server-rendered vanilla HTML/CSS/JS (React yox), əl-çəkilmiş inline SVG və CSS-"gil" (clay) effekti ilə qurulur.

**Əhval:** "Barmaqla basılanda batan, yumşaq işıq-kölgəli plastilin fiqurları ilə dolu bir oyuncaq şəhər."

## 1. Rəng tokenləri

```css
:root{
  --cream:   #FFF4E2; /* səhifə fonu */
  --night:   #1B2A4A; /* əsas mətn, tünd kartlar/footer fonu */
  --night-2: #3C4B6B; /* ikinci dərəcəli mətn */
  --orange:  #E8682A; /* əsas vurğu — CTA, aktiv vəziyyət */
  --orange-deep: #B44E1D; /* orange-in "basma" kölgəsi */
  --butter:  #FFE08A; /* isti dekorativ fon (info kartları) */
  --sun:     #FFC23D; /* ikinci dekorativ vurğu (xəbərdarlıq/diqqət) */
  --green:   #7BC67E; /* uğur/müsbət vəziyyət (yer var, təsdiq) */
  --green-deep: #57A05A;
  --blue:    #6FA8DC; /* neytral dekorativ (su, səma, kart) */
  --blue-deep: #4C84B8;
  --pink:    #F28AA6; /* yalnız ad günü bölməsi vurğusu */
  --pink-deep: #C9637F;
  --card-shadow: #EAD9BE; /* ağ kart altı "basma" kölgəsi */
  --white:   #FFFFFF;
}
```

**Vurğu qaydası:** `--orange` əsas, tək kilidlənmiş CTA/aktiv-vəziyyət rəngidir (maketlərdə ardıcıl belədir). `--sun`/`--green`/`--blue`/`--pink` yalnız **ev/kateqoriya kodlaşdırması** və bölməyə-məxsus vurğular üçün (hər bölmədə ən çoxu 1-2) — BRIEF §6-nın "hər yerdə eyni vurğu" qadağasına deyil, "rəqabətli vurğuların xaos yaratması"na qarşı qoyulur; maketlərdəki istifadə artıq nizamlıdır (hər ev öz rəngi, hər bölmə öz fon rəngi), bu nizam qorunur.

**Kontrast:** `--night` / `--cream` və `--white` üzərində ≥ 12:1. `--white` mətn / `--orange`, `--night` fonları üzərində ≥ 4.6:1 (Mərhələ 6-da ölçülüb təsdiqlənəcək). `--butter`/`--sun`/`--card-shadow` yalnız dekorativ fon/kölgə kimi, üzərlərinə birbaşa kiçik mətn qoyularsa ayrıca yoxlanılır.

## 2. Şriftlər

| Rol | Şrift | Çəki | AZ dəstək |
|---|---|---|---|
| Başlıq (display) | **Fredoka** | 500–700 | self-host ediləndə render-yoxlaması aparılacaq (ə,ı,ğ,ş,ç,ö,ü) |
| Mətn (body) | **Nunito** | 500–800 | eyni yoxlama |
| Reys lövhəsi / kod / bilet № | **Space Mono** | 700 | yalnız rəqəm+latın böyük hərf üçün işlədilir (Space Mono-nun Azərbaycan hərf dəstəyi zəifdir) — **AZ hərfi olan heç bir məzmun bu şriftlə yazılmır**, yalnız saat (`11:00`), bilet kodu (`SAMPLE-0427`), kateqoriya etiketi kimi latın/rəqəm sabit-enli mətnlər |

Fontsource namizədləri: `@fontsource/fredoka`, `@fontsource/nunito`, `@fontsource/space-mono`. Hər biri Mərhələ 4-də self-host ediləndə Azərbaycan hərfləri canlı render edilib təsdiqlənəcək; dəstəkləmirsə BRIEF §7 qaydasına görə istifadə edilməyəcək və mənə bildiriləcək.

## 3. "Plastilin" effekti — imza CSS utility

```css
.clay{ box-shadow: inset -6px -7px 0 rgba(0,0,0,.16), inset 6px 6px 0 rgba(255,255,255,.35); }
.clay-sm{ box-shadow: inset -4px -5px 0 rgba(0,0,0,.16), inset 4px 4px 0 rgba(255,255,255,.3); }
.clay-press{ box-shadow: 0 6px 0 var(--orange-deep); }      /* düymə altı sərt kölgə */
.clay-card{ box-shadow: 0 5px 0 var(--card-shadow); }        /* ağ kart altı yumşaq kölgə */
```

İki qat: **doldurulmuş formalar** (`.clay`/`.clay-sm`, inset işıq/kölgə — düymələr, evlər, blob-lar) və **düz kartlar** (`.clay-card`/`.clay-press`, alt sərt kölgə — ağ kartlar, CTA-lar). Basılanda (`:active`) `.clay-press`/`.clay-card` elementləri `translateY(4-6px)` + kölgə `0 2px 0`-a düşür (maketin "basma" davranışı).

## 4. Spacing, radius

- Künclər **böyük və yumşaq**: kiçik etiket/düymə 14–18px, kartlar 20–30px, dairəvi elementlər 50% (ev damı, maskot başı və s. maketdəki kimi sərbəst formalar da var — hər evin öz unikal kontur-radiusu ola bilər, bax `docs/PAGES.md` Ev data nümunələri).
- Toxunma sahələri ≥ 44px (maketdə ardıcıl ≥48–58px, standart bu saxlanılır).
- Container: mobil-first 375px bazası (maketlər 390px-də çəkilib, 375-ə uyğunlaşdırılacaq), 960px-dən sonra geniş-ekran tənzimləmələri (maketlərdə yoxdur — Mərhələ 4-də əlavə ediləcək, BRIEF §7 "375px-dən başla" tələbinə görə).

## 5. Komponent kataloqu (maketlərdən, `docs/PAGES.md`-ə istinadla)

Hər səhifənin tam komponent siyahısı `docs/PAGES.md`-dədir. Ortaq/təkrarlanan komponentlər:
- **Ev/yer kartı** (dam+bədən+etiket, rəng-kodlu) — ana səhifə, qonşu-ev linkləri, təlimçi ev etiketi
- **Muncuq qabı** (tutum göstəricisi, dairəvi, dolu=rəngli) — hər seans göstərilən yerdə
- **Flip-kart** (3D `rotateY`, klik/tap) — təlimçi kartları, (BRIEF-ə uyğun olaraq yaddaş-oyunu kartları da konseptual qohum)
- **Split-flap reys sətri** (Space Mono, qaranlıq lövhə) — yalnız Təqvim
- **Möhür/stamp** (`scale+rotate` bir-dəfəlik "basma") — bilet təsdiqi, pasport möhürü
- **Overlay-menyu** (slide/fade, `aria-expanded`) — bütün səhifələrdə ortaq header komponenti

## 6. Hərəkət qaydaları (BRIEF §6 ilə uzlaşdırma — mühüm qərar)

Maketlərdə bir neçə dekorativ animasiya (`float`, `sway`, `spin`, `swing`, `flag`, `wiggle`, `swingS`, `blink`) **sonsuz dövr** edir — bu, BRIEF §6-nın "hər elementdə sonsuz dövr edən mikroanimasiya" qadağasına toxunur (bax `docs/PAGES.md` Ortaq qeydlər). Qərar:

1. **Ambient dekorativ hərəkət** (bulud/günəş `float`, ağac `sway`, bazar bayraqcıqları `flag`, çadır `wiggle`, qalereya çərçivəsi `swingS`, təlimçi maskotu `wave`) — görünən sahəyə girəndə başlayır, **3 dövrdən sonra** rahat vəziyyətdə dayanır (CSS `animation-iteration-count:3` + sonuncu kadrda qalma, və ya JS ilə `animationiteration` sayılıb class silinir). Hər bölmədə **ən çoxu 1-2** belə element eyni anda.
2. **Fırlanan/dönən dekorlar** (fırlanan çarx `spin`, yellənən yelləncək `swing` — Oyun parkı səhnəsi) eyni qaydaya tabedir: 3 dövr, sonra dayanır. İstisna: istifadəçi "Oyun parkı" bölməsindəykən, bu hiss-oyun (play-area) özü fokusda olduğu üçün parkı canlı göstərmək üçün yelləncək/çarx `hover`/`scroll-görünmə`-də yenidən 1 dövr təkrarlana bilər (funksional deyil, estetik qərar — Mərhələ 4-də yoxlanılacaq).
3. **Marşrut/vasitə yolu** (`drive` — avtomobil yol boyu) — artıq məntiqən **bir-dəfəlik** olmalıdır: scroll-la bölmə görünəndə bir dəfə başdan sona sürür, sonra dayanır (`IntersectionObserver` və ya Motion `inView()`). Dövr etmir.
4. **Funksional status göstəricisi** (Təqvimdəki "● CANLI" `blink`) — istisnadır: bu dekorativ deyil, canlı-data statusunu bildirir. **Kiçik nöqtə ilə məhdudlaşdırılıb saxlanılır** (tam elementə yox, yalnız 8-10px nöqtəyə), çünki mənalı status siqnalıdır, "mikroanimasiya zinət" deyil. Alternativ kimi sonda `web-design-guidelines` auditində statik "yenilənir" mətninə keçirilə bilər.
5. **Funksional/hadisə-bağlı hərəkət** (möhür, konfeti, bilet çapı, flip-kart, plastilin yoğurma, balon/şam) dəyişmir — bunlar artıq bir hadisəyə bağlıdır (klik, state dəyişikliyi), BRIEF-ə tam uyğundur.
6. Bütün yuxarıdakılar `prefers-reduced-motion:reduce`-da **ya tam söndürülür (dekorativ), ya animasiyasız dərhal son vəziyyətə keçir (funksional)**.
7. Yalnız `transform` və `opacity` animasiya olunur (performans), rənglərin/kölgələrin dəyişməsi `transition` ilə qısa (≤300ms) saxlanılır.

Bu qaydalar Mərhələ 4 tətbiqində `design-motion-principles` (Jhey Tompkins — oynaq — əsas yanaşma) ilə qurulacaq, Mərhələ 6-da Audit rejimi ilə yenidən yoxlanılacaq.

## 7. Qadağalar (BRIEF §6 yoxlama siyahısı — son auditdə `redesign-existing-projects` ilə təkrarlanacaq)

- [ ] Bənövşəyi/çəhrayı qradiyent fon yoxdur (krem + tünd-gecə tək-ton kontrastı)
- [ ] Eyni-ölçülü 3 "feature" kart yan-yana yoxdur (ev kartları fərqli ölçü/forma, trust-badge-lər siyahı şəklində)
- [ ] Emoji ikon kimi istifadə olunmayıb (hamısı əl-çəkilmiş CSS-"gil" forma/SVG)
- [ ] Hər yerdə glassmorphism yoxdur (plastilin inset-kölgə effekti, şüşə-effekt deyil)
- [ ] Inter + slate-900 cütlüyü yoxdur (Fredoka + Nunito)
- [ ] Stok foto yoxdur — bütün foto yerləri `[FOTO]`/SAMPLE etiketli
- [ ] Uydurma rəy/rəqəm yoxdur
- [ ] Generic mətn yoxdur — konkret ton ("Şənbə 11:00, gil boşqab düzəldirik")
- [ ] Hər bölmədə eyni "sol mətn/sağ şəkil" düzülüşü yoxdur (hər bölmənin öz unikal "səhnə" kompozisiyası var)
- [ ] §6-dakı "sonsuz mikroanimasiya" riski §6 (bu sənəddə) qaydaları ilə məhdudlaşdırılıb

## 8. Əlçatanlıq bazası

- Kontrast ≥ 4.5:1, fokus həmişə görünən (`outline:3px solid var(--orange); outline-offset:2-3px` — maketdə artıq var)
- Toxunma sahələri ≥ 44px
- Dekorativ elementlər `aria-hidden="true"`
- Flip-kartlar, akkordeonlar, menyu overlay — `aria-expanded`/`aria-pressed` (maketlərdə qismən var, Mərhələ 4-də hamısına tətbiq olunacaq)
- Lightbox (Qalereya) klaviatura ilə: Esc=bağla, ←/→=naviqasiya (maketdə yoxdur, əlavə ediləcək)
- Trust-qat (qiymət/tarix/yer/CTA) heç vaxt animasiyanın arxasında gizlənmir

## 9. Responsiv baza

Mobile-first 375px. Maketlər 390px fiksasiya ilə çəkilib — portlanarkən `clamp()`/nisbi vahidlərə keçiriləcək ki, 375px-də də sıxılma olmasın. 960px-dən sonrakı geniş-ekran tənzimləmələri (maketlərdə yoxdur) Mərhələ 4-də dizayn sisteminin öz qaydaları ilə (BRIEF-in əvvəlki fazasından miras: 2-sütun yalnız ≥960px) əlavə olunacaq.
