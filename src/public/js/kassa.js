(function () {
  'use strict';
  var form = document.getElementById('kassa-form');
  if (!form) return;
  var steps = form.querySelectorAll('.kassa-fieldset');
  if (steps.length < 2) return;

  var stepLabel = document.getElementById('kassa-step-label');
  var stepTemplate = stepLabel ? stepLabel.textContent.replace('1', '{n}') : '';

  function showStep(n) {
    steps.forEach(function (fs) { fs.hidden = Number(fs.dataset.step) !== n; });
    if (stepLabel) stepLabel.textContent = stepTemplate.replace('{n}', String(n));
    var firstField = steps[n - 1].querySelector('input, select');
    if (firstField) firstField.focus();
  }

  // JS yüklənəndə yalnız 1-ci addımı göstər (JS-siz hər iki fieldset görünür və form yenə işləyir).
  showStep(1);

  form.querySelector('[data-kassa-next]').addEventListener('click', function () {
    var step1 = steps[0];
    var invalid = step1.querySelector(':invalid');
    if (invalid) { invalid.reportValidity(); return; }
    showStep(2);
  });
  form.querySelector('[data-kassa-back]').addEventListener('click', function () { showStep(1); });
})();
