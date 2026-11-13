(function () {
  var root = document.documentElement;

  /* Theme toggle: follows the system setting until the visitor picks one. */
  var toggle = document.getElementById('theme-toggle');

  function effectiveTheme() {
    var set = root.getAttribute('data-theme');
    if (set) return set;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function syncToggle() {
    if (!toggle) return;
    var dark = effectiveTheme() === 'dark';
    toggle.setAttribute('aria-pressed', String(dark));
    toggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  }

  try {
    var saved = localStorage.getItem('portfolio-theme');
    if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);
  } catch (e) {}

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('portfolio-theme', next); } catch (e) {}
      syncToggle();
    });
  }
  syncToggle();

  /* Copy buttons for email and phone. */
  var status = document.getElementById('copy-status');

  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    var target = document.getElementById(btn.getAttribute('data-copy'));
    var label = btn.querySelector('.copy-label');
    var timer;
    if (!target || !label) return;

    function done(message) {
      label.textContent = message;
      if (status) status.textContent = message === 'Copied' ? 'Copied to clipboard' : 'Text selected, press copy on your keyboard';
      clearTimeout(timer);
      timer = setTimeout(function () { label.textContent = 'Copy'; }, 1800);
    }

    function selectText() {
      var range = document.createRange();
      range.selectNodeContents(target);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      done('Selected');
    }

    btn.addEventListener('click', function () {
      var text = target.textContent.trim();
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () { done('Copied'); }, selectText);
          return;
        }
      } catch (e) {}
      selectText();
    });
  });

  /* Highlight the current section in the nav while scrolling. */
  var links = Array.prototype.slice.call(document.querySelectorAll('.bar nav a'));
  var sections = links
    .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          if (a.getAttribute('href') === '#' + entry.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    sections.forEach(function (s) { observer.observe(s); });
  }
})();
