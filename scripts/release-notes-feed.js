 (function() {
  const STORAGE_KEY = 'm3m3-admin-updates-v1';

  function loadUpdates() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to load admin updates for release notes', e);
      return [];
    }
  }

  function renderReleaseUpdates(container, updates) {
    container.innerHTML = '';
    if (!updates.length) {
      const hint = document.createElement('p');
      hint.textContent = 'No updates yet. Posts will appear here once added to the posts/ folder.';
      hint.style.color = '#6b7280';
      hint.style.fontSize = '0.9rem';
      container.appendChild(hint);
      return;
    }

    updates
      .slice()
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .forEach(update => {
        const card = document.createElement('article');
        card.className = 'version-block';

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
            img.style.maxWidth = '100%';
            img.style.maxHeight = '480px';
            img.style.borderRadius = '6px';
            imgsContainer.appendChild(img);
          });
          card.appendChild(imgsContainer);
        }

        card.appendChild(body);
        container.appendChild(card);
      });
  }

  async function fetchPublishedPosts() {
    try {
      const res = await fetch('../posts/index.json');
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.error('Failed to load published posts', e);
      return [];
    }
  }

  async function init() {
    const container = document.getElementById('dynamic-release-updates');
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
    
    renderReleaseUpdates(container, updates);

    // Listen for local storage changes
    window.addEventListener('storage', function(e) {
      if (e.key === STORAGE_KEY) {
        const updates = loadUpdates();
        renderReleaseUpdates(container, updates);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
