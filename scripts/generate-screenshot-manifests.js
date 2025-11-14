/*
  Node script to generate a manifest of image files inside assets/screenshots/frontend and backend.
  Run: node scripts/generate-screenshot-manifests.js
  It will write list.json inside each folder with an array of filenames.
*/
const fs = require('fs');
const path = require('path');

const folders = ['frontend', 'backend'];
const base = path.resolve(__dirname, '..', 'assets', 'screenshots');

folders.forEach(folder => {
  const dir = path.join(base, folder);
  if (!fs.existsSync(dir)) {
    console.warn('Directory not found:', dir);
    return;
  }
  const files = fs.readdirSync(dir).filter(f => !f.startsWith('.') && fs.statSync(path.join(dir, f)).isFile());
  const manifestPath = path.join(dir, 'list.json');
  fs.writeFileSync(manifestPath, JSON.stringify(files, null, 2));
  console.log('Wrote manifest:', manifestPath, '(', files.length, 'files)');
});
