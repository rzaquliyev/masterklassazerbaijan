(function () {
  'use strict';

  // ---- Yol xəritəsi: maşın yolu bir dəfə, scroll ilə keçir ----
  // SMIL animateMotion əvəzinə birbaşa path.getPointAtLength() istifadə olunur —
  // beləcə maşının mövqeyi həmişə görünən yolun öz koordinatları ilə üst-üstə düşür,
  // ayrıca "transform" qatının toplanması ilə bağlı brauzer fərqlərindən asılı olmur.
  var roadmapSection = document.getElementById('roadmap');
  var roadmapCar = document.getElementById('roadmap-car');
  var roadmapPath = document.querySelector('.roadmap-road-base');
  if (roadmapSection && roadmapCar && roadmapPath && !window.__reduceMotion && 'IntersectionObserver' in window && typeof roadmapPath.getPointAtLength === 'function') {
    var triggered = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !triggered) {
          triggered = true;
          driveCarAlongRoad(roadmapPath, roadmapCar, 3200);
          io.disconnect();
        }
      });
    }, { threshold: 0.4 });
    io.observe(roadmapSection);
  }

  function driveCarAlongRoad(path, car, durationMs) {
    var total = path.getTotalLength();
    var startTime = null;
    function frame(now) {
      if (startTime === null) startTime = now;
      var t = Math.min((now - startTime) / durationMs, 1);
      var eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      var dist = eased * total;
      var p = path.getPointAtLength(dist);
      var ahead = path.getPointAtLength(Math.min(dist + 1, total));
      var angle = Math.atan2(ahead.y - p.y, ahead.x - p.x) * (180 / Math.PI);
      car.setAttribute('transform', 'translate(' + p.x + ',' + p.y + ') rotate(' + angle + ')');
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
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
