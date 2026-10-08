// Rəngləmə guşəsi — 6 şəkil, hissə-hissə boyama. Client-only, heç bir data serverə getmir.
// Data: rengleme-data.js (window.RENGLEME_PICS/RENGLEME_PAL), port: design/Rengleme.dc.html.
(function () {
  'use strict';
  var canvas = document.getElementById('rg-canvas');
  if (!canvas) return;

  var PICS = window.RENGLEME_PICS || [];
  var PAL = window.RENGLEME_PAL || [];
  var i18nEl = document.getElementById('rg-i18n');
  var i18n = { pictureNames: {}, levels: {}, eraserLabel: 'Pozan', progressLabel: '' };
  if (i18nEl) { try { i18n = JSON.parse(i18nEl.textContent); } catch (e) {} }

  var thumbsWrap = document.getElementById('rg-thumbs');
  var paletteWrap = document.getElementById('rg-palette');
  var progressEl = document.getElementById('rg-progress');
  var finishedEl = document.getElementById('rg-finished');
  var downloadBtn = document.getElementById('rg-download');
  var undoBtn = document.getElementById('rg-undo');
  var sampleBtn = document.getElementById('rg-sample');
  var clearBtn = document.getElementById('rg-clear');

  var LEVEL_COLOR = { easy: '#7BC67E', medium: '#FFC23D', hard: '#E8682A' };
  var EMPTY_FILL = '#FFFFFF';

  var state = { picIndex: 0, colorIndex: 0, fills: {}, history: [] };

  function currentPic() { return PICS[state.picIndex]; }

  function renderCanvasPaths() {
    var pic = currentPic();
    canvas.innerHTML = '';
    pic.regions.forEach(function (region, i) {
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', region.d);
      path.setAttribute('fill', state.fills[region.id] || EMPTY_FILL);
      path.setAttribute('fill-rule', 'evenodd');
      path.setAttribute('stroke', '#1B2A4A');
      path.setAttribute('stroke-width', '3');
      path.setAttribute('stroke-linejoin', 'round');
      path.style.cursor = 'pointer';
      // Klaviatura dəstəyi: SVG <path> defolt fokuslanmır/aktivləşmir, əl ilə əlavə edirik.
      path.setAttribute('tabindex', '0');
      path.setAttribute('role', 'button');
      path.setAttribute('aria-label', 'Hissə ' + (i + 1));
      path.addEventListener('click', function () { paint(region.id); });
      path.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); paint(region.id); }
      });
      canvas.appendChild(path);
    });
  }

  function paint(regionId) {
    var prev = state.fills[regionId];
    var next = PAL[state.colorIndex][1];
    if (prev === next) return;
    state.history.push({ id: regionId, prev: prev });
    state.fills[regionId] = next;
    renderCanvasPaths();
    updateProgress();
  }

  function updateProgress() {
    var pic = currentPic();
    var done = pic.regions.filter(function (r) { return state.fills[r.id] && state.fills[r.id] !== EMPTY_FILL; }).length;
    var total = pic.regions.length;
    progressEl.textContent = done + ' / ' + total + ' ' + i18n.progressLabel;
    undoBtn.disabled = state.history.length === 0;
    undoBtn.style.opacity = state.history.length === 0 ? '.5' : '1';
    var finished = done === total;
    finishedEl.hidden = !finished;
  }

  function renderThumbs() {
    thumbsWrap.innerHTML = '';
    PICS.forEach(function (pic, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'rg-thumb' + (i === state.picIndex ? ' is-active' : '');
      btn.setAttribute('aria-label', i18n.pictureNames[pic.key] || pic.key);

      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 320 320');
      svg.classList.add('rg-thumb-svg');
      pic.regions.forEach(function (region) {
        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', region.d);
        path.setAttribute('fill', region.sample);
        path.setAttribute('fill-rule', 'evenodd');
        path.setAttribute('stroke', '#1B2A4A');
        path.setAttribute('stroke-width', '6');
        path.setAttribute('stroke-linejoin', 'round');
        svg.appendChild(path);
      });
      btn.appendChild(svg);

      var label = document.createElement('span');
      label.className = 'rg-thumb-label';
      label.textContent = i18n.pictureNames[pic.key] || pic.key;
      btn.appendChild(label);

      var level = document.createElement('span');
      level.className = 'rg-thumb-level';
      level.style.background = LEVEL_COLOR[pic.levelKey];
      level.textContent = i18n.levels[pic.levelKey] || pic.levelKey;
      btn.appendChild(level);

      btn.addEventListener('click', function () {
        if (state.picIndex === i) return;
        state.picIndex = i; state.fills = {}; state.history = [];
        renderThumbs(); renderCanvasPaths(); updateProgress();
      });
      thumbsWrap.appendChild(btn);
    });
  }

  function renderPalette() {
    paletteWrap.innerHTML = '';
    PAL.forEach(function (entry, i) {
      var name = entry[0], color = entry[1];
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'rg-swatch' + (i === state.colorIndex ? ' is-active' : '');
      btn.style.background = color;
      var isEraser = color.toUpperCase() === EMPTY_FILL;
      if (isEraser) { btn.classList.add('is-eraser'); btn.textContent = '⌫'; }
      btn.setAttribute('aria-label', isEraser ? i18n.eraserLabel : name);
      btn.addEventListener('click', function () {
        state.colorIndex = i;
        paletteWrap.querySelectorAll('.rg-swatch').forEach(function (b, bi) { b.classList.toggle('is-active', bi === i); });
      });
      paletteWrap.appendChild(btn);
    });
  }

  undoBtn.addEventListener('click', function () {
    if (!state.history.length) return;
    var last = state.history.pop();
    if (last.prev === undefined) delete state.fills[last.id]; else state.fills[last.id] = last.prev;
    renderCanvasPaths(); updateProgress();
  });

  sampleBtn.addEventListener('click', function () {
    var pic = currentPic();
    var fills = {};
    pic.regions.forEach(function (r) { fills[r.id] = r.sample; });
    state.fills = fills; state.history = [];
    renderCanvasPaths(); updateProgress();
  });

  clearBtn.addEventListener('click', function () {
    state.fills = {}; state.history = [];
    renderCanvasPaths(); updateProgress();
  });

  downloadBtn.addEventListener('click', function () {
    var xml = new XMLSerializer().serializeToString(canvas);
    var svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
    var url = URL.createObjectURL(svgBlob);
    var img = new Image();
    img.onload = function () {
      var scale = 3;
      var out = document.createElement('canvas');
      out.width = 320 * scale; out.height = 320 * scale;
      var ctx = out.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, out.width, out.height);
      ctx.drawImage(img, 0, 0, out.width, out.height);
      URL.revokeObjectURL(url);
      var a = document.createElement('a');
      a.href = out.toDataURL('image/png');
      var pic = currentPic();
      a.download = 'plastilin-sheheri-' + pic.key + '.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
    };
    img.src = url;
  });

  renderThumbs();
  renderCanvasPaths();
  renderPalette();
  updateProgress();
})();
