# Məzmun boşluqları (CONTENT-TODO)

> BRIEF.md §4-ə görə: maketlərdəki/koddakı bütün `[...]` yer tutucuları (placeholder) real məlumatla əvəz olunmalıdır. Heç nə uydurulmayıb — aşağıdakı siyahı kodda indi görünən bütün belə yerləri və onların harada olduğunu göstərir. Studiya sahibi bunları cavablandırana qədər sayt bu vəziyyətdə **istehsala (production) buraxıla bilməz**.

## 1. Brend adı (ən prioritetli)

- **Harada:** `siteName` açarı — `src/i18n/az.json:3`, `ru.json`, `en.json` (bütün səhifə başlıqlarında, naviqasiyada, footer-də görünür)
- **Hazırkı vəziyyət:** `"[Studio adı]"` — hələ seçilməyib
- **Niyə boş qalıb:** BRIEF.md §0/§2 "Ad və domen riski" bəndinə görə, "Masterclass Azerbaijan" adı və `masterclass.az` domeni Bakıda artıq başqa, əlaqəsiz bir biznesə məxsusdur (avtomobil mövzulu media səhifəsi, ~146K izləyici). Qarışıqlıq riski olduğu üçün **dəqiq brend adı və domen adı studiya sahibindən təsdiqlənməlidir**.
- **Qeyd:** Instagram hesabı `@masterklassazerbaijan` artıq BRIEF.md §0-da təsdiqlənib və kodda düzgün istifadə olunur (`src/views/layouts/base.njk:51`, `src/views/elaqe.njk:33`) — bu, boşluq DEYİL.

## 2. Əlaqə məlumatları

| Sahə | Harada (fayl : sətir / açar) | Hazırkı dəyər |
|---|---|---|
| Ünvan | `az.json` → `elaqe.address` | `"[Küçə, bina], Bakı"` |
| İş saatları | `az.json` → `elaqe.hours` | `"[Şən–Baz 10:00–19:00]"` |
| Telefon | `src/views/elaqe.njk:31` (hardcode) | `+994 00 000 00 00` / `tel:+994000000000` |
| WhatsApp nömrəsi | 5 yerdə hardcode: `layouts/base.njk:48`, `elaqe.njk:32`, `suallar.njk:41`, `kampaniyalar.njk:17`, `kassa-tesdiq.njk:35` | `994000000000` (hamısı eyni, bir dəfə dəyişdirilməlidir) |
| Google Xəritə linki | `src/views/elaqe.njk:36` | `https://www.google.com/maps` (generic, pin deyil) |

> Tövsiyə: WhatsApp nömrəsi bir dəfə ağlabatan yerdən (`.env` və ya `site_settings` cədvəli) oxunsa, 5 fayldakı hardcode təkrarından qurtulardıq — hələlik həqiqi nömrə gələndə eyni `994000000000` qiymətini bütün 5 yerdə əvəz etmək kifayətdir.

## 3. Qiymətlər

| Sahə | Harada | Hazırkı dəyər |
|---|---|---|
| Ad günü paketləri (Mini/Usta/Super) | `src/views/ad-gunu.njk:39` | `[QİYMƏT] ₼` (hər paket üçün ayrı, dinamik yer tutucu) |
| Masterklass seansları | `scripts/seed-sample-data.*` (DB seed) | Artıq ədəd dəyərlərlə doldurulub, lakin `SAMPLE` bayrağı ilə işarələnib — **real istehsal qiymətləri** studiya sahibindən alınmalı, seed sıfırlanmalıdır |

## 4. Qrup ölçüsü / say həddi

| Sahə | Harada | Hazırkı dəyər |
|---|---|---|
| Ümumi "kiçik qruplar" vədi | `az.json` → `home.trust[1].text` | `"Ən çox [N] uşaq"` |
| Ad günü — hər paketin tutumu | `az.json` → `adGunu.packages[0..2].desc` | `"[N] uşağa qədər"` ×3 |
| Ad günü — qonaq sayı seçicisi | `az.json` → `adGunu.guestsMax` | `"uşaq (maks. [N])"` |

## 5. Qaydalar / siyasət mətnləri

| Sahə | Harada | Hazırkı dəyər |
|---|---|---|
| Masterklassa nə gətirmək | `az.json` → `detail.bringNothingText` | "...Sadəcə ləkələnməsindən qorxmadığınız paltar. **[Dəqiqləşdirin]**" |
| Təhlükəsizlik sertifikatı | `az.json` → `home.trust[0].text` | `"[Sertifikat məlumatı]"` |
| Ləğv qaydası | `az.json` → `home.trust[2].text` | `"[Ləğv qaydası]"` |
| Məlumatların saxlanma müddəti | `az.json` → `mexfilik.sections[3].p` | `"[Saxlama müddəti]"` — məxfilik siyasəti artıq "SAMPLE, hüquqşünasla yoxlanmalı" qeydi ilə işarələnib |

## 6. Fotolar

- Ana səhifə "Şəhər muzeyi" bölməsi (`home.njk`) və tam Qalereya səhifəsi (`qalereya.njk`) hazırda `[FOTO]` / `[BÖYÜK FOTO]` yer tutucuları ilə göstərilir (real şəkil yoxdur, DB-də `gallery_photos` cədvəli boşdur).
- BRIEF.md-ə görə: **stok uşaq fotoları və ya tanınan uşaqların şəkilləri qadağandır** — yalnız studiyanın öz, valideyn razılığı olan fotoları, EXIF/GPS metadatası təmizlənmiş şəkildə yüklənməlidir (admin panel hazır olduqda).

## 7. Hələ tətbiq olunmayan (əlaqəli, amma ayrı mövzu)

- Admin panel (foto yükləmə, masterklass/seans idarəsi, bron idarəsi) hələ qurulmayıb — yuxarıdakı bir çox boşluq (qiymətlər, fotolar) yalnız admin panel və ya birbaşa DB-seed vasitəsilə doldurula bilər.

---

**Növbəti addım:** bu siyahı studiya sahibi ilə gözdən keçirilməli, cavablar alındıqdan sonra müvafiq fayllar (ilk növbədə `src/i18n/*.json` və `src/views/elaqe.njk`) yenilənməli və bu fayldan həmin bəndlər silinməlidir.
