(function () {
  const STORAGE_KEY = 'm3m3-theme';

  function applyTheme(theme) {
    const body = document.body;
    if (theme === 'dark') {
      body.classList.add('theme-dark');
    } else {
      body.classList.remove('theme-dark');
    }
  }

  function getInitialTheme() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
    } catch (e) {
      console.error('Failed to read theme from localStorage', e);
    }
    // Fallback to system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  function init() {
    // Support for the new checkbox slider control
    const toggles = document.querySelectorAll('.theme-toggle-checkbox');
    // Also backwards compatible with an existing #theme-toggle button
    const legacyButtons = document.querySelectorAll('#theme-toggle');

    let currentTheme = getInitialTheme();
    applyTheme(currentTheme);

    // Initialize checkbox states
    toggles.forEach(cb => {
      try { cb.checked = currentTheme === 'dark'; } catch(e) {}
  cb.setAttribute('aria-checked', cb.checked);
  const slider = cb.nextElementSibling;
  if (slider) slider.setAttribute('aria-checked', cb.checked);
      cb.addEventListener('change', function () {
        currentTheme = cb.checked ? 'dark' : 'light';
        applyTheme(currentTheme);
  cb.setAttribute('aria-checked', cb.checked);
  if (slider) slider.setAttribute('aria-checked', cb.checked);
        try { localStorage.setItem(STORAGE_KEY, currentTheme); } catch (e) { console.error('Failed to save theme preference', e); }
      });
    });

    // Backward-compat: handle old plain button (if still present)
    legacyButtons.forEach(btn => {
      btn.textContent = currentTheme === 'dark' ? 'Light mode' : 'Dark mode';
      btn.addEventListener('click', function () {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(currentTheme);
        btn.textContent = currentTheme === 'dark' ? 'Light mode' : 'Dark mode';
        try { localStorage.setItem(STORAGE_KEY, currentTheme); } catch (e) { console.error('Failed to save theme preference', e); }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
