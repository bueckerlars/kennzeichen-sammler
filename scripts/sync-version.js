#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read version from version.json
const versionJsonPath = path.join(__dirname, '..', 'version.json');
const versionData = JSON.parse(fs.readFileSync(versionJsonPath, 'utf8'));
const version = versionData.version;

if (!version) {
  console.error('Error: No version found in version.json');
  process.exit(1);
}

console.log(`Syncing version ${version} to package.json files...`);

// Update frontend/package.json
const frontendPackagePath = path.join(__dirname, '..', 'frontend', 'package.json');
const frontendPackage = JSON.parse(fs.readFileSync(frontendPackagePath, 'utf8'));
frontendPackage.version = version;
fs.writeFileSync(frontendPackagePath, JSON.stringify(frontendPackage, null, 2) + '\n');
console.log(`✓ Updated frontend/package.json`);

// Update backend/package.json
const backendPackagePath = path.join(__dirname, '..', 'backend', 'package.json');
const backendPackage = JSON.parse(fs.readFileSync(backendPackagePath, 'utf8'));
backendPackage.version = version;
fs.writeFileSync(backendPackagePath, JSON.stringify(backendPackage, null, 2) + '\n');
console.log(`✓ Updated backend/package.json`);

console.log(`Successfully synced version ${version} to all package.json files.`);

