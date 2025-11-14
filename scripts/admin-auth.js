(function () {
  const AUTH_KEY = 'm3m3-admin-auth';
  const CONFIG_URL = '../config/auth-config.json';

  function loadConfig() {
    return fetch(CONFIG_URL).then(function (response) {
      if (!response.ok) {
        throw new Error('Failed to load auth config');
      }
      return response.json();
    });
  }

  function applyLockedState() {
    const main = document.querySelector('main');
    if (main) {
      main.style.filter = 'blur(4px)';
      main.style.pointerEvents = 'none';
      main.setAttribute('aria-hidden', 'true');
    }
  }

  function applyUnlockedState() {
    const main = document.querySelector('main');
    if (main) {
      main.style.filter = '';
      main.style.pointerEvents = '';
      main.removeAttribute('aria-hidden');
    }
  }

  function promptForCredentials(expectedUser, expectedPass) {
    const username = prompt('Admin username:');
    const password = prompt('Admin password:');
    return username === expectedUser && password === expectedPass;
  }

  function init() {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored === 'true') {
      applyUnlockedState();
      return;
    }

    applyLockedState();

    loadConfig()
      .then(function (config) {
        const ok = promptForCredentials(config.adminUsername, config.adminPassword);
        if (ok) {
          applyUnlockedState();
          try {
            localStorage.setItem(AUTH_KEY, 'true');
          } catch (e) {
            console.error('Failed to persist admin auth flag', e);
          }
        } else {
          alert('Incorrect credentials. Admin tools will remain locked.');
        }
      })
      .catch(function (err) {
        console.error(err);
        alert('Auth configuration could not be loaded. Admin tools will remain locked.');
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
