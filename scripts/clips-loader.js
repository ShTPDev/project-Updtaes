(function() {
  const STORAGE_KEY = 'm3m3-clips-v1';

  // Detect if we're on admin page
  const isAdminPage = window.location.pathname.includes('admin_updates');

  // Extract YouTube video ID from various URL formats
  function getYouTubeId(url) {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  // Extract Vimeo video ID
  function getVimeoId(url) {
    if (!url) return null;
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
  }

  // Create video embed element
  function createVideoEmbed(url) {
    const youtubeId = getYouTubeId(url);
    if (youtubeId) {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${youtubeId}`;
      iframe.className = 'video-embed';
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allowfullscreen', 'true');
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      return iframe;
    }
    
    const vimeoId = getVimeoId(url);
    if (vimeoId) {
      const iframe = document.createElement('iframe');
      iframe.src = `https://player.vimeo.com/video/${vimeoId}`;
      iframe.className = 'video-embed';
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allowfullscreen', 'true');
      return iframe;
    }
    
    return null;
  }

  // Load clips from localStorage
  function loadClips() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { frontend: [], backend: [] };
      const parsed = JSON.parse(raw);
      return {
        frontend: Array.isArray(parsed.frontend) ? parsed.frontend : [],
        backend: Array.isArray(parsed.backend) ? parsed.backend : []
      };
    } catch (e) {
      console.error('Failed to load clips', e);
      return { frontend: [], backend: [] };
    }
  }

  // Save clips to localStorage
  function saveClips(clips) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clips));
    } catch (e) {
      console.error('Failed to save clips', e);
    }
  }

  // Render clips grid for viewer page (no delete buttons)
  function renderClipsGridViewer(container, clips, sectionEl) {
    if (!container) return;
    container.innerHTML = '';

    // Update count badge
    const countBadge = sectionEl?.querySelector('.clips-count');
    if (countBadge) {
      countBadge.textContent = `${clips.length} video${clips.length !== 1 ? 's' : ''}`;
    }

    if (!clips.length) {
      const empty = document.createElement('p');
      empty.textContent = 'No clips available yet.';
      empty.style.color = 'var(--color-text-subtle)';
      empty.style.padding = '1rem';
      container.appendChild(empty);
      return;
    }

    clips.forEach((clip) => {
      const card = document.createElement('div');
      card.className = 'clip-card';

      // Video container
      const videoContainer = document.createElement('div');
      videoContainer.className = 'video-container';
      const embed = createVideoEmbed(clip.url);
      if (embed) {
        videoContainer.appendChild(embed);
      } else {
        videoContainer.innerHTML = '<p style="color:#ef4444;padding:1rem;">Invalid video URL</p>';
      }
      card.appendChild(videoContainer);

      // Title
      const title = document.createElement('h4');
      title.className = 'clip-title';
      title.textContent = clip.title || 'Untitled Clip';
      card.appendChild(title);

      // Meta (date added)
      if (clip.addedAt) {
        const meta = document.createElement('p');
        meta.className = 'clip-meta';
        meta.textContent = `Added: ${clip.addedAt}`;
        card.appendChild(meta);
      }

      container.appendChild(card);
    });
  }

  // Render admin clips list (compact, with delete)
  function renderAdminClipsList(container, clips, section, allClips, refreshCallback) {
    if (!container) return;
    container.innerHTML = '';

    if (!clips.length) {
      const empty = document.createElement('p');
      empty.textContent = 'No clips yet.';
      empty.style.color = 'var(--color-text-subtle)';
      empty.style.fontSize = '0.9rem';
      container.appendChild(empty);
      return;
    }

    clips.forEach((clip, index) => {
      const item = document.createElement('div');
      item.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:0.5rem;background:var(--color-surface);border-radius:6px;margin-bottom:0.5rem;';

      const info = document.createElement('div');
      info.style.cssText = 'flex:1;min-width:0;';
      
      const titleEl = document.createElement('div');
      titleEl.style.cssText = 'font-weight:600;font-size:0.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
      titleEl.textContent = clip.title || 'Untitled';
      
      const dateEl = document.createElement('div');
      dateEl.style.cssText = 'font-size:0.75rem;color:var(--color-text-subtle);';
      dateEl.textContent = clip.addedAt || '';
      
      info.appendChild(titleEl);
      info.appendChild(dateEl);

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '✕';
      deleteBtn.style.cssText = 'background:#ef4444;padding:0.25rem 0.5rem;font-size:0.8rem;margin-left:0.5rem;';
      deleteBtn.addEventListener('click', () => {
        const ok = confirm(`Remove "${clip.title}"?`);
        if (!ok) return;
        allClips[section].splice(index, 1);
        saveClips(allClips);
        refreshCallback();
      });

      item.appendChild(info);
      item.appendChild(deleteBtn);
      container.appendChild(item);
    });
  }

  // Setup collapsible section
  function setupCollapsible(sectionEl) {
    const header = sectionEl.querySelector('.clips-section-header');
    if (!header) return;
    
    header.addEventListener('click', () => {
      sectionEl.classList.toggle('collapsed');
    });
  }

  // Export clips as JSON
  function exportClips(clips) {
    const blob = new Blob([JSON.stringify(clips, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clips-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Import clips from JSON
  function importClips(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const imported = {
          frontend: Array.isArray(data.frontend) ? data.frontend : [],
          backend: Array.isArray(data.backend) ? data.backend : []
        };
        callback(imported);
      } catch (err) {
        alert('Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
  }

  function init() {
    let clips = loadClips();

    // Viewer page elements
    const frontendSection = document.getElementById('frontend-clips');
    const backendSection = document.getElementById('backend-clips');
    const frontendGrid = document.getElementById('frontend-clips-grid');
    const backendGrid = document.getElementById('backend-clips-grid');

    // Admin page elements
    const adminFrontendList = document.getElementById('admin-frontend-clips');
    const adminBackendList = document.getElementById('admin-backend-clips');

    // Refresh function for admin
    function refreshAll() {
      clips = loadClips();
      if (frontendGrid) renderClipsGridViewer(frontendGrid, clips.frontend, frontendSection);
      if (backendGrid) renderClipsGridViewer(backendGrid, clips.backend, backendSection);
      if (adminFrontendList) renderAdminClipsList(adminFrontendList, clips.frontend, 'frontend', clips, refreshAll);
      if (adminBackendList) renderAdminClipsList(adminBackendList, clips.backend, 'backend', clips, refreshAll);
    }

    // Setup collapsible sections (viewer page)
    if (frontendSection) setupCollapsible(frontendSection);
    if (backendSection) setupCollapsible(backendSection);

    // Initial render
    refreshAll();

    // Form handling (only on admin page)
    const form = document.getElementById('add-clip-form');
    const urlInput = document.getElementById('clip-url');
    const previewContainer = document.getElementById('clip-preview');
    const previewInner = document.getElementById('clip-preview-container');

    // Live preview
    if (urlInput) {
      urlInput.addEventListener('input', () => {
        const url = urlInput.value.trim();
        if (previewInner) previewInner.innerHTML = '';
        if (!url) {
          if (previewContainer) previewContainer.style.display = 'none';
          return;
        }
        const embed = createVideoEmbed(url);
        if (embed && previewInner) {
          const wrapper = document.createElement('div');
          wrapper.className = 'video-container';
          wrapper.appendChild(embed);
          previewInner.appendChild(wrapper);
          previewContainer.style.display = 'block';
        } else {
          if (previewContainer) previewContainer.style.display = 'none';
        }
      });
    }

    // Add clip
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const section = document.getElementById('clip-section').value;
        const title = document.getElementById('clip-title').value.trim();
        const url = document.getElementById('clip-url').value.trim();

        if (!title || !url) {
          alert('Title and URL are required');
          return;
        }

        // Validate URL
        if (!getYouTubeId(url) && !getVimeoId(url)) {
          alert('Please enter a valid YouTube or Vimeo URL');
          return;
        }

        const now = new Date();
        const pad = (n) => (n < 10 ? '0' + n : '' + n);
        const addedAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

        const newClip = {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          title,
          url,
          addedAt
        };

        clips[section].unshift(newClip); // Add to beginning
        saveClips(clips);

        // Refresh all lists
        refreshAll();

        // Reset form
        form.reset();
        if (previewContainer) previewContainer.style.display = 'none';
        if (previewInner) previewInner.innerHTML = '';

        alert('Clip added! View it on the Clips page.');
      });
    }

    // Export button
    const exportBtn = document.getElementById('export-clips-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => exportClips(clips));
    }

    // Import file
    const importInput = document.getElementById('import-clips-file');
    if (importInput) {
      importInput.addEventListener('change', () => {
        if (!importInput.files.length) return;
        const file = importInput.files[0];
        importClips(file, (imported) => {
          const merge = confirm('Merge with existing clips? (Cancel to replace all)');
          if (merge) {
            clips.frontend = [...imported.frontend, ...clips.frontend];
            clips.backend = [...imported.backend, ...clips.backend];
          } else {
            clips = imported;
          }
          saveClips(clips);
          refreshAll();
          importInput.value = '';
          alert('Clips imported successfully!');
        });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
