'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const root = path.resolve(__dirname, '..');
const version = require(path.join(root, 'package.json')).version;

function scan(directory) {
  return fs.readdirSync(directory, {withFileTypes:true}).flatMap(entry => {
    const filename=path.join(directory,entry.name);
    return entry.isDirectory() ? scan(filename) : entry.name.endsWith('.md') ? [filename] : [];
  });
}
test('all local documentation links resolve to actual files', () => {
  const files = [path.join(root,'README.md'),...scan(path.join(root,'docs'))];
  const failures=[];
  for (const file of files) {
    const body=fs.readFileSync(file,'utf8');
    for (const match of body.matchAll(/!?\[[^\]\n]*\]\(([^)\n]+)\)/g)) {
      const dest=match[1].trim().replace(/^<|>$/g,'').split(/\s+"/)[0];
      if (/^(?:https?:|mailto:|#|data:)/i.test(dest)) continue;
      const local=decodeURIComponent(dest.split('#')[0].split('?')[0]);
      if (!local) continue;
      const resolved=path.resolve(path.dirname(file),local);
      if (!resolved.startsWith(root+path.sep) || !fs.existsSync(resolved)) {
        failures.push(path.relative(root,file)+' -> '+dest);
      }
    }
  }
  assert.deepEqual(failures,[]);
});
test('release documentation points at active version and official brand', () => {
  const readme=fs.readFileSync(path.join(root,'README.md'),'utf8');
  const cdn=fs.readFileSync(path.join(root,'docs/CDN.hr.md'),'utf8');
  const wp=fs.readFileSync(path.join(root,'wordpress/brendigo-cookieconsent/readme.txt'),'utf8');
  assert.match(readme,/CookieConsent by Brendigo/);
  assert.ok(readme.includes('version-'+version));
  assert.ok(readme.includes('/v'+version+'/loader.js'));
  assert.ok(cdn.includes('/v'+version+'/loader.js'));
  assert.ok(wp.includes('Stable tag: '+version));
});
