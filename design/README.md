# design/ — Plastilin şəhəri maketləri

Bu fayllar Claude-un dizayn kətanında hazırlanmış telefon ölçülü (390px) maketlərdir.
Format: HTML + şablon sintaksisi (`{{...}}`, `<sc-for>`, `<sc-if>`, `class Component extends DCLogic`).
Brauzerdə birbaşa açılmır; **vizual və davranış referansıdır**.

Necə istifadə et:
- Rəng, ölçü, kölgə, künc, şrift dəyərlərini inline `style` atributlarından götür.
- Animasiyalar `<helmet><style>` içindəki `@keyframes` və `.on .x` siniflərindədir.
- İnteraktiv davranış (state, filtrlər, oyunlar) `<script type="text/x-dc">` içindəki `renderVals()` funksiyasındadır.
- Nümunə data (seanslar, qalan yerlər, kodlar) real backend datası ilə əvəz olunmalıdır. Bax: BRIEF.md §5.

Ana səhifə: Plastilin.dc.html. Hər səhifənin şəhərdəki yeri: BRIEF.md §2.
