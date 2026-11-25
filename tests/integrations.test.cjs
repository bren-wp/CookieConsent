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

const {renderLoader}=require('../tools/render-cdn-loader.cjs');
function loaderFixture(attrs={},src='https://example.org/assets/loader.js'){
  const nodes=[],events=[];
  const win={location:{href:'https://example.org/page'},console,
    CustomEvent:function(type,init){this.type=type;this.detail=init.detail;},
    dispatchEvent(event){events.push(event.detail.state);}};
  const doc={currentScript:{src,nonce:'page-nonce',getAttribute(k){return attrs[k]||null;}},
    head:{appendChild(node){nodes.push(node);}},
    createElement(type){return {type,handlers:{},addEventListener(k,f){this.handlers[k]=f;},
      remove(){this.removed=true;},fire(k){this.handlers[k]();}};}};
  const run=()=>vm.runInNewContext(renderLoader(root).toString(),{document:doc,window:win,URL});
  run();
  return {nodes,events,win,run};
}
test('CDN loader pins both resources, waits for CSS and rejects duplicate startup',()=>{
  const f=loaderFixture({'data-bcc-cdn':'true'});
  assert.equal(f.nodes.length,1);
  assert.match(f.nodes[0].href,/^https:\/\/api\.brendigo\.com\/cookieconsent\/v/);
  f.run();assert.equal(f.nodes.length,1);
  f.nodes[0].fire('load');
  assert.equal(f.nodes.length,2);
  for(const n of f.nodes){
    assert.match(n.integrity,/^sha384-[A-Za-z0-9+/]{64}$/);
    assert.equal(n.nonce,'page-nonce');
    assert.equal(n.crossOrigin,'anonymous');
    assert.equal(n.referrerPolicy,'no-referrer');
  }
  f.win.BrendigoCookieConsent={};
  f.nodes[1].fire('load');
  assert.deepEqual(f.events,['ready']);
});
test('CDN script failure uses equally pinned same-origin fallback exactly once',()=>{
  const f=loaderFixture({'data-bcc-cdn':'true'});
  f.nodes[0].fire('load');f.nodes[1].fire('error');
  assert.equal(f.nodes[0].removed,true);
  assert.equal(f.nodes[2].href,'https://example.org/assets/brendigo-cookieconsent.css');
  assert.equal(f.nodes[2].integrity,f.nodes[0].integrity);
  f.nodes[2].fire('load');
  assert.equal(f.nodes[3].integrity,f.nodes[1].integrity);
  f.nodes[3].fire('error');
  assert.deepEqual(f.events,['unavailable']);
  assert.equal(f.nodes.length,4);
});
test('remote loader refuses an unrelated origin and untrusted fallback',()=>{
  const bad=loaderFixture({},'https://untrusted.example/loader.js');
  assert.equal(bad.nodes.length,0);
  const version=require('../package.json').version;
  const f=loaderFixture({'data-bcc-fallback':'https://untrusted.example/'},
    'https://api.brendigo.com/cookieconsent/v'+version+'/loader.js');
  f.nodes[0].fire('error');
  assert.deepEqual(f.events,['unavailable']);
  assert.equal(f.nodes.length,1);
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

test('provider lifecycle: callbacks run on permission changes and reset', () => {
  const fs=require('node:fs');
  const vm=require('node:vm');
  const root=require('node:path').join(__dirname, '..');
  const events=[];
  const doc={
    readyState:'loading',
    documentElement:{lang:'hr'},
    cookie:'',
    addEventListener(){},
    querySelectorAll(){return []}
  };
  const fakeWindow={
    document:doc, navigator:{globalPrivacyControl:false},
    location:{protocol:'https:',href:'https://example.org/'},
    URL, console,
    CustomEvent:class {constructor(name,data){this.type=name;this.detail=data.detail;}},
    dispatchEvent(event){events.push(event.type);}
  };
  const ctx={window:fakeWindow,globalThis:fakeWindow};
  vm.runInNewContext(fs.readFileSync(require('node:path').join(root,'packages/core/brendigo-cookieconsent.js'),'utf8'),ctx);
  const cc=fakeWindow.BrendigoCookieConsent;
  cc.init({language:'hr',revision:'test'});
  const lifecycle=[];
  const unregister=cc.registerProvider({
    id:'test-analytics',category:'analytics',
    onGrant(){lifecycle.push('grant');},
    onRevoke(){lifecycle.push('revoke');}
  });
  assert.equal(cc.hasConsent('analytics'),false);
  cc.setConsent({analytics:true});
  assert.equal(cc.hasConsent('analytics'),true);
  cc.setConsent({analytics:true});
  cc.setConsent({analytics:false});
  cc.setConsent({analytics:true});
  cc.reset();
  assert.deepEqual(lifecycle,['grant','revoke','grant','revoke']);
  assert.equal(cc.getConsent(),null);
  assert.ok(events.includes('brendigo:consentrevoked'));
  unregister();
});
test('provider lifecycle rejects invalid registration and duplicate IDs', () => {
  const fs=require('node:fs');
  const vm=require('node:vm');
  const root=require('node:path').join(__dirname, '..');
  const fakeWindow={document:{readyState:'loading',documentElement:{lang:'en'},cookie:'',addEventListener(){},querySelectorAll(){return []}},
    navigator:{},location:{protocol:'https:',href:'https://example.org/'}, URL,console};
  vm.runInNewContext(fs.readFileSync(require('node:path').join(root,'packages/core/brendigo-cookieconsent.js'),'utf8'),{window:fakeWindow,globalThis:fakeWindow});
  const cc=fakeWindow.BrendigoCookieConsent;
  assert.throws(()=>cc.registerProvider({id:'evil',category:'necessary'}), /Invalid or duplicate CookieConsent provider/);
  cc.registerProvider({id:'provider-1',category:'analytics'});
  assert.throws(()=>cc.registerProvider({id:'provider-1',category:'analytics'}), /Invalid or duplicate CookieConsent provider/);
});

test('WordPress external config reader uses inert JSON without evaluating input',()=>{
  const queries=[];
  const win={BCC_SITE_CONFIG:null,document:{querySelector(selector){
    queries.push(selector);
    return {getAttribute(key){return key==='content'?
      JSON.stringify({language:'hr',revision:'wp-v1',services:[],policyUrl:'/cookies'}):null;}};
  }}};
  const source=fs.readFileSync(path.join(root,'wordpress/brendigo-cookieconsent/assets/wp-config.js'),'utf8');
  vm.runInNewContext(source,{window:win});
  assert.equal(win.BCC_SITE_CONFIG.language,'hr');
  assert.equal(win.BCC_SITE_CONFIG.revision,'wp-v1');
  assert.equal(queries.length,1);
  win.BCC_SITE_CONFIG={language:'en'};
  vm.runInNewContext(source,{window:win});
  assert.equal(win.BCC_SITE_CONFIG.language,'en','do not overwrite site-provided config');
  const malformed={document:{querySelector(){return {getAttribute(){return '{incomplete';}}}}};
  assert.doesNotThrow(()=>vm.runInNewContext(source,{window:malformed}));
  assert.equal(malformed.BCC_SITE_CONFIG,undefined);
});
