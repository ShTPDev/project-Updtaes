#!/usr/bin/env node

/**
 * Generate posts/index.json from individual post JSON files in posts/ folder
 * Run: node scripts/generate-posts-index.js
 */

const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, '..', 'posts');
const INDEX_FILE = path.join(POSTS_DIR, 'index.json');

function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.error('Error: posts/ directory not found');
    process.exit(1);
  }

  const files = fs.readdirSync(POSTS_DIR);
  const posts = [];

  for (const file of files) {
    if (file === 'index.json' || file === 'README.md' || !file.endsWith('.json')) {
      continue;
    }

    const filePath = path.join(POSTS_DIR, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const post = JSON.parse(content);
      
      // Validate required fields
      if (!post.id || !post.title || !post.body || !post.createdAt) {
        console.warn(`Warning: ${file} missing required fields, skipping`);
        continue;
      }

      posts.push(post);
      console.log(`✓ Loaded ${file}`);
    } catch (e) {
      console.error(`Error reading ${file}:`, e.message);
    }
  }

  // Sort by createdAt desc (newest first)
  posts.sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Write index
  fs.writeFileSync(INDEX_FILE, JSON.stringify(posts, null, 2), 'utf8');
  console.log(`\n✅ Generated ${INDEX_FILE} with ${posts.length} post(s)`);
}

main();
