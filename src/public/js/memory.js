// Yaddaş oyunu ("Usta cütləri") — client-only, data saxlanmır. Maketdən portlanıb.
(function () {
  'use strict';
  var grid = document.getElementById('memory-grid');
  if (!grid) return;
  var statsEl = document.getElementById('memory-stats');
  var wonEl = document.getElementById('memory-won');
  var wonMovesEl = document.getElementById('memory-won-moves');
  var resetBtn = document.getElementById('memory-reset');
  var movesLabel = statsEl.dataset.movesLabel || 'gediş';
  var pairsLabel = statsEl.dataset.pairsLabel || 'cüt';

  var SHAPE_CLASSES = ['shape-ball', 'shape-ring', 'shape-cube', 'shape-drop', 'shape-triangle', 'shape-capsule'];
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var order = [], open = [], done = [], moves = 0, lock = false;

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  function buildOrder() {
    var pairs = SHAPE_CLASSES.concat(SHAPE_CLASSES);
    return shuffle(pairs);
  }

  function renderStats() {
    statsEl.innerHTML = moves + ' ' + movesLabel + '<br>' + (done.length / 2) + '/6 ' + pairsLabel;
  }

  function render() {
    grid.innerHTML = '';
    order.forEach(function (shapeClass, i) {
      var isDone = done.indexOf(i) !== -1;
      var isOpen = isDone || open.indexOf(i) !== -1;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'memory-card' + (isOpen ? ' is-open' : '') + (isDone ? ' is-done' : '');
      btn.setAttribute('aria-label', isOpen ? shapeClass : 'Kart ' + (i + 1));
      if (isOpen) {
        var shape = document.createElement('span');
        shape.className = 'memory-shape ' + shapeClass;
        btn.appendChild(shape);
      } else {
        btn.textContent = '?';
      }
      btn.addEventListener('click', function () { flip(i); });
      grid.appendChild(btn);
    });
    renderStats();
  }

  function flip(i) {
    if (lock || open.indexOf(i) !== -1 || done.indexOf(i) !== -1) return;
    open.push(i);
    if (open.length < 2) { render(); return; }
    moves++;
    if (order[open[0]] === order[open[1]]) {
      done = done.concat(open);
      open = [];
      render();
      if (done.length === order.length) {
        wonEl.hidden = false;
        wonMovesEl.textContent = moves + ' ' + movesLabel;
      }
      return;
    }
    lock = true;
    render();
    setTimeout(function () { open = []; lock = false; render(); }, reduceMotion ? 200 : 800);
  }

  function reset() {
    order = buildOrder(); open = []; done = []; moves = 0; lock = false;
    wonEl.hidden = true;
    render();
  }

  resetBtn.addEventListener('click', reset);
  reset();
})();
