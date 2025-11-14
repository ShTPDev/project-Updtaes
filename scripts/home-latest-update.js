(function() {
  const STORAGE_KEY = 'm3m3-admin-updates-v1';

  function loadUpdates() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to load admin updates for home', e);
      return [];
    }
  }

  function createUpdateCard(update) {
    const card = document.createElement('article');
    card.className = 'update-card';

    const heading = document.createElement('h3');
    const titleWrap = document.createElement('span');
    titleWrap.className = 'post-title';
    titleWrap.textContent = update.title || 'Update';
    heading.appendChild(titleWrap);

    const meta = document.createElement('p');
    meta.style.fontSize = '0.8rem';
    meta.style.color = 'var(--color-text-subtle)';
    meta.textContent = `${update.displayDate} • ${update.displayTime}`;

    const body = document.createElement('p');
    body.textContent = update.body;

    card.appendChild(heading);
    card.appendChild(meta);

    if (update.imageUrls && update.imageUrls.length) {
      const imgsContainer = document.createElement('div');
      imgsContainer.style.display = 'grid';
      imgsContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(120px, 1fr))';
      imgsContainer.style.gap = '0.5rem';
      update.imageUrls.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = update.title || 'Update image';
        img.style.width = '100%';
        img.style.borderRadius = '6px';
        img.style.display = 'block';
        img.style.objectFit = 'contain';
        img.style.background = 'var(--color-bg)';
        imgsContainer.appendChild(img);
      });
      card.appendChild(imgsContainer);
    }

    card.appendChild(body);
    return card;
  }

  function renderLatest(container, updates) {
    container.innerHTML = '';
    if (!updates.length) {
      const p = document.createElement('p');
      p.textContent = 'No updates yet. Posts will appear here once added to the posts/ folder.';
      p.style.color = 'var(--color-text-subtle)';
      container.appendChild(p);
      return;
    }

    // Newest only
    const latest = updates.slice().sort((a,b)=> a.createdAt < b.createdAt ? 1: -1)[0];
    const card = createUpdateCard(latest);
    // If latest uses a data URL that is very long, cap the preview height
    const imgs = card.getElementsByTagName('img');
    for (let i = 0; i < imgs.length; i++) {
      imgs[i].style.maxHeight = '360px';
      imgs[i].style.objectFit = 'contain';
      imgs[i].style.display = 'block';
      imgs[i].style.margin = '0.75rem auto';
    }
    container.appendChild(card);
  }

  async function fetchPublishedPosts() {
    // Try a few likely relative paths so the same script works from
    // both the repo root (`index.html`) and the `pages/` folder
    const candidates = [
      'posts/index.json',    // when page is at repo root
      '../posts/index.json', // when page is inside pages/
      '/posts/index.json',   // absolute to site root (may or may not work depending on hosting)
    ];

    for (const p of candidates) {
      try {
        const res = await fetch(p);
        if (res && res.ok) {
          return await res.json();
        }
      } catch (e) {
        // ignore and try next candidate
      }
    }

    console.error('Failed to load published posts from any known path');
    return [];
  }

  async function init() {
    const container = document.getElementById('home-latest-update');
    if (!container) return;
    
    // Load local drafts
    let updates = loadUpdates();
    
    // Fetch and merge published posts from repo
    const published = await fetchPublishedPosts();
    if (published && published.length) {
      const known = new Set(updates.map(u => u.id));
      published.forEach(post => {
        if (!known.has(post.id)) {
          updates.push(post);
        }
      });
    }
    
    renderLatest(container, updates);

    // Listen for updates from other tabs
    window.addEventListener('storage', function(e) {
      if (e.key === STORAGE_KEY) {
        const updates = loadUpdates();
        renderLatest(container, updates);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
