/* Struinova site theme: dark (default) and light. One setting for every page, remembered per browser. */
(function () {
  var KEY = 'struinova_theme';
  var d = document.documentElement;
  var t = null;
  try { t = localStorage.getItem(KEY); } catch (e) {}
  if (t !== 'light' && t !== 'dark') t = 'dark';
  d.setAttribute('data-theme', t);

  var SUN = '<svg class="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON = '<svg class="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>';

  function swapLogos(mode) {
    var imgs = document.querySelectorAll('img[src*="Struinova"]');
    for (var i = 0; i < imgs.length; i++) {
      var s = imgs[i].getAttribute('src');
      var n = mode === 'light' ? s.replace('Struinova-dark.svg', 'Struinova.svg') : s.replace(/Struinova\.svg/, 'Struinova-dark.svg');
      if (n !== s) imgs[i].setAttribute('src', n);
    }
  }
  function labels(btn, mode) {
    var next = mode === 'light' ? 'dark' : 'light';
    btn.setAttribute('aria-label', 'Switch to ' + next + ' mode');
    btn.setAttribute('title', 'Switch to ' + next + ' mode');
  }
  function apply(mode, save) {
    d.setAttribute('data-theme', mode);
    if (save) { try { localStorage.setItem(KEY, mode); } catch (e) {} }
    swapLogos(mode);
    var b = document.querySelectorAll('.theme-toggle');
    for (var i = 0; i < b.length; i++) labels(b[i], mode);
    try { window.dispatchEvent(new CustomEvent('struinova-theme', { detail: mode })); } catch (e) {}
  }
  function place(btn) {
    var nav = document.querySelector('nav');
    if (!nav) { btn.classList.add('floating'); document.body.appendChild(btn); return; }
    var menu = nav.querySelector('.menu-btn');
    if (menu) nav.insertBefore(btn, menu); else nav.appendChild(btn);
    var links = nav.querySelector('.navlinks');
    function fit() {
      var hidden = links && getComputedStyle(links).display === 'none';
      btn.style.marginLeft = (!links || hidden) ? 'auto' : '0';
      if (menu && hidden) menu.style.marginLeft = '0';
    }
    fit(); window.addEventListener('resize', fit);
  }
  function init() {
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'theme-toggle'; btn.innerHTML = SUN + MOON;
    btn.addEventListener('click', function () {
      apply(d.getAttribute('data-theme') === 'light' ? 'dark' : 'light', true);
    });
    place(btn);
    apply(d.getAttribute('data-theme') || 'dark', false);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.addEventListener('storage', function (e) { if (e.key === KEY && (e.newValue === 'light' || e.newValue === 'dark')) apply(e.newValue, false); });
})();
