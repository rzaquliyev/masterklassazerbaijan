// "Rəng qarışdır" — iki plastilin topunu qaba at, yoğur, hədəf rəngi düzəlt. 5 tur. Client-only.
(function () {
  'use strict';
  var game = document.getElementById('mix-game');
  if (!game) return;

  var names = JSON.parse(game.getAttribute('data-colors') || '{}');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HEX = {
    red: '#E2493B', yellow: '#FFB830', blue: '#3779C4', white: '#FFFFFF',
    orange: '#F08A24', green: '#52B788', purple: '#8E63C2', pink: '#F7A8C0', lightblue: '#A9D2F5', cream: '#FFE39B',
  };
  var BASE = ['red', 'yellow', 'blue', 'white'];
  // Sıralanmış cüt → nəticə (eyni rəng öz rəngini verir)
  var RECIPES = {
    'red+yellow': 'orange', 'blue+yellow': 'green', 'blue+red': 'purple',
    'red+white': 'pink', 'blue+white': 'lightblue', 'white+yellow': 'cream',
  };
  var TARGETS = ['orange', 'green', 'purple', 'pink', 'lightblue'];

  var palette = document.getElementById('mix-palette');
  var slots = [document.getElementById('mix-slot-0'), document.getElementById('mix-slot-1')];
  var bowl = document.getElementById('mix-bowl');
  var result = document.getElementById('mix-result');
  var msg = document.getElementById('mix-msg');
  var targetBall = document.getElementById('mix-target-ball');
  var targetName = document.getElementById('mix-target-name');
  var roundEl = document.getElementById('mix-round');
  var starsEl = document.getElementById('mix-stars');
  var goBtn = document.getElementById('mix-go');
  var clearBtn = document.getElementById('mix-clear');
  var againBtn = document.getElementById('mix-again');

  var order, round, stars, picked, busy;

  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function mixOf(a, b) { if (a === b) return a; var k = [a, b].sort().join('+'); return RECIPES[k] || a; }
  function say(text, cls) { msg.textContent = text; msg.className = 'mix-msg' + (cls ? ' ' + cls : ''); }

  BASE.forEach(function (c) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'mix-ball'; b.setAttribute('data-squish', '');
    b.style.setProperty('--c', HEX[c]);
    b.innerHTML = '<span>' + (names[c] || c) + '</span>';
    b.addEventListener('click', function () { pick(c); });
    palette.appendChild(b);
  });

  function newGame() {
    order = shuffle(TARGETS.slice()); round = 0; stars = 0;
    againBtn.hidden = true; goBtn.hidden = false; clearBtn.hidden = false;
    palette.querySelectorAll('button').forEach(function (b) { b.disabled = false; });
    nextRound();
  }

  function nextRound() {
    var t = order[round];
    targetBall.style.setProperty('--c', HEX[t]);
    targetName.textContent = names[t] || t;
    roundEl.textContent = game.getAttribute('data-round').replace('{n}', round + 1);
    starsEl.textContent = '★'.repeat(stars);
    empty();
    say(game.getAttribute('data-pick'));
  }

  function empty() {
    picked = []; busy = false;
    slots.forEach(function (s) { s.classList.remove('is-filled'); s.style.removeProperty('--c'); s.hidden = false; });
    result.hidden = true;
  }

  function pick(c) {
    if (busy) return;
    if (!result.hidden) empty();
    if (picked.length >= 2) return;
    var s = slots[picked.length];
    picked.push(c);
    s.style.setProperty('--c', HEX[c]);
    s.classList.remove('is-filled'); void s.offsetWidth; s.classList.add('is-filled');
    if (picked.length === 2) goBtn.focus();
  }

  function mix() {
    if (busy || picked.length < 2) { say(game.getAttribute('data-pick')); return; }
    busy = true;
    var res = mixOf(picked[0], picked[1]);
    bowl.classList.remove('is-mixing'); void bowl.offsetWidth; bowl.classList.add('is-mixing');
    setTimeout(function () {
      slots.forEach(function (s) { s.hidden = true; });
      result.style.setProperty('--c', HEX[res]);
      result.hidden = false;
      if (res === order[round]) {
        stars++; starsEl.textContent = '★'.repeat(stars);
        say(game.getAttribute('data-correct'), 'is-good');
        if (window.MKMotion) window.MKMotion.confetti(bowl.parentNode, 22);
        setTimeout(function () {
          round++;
          if (round >= order.length) finish(); else nextRound();
        }, reduce ? 600 : 1500);
      } else {
        say(game.getAttribute('data-wrong').replace('{color}', names[res] || res), 'is-bad');
        busy = false;
      }
    }, reduce ? 50 : 900);
  }

  function finish() {
    busy = true;
    say(game.getAttribute('data-done'), 'is-good');
    goBtn.hidden = true; clearBtn.hidden = true; againBtn.hidden = false;
    palette.querySelectorAll('button').forEach(function (b) { b.disabled = true; });
    if (window.MKMotion) window.MKMotion.confetti(game, 50);
    againBtn.focus();
  }

  goBtn.addEventListener('click', mix);
  clearBtn.addEventListener('click', function () { if (!busy) { empty(); say(game.getAttribute('data-pick')); } });
  againBtn.addEventListener('click', newGame);
  newGame();
})();
