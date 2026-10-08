# ASSETS.md — xarici resurslar

Hər xarici resurs: ad, mənbə, lisenziya, harada istifadə olunur (BRIEF §4).

| Resurs | Mənbə | Lisenziya | Harada istifadə olunur |
|---|---|---|---|
| Fredoka (şrift, 500/600/700) | npm `@fontsource/fredoka` | OFL (Open Font License) | Başlıq şrifti, self-host, `src/public/fonts/`, `src/public/css/fonts.css` |
| Nunito (şrift, 500/700/800) | npm `@fontsource/nunito` | OFL | Mətn şrifti, self-host |
| Space Mono (şrift, 700) | npm `@fontsource/space-mono` | OFL | Reys lövhəsi/bilet kodu kimi **yalnız rəqəm/latın-böyük-hərf** mətnlər üçün — latin-ext yüklənməyib, Azərbaycan hərfli mətndə **işlədilmir** (bax Qeydlər) |

## Qeydlər

- Bütün illüstrasiyalar (ev siluetləri, muncuq/stiker-lər, maskot, SVG-lər) əl ilə inline SVG/CSS-"gil" forması kimi çəkilib — başqa saytdan götürülməyib.
- Şriftlər self-host edilib (`npm` paketləri, `src/public/fonts/`), xarici CDN-dən asılılıq yoxdur.
- Hər şrift Azərbaycan hərfləri (ə, ı, ğ, ş, ç, ö, ü) üçün latin-ext unicode-range (U+0100-02BA) ilə yoxlanılıb — bu range bu hərflərin hamısını əhatə edir.
- **Mərhələ 4 QA zamanı tapılan real xəta:** Space Mono üçün latin-ext self-host edilməyib (DESIGN.md §2-də qəsdən, "AZ hərfli mətndə işlədilmir" qaydası ilə), amma 2 yerdə (Təqvim-in "REYSLƏR" başlığı, Kampaniyalar-ın "PLASTİLİN ŞƏHƏRİ" etiketi) bu qaydaya əməl edilməmiş, nəticədə həmin mətnlərdəki Ə/Ş/İ hərfləri sistem şriftinə keçib, fərqli görünürdü. Hər iki yer `font-family:var(--font-display)` (Fredoka) ilə düzəldildi.

## Maketlər (`design/*.dc.html`)

Vizual/davranış referansı kimi istifadə olunur, birbaşa kod kopyalanmır (BRIEF §2, §4). `Rengleme.dc.html`-dəki 6 şəklin SVG `<path>` məlumatları (hər region-un konturu və nümunə rəngi) bu layihənin öz dizayn alətində hazırlanmış orijinal illüstrasiyadır — `src/public/js/rengleme-data.js`-ə birbaşa köçürülüb (BRIEF-in "maketi port et" təlimatına uyğun, başqa saytdan kopyalama deyil).

İlham üçün öyrənilən (kopyalanmayan) saytlar: Kidwonder, Goodkids, Agencia Kids, MEplace Childcare (BRIEF §4).
