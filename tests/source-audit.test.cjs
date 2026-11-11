'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
function source(file){return fs.readFileSync(path.join(root,file),'utf8');}
test('source security audit: unsafe dynamic JS and PHP execution sinks are absent',()=>{
  const jsFiles=[
    'packages/core/brendigo-cookieconsent.js',
    'wordpress/brendigo-cookieconsent/assets/brendigo-cookieconsent.js',
    'wordpress/brendigo-cookieconsent/assets/admin-preview.js',
    'wordpress/brendigo-cookieconsent/assets/translation-editor.js',
    'packages/integrations/google-consent-basic.js',
    'cdn/loader.js',
    'shopify/extensions/brendigo-cookieconsent/assets/shopify-config.js',
    'shopify/extensions/brendigo-cookieconsent/assets/shopify-privacy-bridge.js',
    'magento/view/frontend/web/js/bootstrap.js',
    'opencart/catalog/view/javascript/bootstrap.js',
    'prestashop/views/js/bootstrap.js',
    'joomla/media/js/bootstrap.js',
    'drupal/js/bootstrap.js'
  ];
  for(const file of jsFiles){
    const value=source(file);
    for(const [name,pattern] of [
      ['eval()',/\beval\s*\(/],
      ['new Function()',/\bnew\s+Function\s*\(/],
      ['innerHTML assignment',/\.innerHTML\s*=/],
      ['document.write()',/\bdocument\.write\s*\(/],
      ['importScripts()',/\bimportScripts\s*\(/],
    ]) assert.doesNotMatch(value,pattern,name+' is not permitted in '+file);
  }
  const php=source('wordpress/brendigo-cookieconsent/brendigo-cookieconsent.php');
  assert.doesNotMatch(php,/\b(?:eval|unserialize|base64_decode)\s*\(/);
  assert.match(php,/check_admin_referer\('bcc_import_settings'\)/);
  assert.match(php,/current_user_can\('manage_options'\)/);
  assert.match(php,/wp_json_encode\(\$config,\s*JSON_HEX_TAG/);
  assert.match(php,/WP_HTML_Tag_Processor/);
});
test('demo pages do not rely on inline HTML event-handler attributes',()=>{
  for(const page of ['demo/index.html','demo/configurator.html','demo/services.html','demo/catalog.html']){
    assert.doesNotMatch(source(page),/\bon(?:click|load|error|mouseover|focus)\s*=/i);
  }
});
test('dead code regression: no redundant tab subscription and no duplicate hidden override',()=>{
  const js=source('packages/core/brendigo-cookieconsent.js');
  const css=source('packages/core/brendigo-cookieconsent.css');
  assert.equal((js.match(/listenForTabUpdates\(\);/g)||[]).length,1);
  assert.equal((css.match(/\.bcc-root \.bcc-banner\[hidden\]/g)||[]).length,1);
  assert.equal(js,source('wordpress/brendigo-cookieconsent/assets/brendigo-cookieconsent.js'));
  assert.equal(css,source('wordpress/brendigo-cookieconsent/assets/brendigo-cookieconsent.css'));
  assert.doesNotMatch(source('tests/wp-settings.php'),/\beval\s*\(/);
});
test('security invariants: expiry, safe URL scheme, local WordPress default',()=>{
 const js=source('packages/core/brendigo-cookieconsent.js');
 const php=source('wordpress/brendigo-cookieconsent/brendigo-cookieconsent.php');
 const wporg=source('tools/build-wporg.mjs');
 assert.match(js,/now - timestamp > days \* 86400000/);
 assert.match(js,/url\.username \|\| url\.password/);
 assert.match(js,/root\.location\.protocol === 'https:' && url\.protocol !== 'https:'/);
 assert.match(php,/'asset_source' => 'local'/);
 assert.match(wporg,/showBranding === true/);
 assert.match(wporg,/Local plugin assets only/);
});

test('Shopify head embed avoids executable inline config and escapes Liquid attributes',()=>{
 const liquid=source('shopify/extensions/brendigo-cookieconsent/blocks/consent-banner.liquid');
 assert.doesNotMatch(liquid,/<script(?![^>]*\bsrc=)[^>]*>\s*window\./i);
 for(const field of ['language','position','policy_url','revision','accent_color']){
   assert.match(liquid,new RegExp('block\\.settings\\.'+field+' \\| escape'));
 }
});

test('script syntax gate recursively checks every shipped runtime JS and build helper',()=>{
 const checker=source('tools/check-scripts.mjs');
 const packageFile=JSON.parse(source('package.json'));
 assert.match(packageFile.scripts.check,/node tools\/check-scripts\.mjs/);
 for(const dir of ['cdn','packages','wordpress','joomla','drupal','shopify',
   'magento','opencart','prestashop','website','demo','tests','tools']) {
   assert.ok(checker.includes("'"+dir+"'"),'missing JS audit directory '+dir);
 }
 assert.match(checker,/--check/);
});
