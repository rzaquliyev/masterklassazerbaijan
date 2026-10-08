(function () {
  'use strict';
  var tabLinks = document.querySelectorAll('[data-tab-link]');
  if (!tabLinks.length) return;
  tabLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var id = link.getAttribute('data-tab-link');
      tabLinks.forEach(function (l) { l.classList.toggle('is-active', l === link); });
      document.querySelectorAll('[data-tab-panel]').forEach(function (panel) {
        panel.hidden = panel.getAttribute('data-tab-panel') !== id;
      });
    });
  });
  if (tabLinks[0]) tabLinks[0].classList.add('is-active');
})();
