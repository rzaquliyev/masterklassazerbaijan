// Rəngləmə — SVG-şəhəri boyama, PNG kimi yükləmə. Client-only, heç bir data serverə getmir.
(function () {
  'use strict';
  var svg = document.getElementById('rengleme-svg');
  if (!svg) return;
  var colorsWrap = document.getElementById('rengleme-colors');
  var resetBtn = document.getElementById('rengleme-reset');
  var downloadBtn = document.getElementById('rengleme-download');

  var PALETTE = ['#E8682A', '#6FA8DC', '#7BC67E', '#FFC23D', '#F28AA6', '#9B7BD4', '#1B2A4A', '#FFFFFF'];
  var DEFAULT_FILLS = {};
  var activeColor = PALETTE[0];

  svg.querySelectorAll('[data-colorable]').forEach(function (el, i) {
    DEFAULT_FILLS[i] = el.getAttribute('fill');
    el.dataset.idx = i;
    el.addEventListener('click', function () { el.setAttribute('fill', activeColor); });
  });

  PALETTE.forEach(function (color, i) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'rengleme-color-btn' + (i === 0 ? ' is-active' : '');
    btn.style.background = color;
    btn.setAttribute('aria-label', color);
    btn.addEventListener('click', function () {
      activeColor = color;
      colorsWrap.querySelectorAll('.rengleme-color-btn').forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
    });
    colorsWrap.appendChild(btn);
  });

  resetBtn.addEventListener('click', function () {
    svg.querySelectorAll('[data-colorable]').forEach(function (el) {
      el.setAttribute('fill', DEFAULT_FILLS[el.dataset.idx]);
    });
  });

  downloadBtn.addEventListener('click', function () {
    var xml = new XMLSerializer().serializeToString(svg);
    var svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
    var url = URL.createObjectURL(svgBlob);
    var img = new Image();
    img.onload = function () {
      var canvas = document.createElement('canvas');
      var scale = 2;
      canvas.width = 360 * scale; canvas.height = 260 * scale;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      var pngUrl = canvas.toDataURL('image/png');
      var a = document.createElement('a');
      a.href = pngUrl;
      a.download = 'plastilin-sheheri-rengleme.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
    };
    img.src = url;
  });
})();
