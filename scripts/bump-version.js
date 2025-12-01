#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get bump type from command line argument
const bumpType = process.argv[2];

if (!bumpType || !['major', 'minor', 'patch'].includes(bumpType)) {
  console.error('Usage: node bump-version.js <major|minor|patch>');
  process.exit(1);
}

// Read current version from version.json
const versionJsonPath = path.join(__dirname, '..', 'version.json');
const versionData = JSON.parse(fs.readFileSync(versionJsonPath, 'utf8'));
const currentVersion = versionData.version;

if (!currentVersion) {
  console.error('Error: No version found in version.json');
  process.exit(1);
}

// Parse version
const versionParts = currentVersion.split('.').map(Number);
if (versionParts.length !== 3) {
  console.error(`Error: Invalid version format: ${currentVersion}`);
  process.exit(1);
}

let [major, minor, patch] = versionParts;

// Bump version
switch (bumpType) {
  case 'major':
    major++;
    minor = 0;
    patch = 0;
    break;
  case 'minor':
    minor++;
    patch = 0;
    break;
  case 'patch':
    patch++;
    break;
}

const newVersion = `${major}.${minor}.${patch}`;

// Write new version to version.json
versionData.version = newVersion;
fs.writeFileSync(versionJsonPath, JSON.stringify(versionData, null, 2) + '\n');
console.log(`Bumped version from ${currentVersion} to ${newVersion} (${bumpType})`);

// Automatically sync to package.json files
console.log('Syncing version to package.json files...');
const { execSync } = require('child_process');
const syncScriptPath = path.join(__dirname, 'sync-version.js');
execSync(`node ${syncScriptPath}`, { stdio: 'inherit' });

console.log(`Successfully bumped version to ${newVersion} and synced to all package.json files.`);

