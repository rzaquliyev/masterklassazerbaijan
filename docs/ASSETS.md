# ASSETS.md — xarici resurslar

Hər xarici resurs: ad, mənbə, lisenziya, harada istifadə olunur (BRIEF §4).

| Resurs | Mənbə | Lisenziya | Harada istifadə olunur |
|---|---|---|---|
| Baloo 2 (şrift, 500/600/700) | npm `@fontsource/baloo-2` | OFL (Open Font License) | Başlıq şrifti, self-host, `src/public/fonts/`, `src/public/css/fonts.css` — **Fredoka-nı əvəz edib**, bax Qeydlər |
| Nunito (şrift, 500/700/800) | npm `@fontsource/nunito` | OFL | Mətn şrifti, self-host |
| Space Mono (şrift, 700) | npm `@fontsource/space-mono` | OFL | Reys lövhəsi/bilet kodu kimi **yalnız rəqəm/latın-böyük-hərf** mətnlər üçün — latin-ext yüklənməyib, Azərbaycan hərfli mətndə **işlədilmir** (bax Qeydlər) |

## Qeydlər

- Bütün illüstrasiyalar (ev siluetləri, muncuq/stiker-lər, maskot, SVG-lər) əl ilə inline SVG/CSS-"gil" forması kimi çəkilib — başqa saytdan götürülməyib.
- Şriftlər self-host edilib (`npm` paketləri, `src/public/fonts/`), xarici CDN-dən asılılıq yoxdur.
- Hər şrift Azərbaycan hərfləri (ə, ı, ğ, ş, ç, ö, ü, İ) üçün **`fonttools` ilə cmap cədvəli birbaşa yoxlanılıb** (yalnız unicode-range ədədi hesabı kifayət etmir — bax aşağı).
- **Real xəta #1 (istifadəçi bildirdi, 2026-10-08):** Fredoka-nın HEÇ BİR Fontsource subset-i (latin, latin-ext, variable paket də daxil) ə/Ə/ş/Ş/İ qlif-lərini daşımırdı — bu, Fredoka-nın öz qlif dəstinin məhdudiyyəti idi (Google Fonts-dakı əsil fayl), Fontsource-un subset bölgüsü xətası deyil. Nəticədə bu hərflər səssizcə sistem şriftinə keçib, eyni sözün içində fərqli görünürdü. 10 namizəd (`fonttools`-la cmap yoxlanıldı: Baloo 2 ✓, Quicksand ✓, Varela Round ✓, Comfortaa ✓, Mali ✓, Baloo Bhaijaan 2 ✓, Grandstander ✗, Lilita One ✗, Bagel Fat One ✗, Sniglet ✗, Concert One ✗) arasından **Baloo 2** seçildi (tam AZ dəstəyi + Fredoka-ya ən yaxın bold/rounded üslub). Bax `DESIGN.md` §2.
- **Real xəta #2 (Mərhələ 4 QA zamanı tapılan):** Space Mono üçün latin-ext self-host edilməyib (qəsdən, "AZ hərfli mətndə işlədilmir" qaydası ilə), amma 2 yerdə (Təqvim-in "REYSLƏR" başlığı, Kampaniyalar-ın "PLASTİLİN ŞƏHƏRİ" etiketi) bu qaydaya əməl edilməmişdi — `font-family:var(--font-display)` ilə düzəldildi.

## Maketlər (`design/*.dc.html`)

Vizual/davranış referansı kimi istifadə olunur, birbaşa kod kopyalanmır (BRIEF §2, §4). `Rengleme.dc.html`-dəki 6 şəklin SVG `<path>` məlumatları (hər region-un konturu və nümunə rəngi) bu layihənin öz dizayn alətində hazırlanmış orijinal illüstrasiyadır — `src/public/js/rengleme-data.js`-ə birbaşa köçürülüb (BRIEF-in "maketi port et" təlimatına uyğun, başqa saytdan kopyalama deyil).

İlham üçün öyrənilən (kopyalanmayan) saytlar: Kidwonder, Goodkids, Agencia Kids, MEplace Childcare (BRIEF §4).
