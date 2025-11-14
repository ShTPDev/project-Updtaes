
# project-updates/

│
├── index.html                 # Home page
├── release-notes.html         # Release notes page
├── screenshots.html           # Screenshots page
├── future-updates.html        # Upcoming features page
├── client-template.html       # Reusable client update template
├── styles.css                 # Global CSS with branding
├── scripts.js                 # Optional JS for dynamic features
├── assets/                    # Folder for all images/screenshots/etc.
│   ├── logo-placeholder.png
│   └── screenshots/
│       ├── frontend1.png
│       ├── frontend2.png
│       └── admin1.png
│
└── README.md                  # Optional project documentation

Notes:

- Screenshots: `assets/screenshots/frontend` and `assets/screenshots/backend` now support a `list.json` manifest describing files. The site will use `scripts/screenshots-loader.js` to load all images listed into the `Screenshots` page.

- To regenerate manifests after adding/removing screenshots, run:

  ```powershell
  node scripts/generate-screenshot-manifests.js
  ```

  The script writes `list.json` into each screenshots folder.

  ## Serving locally

  Most browsers block fetch() from file:// pages. To test the dynamic loader you should serve the site from a simple local HTTP server. Examples (PowerShell):

  ```powershell
  # Python 3
  python -m http.server 8000
  # or using node http-server (install: npm i -g http-server)
  http-server -p 8000
  ```

  Then open the following in your browser after starting the server:

  - Open: `http://localhost:8000/pages/screenshots_page.html`

  ## Features added in this repository

  - Theme and styling
    - Global stylesheet using CSS variables in `css/styles.css` for a three-color palette.
    - Dark mode supported via `body.theme-dark` class. Toggle persisted in localStorage using the key `m3m3-theme`.
    - The theme toggle was updated from a button to an accessible slider checkbox — see `scripts/theme-toggle.js`.

  - Admin updates and release notes
    - Admin UI for posting updates: `pages/admin_updates.html` and `scripts/admin-updates.js` store updates in localStorage.
    - Admin posts include: title, body, a generated timestamp (local time), and optionally multiple images per post (data URLs or remote URLs).
    - Posts are persisted under the key `m3m3-admin-updates-v1`.
    - Admin authentication is handled by a light client-side gate using `config/auth-config.json` and `scripts/admin-auth.js`; the auth flag is stored at `m3m3-admin-auth`.
    - Release notes page (`pages/release_notes_page.html`) loads the same admin posts via `scripts/release-notes-feed.js` and shows newest-first.
    - Home (`pages/future_updates.html`) shows the latest admin post with `scripts/home-latest-update.js`.

  - Screenshots loader and lightbox viewer
    - The screenshots page now dynamically loads images per section from manifests located at `assets/screenshots/<folder>/list.json`.
    - The loader script is `scripts/screenshots-loader.js`. It fetches `list.json` from the specified section's `data-dir` attribute (`frontend` or `backend`) and builds a responsive grid.
    - To generate/update the `list.json` files, use `scripts/generate-screenshot-manifests.js` which scans `assets/screenshots/*` and writes manifest files.
    - Clicking any screenshot opens a fullscreen lightbox viewer with a caption and left/right arrow navigation. Keyboard support: Esc to close, Left/Right arrows to navigate.
    - The lightbox overlay and styles are implemented in `css/styles.css` using `.lightbox-*` classes so no additional HTML markup is required.

  - UI and accessibility notes
    - The new theme slider uses a checkbox for keyboard accessibility and sets `role="switch"` and `aria-checked` state on the slider.
    - Lightbox elements use `role="dialog"` and focus management (focus is moved to the close button when opened); keyboard events are supported.

  ## Repository notes and cleanup

  - The `pages/project_update_webpage.html` page was removed from the main navigation and replaced with a 'page removed' message then redirected to Home. The site now uses the Release Notes and Admin pages for update publishing.
  - Demo images used for screenshots are placed in `assets/screenshots/frontend` and `assets/screenshots/backend`.

  If you'd like, I can add a small README section for image captions or wire the screenshot manifest generator into an `npm` script (e.g. `npm run generate-manifests`). Which would you prefer?
