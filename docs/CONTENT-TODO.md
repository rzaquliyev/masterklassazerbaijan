# Məzmun boşluqları (CONTENT-TODO)

> BRIEF.md §4-ə görə: maketlərdəki/koddakı bütün `[...]` yer tutucuları (placeholder) real məlumatla əvəz olunmalıdır. Heç nə uydurulmayıb — aşağıdakı siyahı kodda indi görünən bütün belə yerləri və onların harada olduğunu göstərir. Studiya sahibi bunları cavablandırana qədər sayt bu vəziyyətdə **istehsala (production) buraxıla bilməz**.

## 1. Brend adı ✅ TƏSDİQLƏNDİ (2026-10-09)

- **Qərar:** rəsmi ad **"Masterklass Azerbaijan"** (yazılışda "k" ilə — "masterklass", "masterclass" yox) — Instagram hesabı `@masterklassazerbaijan` ilə eyni, BRIEF.md §0/§2-dəki ad/domen qarışıqlığı riski bununla aradan qalxır, çünki mövcud əlaqəsiz biznes "masterclass" (ingilis yazılışı, "c" ilə) adını və domenini istifadə edir.
- **Tətbiq olundu:** `siteName` açarı `src/i18n/az.json`, `ru.json`, `en.json`-da `"Masterklass Azerbaijan"` olaraq dəyişdirildi (bütün səhifə başlıqlarında, naviqasiyada, footer-də avtomatik görünür).
- Domen adı hələ ayrıca təsdiqlənməlidir (məs. `masterklassazerbaijan.az` və ya oxşar — "masterclass.az" YOX, çünki o, başqa birinə məxsusdur).

## 2. Əlaqə məlumatları

| Sahə | Vəziyyət |
|---|---|
| Ünvan | ✅ **TƏSDİQLƏNDİ** (2026-10-09): "Nərimanov rayonu, Təbriz küç., Metropark ƏTM, 7-ci mərtəbə, Bakı" — 3 dildə `elaqe.address` açarına yazıldı, Google Xəritə düyməsi (`elaqe.njk`) indi bu ünvanla axtarış linkinə gedir (`maps/search/?query=...`) |
| Telefon / WhatsApp | ✅ **TƏSDİQLƏNDİ** (2026-10-09): `+994 55 819 99 01` — görünən telefon (`elaqe.njk`) və bütün 5 WhatsApp linki (`layouts/base.njk`, `elaqe.njk`, `suallar.njk`, `kampaniyalar.njk`, `kassa-tesdiq.njk`) bu nömrəyə yeniləndi. **Qeyd:** WhatsApp üçün ayrı nömrə verilməyib, görünən telefon nömrəsi WhatsApp üçün də istifadə olundu — fərqlidirsə, xəbər verin. |
| İş saatları | ❌ Hələ gözlənilir — `az.json`/`ru.json`/`en.json` → `elaqe.hours`, hazırkı: `"[Şən–Baz 10:00–19:00]"` |

> Qalan təkmilləşdirmə (opsional): WhatsApp nömrəsi bir dəfə ağlabatan yerdən (`.env` və ya `site_settings` cədvəli) oxunsa, 5 fayldakı hardcode təkrarından qurtulardıq.

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
