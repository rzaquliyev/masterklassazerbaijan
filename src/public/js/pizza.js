// Pizza bəzə — Mətbəx evi üçün sadə "malzemə qoy" oyunu. Client-only, data saxlanmır.
(function () {
  'use strict';
  var area = document.getElementById('pizza-area');
  if (!area) return;
  var svg = document.getElementById('pizza-svg');
  var toppingsLayer = document.getElementById('pizza-toppings');
  var palette = document.getElementById('pizza-palette');
  var counter = document.getElementById('pizza-counter');
  var undoBtn = document.getElementById('pizza-undo');
  var clearBtn = document.getElementById('pizza-clear');
  var i18nEl = document.getElementById('pizza-i18n');
  var i18n = { toppings: ['Pomidor', 'Göbələk', 'Zeytun', 'Bibər', 'Pendir'], placedLabel: '' };
  if (i18nEl) { try { i18n = JSON.parse(i18nEl.textContent); } catch (e) {} }

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var CENTER = { x: 160, y: 160 };
  var RADIUS = 128; // pizzanın pendir dairəsindən (132) bir az kiçik — malzemə kənara çıxmasın

  // Hər forma (0,0) mərkəzli, ~10-11 radiuslu sadə SVG elementlər massividir.
  var SHAPES = [
    function () { // Pomidor
      return [
        ['circle', { cx: 0, cy: 0, r: 10, fill: '#E8682A' }],
        ['circle', { cx: -3, cy: -3, r: 3, fill: '#F2946A' }],
      ];
    },
    function () { // Göbələk
      return [
        ['ellipse', { cx: 0, cy: 0, rx: 11, ry: 8, fill: '#D9B38C' }],
        ['circle', { cx: -3, cy: -1, r: 1.6, fill: '#FBEFDD' }],
        ['circle', { cx: 3, cy: 2, r: 1.6, fill: '#FBEFDD' }],
      ];
    },
    function () { // Zeytun
      return [
        ['circle', { cx: 0, cy: 0, r: 8, fill: '#3B2E2A' }],
        ['circle', { cx: 0, cy: 0, r: 3.4, fill: '#FFD966' }],
      ];
    },
    function () { // Bibər
      return [
        ['circle', { cx: 0, cy: 0, r: 9, fill: 'none', stroke: '#5FA85A', 'stroke-width': 4 }],
      ];
    },
    function () { // Pendir
      return [
        ['circle', { cx: -3, cy: -2, r: 3, fill: '#FFC23D' }],
        ['circle', { cx: 3, cy: 1, r: 3, fill: '#FFC23D' }],
        ['circle', { cx: 0, cy: -4, r: 2.4, fill: '#FFE08A' }],
      ];
    },
  ];

  function buildShapeGroup(typeIndex) {
    var g = document.createElementNS(SVG_NS, 'g');
    SHAPES[typeIndex]().forEach(function (entry) {
      var el = document.createElementNS(SVG_NS, entry[0]);
      Object.keys(entry[1]).forEach(function (k) { el.setAttribute(k, entry[1][k]); });
      g.appendChild(el);
    });
    return g;
  }

  var state = { selected: 0, toppings: [] };

  function renderPalette() {
    palette.innerHTML = '';
    i18n.toppings.forEach(function (name, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pizza-topping-btn' + (i === state.selected ? ' is-active' : '');
      btn.setAttribute('aria-label', name);
      var iconSvg = document.createElementNS(SVG_NS, 'svg');
      iconSvg.setAttribute('viewBox', '-12 -12 24 24');
      iconSvg.appendChild(buildShapeGroup(i));
      btn.appendChild(iconSvg);
      btn.addEventListener('click', function () {
        state.selected = i;
        palette.querySelectorAll('.pizza-topping-btn').forEach(function (b, bi) { b.classList.toggle('is-active', bi === i); });
      });
      palette.appendChild(btn);
    });
  }

  function renderToppings() {
    toppingsLayer.innerHTML = '';
    state.toppings.forEach(function (t) {
      var g = buildShapeGroup(t.type);
      g.setAttribute('transform', 'translate(' + t.x + ',' + t.y + ') rotate(' + t.rotation + ')');
      g.setAttribute('class', 'pizza-topping');
      toppingsLayer.appendChild(g);
    });
    counter.textContent = state.toppings.length + ' ' + i18n.placedLabel;
    undoBtn.disabled = state.toppings.length === 0;
    undoBtn.style.opacity = state.toppings.length === 0 ? '.5' : '1';
  }

  function svgPoint(evt) {
    var pt = svg.createSVGPoint();
    pt.x = evt.clientX; pt.y = evt.clientY;
    var ctm = svg.getScreenCTM();
    if (!ctm) return null;
    return pt.matrixTransform(ctm.inverse());
  }

  svg.addEventListener('pointerdown', function (e) {
    var p = svgPoint(e);
    if (!p) return;
    var dx = p.x - CENTER.x, dy = p.y - CENTER.y;
    if (Math.sqrt(dx * dx + dy * dy) > RADIUS) return;
    state.toppings.push({ type: state.selected, x: p.x, y: p.y, rotation: Math.round(Math.random() * 360) });
    renderToppings();
  });

  undoBtn.addEventListener('click', function () {
    state.toppings.pop();
    renderToppings();
  });

  clearBtn.addEventListener('click', function () {
    state.toppings = [];
    renderToppings();
  });

  renderPalette();
  renderToppings();
})();
