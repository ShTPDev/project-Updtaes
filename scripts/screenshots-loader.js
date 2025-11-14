(function () {
  // Load screenshots from a manifest JSON. The script expects JSON files located at:
  // ../assets/screenshots/frontend/list.json and ../assets/screenshots/backend/list.json

  function renderGrid(container, images, basePath) {
    if (!container) return;
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'screenshot-grid';

  images.forEach((filename, index) => {
      const card = document.createElement('div');
      card.className = 'screenshot-card';
      const img = document.createElement('img');
  img.src = basePath + '/' + encodeURIComponent(filename).replace(/%2F/g, '/');
      img.alt = filename;
      img.loading = 'lazy';
  img.dataset.index = index;
  img.dataset.filename = filename;
  img.dataset.base = basePath;
  img.style.cursor = 'zoom-in';
  img.addEventListener('click', () => openLightbox(images, index, basePath));
      card.appendChild(img);
      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  function tryLoadList(manifestPath) {
    return fetch(manifestPath).then(resp => {
      if (!resp.ok) throw new Error('Manifest not found');
      return resp.json();
    });
  }

  function init() {
    // This is run from /pages/* so assets path should be ../assets/... accordingly
    const frontendContainer = document.querySelector('#frontend .screenshot-placeholder');
    const backendContainer = document.querySelector('#admin-panel .screenshot-placeholder');

  if (frontendContainer) {
      const dir = frontendContainer.parentElement?.dataset?.dir || 'frontend';
      const manifest = `../assets/screenshots/${dir}/list.json`;
      const base = `../assets/screenshots/${dir}`;
      tryLoadList(manifest)
        .then(images => {
          // Filter out anything that isn't an image and ignore manifest file names
          const allowed = images.filter(name => /\.(png|jpe?g|gif|webp|svg)$/i.test(name));
          renderGrid(frontendContainer, allowed, base);
        })
        .catch(() => { // fallback: keep placeholders
          frontendContainer.innerHTML = '<p>No screenshot manifest found for ' + dir + '.</p>';
        });
    }

  if (backendContainer) {
      const dir = backendContainer.parentElement?.dataset?.dir || 'backend';
      const manifest = `../assets/screenshots/${dir}/list.json`;
      const base = `../assets/screenshots/${dir}`;
      tryLoadList(manifest)
        .then(images => {
          const allowed = images.filter(name => /\.(png|jpe?g|gif|webp|svg)$/i.test(name));
          renderGrid(backendContainer, allowed, base);
        })
        .catch(() => {
          backendContainer.innerHTML = '<p>No screenshot manifest found for ' + dir + '.</p>';
        });
    }
  }

  // ----- Lightbox implementation -----
  // Shared overlay for all sections so only one overlay element is added.
  let overlay = null;
  let current = { images: [], index: 0, base: '' };

  function buildOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
      <div class="lightbox-content" role="dialog" aria-modal="true">
        <button class="lightbox-close" aria-label="Close">✕</button>
        <button class="lightbox-nav left" aria-label="Previous">◀</button>
        <div class="lightbox-inner">
          <img class="lightbox-img" alt="" />
          <div class="lightbox-caption"></div>
        </div>
        <button class="lightbox-nav right" aria-label="Next">▶</button>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    overlay.querySelector('.lightbox-nav.left').addEventListener('click', showPrev);
    overlay.querySelector('.lightbox-nav.right').addEventListener('click', showNext);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeLightbox();
    });
    return overlay;
  }

  function openLightbox(images, index, basePath) {
    current.images = images;
    current.index = index;
    current.base = basePath;
    const off = buildOverlay();
  off.style.display = 'flex';
    off.setAttribute('aria-hidden', 'false');
    renderLightbox();
  // set focus to close for accessibility
  const closeBtn = off.querySelector('.lightbox-close');
  if (closeBtn) closeBtn.focus();
    document.addEventListener('keydown', onKeyDown);
  }

  function renderLightbox() {
    if (!overlay) return;
    const img = overlay.querySelector('.lightbox-img');
    const caption = overlay.querySelector('.lightbox-caption');
    const filename = current.images[current.index];
    const src = current.base + '/' + encodeURIComponent(filename).replace(/%2F/g, '/');
    img.src = src;
    img.alt = filename;
    caption.textContent = filename;
  }

  function closeLightbox() {
    if (!overlay) return;
    overlay.style.display = 'none';
    overlay.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', onKeyDown);
  }

  function showPrev() {
    if (!current.images.length) return;
    current.index = (current.index - 1 + current.images.length) % current.images.length;
    renderLightbox();
  }

  function showNext() {
    if (!current.images.length) return;
    current.index = (current.index + 1) % current.images.length;
    renderLightbox();
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
