// Plastilin yoğur — Pointer Events ilə dartma/sıxma fizikası. Port: design/Yogur.dc.html.
(function () {
  'use strict';
  var area = document.getElementById('yogur-area');
  if (!area) return;
  var blob = document.getElementById('yogur-blob');
  var shadow = document.getElementById('yogur-shadow');
  var face = document.getElementById('yogur-face');
  var mouth = document.getElementById('yogur-mouth');
  var hint = document.getElementById('yogur-hint');
  var counter = document.getElementById('squeeze-counter');
  var colorsWrap = document.getElementById('yogur-colors');
  var shapesWrap = document.getElementById('yogur-shapes');
  var toggleFaceBtn = document.getElementById('yogur-toggle-face');
  var resetBtn = document.getElementById('yogur-reset');
  var i18nEl = document.getElementById('yogur-i18n');
  var i18n = { colors: [], shapes: [], hintPress: '', hintDrag: '', addFace: '', hideFace: '', squeezes: '' };
  if (i18nEl) { try { i18n = JSON.parse(i18nEl.textContent); } catch (e) {} }

  var SHAPE_RADII = ['50%', '50% 50% 50% 50% / 60% 60% 40% 40%', '18%', '50% 50% 50% 50% / 64% 64% 36% 36%'];

  var state = { dx: 0, dy: 0, pressing: false, color: 0, shape: 0, face: false, n: 0 };
  var start = null;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function render() {
    var col = i18n.colors[state.color][1];
    var sx = 1 + clamp(Math.abs(state.dx) / 160, 0, 0.9) - clamp(Math.abs(state.dy) / 320, 0, 0.35);
    var sy = 1 + clamp(Math.abs(state.dy) / 160, 0, 0.9) - clamp(Math.abs(state.dx) / 320, 0, 0.35);
    if (state.pressing && Math.abs(state.dx) < 6 && Math.abs(state.dy) < 6) { sx = 1.12; sy = 0.86; }
    var tx = clamp(state.dx * 0.35, -70, 70), ty = clamp(state.dy * 0.35, -70, 70);
    var transition = state.pressing ? 'transform .06s linear, border-radius .3s' : 'transform .6s cubic-bezier(.25,1.8,.45,1), border-radius .3s';

    blob.style.background = col;
    blob.style.borderRadius = SHAPE_RADII[state.shape];
    blob.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + sx.toFixed(3) + ',' + sy.toFixed(3) + ')';
    blob.style.transition = transition;

    shadow.style.transform = 'translateX(' + tx + 'px) scaleX(' + sx.toFixed(3) + ')';
    shadow.style.transition = transition;

    face.hidden = !state.face;
    if (state.face) {
      mouth.style.height = (state.pressing ? 26 : 14) + 'px';
      mouth.style.borderRadius = state.pressing ? '50%' : '0 0 18px 18px';
    }

    hint.textContent = state.pressing ? i18n.hintDrag : i18n.hintPress;
    counter.textContent = state.n + ' ' + i18n.squeezes;
    toggleFaceBtn.textContent = state.face ? i18n.hideFace : i18n.addFace;
  }

  area.addEventListener('pointerdown', function (e) {
    try { area.setPointerCapture(e.pointerId); } catch (err) {}
    start = { x: e.clientX, y: e.clientY };
    state.pressing = true; state.dx = 0; state.dy = 0;
    render();
  });
  area.addEventListener('pointermove', function (e) {
    if (!start) return;
    state.dx = e.clientX - start.x; state.dy = e.clientY - start.y;
    render();
  });
  function release() {
    if (!start) return;
    start = null;
    state.pressing = false; state.dx = 0; state.dy = 0; state.n++;
    render();
  }
  area.addEventListener('pointerup', release);
  area.addEventListener('pointercancel', release);
  area.addEventListener('pointerleave', function () { if (state.pressing) release(); });

  // Klaviatura ilə: ox düymələri ilə sıxma simulyasiyası (toxunma/siçansız istifadəçilər üçün).
  area.addEventListener('keydown', function (e) {
    var step = 40;
    if (e.key === 'ArrowLeft') { state.dx -= step; } else if (e.key === 'ArrowRight') { state.dx += step; }
    else if (e.key === 'ArrowUp') { state.dy -= step; } else if (e.key === 'ArrowDown') { state.dy += step; }
    else if (e.key === 'Enter' || e.key === ' ') { state.n++; state.dx = 0; state.dy = 0; }
    else return;
    e.preventDefault();
    render();
  });

  i18n.colors.forEach(function (c, i) {
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'yogur-color-btn' + (i === 0 ? ' is-active' : '');
    btn.style.background = c[1]; btn.setAttribute('aria-label', c[0]);
    btn.addEventListener('click', function () {
      state.color = i;
      colorsWrap.querySelectorAll('.yogur-color-btn').forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      render();
    });
    colorsWrap.appendChild(btn);
  });

  i18n.shapes.forEach(function (name, i) {
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'pill' + (i === 0 ? ' is-active' : '');
    btn.textContent = name;
    btn.addEventListener('click', function () {
      state.shape = i;
      shapesWrap.querySelectorAll('.pill').forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      render();
    });
    shapesWrap.appendChild(btn);
  });

  toggleFaceBtn.addEventListener('click', function () { state.face = !state.face; render(); });
  resetBtn.addEventListener('click', function () {
    state = { dx: 0, dy: 0, pressing: false, color: 0, shape: 0, face: false, n: 0 };
    colorsWrap.querySelectorAll('.yogur-color-btn').forEach(function (b, i) { b.classList.toggle('is-active', i === 0); });
    shapesWrap.querySelectorAll('.pill').forEach(function (b, i) { b.classList.toggle('is-active', i === 0); });
    render();
  });

  render();
})();
