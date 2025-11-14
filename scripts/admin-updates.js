(function() {
  const STORAGE_KEY = 'm3m3-admin-updates-v1';

  /**
  * Update shape:
  * {
  *   id: string,
  *   title: string,
  *   body: string,
  *   createdAt: string (ISO),
  *   displayDate: string,
  *   displayTime: string,
  *   imageUrls?: string[] // array of data URLs or remote URLs
  * }
   */

  function loadUpdates() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to load admin updates', e);
      return [];
    }
  }

  function saveUpdates(updates) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updates));
    } catch (e) {
      console.error('Failed to save admin updates', e);
    }
  }

  function renderUpdates(container, updates) {
    container.innerHTML = '';
    if (!updates.length) {
      const empty = document.createElement('p');
      empty.textContent = 'No updates yet. Add your first update above.';
      empty.style.color = '#6b7280';
      container.appendChild(empty);
      return;
    }

    updates
      .slice()
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)) // newest first
      .forEach(update => {
        const card = document.createElement('article');
        card.className = 'update-card';

  const heading = document.createElement('h3');
  const titleWrap = document.createElement('span');
  titleWrap.className = 'post-title';
  titleWrap.textContent = update.title;
  heading.appendChild(titleWrap);

        const meta = document.createElement('p');
        meta.style.fontSize = '0.8rem';
        meta.style.color = '#6b7280';
        meta.textContent = `${update.displayDate} • ${update.displayTime}`;

        const body = document.createElement('p');
        body.textContent = update.body;

        card.appendChild(heading);
        card.appendChild(meta);

        if (update.imageUrls && update.imageUrls.length) {
          const imgsContainer = document.createElement('div');
          imgsContainer.style.display = 'grid';
          imgsContainer.style.gridTemplateColumns = 'repeat(auto-fit,minmax(120px,1fr))';
          imgsContainer.style.gap = '0.5rem';
          update.imageUrls.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = update.title || 'Update image';
            img.style.width = '100%';
            img.style.borderRadius = '6px';
            img.style.display = 'block';
            img.style.objectFit = 'contain';
            imgsContainer.appendChild(img);
          });
          card.appendChild(imgsContainer);
        }

        // Delete button (admin only)
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.textContent = 'Delete post';
        deleteBtn.style.background = '#ef4444';
        deleteBtn.style.marginTop = '0.5rem';
        deleteBtn.addEventListener('click', function() {
          const ok = confirm('Delete this post? This action cannot be undone.');
          if (!ok) return;
          updates = updates.filter(u => u.id !== update.id);
          saveUpdates(updates);
          renderUpdates(feed, updates);
        });
        card.appendChild(deleteBtn);

        card.appendChild(body);
        container.appendChild(card);
      });
  }

  function init() {
    const form = document.getElementById('admin-update-form');
    const feed = document.getElementById('admin-updates-feed');
    const clearBtn = document.getElementById('clear-updates-btn');

    if (!form || !feed) return;

    let updates = loadUpdates();
    renderUpdates(feed, updates);

  // file upload preview handling (support multiple)
  let filePreviewDataUrls = [];
    const fileInput = document.getElementById('update-image-file');
    const previewContainer = document.getElementById('update-image-preview');
    const previewImg = document.getElementById('update-image-preview-img');
    const removePreviewBtn = document.getElementById('clear-image-btn');

    function readFileAsDataUrl(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target.result);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });
    }

    async function handleFiles(files) {
      previewContainer.style.display = 'none';
      const list = document.getElementById('update-image-preview-list');
      list.innerHTML = '';
      filePreviewDataUrls = [];
      if (!files || !files.length) return;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        try {
          const dataUrl = await readFileAsDataUrl(file);
          const approxBytes = Math.round((dataUrl.length * 3) / 4);
          if (approxBytes > 2_000_000) {
            const keep = confirm(`Image \"${file.name}\" is larger than ~2MB. Storing large images in localStorage can fill space or be slow. Continue?`);
            if (!keep) continue;
          }

          filePreviewDataUrls.push(dataUrl);
          const imgWrap = document.createElement('div');
          const img = document.createElement('img');
          img.src = dataUrl;
          img.alt = file.name;
          img.style.width = '100%';
          img.style.borderRadius = '6px';
          img.style.display = 'block';
          imgWrap.appendChild(img);

          const removeBtn = document.createElement('button');
          removeBtn.type = 'button';
          removeBtn.textContent = 'Remove';
          removeBtn.style.marginTop = '0.25rem';
          removeBtn.style.background = '#ef4444';
          removeBtn.addEventListener('click', () => {
            const idx = filePreviewDataUrls.indexOf(dataUrl);
            if (idx > -1) filePreviewDataUrls.splice(idx, 1);
            imgWrap.remove();
            if (!filePreviewDataUrls.length) previewContainer.style.display = 'none';
            if (fileInput) fileInput.value = '';
          });
          imgWrap.appendChild(removeBtn);
          list.appendChild(imgWrap);
          previewContainer.style.display = 'block';
        } catch (e) {
          console.error('Failed to read file', e);
        }
      }
    }

    if (fileInput) {
      fileInput.addEventListener('change', async function() {
        await handleFiles(fileInput.files);
      });
    }

    if (removePreviewBtn) {
      removePreviewBtn.addEventListener('click', function() {
        filePreviewDataUrls = [];
        if (fileInput) fileInput.value = '';
        const list = document.getElementById('update-image-preview-list');
        if (list) list.innerHTML = '';
        previewContainer.style.display = 'none';
      });
    }

    form.addEventListener('submit', function(e) {
      e.preventDefault();

      const title = document.getElementById('update-title').value.trim();
      const body = document.getElementById('update-body').value.trim();
  // use local machine time for timestamp (user requested current time)
  const imageUrl = document.getElementById('update-image-url').value.trim();
  // prefer file images if present; allow typed URL as a fallback or additional image
  const finalImageUrls = (filePreviewDataUrls && filePreviewDataUrls.length) ? filePreviewDataUrls.slice() : [];
  if (imageUrl) finalImageUrls.push(imageUrl);

      if (!title || !body) {
        alert('Title and notes are required.');
        return;
      }

  const now = new Date();
  // format local date YYYY-MM-DD
  const pad = (n) => (n < 10 ? '0' + n : '' + n);
  const displayDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  // format time HH:MM in local timezone
  const displayTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

      const update = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        title,
        body,
        createdAt: now.toISOString(),
        displayDate,
        displayTime,
        imageUrls: finalImageUrls
      };

      updates.push(update);
      saveUpdates(updates);
      renderUpdates(feed, updates);

      form.reset();
      filePreviewDataUrl = null;
      if (previewContainer) previewContainer.style.display = 'none';
      if (previewImg) previewImg.src = '';
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', function() {
        const confirmClear = confirm('Clear all stored updates in this browser? This cannot be undone.');
        if (!confirmClear) return;
        updates = [];
        saveUpdates(updates);
        renderUpdates(feed, updates);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
