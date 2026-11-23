// "Fiqur düzəlt" — plastilin fiqur konstruktoru. Client-only, heç nə göndərilmir/saxlanmır.
// Hissəyə toxunanda fiqura əlavə olunur (hər qrupdan biri), sürükləmə/ox düymələri ilə yeri dəyişir.
// Göz + ağız olan kimi fiqur "canlanır": 3 dəfə hoppanır, göz qırpır, əl yelləyir.
(function () {
  'use strict';
  var game = document.getElementById('figure-game');
  if (!game) return;

  var NS = 'http://www.w3.org/2000/svg';
  var svg = document.getElementById('figure-svg');
  var stage = document.getElementById('figure-stage');
  var bubble = document.getElementById('figure-bubble');
  var colorsEl = document.getElementById('figure-colors');
  var partsEl = document.getElementById('figure-parts');
  var groupNames = JSON.parse(partsEl.getAttribute('data-groups') || '{}');
  var NIGHT = '#1B2A4A';

  var BODY_COLORS = ['#FFB830', '#5BA4E8', '#52B788', '#F27A9E', '#CC4B1A', '#FFE39B'];
  var bodyColor = BODY_COLORS[0];

  // Hər hissə: qrup, defolt mövqe, SVG markup (0,0 mərkəzli), önizləmə viewBox
  var PARTS = [
    { id: 'eyes-round', slot: 'eyes', x: 150, y: 172, vb: '-60 -35 120 70',
      svg: '<g class="fig-eye"><circle cx="-28" r="18" fill="#fff" stroke="' + NIGHT + '" stroke-width="3"/><circle cx="-24" cy="3" r="8" fill="' + NIGHT + '"/><circle cx="-21" cy="-1" r="2.5" fill="#fff"/></g>' +
           '<g class="fig-eye"><circle cx="28" r="18" fill="#fff" stroke="' + NIGHT + '" stroke-width="3"/><circle cx="32" cy="3" r="8" fill="' + NIGHT + '"/><circle cx="35" cy="-1" r="2.5" fill="#fff"/></g>' },
    { id: 'eyes-happy', slot: 'eyes', x: 150, y: 172, vb: '-60 -35 120 70',
      svg: '<g class="fig-eye" fill="none" stroke="' + NIGHT + '" stroke-width="6" stroke-linecap="round"><path d="M-42 6 Q-28 -12 -14 6"/><path d="M14 6 Q28 -12 42 6"/></g>' },
    { id: 'eyes-one', slot: 'eyes', x: 150, y: 168, vb: '-60 -40 120 80',
      svg: '<g class="fig-eye"><circle r="28" fill="#fff" stroke="' + NIGHT + '" stroke-width="3"/><circle cx="4" cy="4" r="13" fill="' + NIGHT + '"/><circle cx="9" cy="-2" r="4" fill="#fff"/></g>' },
    { id: 'mouth-smile', slot: 'mouth', x: 150, y: 236, vb: '-40 -25 80 50',
      svg: '<path d="M-26 -4 Q0 24 26 -4" fill="none" stroke="' + NIGHT + '" stroke-width="6" stroke-linecap="round"/>' },
    { id: 'mouth-open', slot: 'mouth', x: 150, y: 236, vb: '-40 -25 80 50',
      svg: '<path d="M-24 -8 Q0 34 24 -8 Z" fill="' + NIGHT + '"/><ellipse cx="0" cy="10" rx="10" ry="6" fill="#F27A9E"/>' },
    { id: 'mouth-o', slot: 'mouth', x: 150, y: 238, vb: '-40 -25 80 50',
      svg: '<ellipse rx="11" ry="14" fill="' + NIGHT + '"/><ellipse cy="5" rx="6" ry="5" fill="#F27A9E"/>' },
    { id: 'nose-ball', slot: 'nose', x: 150, y: 205, vb: '-30 -30 60 60',
      svg: '<circle r="11" fill="#CC4B1A"/><circle cx="-4" cy="-4" r="3.5" fill="rgba(255,255,255,.5)"/>' },
    { id: 'nose-carrot', slot: 'nose', x: 150, y: 205, vb: '-30 -30 60 60',
      svg: '<path d="M-8 -7 L26 0 L-8 7 Z" fill="#F08A24" stroke="#93330F" stroke-width="2" stroke-linejoin="round"/>' },
    { id: 'hat-party', slot: 'hat', x: 150, y: 100, vb: '-50 -85 100 100',
      svg: '<path d="M-32 0 L0 -72 L32 0 Z" fill="#F27A9E"/><path d="M-22 -22 L22 -22 M-13 -44 L13 -44" stroke="#FFE39B" stroke-width="6" stroke-linecap="round"/><circle cy="-74" r="9" fill="#FFB830"/>' },
    { id: 'hat-chef', slot: 'hat', x: 150, y: 100, vb: '-50 -85 100 100',
      svg: '<rect x="-30" y="-14" width="60" height="18" rx="5" fill="#fff" stroke="#EAD9BE" stroke-width="3"/><circle cx="-18" cy="-30" r="18" fill="#fff"/><circle cx="16" cy="-32" r="20" fill="#fff"/><circle cy="-46" r="18" fill="#fff"/>' },
    { id: 'hat-bow', slot: 'hat', x: 196, y: 112, vb: '-40 -30 80 60',
      svg: '<path d="M0 0 L-30 -18 L-30 18 Z M0 0 L30 -18 L30 18 Z" fill="#CC4B1A" stroke="#93330F" stroke-width="2" stroke-linejoin="round"/><circle r="8" fill="#93330F"/>' },
    { id: 'arms-sticks', slot: 'arms', x: 150, y: 212, vb: '-135 -60 270 90', back: true,
      svg: '<g stroke="#8A5A3B" stroke-width="8" stroke-linecap="round" fill="none"><path d="M-80 0 L-122 -34"/></g><circle cx="-124" cy="-36" r="10" fill="#8A5A3B"/>' +
           '<g class="fig-wave"><path d="M80 0 L122 -34" stroke="#8A5A3B" stroke-width="8" stroke-linecap="round"/><circle cx="124" cy="-36" r="10" fill="#8A5A3B"/></g>' },
    { id: 'arms-clay', slot: 'arms', x: 150, y: 214, vb: '-135 -60 270 90', back: true,
      svg: '<ellipse cx="-96" cy="-6" rx="30" ry="16" fill="currentColor" stroke="rgba(0,0,0,.18)" stroke-width="3" transform="rotate(-25 -96 -6)"/>' +
           '<g class="fig-wave"><ellipse cx="96" cy="-6" rx="30" ry="16" fill="currentColor" stroke="rgba(0,0,0,.18)" stroke-width="3" transform="rotate(25 96 -6)"/></g>' },
  ];

  var placed = {};      // slot -> <g>
  var selected = null;
  var wasAlive = false;

  // ---- SVG skeleti: qollar (arxada), bədən, üz hissələri ----
  svg.innerHTML = '';
  var root = el('g', { id: 'fig-root' });
  var backLayer = el('g', {});
  var bodyG = el('g', {});
  var frontLayer = el('g', {});
  bodyG.innerHTML =
    '<ellipse cx="118" cy="300" rx="26" ry="12" fill="currentColor" stroke="rgba(0,0,0,.2)" stroke-width="3"/>' +
    '<ellipse cx="182" cy="300" rx="26" ry="12" fill="currentColor" stroke="rgba(0,0,0,.2)" stroke-width="3"/>' +
    '<path d="M150 92 C 214 92 240 150 238 205 C 236 262 200 298 150 298 C 100 298 64 262 62 205 C 60 150 86 92 150 92 Z" fill="currentColor"/>' +
    '<path d="M74 238 C 92 286 208 286 226 238 C 214 292 86 294 74 238 Z" fill="rgba(0,0,0,.12)"/>' +
    '<ellipse cx="112" cy="138" rx="24" ry="14" fill="rgba(255,255,255,.38)" transform="rotate(-25 112 138)"/>';
  root.appendChild(backLayer); root.appendChild(bodyG); root.appendChild(frontLayer);
  svg.appendChild(root);
  svg.style.color = bodyColor;

  function el(name, attrs) {
    var n = document.createElementNS(NS, name);
    Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }

  // ---- Bədən rəngi düymələri ----
  BODY_COLORS.forEach(function (c, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'color-btn'; b.style.background = c;
    b.setAttribute('data-squish', '');
    b.setAttribute('aria-label', colorsEl.getAttribute('aria-label') + ' ' + (i + 1));
    b.setAttribute('aria-pressed', String(c === bodyColor));
    b.addEventListener('click', function () {
      bodyColor = c; svg.style.color = c;
      colorsEl.querySelectorAll('.color-btn').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    });
    colorsEl.appendChild(b);
  });

  // ---- Hissə düymələri (qruplar üzrə) ----
  ['eyes', 'mouth', 'nose', 'hat', 'arms'].forEach(function (slot) {
    var wrap = document.createElement('div');
    var label = document.createElement('div');
    label.className = 'part-group-label'; label.textContent = groupNames[slot] || slot;
    var row = document.createElement('div');
    row.className = 'part-row'; row.setAttribute('role', 'group'); row.setAttribute('aria-label', label.textContent);
    PARTS.filter(function (p) { return p.slot === slot; }).forEach(function (p, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'part-btn'; b.setAttribute('data-squish', ''); b.setAttribute('data-part', p.id);
      b.setAttribute('aria-label', label.textContent + ' ' + (i + 1)); b.setAttribute('aria-pressed', 'false');
      b.style.color = bodyColor;
      b.innerHTML = '<svg viewBox="' + p.vb + '" aria-hidden="true">' + p.svg + '</svg>';
      b.addEventListener('click', function () { addPart(p); });
      row.appendChild(b);
    });
    wrap.appendChild(label); wrap.appendChild(row);
    partsEl.appendChild(wrap);
  });

  function syncButtons() {
    partsEl.querySelectorAll('.part-btn').forEach(function (b) {
      var p = PARTS.filter(function (x) { return x.id === b.getAttribute('data-part'); })[0];
      var g = placed[p.slot];
      b.setAttribute('aria-pressed', String(!!g && g.getAttribute('data-part') === p.id));
      b.style.color = bodyColor;
    });
  }

  function addPart(p) {
    var old = placed[p.slot];
    var x = p.x, y = p.y;
    if (old) {
      // eyni qrupdan yenisi köhnəsinin yerini götürür
      x = Number(old.getAttribute('data-x')); y = Number(old.getAttribute('data-y'));
      old.remove();
      if (old.getAttribute('data-part') === p.id) { delete placed[p.slot]; select(null); syncButtons(); return; }
    }
    var g = el('g', { 'class': 'fig-part is-new', 'data-part': p.id, 'data-slot': p.slot });
    g.innerHTML = p.svg;
    setPos(g, x, y);
    (p.back ? backLayer : frontLayer).appendChild(g);
    g.addEventListener('animationend', function () { g.classList.remove('is-new'); });
    placed[p.slot] = g;
    select(g);
    syncButtons();
    checkAlive();
  }

  function setPos(g, x, y) {
    x = Math.max(20, Math.min(280, x)); y = Math.max(20, Math.min(330, y));
    g.setAttribute('data-x', x); g.setAttribute('data-y', y);
    g.setAttribute('transform', 'translate(' + x + ' ' + y + ')');
  }

  function select(g) {
    if (selected) selected.classList.remove('is-selected');
    selected = g;
    if (g) g.classList.add('is-selected');
  }

  function checkAlive() {
    var alive = !!(placed.eyes && placed.mouth);
    if (alive && !wasAlive) {
      stage.classList.remove('is-alive'); void stage.offsetWidth; stage.classList.add('is-alive');
      bubble.textContent = game.getAttribute('data-alive');
      bubble.hidden = false;
      setTimeout(function () { bubble.hidden = true; }, 3500);
      if (window.MKMotion) window.MKMotion.confetti(stage, 30);
    }
    wasAlive = alive;
  }

  // ---- Sürükləmə ----
  var drag = null;
  function svgPoint(e) {
    var pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }
  svg.addEventListener('pointerdown', function (e) {
    var g = e.target.closest && e.target.closest('.fig-part');
    if (!g) { select(null); return; }
    select(g);
    var p = svgPoint(e);
    drag = { g: g, dx: p.x - Number(g.getAttribute('data-x')), dy: p.y - Number(g.getAttribute('data-y')) };
    g.classList.add('is-dragging');
    svg.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  svg.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var p = svgPoint(e);
    setPos(drag.g, p.x - drag.dx, p.y - drag.dy);
  });
  function endDrag() { if (drag) { drag.g.classList.remove('is-dragging'); drag = null; } }
  svg.addEventListener('pointerup', endDrag);
  svg.addEventListener('pointercancel', endDrag);

  // ---- Klaviatura: seçilmiş hissəni oxlarla hərəkət etdir, Delete ilə sil ----
  svg.addEventListener('keydown', function (e) {
    if (!selected) return;
    var x = Number(selected.getAttribute('data-x')), y = Number(selected.getAttribute('data-y'));
    var step = e.shiftKey ? 16 : 6;
    if (e.key === 'ArrowLeft') x -= step; else if (e.key === 'ArrowRight') x += step;
    else if (e.key === 'ArrowUp') y -= step; else if (e.key === 'ArrowDown') y += step;
    else if (e.key === 'Delete' || e.key === 'Backspace') {
      delete placed[selected.getAttribute('data-slot')]; selected.remove(); selected = null; syncButtons(); wasAlive = !!(placed.eyes && placed.mouth); e.preventDefault(); return;
    } else return;
    e.preventDefault();
    setPos(selected, x, y);
  });

  // ---- Təmizlə ----
  document.getElementById('figure-clear').addEventListener('click', function () {
    Object.keys(placed).forEach(function (k) { placed[k].remove(); });
    placed = {}; select(null); wasAlive = false;
    stage.classList.remove('is-alive'); bubble.hidden = true;
    syncButtons();
  });

  // ---- PNG yüklə (SVG → Blob URL → <img> → canvas; CSP img-src 'blob:' icazəlidir) ----
  document.getElementById('figure-download').addEventListener('click', function () {
    var clone = svg.cloneNode(true);
    clone.setAttribute('xmlns', NS);
    clone.setAttribute('width', '600'); clone.setAttribute('height', '680');
    clone.setAttribute('style', 'color:' + bodyColor);
    clone.querySelectorAll('.is-selected').forEach(function (n) { n.classList.remove('is-selected'); });
    var bg = document.createElementNS(NS, 'rect');
    bg.setAttribute('width', '300'); bg.setAttribute('height', '340'); bg.setAttribute('fill', '#FFF4E2');
    clone.insertBefore(bg, clone.firstChild);
    var blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' });
    var url = URL.createObjectURL(blob);
    var img = new Image();
    img.onload = function () {
      var c = document.createElement('canvas'); c.width = 600; c.height = 680;
      c.getContext('2d').drawImage(img, 0, 0, 600, 680);
      URL.revokeObjectURL(url);
      c.toBlob(function (png) {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(png); a.download = 'plastilin-fiqur.png';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      }, 'image/png');
    };
    img.src = url;
  });

  syncButtons();
})();
