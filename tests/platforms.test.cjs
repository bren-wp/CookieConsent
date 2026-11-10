'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const platforms=[
 ['joomla','joomla/media/js/brendigo-cookieconsent.js','joomla/media/css/brendigo-cookieconsent.css'],
 ['drupal','drupal/js/brendigo-cookieconsent.js','drupal/css/brendigo-cookieconsent.css'],
 ['shopify','shopify/extensions/brendigo-cookieconsent/assets/brendigo-cookieconsent.js',
             'shopify/extensions/brendigo-cookieconsent/assets/brendigo-cookieconsent.css'],
 ['magento','magento/view/frontend/web/js/brendigo-cookieconsent.js',
             'magento/view/frontend/web/css/brendigo-cookieconsent.css'],
 ['opencart','opencart/catalog/view/javascript/brendigo-cookieconsent.js',
             'opencart/catalog/view/javascript/brendigo-cookieconsent.css'],
 ['prestashop','prestashop/views/js/brendigo-cookieconsent.js',
              'prestashop/views/css/brendigo-cookieconsent.css']
];
test('all six platforms contain identical local privacy core without an external runtime',()=>{
 const js=read('packages/core/brendigo-cookieconsent.js'),css=read('packages/core/brendigo-cookieconsent.css');
 for(const [name,jsPath,cssPath] of platforms){
  assert.equal(read(jsPath),js,'core JS mismatch: '+name);
  assert.equal(read(cssPath),css,'core CSS mismatch: '+name);
  assert.ok(read(name+'/README.md').includes('Brendigo'),'documentation missing: '+name);
 }
});
test('platform plugins have native installation entrypoints',()=>{
 assert.match(read('joomla/brendigocookieconsent.xml'),/<extension type="plugin" group="system"/);
 assert.match(read('joomla/src/Extension/CookieConsent.php'),/onBeforeCompileHead/);
 assert.match(read('drupal/brendigo_cookieconsent.module'),/function brendigo_cookieconsent_page_attachments/);
 assert.match(read('drupal/src/Form/SettingsForm.php'),/getEditableConfigNames/);
 assert.match(read('shopify/extensions/brendigo-cookieconsent/shopify.extension.toml'),/type = "theme"/);
 assert.match(read('magento/registration.php'),/ComponentRegistrar::MODULE/);
 assert.match(read('magento/view/frontend/layout/default.xml'),/before\.body\.end/);
 assert.match(read('opencart/admin/controller/module/cookieconsent.php'),/catalog\/view\/common\/header\/after/);
 assert.match(read('opencart/catalog/controller/module/cookieconsent.php'),/extension\/brendigo\/catalog\/view\/javascript/);
 assert.match(read('prestashop/brendigocookieconsent.php'),/registerHook\('actionFrontControllerSetMedia'\)/);
});
test('Shopify app embed JSON schema uses compliance_head and explicit Customer Privacy API updates',()=>{
 const liquid=read('shopify/extensions/brendigo-cookieconsent/blocks/consent-banner.liquid');
 const match=liquid.match(/{% schema %}([\s\S]*?){% endschema %}/);
 assert.ok(match,'Shopify app embed schema missing');
 const schema=JSON.parse(match[1]);
 assert.equal(schema.target,'compliance_head');
 assert.equal(schema.name,'Consent banner');
 assert.ok(schema.settings.some(s=>s.id==='policy_url'));
 assert.ok(schema.settings.some(s=>s.id==='revision'));
 const bridge=read('shopify/extensions/brendigo-cookieconsent/assets/shopify-privacy-bridge.js');
 assert.match(bridge,/consent-tracking-api/);
 assert.match(bridge,/setTrackingConsent/);
 assert.match(liquid,/onDecision/);
 assert.doesNotMatch(bridge,/document\.cookie\s*=/);
});
test('CMS config serialization uses escaped JSON; no remote JS or PHP eval in integrators',()=>{
 const php=[
  'joomla/src/Extension/CookieConsent.php',
  'drupal/brendigo_cookieconsent.module',
  'magento/Block/Consent.php',
  'opencart/catalog/controller/module/cookieconsent.php',
  'prestashop/brendigocookieconsent.php'
 ];
 for(const file of php){
  const src=read(file);
  assert.doesNotMatch(src,/\b(?:eval|unserialize|base64_decode)\s*\(/);
  assert.doesNotMatch(src,/https:\/\/cookie\.brendigo\.com\/v[0-9]/);
 }
 for(const file of php.slice(2)){
  assert.match(read(file),/JSON_HEX_TAG/);
 }
 assert.match(read('drupal/brendigo_cookieconsent.module'),/drupalSettings/);
 assert.match(read('joomla/src/Extension/CookieConsent.php'),/addScriptOptions/);
 assert.match(read('opencart/admin/controller/module/cookieconsent.php'),/hasPermission\('modify'/);
});
test('presta, opencart and magento provide editable policy/revision fields',()=>{
 for(const file of [
  'magento/etc/adminhtml/system.xml','opencart/admin/view/template/module/cookieconsent.twig',
  'prestashop/brendigocookieconsent.php'
 ]){
  const source=read(file);
  assert.match(source,/policy/i);
  assert.match(source,/revision/i);
 }
});

test('OpenCart uses store-root asset URLs and inert JSON config for strict CSP',()=>{
  const source=read('opencart/catalog/controller/module/cookieconsent.php');
  assert.match(source,/HTTPS_SERVER/);
  assert.match(source,/type="application\/json"/);
  assert.match(source,/bootstrap\.js/);
  assert.doesNotMatch(source,/<script>window\.BCC_SITE_CONFIG/);
  const bootstrap=read('opencart/catalog/view/javascript/bootstrap.js');
  assert.match(bootstrap,/JSON\.parse/);
  assert.doesNotMatch(bootstrap,/eval\s*\(/);
});
test('Shopify bridge queues only the last visitor decision and never registers on load',()=>{
 const vm=require('node:vm'),bridge=read('shopify/extensions/brendigo-cookieconsent/assets/shopify-privacy-bridge.js');
 const updates=[], callbacks=[],listeners=[];
 const root={navigator:{globalPrivacyControl:true},console:{warn(){}},
   addEventListener(type,handler){listeners.push([type,handler])},
   Shopify:{loadFeatures(features,callback){callbacks.push(callback)},
     customerPrivacy:{setTrackingConsent(values,callback){updates.push({...values});callback()}}}};
 const context={window:root};vm.runInNewContext(bridge,context);
 assert.equal(updates.length,0);
 root.BrendigoShopifyPrivacyBridge.apply({analytics:true,marketing:true,preferences:true});
 root.BrendigoShopifyPrivacyBridge.apply({analytics:false,marketing:false,preferences:true});
 assert.equal(updates.length,0);
 callbacks.shift()(null);
 assert.equal(updates.length,1);
 assert.equal(updates[0].analytics,false);
 assert.equal(updates[0].preferences,true);
 root.BrendigoShopifyPrivacyBridge.apply({analytics:true,marketing:true,preferences:true});
 assert.equal(updates.length,2);
 assert.equal(updates[1].marketing,false,'GPC must deny marketing');
 assert.equal(updates[1].analytics,true);
});
