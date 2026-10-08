// Ortaq, bütün səhifələrdə yüklənən davranışlar: menyu overlay, flip-kart, akkordeon.
// Proqressiv təkmilləşdirmə: bu skript olmasa da naviqasiya/link-lər düz HTML kimi işləyir.
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.__reduceMotion = reduceMotion;

  // ---- Menyu overlay ----
  var menuBtn = document.getElementById('menu-btn');
  var menuOverlay = document.getElementById('menu-overlay');
  var menuClose = document.getElementById('menu-close');
  function openMenu() {
    if (!menuOverlay) return;
    menuOverlay.hidden = false;
    menuBtn.setAttribute('aria-expanded', 'true');
    var firstLink = menuOverlay.querySelector('a, button');
    if (firstLink) firstLink.focus();
  }
  function closeMenu() {
    if (!menuOverlay) return;
    menuOverlay.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.focus();
  }
  if (menuBtn && menuOverlay) {
    menuBtn.addEventListener('click', function () {
      if (menuOverlay.hidden) openMenu(); else closeMenu();
    });
    menuClose && menuClose.addEventListener('click', closeMenu);
    menuOverlay.addEventListener('click', function (e) {
      if (e.target === menuOverlay) closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menuOverlay.hidden) closeMenu();
    });
  }

  // ---- Flip-kart (klik/tap) ----
  document.querySelectorAll('[data-flip-trigger]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('.flip-card');
      if (!card) return;
      var flipped = card.classList.toggle('is-flipped');
      btn.setAttribute('aria-pressed', String(flipped));
    });
  });

  // ---- Akkordeon ----
  document.querySelectorAll('[data-accordion-trigger]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panelId = btn.getAttribute('aria-controls');
      var panel = panelId && document.getElementById(panelId);
      if (!panel) return;
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
    });
  });

  // ---- Auto-submit select (filtrlər, JS yoxdursa "Axtar" düyməsi işləyir) ----
  document.querySelectorAll('[data-auto-submit]').forEach(function (field) {
    field.addEventListener('change', function () { field.form.submit(); });
  });

  // ---- Panoya kopyala (Dostunu gətir, kodlar) ----
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var done = function () {
        var original = btn.textContent;
        btn.textContent = btn.getAttribute('data-copy-label') || 'Kopyalandı ✓';
        btn.disabled = true;
        setTimeout(function () { btn.textContent = original; btn.disabled = false; }, 1500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(done);
      } else {
        done();
      }
    });
  });
})();
