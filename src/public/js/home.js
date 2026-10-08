(function () {
  'use strict';
  var buttons = document.querySelectorAll('[data-house-btn]');
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      buttons.forEach(function (b) {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');

      document.querySelectorAll('.house-panel').forEach(function (p) { p.hidden = true; });
      var target = document.getElementById(btn.getAttribute('data-target'));
      if (target) target.hidden = false;
    });
  });
})();
