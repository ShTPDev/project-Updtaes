
# project-updates/

A static website for publishing project updates, release notes, and screenshots. Fully self-contained with no external database dependencies—all posts are stored as JSON files in the repository.

## Quick Start

### Publishing Posts

1. **Create a post** via the Admin page (`pages/admin_updates.html`)
   - Fill in title, body, and optionally add images
   - Click Submit → a JSON file will auto-download

2. **Save the JSON file** to the `posts/` folder

3. **Generate the index**:
   ```powershell
   npm run generate-posts
   ```

4. **Commit and push**:
   ```powershell
   git add posts/
   git commit -m "Add new post"
   git push
   ```

5. **Done!** GitHub Pages will automatically deploy your changes.

## Publishing with GitHub Pages

- Check out the repository
- Install Node/npm dependencies
- Run `npm run generate-manifests` to refresh screenshot manifests
- Upload the repo as a Pages artifact and publish

You can change the branch under `on.push.branches` if you prefer a different branch. Your current default is `origin` so the workflow shows `branches: [ origin ]`.

Once the action runs, it will publish the site using the `gh-pages` branch. In your repository Settings → Pages, make sure the source is set to "Branch: gh-pages" (root) if you want a consistent Pages domain. The workflow will create the `gh-pages` branch when it first runs if it doesn't already exist.

Troubleshooting deploy failures

- If the workflow fails with '/usr/bin/git failed with exit code 128' that usually means the workflow couldn't push to the `gh-pages` branch (non-fast-forward or permission problem).
  - Check Actions logs (Actions → Build and deploy to GitHub Pages) and open the failing step output to learn the exact reason.
  - Ensure the workflow has permissions:
    - The workflow sets `permissions: contents: write` so it can push to branches — if you changed that, update it.
    - Ensure the repository is not blocking Actions from pushing to protected branches. For a protected branch, the action won't be able to push without appropriate bypass rules.
  - The publish action is configured with `force: true` to force pushes to `gh-pages` (useful when the branch history diverges). This is safe for published artifacts but beware if you have custom content in `gh-pages`.
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

  Or with npm (convenience script):

  ```powershell
  npm run generate-manifests
  ```

  The script writes `list.json` into each screenshots folder.
  - The generator includes only these file types for the manifest: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg`. It excludes `list.json` itself so the manifest won't be rendered by the loader.

## Posts System

### Overview
Posts are stored as individual JSON files in the `posts/` folder. The site loads posts from `posts/index.json`, which is generated from all individual post files.

### Workflow
1. **Create** - Use the Admin page to create a post (downloads a JSON file)
2. **Save** - Move the downloaded file to `posts/` folder
3. **Generate** - Run `npm run generate-posts` to update the index
4. **Deploy** - Commit and push to GitHub

### Post Format
Each post is a JSON file with this structure:
```json
{
  "id": "unique-id",
  "title": "Post Title",
  "body": "Post content...",
  "createdAt": "2025-11-14T12:00:00.000Z",
  "displayDate": "2025-11-14",
  "displayTime": "12:00",
  "imageUrls": ["data:image/png;base64,..."],
  "videoUrl": "https://www.youtube.com/watch?v=..."
}
```

Images are stored as base64 data URLs within the JSON file, making posts completely self-contained. Videos are embedded via YouTube or Vimeo URLs.

### Scripts
- `npm run generate-posts` - Regenerate `posts/index.json` from individual post files
- `npm run generate-manifests` - Regenerate screenshot manifests

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
    - Admin UI for posting updates: `pages/admin_updates.html` and `scripts/admin-updates.js`.
    - Posts are stored as JSON files in the `posts/` folder. Each post is downloaded after creation and committed to the repository.
    - Admin posts include: title, body, a generated timestamp (local time), optionally multiple images per post (stored as base64 data URLs), and optionally a video URL (YouTube or Vimeo).
    - **Video embeds**: When adding a post, you can include a YouTube or Vimeo link. Use **Unlisted** privacy for videos only your clients should see. The video will be embedded in the post on Release Notes and Home pages.
    - **Auto-add to Clips**: When you add a video URL to a post, a dropdown appears to select "Frontend" or "Backend" section. The video is automatically added to the Clips page under that section.
    - Posts are also cached in localStorage under the key `m3m3-admin-updates-v1` for quick local access.
    - Admin authentication is handled by a light client-side gate using `config/auth-config.json` and `scripts/admin-auth.js`; the auth flag is stored at `m3m3-admin-auth`.
    - Release notes page (`pages/release_notes_page.html`) loads posts from `posts/index.json` via `scripts/release-notes-feed.js` and shows newest-first.
    - Home (`pages/index.html`) shows the latest post with `scripts/home-latest-update.js`.
    - Use `npm run generate-posts` to regenerate `posts/index.json` after adding new post files.

  - Video Clips page
    - Dedicated clips gallery at `pages/clips_page.html` displays video demos organized by Frontend (Mobile App) and Backend (Admin Panel) sections.
    - Clips are stored in localStorage under the key `m3m3-clips-v1` and can be managed from the Admin page.
    - **Adding clips**: Use the "Add a New Clip" form on the Admin page, or add a video URL to a post (auto-adds to clips).
    - **Managing clips**: Edit or delete clips from the Admin page under "Manage Video Clips" section.
    - **Import/Export**: Use "Export Clips JSON" to backup clips data, or "Import Clips JSON" to restore from a backup file.
    - The Clips page is view-only for clients; all management is done through the Admin page.

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

  - The site is now completely self-contained with no external database dependencies. All posts are stored as JSON files in the `posts/` folder.
  - The `pages/project_update_webpage.html` page was removed from the main navigation and replaced with a 'page removed' message then redirected to Home. The site now uses the Release Notes and Admin pages for update publishing.
  - Demo images used for screenshots are placed in `assets/screenshots/frontend` and `assets/screenshots/backend`.
  - Previous Supabase integration has been removed. Posts are now managed entirely through static JSON files in the repository.
