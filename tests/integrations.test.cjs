'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');

test('Google Basic adapter starts with all optional consent denied', () => {
  const events = {};
  const fakeWindow = {
    navigator: {globalPrivacyControl: false},
    addEventListener(name,fn) { events[name] = fn; },
    dataLayer: []
  };
  vm.runInNewContext(
    fs.readFileSync(path.join(root, 'packages/integrations/google-consent-basic.js'),'utf8'),
    {window:fakeWindow}
  );
  assert.equal(fakeWindow.dataLayer.length,1);
  const initial = Array.from(fakeWindow.dataLayer[0]);
  assert.equal(initial[0], 'consent');
  assert.equal(initial[1], 'default');
  for (const name of ['ad_storage','analytics_storage','ad_user_data','ad_personalization'])
    assert.equal(initial[2][name], 'denied');
  assert.equal(initial[2].security_storage,'granted');
  events['brendigo:consentchange']({detail:{consent:{
    necessary:true, preferences:false, analytics:true,marketing:false
  }}});
  const update = Array.from(fakeWindow.dataLayer[1]);
  assert.equal(update[0], 'consent');
  assert.equal(update[1], 'update');
  assert.equal(update[2].analytics_storage, 'granted');
  assert.equal(update[2].ad_storage, 'denied');
  assert.equal(update[2].ad_user_data, 'denied');
  assert.equal(update[2].ad_personalization, 'denied');
});

test('GPC keeps Google marketing signals denied even when a client requests marketing', () => {
  const listeners={};
  const w={navigator:{globalPrivacyControl:true},dataLayer:[],addEventListener(k,v){listeners[k]=v;}};
  vm.runInNewContext(fs.readFileSync(path.join(root,'packages/integrations/google-consent-basic.js'),'utf8'),{window:w});
  listeners['brendigo:consentready']({detail:{consent:{
    preferences:true,analytics:true,marketing:true
  }}});
  const state=Array.from(w.dataLayer.at(-1))[2];
  assert.equal(state.analytics_storage,'granted');
  assert.equal(state.ad_storage,'denied');
  assert.equal(state.ad_user_data,'denied');
});

test('CDN loader resolves only assets in its versioned own directory', () => {
  const tags=[];
  const doc={
    currentScript:{src:'https://cookie.brendigo.com/v0.2.0/loader.js'},
    head:{appendChild(tag){tags.push(tag);}},
    createElement(tagName){return {tagName,addEventListener(){}};}
  };
  vm.runInNewContext(fs.readFileSync(path.join(root,'cdn/loader.js'),'utf8'),{
    document:doc, URL,window:{console}
  });
  assert.equal(tags.length,2);
  assert.equal(tags[0].href,'https://cookie.brendigo.com/v0.2.0/brendigo-cookieconsent.css');
  assert.equal(tags[1].src,'https://cookie.brendigo.com/v0.2.0/brendigo-cookieconsent.js');
});

test('all nine supported banner positions have a CSS rule', () => {
  const css=fs.readFileSync(path.join(root,'packages/core/brendigo-cookieconsent.css'),'utf8');
  for (const pos of ['bottom-center','bottom-left','bottom-right','bottom-bar',
    'top-center','top-left','top-right','top-bar','center']) {
    assert.ok(css.includes('.bcc-position-'+pos+' .bcc-banner'),pos+' must be styled');
  }
});

test('attribution is fixed and neither core nor WordPress exposes a toggle', () => {
  const js=fs.readFileSync(path.join(root,'packages/core/brendigo-cookieconsent.js'),'utf8');
  const php=fs.readFileSync(path.join(root,'wordpress/brendigo-cookieconsent/brendigo-cookieconsent.php'),'utf8');
  assert.match(js,/element\('a', 'bcc-credit', 'by Brendigo'\)/);
  assert.doesNotMatch(js,/showBranding/);
  assert.doesNotMatch(php,/show_branding/);
  assert.match(php,/The by Brendigo credit is always displayed/);
});
