// "Rəngli toplar" — tutma oyunu. Client-only; yalnız rekord brauzerin localStorage-ində saxlanır.
// Hər rəngin içində öz forması var (dairə/kvadrat/üçbucaq/romb/artı) — rəngləri ayırd etməyən uşaq üçün.
(function () {
  'use strict';
  var root = document.getElementById('catch-game');
  if (!root) return;

  var canvas = document.getElementById('catch-canvas');
  var ctx = canvas.getContext('2d');
  var overlay = document.getElementById('catch-overlay');
  var overlayTitle = document.getElementById('catch-overlay-title');
  var overlaySub = document.getElementById('catch-overlay-sub');
  var startBtn = document.getElementById('catch-start');
  var scoreEl = document.getElementById('catch-score');
  var livesEl = document.getElementById('catch-lives');
  var bestEl = document.getElementById('catch-best');
  var swatch = document.getElementById('catch-swatch');
  var targetName = document.getElementById('catch-target-name');
  var live = document.getElementById('catch-live');
  var names = JSON.parse(root.getAttribute('data-colors') || '{}');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var COLORS = [
    { id: 'orange', hex: '#CC4B1A', deep: '#93330F', sym: 'circle' },
    { id: 'blue', hex: '#5BA4E8', deep: '#3779C4', sym: 'square' },
    { id: 'green', hex: '#52B788', deep: '#378A63', sym: 'triangle' },
    { id: 'pink', hex: '#F27A9E', deep: '#C4527A', sym: 'diamond' },
    { id: 'sun', hex: '#FFB830', deep: '#C98A12', sym: 'plus' },
  ];

  var W = 0, H = 0, dpr = 1;
  var basket = { x: 0, w: 110, h: 46, vx: 0 };
  var balls = [], bits = [];
  var target, score, lives, level, spawnIn, running = false, lastT = 0, shake = 0;
  var keys = { left: false, right: false };

  function readBest() { try { return Number(localStorage.getItem('mk-catch-best')) || 0; } catch (e) { return 0; } }
  function writeBest(n) { try { localStorage.setItem('mk-catch-best', String(n)); } catch (e) { /* gizli rejim */ } }
  bestEl.textContent = readBest();

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    basket.w = Math.max(90, Math.min(140, W * 0.26));
    if (!basket.x) basket.x = W / 2;
    basket.x = Math.max(basket.w / 2, Math.min(W - basket.w / 2, basket.x));
    if (!running) draw();
  }

  function setTarget(c) {
    target = c;
    swatch.style.setProperty('--sw', c.hex);
    swatch.style.setProperty('--sw-deep', c.deep);
    swatch.setAttribute('data-sym', c.sym);
    targetName.textContent = names[c.id] || c.id;
  }
  function renderLives() { livesEl.textContent = '♥♥♥'.slice(0, lives) + '♡♡♡'.slice(0, 3 - lives); livesEl.setAttribute('aria-label', String(lives)); }
  function say(text) { live.textContent = text; }

  function start() {
    score = 0; lives = 3; level = 0; balls = []; bits = []; spawnIn = 0.6; shake = 0;
    setTarget(COLORS[Math.floor(Math.random() * COLORS.length)]);
    scoreEl.textContent = '0'; renderLives();
    overlay.hidden = true; running = true; lastT = 0;
    canvas.focus();
    requestAnimationFrame(loop);
  }

  function gameOver() {
    running = false;
    var best = readBest();
    var isBest = score > best;
    if (isBest) { writeBest(score); bestEl.textContent = score; }
    overlayTitle.textContent = root.getAttribute('data-over-score').replace('{n}', score);
    overlaySub.textContent = isBest ? root.getAttribute('data-new-best') : '';
    startBtn.textContent = startBtn.getAttribute('data-again');
    overlay.hidden = false;
    say(overlayTitle.textContent + ' ' + overlaySub.textContent);
    if (isBest && window.MKMotion) window.MKMotion.confetti(root.querySelector('.catch-stage'), 40);
    startBtn.focus();
  }

  function spawn() {
    var speedBase = (reduce ? 110 : 140) + level * 22;
    // Hədəf rəng təxminən 45% — oyun ədalətli qalsın
    var c = Math.random() < 0.45 ? target : COLORS[Math.floor(Math.random() * COLORS.length)];
    var r = Math.max(16, Math.min(24, W * 0.05));
    balls.push({ x: r + Math.random() * (W - 2 * r), y: -r, r: r, c: c, vy: speedBase + Math.random() * 60, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 2 });
  }

  function burst(x, y, color) {
    if (reduce) return;
    for (var i = 0; i < 10; i++) {
      var a = Math.random() * Math.PI * 2, s = 80 + Math.random() * 140;
      bits.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 60, life: 0.6, c: color });
    }
  }

  function loop(t) {
    if (!running) return;
    if (!lastT) lastT = t;
    var dt = Math.min(0.05, (t - lastT) / 1000);
    lastT = t;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  function update(dt) {
    var kSpeed = 420;
    if (keys.left) basket.x -= kSpeed * dt;
    if (keys.right) basket.x += kSpeed * dt;
    basket.x = Math.max(basket.w / 2, Math.min(W - basket.w / 2, basket.x));

    spawnIn -= dt;
    if (spawnIn <= 0) { spawn(); spawnIn = Math.max(0.38, 1.0 - level * 0.08) * (0.7 + Math.random() * 0.6); }

    var top = H - basket.h - 18;
    for (var i = balls.length - 1; i >= 0; i--) {
      var b = balls[i];
      b.y += b.vy * dt; b.rot += b.vr * dt;
      var inX = Math.abs(b.x - basket.x) < basket.w / 2;
      if (b.y + b.r >= top && b.y - b.r < top + 14 && inX) {
        balls.splice(i, 1);
        if (b.c === target) {
          score++; scoreEl.textContent = score; burst(b.x, top, b.c.hex);
          if (score % 5 === 0) {
            level++;
            var next = COLORS.filter(function (c) { return c !== target; })[Math.floor(Math.random() * (COLORS.length - 1))];
            setTarget(next);
            say(root.getAttribute('data-level-up').replace('{color}', names[next.id] || next.id));
          }
        } else {
          lives--; renderLives(); shake = 0.35; say(root.getAttribute('data-wrong'));
          if (lives <= 0) { gameOver(); return; }
        }
        continue;
      }
      if (b.y - b.r > H) balls.splice(i, 1);
    }
    for (var j = bits.length - 1; j >= 0; j--) {
      var p = bits[j];
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 400 * dt; p.life -= dt;
      if (p.life <= 0) bits.splice(j, 1);
    }
    if (shake > 0) shake -= dt;
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  function drawSymbol(b) {
    var s = b.r * 0.42;
    ctx.fillStyle = b.c.deep;
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.rot);
    ctx.beginPath();
    switch (b.c.sym) {
      case 'circle': ctx.arc(0, 0, s * 0.8, 0, Math.PI * 2); break;
      case 'square': ctx.rect(-s * 0.75, -s * 0.75, s * 1.5, s * 1.5); break;
      case 'triangle': ctx.moveTo(0, -s); ctx.lineTo(s, s * 0.8); ctx.lineTo(-s, s * 0.8); ctx.closePath(); break;
      case 'diamond': ctx.moveTo(0, -s); ctx.lineTo(s * 0.8, 0); ctx.lineTo(0, s); ctx.lineTo(-s * 0.8, 0); ctx.closePath(); break;
      default: ctx.rect(-s, -s * 0.3, s * 2, s * 0.6); ctx.rect(-s * 0.3, -s, s * 0.6, s * 2);
    }
    ctx.fill(); ctx.restore();
  }

  function drawBall(b) {
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fillStyle = b.c.hex; ctx.fill();
    // plastilin işıq/kölgə
    ctx.beginPath(); ctx.arc(b.x + b.r * 0.25, b.y + b.r * 0.3, b.r * 0.85, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fill();
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 0.86, 0, Math.PI * 2); ctx.fillStyle = b.c.hex; ctx.fill();
    ctx.beginPath(); ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.4, b.r * 0.22, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fill();
    drawSymbol(b);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    // səma, buludlar, ot
    ctx.fillStyle = '#CFE6FA'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    roundRect(W * 0.08, 40, 90, 30, 15); ctx.fill();
    roundRect(W * 0.62, 90, 70, 24, 12); ctx.fill();
    ctx.fillStyle = '#52B788'; ctx.fillRect(0, H - 18, W, 18);

    balls.forEach(drawBall);
    bits.forEach(function (p) { ctx.globalAlpha = Math.max(0, p.life / 0.6); ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill(); });
    ctx.globalAlpha = 1;

    // səbət (sərt kölgə + hörmə xətləri)
    var bx = basket.x - basket.w / 2 + (shake > 0 && !reduce ? Math.sin(shake * 60) * 5 : 0);
    var by = H - basket.h - 18;
    ctx.fillStyle = '#93330F'; roundRect(bx, by + 6, basket.w, basket.h, 14); ctx.fill();
    ctx.fillStyle = '#E2A15B'; roundRect(bx, by, basket.w, basket.h, 14); ctx.fill();
    ctx.strokeStyle = 'rgba(120,60,20,.35)'; ctx.lineWidth = 3;
    for (var x = bx + 16; x < bx + basket.w - 8; x += 16) { ctx.beginPath(); ctx.moveTo(x, by + 6); ctx.lineTo(x, by + basket.h - 6); ctx.stroke(); }
    ctx.fillStyle = '#C47A35'; roundRect(bx - 4, by - 6, basket.w + 8, 12, 6); ctx.fill();
  }

  // ---- İdarəetmə ----
  function pointerTo(e) {
    var r = canvas.getBoundingClientRect();
    basket.x = e.clientX - r.left;
    if (!running) draw();
  }
  canvas.addEventListener('pointerdown', function (e) { canvas.setPointerCapture(e.pointerId); pointerTo(e); });
  canvas.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse' || e.buttons) pointerTo(e); });
  canvas.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { keys.left = true; e.preventDefault(); }
    if (e.key === 'ArrowRight') { keys.right = true; e.preventDefault(); }
  });
  canvas.addEventListener('keyup', function (e) {
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
  });
  // Tab gizlənəndə fasilə; düymə oyunu sıfırlamadan davam etdirir
  var paused = false;
  var gameTitle = overlayTitle.textContent;
  var startLabel = startBtn.textContent;
  startBtn.addEventListener('click', function () {
    if (paused) {
      paused = false; overlay.hidden = true; running = true; lastT = 0;
      canvas.focus(); requestAnimationFrame(loop);
      return;
    }
    start();
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && running) {
      running = false; paused = true;
      overlayTitle.textContent = gameTitle; overlaySub.textContent = '';
      startBtn.textContent = startLabel; overlay.hidden = false;
    }
  });
  window.addEventListener('resize', resize);

  setTarget(COLORS[0]);
  resize();
})();
