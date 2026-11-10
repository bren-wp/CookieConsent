#!/usr/bin/env node
'use strict';
// Builds a self-contained versioned folder. The generated folder can be uploaded
// to an existing HTTPS origin; this script never deploys or changes DNS.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const version = require(path.join(root, 'package.json')).version;
if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('Invalid semver version');
const target = path.join(root, 'dist', 'cdn', 'v' + version);
fs.mkdirSync(target, {recursive:true});
const entries = [
  ['packages/core/brendigo-cookieconsent.js', 'brendigo-cookieconsent.js'],
  ['packages/core/brendigo-cookieconsent.css', 'brendigo-cookieconsent.css'],
  ['cdn/loader.js', 'loader.js'],
  ['packages/integrations/google-consent-basic.js', 'google-consent-basic.js']
];
const manifest = { version, origin: 'https://cookie.brendigo.com', generatedAt: new Date().toISOString(), files: {} };
for (const [source, name] of entries) {
  const bytes = fs.readFileSync(path.join(root,source));
  fs.writeFileSync(path.join(target,name), bytes);
  manifest.files[name] = {sha256:crypto.createHash('sha256').update(bytes).digest('hex'),size:bytes.length};
}
fs.writeFileSync(path.join(target,'manifest.json'), JSON.stringify(manifest,null,2)+'\n');
console.log('CDN build prepared:',target, 'files:',Object.keys(manifest.files).join(', '));
