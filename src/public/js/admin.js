// Admin paneli: geri qaytarıla bilməyən/təhlükəli əməliyyatlar üçün təsdiq.
// `onsubmit="confirm(...)"` kimi inline handler-lər CSP-nin script-src-attr 'none' qaydası
// tərəfindən səssizcə bloklanır (xəbərdarlıq heç görünmür, forma dərhal göndərilir) — ona görə
// təsdiqi `data-confirm` atributu ilə, xarici bu fayldan idarə edirik.
(function () {
  'use strict';
  document.querySelectorAll('form[data-confirm]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      if (!window.confirm(form.getAttribute('data-confirm'))) e.preventDefault();
    });
  });
})();
