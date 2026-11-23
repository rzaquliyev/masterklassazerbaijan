// Ortaq hərəkət modulu (bütün səhifələrdə). Qaydalar üçün bax src/public/css/motion.css başlığı.
// prefers-reduced-motion: reduce olanda heç nə etmir — məzmun statik və tam görünən qalır.
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var api = { reduce: reduce, confetti: function () {} };
  window.MKMotion = api;
  if (reduce) return;

  document.documentElement.classList.add('js-motion');

  // ---- Ardıcıllıq: [data-stagger] qrupunun uşaqlarına indeks + reveal ----
  document.querySelectorAll('[data-stagger]').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.style.setProperty('--i', Math.min(i, 8));
      if (!child.hasAttribute('data-reveal')) child.setAttribute('data-reveal', '');
    });
  });
  document.querySelectorAll('.menu-list li').forEach(function (li, i) { li.style.setProperty('--i', i); });

  // ---- Görünəndə bir dəfə .is-in ----
  var targets = document.querySelectorAll('[data-reveal], [data-anim]');
  function markIn(el) {
    el.classList.add('is-in');
    var c = el.getAttribute('data-confetti');
    if (c !== null) setTimeout(function () { api.confetti(el); }, Number(c) || 0);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { markIn(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(markIn);
  }

  // ---- Toxunanda yenidən 1 tur (dekorativ elementlər) ----
  function replay(el) {
    el.classList.remove('is-in');
    el.style.animationIterationCount = '1';
    void el.offsetWidth; // reflow — animasiya yenidən başlasın
    el.classList.add('is-in');
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-replay]');
    if (!el) return;
    (el.hasAttribute('data-anim') ? [el] : el.querySelectorAll('[data-anim]')).forEach(replay);
  });

  // ---- Plastilin "squish" ----
  var SQUISH = '.btn-primary, .btn-secondary, .btn-dark, .btn-nav, .pill, .day-tab, .menu-btn, .town-house, .candle, [data-squish]';
  document.addEventListener('pointerdown', function (e) {
    var el = e.target.closest && e.target.closest(SQUISH);
    if (!el || el.disabled) return;
    el.classList.remove('is-squish');
    void el.offsetWidth;
    el.classList.add('is-squish');
  });
  document.addEventListener('animationend', function (e) {
    if (e.animationName === 'mSquish') e.target.classList.remove('is-squish');
  });

  // ---- 3D əyilmə (yalnız dəqiq göstərici + hover olan cihazlarda) ----
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('[data-tilt]').forEach(function (el) {
      var max = Number(el.getAttribute('data-tilt')) || 8;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.classList.add('is-tilting');
        el.style.setProperty('--ry', (px * max * 2).toFixed(2) + 'deg');
        el.style.setProperty('--rx', (-py * max * 2).toFixed(2) + 'deg');
      });
      el.addEventListener('pointerleave', function () {
        el.classList.remove('is-tilting');
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    });
  }

  // ---- Konfeti: host elementin üstünə ~28 parça, 2 saniyədən sonra silinir ----
  var COLORS = ['#CC4B1A', '#FFB830', '#52B788', '#5BA4E8', '#F27A9E', '#FFE39B'];
  api.confetti = function (host, count) {
    if (!host) return;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    var layer = document.createElement('div');
    layer.className = 'confetti-layer';
    layer.setAttribute('aria-hidden', 'true');
    var n = count || 28;
    var h = Math.max(host.offsetHeight, 220);
    for (var i = 0; i < n; i++) {
      var p = document.createElement('span');
      p.className = 'confetti-piece';
      p.style.left = (5 + Math.random() * 90) + '%';
      p.style.background = COLORS[i % COLORS.length];
      p.style.setProperty('--x', Math.round((Math.random() - 0.5) * 120) + 'px');
      p.style.setProperty('--y', Math.round(h * (0.6 + Math.random() * 0.5)) + 'px');
      p.style.setProperty('--r', Math.round(180 + Math.random() * 540) * (Math.random() < 0.5 ? -1 : 1) + 'deg');
      p.style.setProperty('--d', (Math.random() * 0.35).toFixed(2) + 's');
      p.style.setProperty('--t', (1.2 + Math.random() * 0.8).toFixed(2) + 's');
      if (i % 3 === 0) p.style.borderRadius = '50%';
      layer.appendChild(p);
    }
    host.appendChild(layer);
    setTimeout(function () { layer.remove(); }, 2600);
  };
})();
