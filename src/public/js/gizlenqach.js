// Gizlənqaç — saytın 5 səhifəsində gizli ulduz, localStorage-da irəliləyiş, 5/5-də mükafat formu.
// Uşaq məlumatı toplanmır (BRIEF): yalnız brauzerdə saxlanılan boolean bayraqlar.
(function () {
  'use strict';
  var STORAGE_KEY = 'gizlenqach_found_v1';

  function readFound() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(raw) ? raw : [];
    } catch (e) { return []; }
  }
  function writeFound(arr) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch (e) {}
  }

  function updateCounters() {
    var found = readFound();
    document.querySelectorAll('[data-star-counter]').forEach(function (el) { el.textContent = String(found.length); });
    var reward = document.getElementById('hunt-reward');
    if (reward) reward.hidden = found.length < 5;
    return found;
  }

  document.querySelectorAll('[data-star]').forEach(function (btn) {
    var pageId = btn.getAttribute('data-star');
    var found = readFound();
    if (found.indexOf(pageId) !== -1) {
      btn.setAttribute('data-found', 'true');
    }
    btn.addEventListener('click', function () {
      var current = readFound();
      if (current.indexOf(pageId) === -1) {
        current.push(pageId);
        writeFound(current);
        btn.setAttribute('data-found', 'true');
      }
      updateCounters();
    });
  });

  updateCounters();

  var form = document.getElementById('hunt-reward-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var phone = form.querySelector('[name="phone"]').value;
      var resultBox = document.getElementById('hunt-reward-result');
      fetch('/api/gizlenqach/mukafat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone }),
      })
        .then(function (r) { return r.json().then(function (data) { return { ok: r.ok, data: data }; }); })
        .then(function (res) {
          resultBox.hidden = false;
          if (res.ok) {
            resultBox.className = 'form-alert success';
            resultBox.textContent = form.dataset.resultTemplate
              .replace('{code}', res.data.code)
              .replace('{percent}', res.data.percent);
          } else if (res.data.alreadyClaimed) {
            resultBox.className = 'form-alert success';
            resultBox.textContent = form.dataset.alreadyText + ' ' + (res.data.code || '');
          } else {
            resultBox.className = 'form-alert error';
            resultBox.textContent = res.data.error || form.dataset.genericError;
          }
        })
        .catch(function () {
          resultBox.hidden = false;
          resultBox.className = 'form-alert error';
          resultBox.textContent = form.dataset.networkError;
        });
    });
  }
})();
