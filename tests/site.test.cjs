'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const version=require(path.join(root,'package.json')).version;
function src(name){return fs.readFileSync(path.join(root,name),'utf8');}
test('official website has required static pages and no remote runtime dependencies',()=>{
 const pages=['index.html','en.html','installation.html','legal.html'];
 for(const file of pages){
  const s=src('website/'+file);
  assert.match(s,/<html lang="(?:hr|en)">/);
  assert.match(s,/<meta name="author" content="Brendigo">/);
  assert.ok(s.includes('CookieConsent'));
  assert.ok(!/<script[^>]+src=["']https?:\/\//i.test(s),'external runtime script in '+file);
 }
 assert.ok(src('website/index.html').includes('https://cookie.brendigo.com/v'+version+'/loader.js'));
 assert.ok(src('website/installation.html').includes('https://cookie.brendigo.com/v'+version+'/loader.js'));
 assert.match(src('website/robots.txt'),/sitemap\.xml/);
 assert.match(src('website/sitemap.xml'),/https:\/\/cookie\.brendigo\.com/);
});
test('plugin branding, official links and contributors remain consistent',()=>{
 const php=src('wordpress/brendigo-cookieconsent/brendigo-cookieconsent.php');
 const readme=src('wordpress/brendigo-cookieconsent/readme.txt');
 assert.match(php,/Plugin URI:\s*https:\/\/cookie\.brendigo\.com/);
 assert.match(php,/Author:\s*Brendigo/);
 assert.match(php,/Author URI:\s*https:\/\/brendigo\.com/);
 assert.match(php,/Text Domain:\s*brendigo-cookieconsent/);
 assert.match(php,/License:\s*MIT/);
 assert.match(readme,/Contributors:\s*brendigo/);
 assert.ok(readme.includes('Stable tag: '+version));
});
test('website does not claim the operator infrastructure was deployed',()=>{
 const doc=src('website/README.md');
 assert.match(doc,/DNS/);
 assert.match(doc,/HTTPS/);
 assert.match(doc,/privatnosti/);
});
