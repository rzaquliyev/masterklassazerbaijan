# Layihə qaydaları (daimi)

Bu layihə `BRIEF.md`-də təsvir olunan "Plastilin şəhəri" uşaq masterklassları saytıdır. Hər sessiyada əvvəlcə `BRIEF.md`-i, sonra `DESIGN.md` və `docs/ARCHITECTURE.md`-ni oxu.

## Dəyişməz qaydalar

- **Dizayn mənbəyi:** vizual istiqamət seçilib (`design/*.dc.html` maketləri) — yeni istiqamət təklif etmə, maketləri tətbiq et. Dəyişiklik lazım olsa əvvəlcə `DESIGN.md` yenilənir.
- **Dil/format:** bütün ictimai mətn Azərbaycan dilində (+ Rus/İngilis, `/az` `/ru` `/en` prefiksləri ilə). Qiymət AZN (₼). Tarix `DD.MM.YYYY`, saat 24-saatlıq, saat qurşağı `Asia/Baku`.
- **Kopyalama qadağası (BRIEF §4):** başqa saytın şəklini, illüstrasiyasını, Lottie/JS/CSS kodunu, loqosunu, mətnini köçürmək OLMAZ. Yalnız texnika/ideya öyrənilib öz kodunla yenidən qurulur. Hər xarici resurs `docs/ASSETS.md`-də lisenziyası ilə qeyd olunur.
- **Instagram:** `@masterklassazerbaijan`-a giriş/scrape etmək OLMAZ. Material yalnız istifadəçidən (fayl, yapışdırılmış mətn) və ya `/assets/raw/`-dan gəlir.
- **SAMPLE data:** qiymət, təlimçi adı, rəy, ünvan, telefon, uşaq fotoları — real deyilsə görünən şəkildə `SAMPLE` kimi işarələnir.
- **Uşaq məlumatı:** oyunlar qeydiyyatsız işləyir, uşaqdan məlumat toplanmır (ad/yaş istisna, bron üçün). Qalereyada uşağın tam adı göstərilmir, yalnız valideyn razılığı olan fotolar ictimai görünür.
- **Şriftlər:** self-host (Fontsource), hər namizəd Azərbaycan hərfləri (ə, ı, ğ, ş, ç, ö, ü) üçün yoxlanılır, dəstəkləmirsə istifadə edilmir (Space Mono yalnız rəqəm/latın-böyük-hərf mətnlər üçün, AZ mətn üçün yox).
- **Hərəkət qaydası (BRIEF §6 + DESIGN.md §6):** heç bir dekorativ animasiya sonsuz dövr etmir — görünəndə ən çoxu 3 dövr edib dayanır, funksional/hadisə-bağlı hərəkət istisnadır. `prefers-reduced-motion`-da dekorativ tam söndürülür.
- **Ödəniş:** məkanda (pay-at-venue), onlayn inteqrasiya yoxdur (Phase 0 qərarı).
- **Təsdiq/xatırlatma:** yalnız WhatsApp (`wa.me` link), real SMS/OTP provayderi yoxdur (Phase 0 qərarı). Loyallıq (pasport) girişi real OTP əvəzinə sadə telefon+bron-kodu yoxlaması ilədir.
- **Admin:** tək `owner` rolu kifayətdir (Phase 0 qərarı), `staff` rolu sxemdə hazır saxlanılır.
- **Köhnə layihə:** `D:\Downloads` altındakı əvvəlki layihələrə (`cookmood-sayim`, `masterklas-sayti`) toxunulmur, silinmir.
- **Ev/kateqoriya genişlənməsi:** yeni masterklass əlavə ediləndə mütləq `houses` cədvəlindən birinə bağlanır (admin panelində seçim).

## İş axını

Hər mərhələdən sonra dayan, nəticəni fayla yaz, `git commit` et — bax `BRIEF.md` §8. Fayllar itmir, söhbətdə qalan qərarlar itə bilər.

## Açıq suallar (hələ cavablanmayıb, bloklamır)

- Dəqiq brend adı və domen (`[Studio adı]` placeholder)
- Ünvan/rayon, WhatsApp nömrəsi, Instagram hesabı
- Loqo/brend rəngləri (maketin rəngləri ilə davam edilir)
- Hosting büdcəsi/seçimi
