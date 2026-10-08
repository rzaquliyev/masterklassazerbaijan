(function () {
  'use strict';

  // ---- Yol xəritəsi: maşın yolu bir dəfə, scroll ilə keçir ----
  var roadmapSection = document.getElementById('roadmap');
  var roadmapCar = document.getElementById('roadmap-car');
  if (roadmapSection && roadmapCar && !window.__reduceMotion && 'IntersectionObserver' in window) {
    var anim = roadmapCar.querySelector('animateMotion');
    if (anim && typeof anim.beginElement === 'function') {
      var triggered = false;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !triggered) {
            triggered = true;
            try { anim.beginElement(); } catch (e) { /* SMIL dəstəklənmirsə, maşın yolun başında qalır */ }
            io.disconnect();
          }
        });
      }, { threshold: 0.4 });
      io.observe(roadmapSection);
    }
  }

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
