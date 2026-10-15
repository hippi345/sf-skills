#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const MAX_PATH_LENGTH = 180;
const longPaths = [];

function walkDirectory(dir, relativeTo) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(relativeTo, fullPath);
    
    if (entry.isDirectory()) {
      if (entry.name === '.git' || entry.name === 'node_modules') {
        continue;
      }
      walkDirectory(fullPath, relativeTo);
    }
    
    if (relativePath.length > MAX_PATH_LENGTH) {
      longPaths.push({
        path: relativePath,
        length: relativePath.length
      });
    }
  }
}

const rootDir = process.argv[2] || process.cwd();
console.log(`Checking paths in: ${rootDir}`);
console.log(`Maximum allowed path length: ${MAX_PATH_LENGTH} characters\n`);

walkDirectory(rootDir, rootDir);

if (longPaths.length === 0) {
  console.log('✓ All paths are within the limit!');
  process.exit(0);
} else {
  console.log(`✗ Found ${longPaths.length} paths exceeding ${MAX_PATH_LENGTH} characters:\n`);
  
  longPaths.sort((a, b) => b.length - a.length);
  
  for (const item of longPaths) {
    console.log(`[${item.length}] ${item.path}`);
  }
  
  process.exit(1);
}
