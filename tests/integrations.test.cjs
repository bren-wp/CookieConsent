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
function loaderFixture(attrs={},src='https://example.org/assets/loader.js',code=renderLoader(root).toString()){
  const nodes=[],events=[];
  const win={location:{href:'https://example.org/page'},console,
    CustomEvent:function(type,init){this.type=type;this.detail=init.detail;},
    dispatchEvent(event){events.push(event.detail.state);}};
  const doc={currentScript:{src,nonce:'page-nonce',getAttribute(k){return attrs[k]||null;}},
    head:{appendChild(node){nodes.push(node);}},
    createElement(type){return {type,handlers:{},addEventListener(k,f){this.handlers[k]=f;},
      remove(){this.removed=true;},fire(k){this.handlers[k]();}};}};
  const run=()=>vm.runInNewContext(code,{document:doc,window:win,URL});
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

test('provider grant generations are cancelled on revoke and stale unregister is harmless',()=>{
 const doc={readyState:'loading',documentElement:{lang:'en'},cookie:'',addEventListener(){},querySelectorAll(){return []}};
 const w={document:doc,navigator:{},location:{protocol:'https:',href:'https://example.org/'},URL,AbortController,console};
 vm.runInNewContext(fs.readFileSync(path.join(root,'packages/core/brendigo-cookieconsent.js'),'utf8'),{window:w,globalThis:w});
 const cc=w.BrendigoCookieConsent;cc.init({revision:'lifecycle'});
 const contexts=[],events=[];
 const old=cc.registerProvider({id:'stats',category:'analytics',onGrant(_,context){contexts.push(context);},onRevoke(){events.push('stop');}});
 cc.setConsent({analytics:true});assert.equal(contexts[0].isCurrent(),true);
 cc.setConsent({analytics:false});assert.equal(contexts[0].signal.aborted,true);assert.equal(contexts[0].isCurrent(),false);
 cc.setConsent({analytics:true});assert.equal(contexts[1].isCurrent(),true);
 old();assert.equal(contexts[1].signal.aborted,true);
 const replacement=cc.registerProvider({id:'stats',category:'analytics',onGrant(_,context){contexts.push(context);}});
 old();cc.setConsent({analytics:true});assert.equal(contexts[2].isCurrent(),true);
 replacement();assert.equal(contexts[2].isCurrent(),false);
 assert.deepEqual(events,['stop','stop']);
});
test('failed provider grant is cleaned up and not retried until permission changes',()=>{
 const doc={readyState:'loading',documentElement:{lang:'en'},cookie:'',addEventListener(){},querySelectorAll(){return []}};
 const w={document:doc,navigator:{},location:{protocol:'https:',href:'https://example.org/'},URL,AbortController,console:{error(){}}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'packages/core/brendigo-cookieconsent.js'),'utf8'),{window:w,globalThis:w});
 const cc=w.BrendigoCookieConsent;cc.init({revision:'failed'});
 let grants=0,stops=0;
 cc.registerProvider({id:'failed',category:'analytics',onGrant(){grants++;throw Error('failure');},onRevoke(){stops++;}});
 cc.setConsent({analytics:true});cc.setConsent({analytics:true});
 assert.equal(grants,1);assert.equal(stops,1);
 cc.setConsent({analytics:false});cc.setConsent({analytics:true});
 assert.equal(grants,2);assert.equal(stops,2);
});

test('provider revocation happens before configured cookie cleanup',()=>{
 const writes=[],events=[];
 const doc={readyState:'loading',documentElement:{lang:'en'},addEventListener(){},querySelectorAll(){return []}};
 Object.defineProperty(doc,'cookie',{get(){return '_ga=abc; wordpress_logged_in_test=keep';},set(value){writes.push(value);if(value.startsWith('_ga='))events.push('cleanup');}});
 const w={document:doc,navigator:{},location:{protocol:'https:',href:'https://example.org/'},URL,AbortController,console};
 vm.runInNewContext(fs.readFileSync(path.join(root,'packages/core/brendigo-cookieconsent.js'),'utf8'),{window:w,globalThis:w});
 const cc=w.BrendigoCookieConsent;
 cc.init({revision:'ordering',cookieCleanupRules:[{category:'analytics',name:'_ga'},{category:'analytics',prefix:'wordpress_'}]});
 cc.registerProvider({id:'stats',category:'analytics',onGrant(){},onRevoke(){events.push('revoke');}});
 cc.setConsent({analytics:true});cc.setConsent({analytics:false});
 assert.deepEqual(events,['revoke','cleanup']);
 assert.ok(!writes.some(value=>value.startsWith('wordpress_logged_in_test=')));
});

function transactionFixture(options={}) {
 const doc={readyState:'loading',documentElement:{lang:'en'},cookie:'',addEventListener(){},querySelectorAll(){return []}};
 const w={document:doc,navigator:{},location:{protocol:'https:',href:'https://example.org/'},URL,AbortController,console:{error(){}}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'packages/core/brendigo-cookieconsent.js'),'utf8'),{window:w,globalThis:w});
 const cc=w.BrendigoCookieConsent;cc.init(options);return cc;
}
test('consent callbacks cannot reenter a partially committed transaction',()=>{
 let cc, attempts=0;
 cc=transactionFixture({onChange(){
   attempts++;
   assert.throws(()=>cc.reset(),/transition in progress/);
   assert.throws(()=>cc.setConsent({marketing:true}),/transition in progress/);
   assert.throws(()=>cc.refresh(),/transition in progress/);
 }});
 cc.setConsent({analytics:true});
 assert.equal(attempts,1);assert.equal(cc.hasConsent('analytics'),true);
 assert.equal(cc.hasConsent('marketing'),false);
 cc.reset();assert.equal(cc.getConsent(),null);
});
test('asynchronous provider teardown prevents restart until it completes',async()=>{
 const cc=transactionFixture(),contexts=[];
 let finish;
 cc.registerProvider({id:'stats',category:'analytics',onGrant(_,ctx){contexts.push(ctx);},
   onRevoke(){return new Promise(resolve=>{finish=resolve;});}});
 cc.setConsent({analytics:true});cc.setConsent({analytics:false});
 assert.equal(contexts[0].signal.aborted,true);
 cc.setConsent({analytics:true});assert.equal(contexts.length,1);
 finish();await new Promise(resolve=>setImmediate(resolve));
 assert.equal(contexts.length,2);assert.equal(contexts[1].isCurrent(),true);
});
test('failed asynchronous teardown blocks future activation',async()=>{
 const cc=transactionFixture();let grants=0;
 cc.registerProvider({id:'stats',category:'analytics',onGrant(){grants++;},
   onRevoke(){return Promise.reject(Error('teardown failed'));}});
 cc.setConsent({analytics:true});cc.setConsent({analytics:false});cc.setConsent({analytics:true});
 await new Promise(resolve=>setImmediate(resolve));
 cc.setConsent({analytics:false});cc.setConsent({analytics:true});assert.equal(grants,1);
});

test('WordPress bootstrap accepts trusted local tag pins only on its own origin',()=>{
 const code=fs.readFileSync(path.join(root,'wordpress/brendigo-cookieconsent/assets/wp-cdn-loader.js'),'utf8');
 const {createHash}=require('node:crypto');
 const pin=ext=>'sha384-'+createHash('sha384').update(fs.readFileSync(path.join(root,'packages/core/brendigo-cookieconsent.'+ext))).digest('base64');
 const attrs={'data-bcc-cdn':'true','data-bcc-css-integrity':pin('css'),'data-bcc-js-integrity':pin('js')};
 const src='https://example.org/assets/wp-cdn-loader.js?ver='+require('../package.json').version;
 const f=loaderFixture(attrs,src,code);
 assert.equal(f.nodes[0].integrity,pin('css'));
 f.nodes[0].fire('error');assert.equal(f.nodes[1].href,'https://example.org/assets/brendigo-cookieconsent.css');
 f.nodes[1].fire('load');assert.equal(f.nodes[2].integrity,pin('js'));
 assert.equal(loaderFixture({'data-bcc-cdn':'true'},src,code).nodes.length,0);
 const remote='https://api.brendigo.com/cookieconsent/v'+require('../package.json').version+'/loader.js';
 assert.equal(loaderFixture(attrs,remote,code).nodes.length,0);
});

test('one cookie snapshot restores a consistent decision and ambiguous duplicates are denied',()=>{
 const record=encodeURIComponent(JSON.stringify({version:1,revision:'snapshot',date:new Date().toISOString(),categories:{analytics:true},services:{stats:false}}));
 let reads=0;
 const doc={readyState:'loading',documentElement:{lang:'en'},addEventListener(){},querySelectorAll(){return []}};
 Object.defineProperty(doc,'cookie',{get(){reads++;return 'bcc_consent='+record;}});
 const w={document:doc,navigator:{},location:{protocol:'https:',href:'https://example.org/'},URL,console};
 vm.runInNewContext(fs.readFileSync(path.join(root,'packages/core/brendigo-cookieconsent.js'),'utf8'),{window:w,globalThis:w});
 w.BrendigoCookieConsent.init({revision:'snapshot',services:[{id:'stats',category:'analytics',name:'Stats',toggleable:true}]});
 assert.equal(reads,1);assert.equal(w.BrendigoCookieConsent.hasConsent('analytics'),true);
 assert.equal(w.BrendigoCookieConsent.hasServiceConsent('stats'),false);
 const doc2={...doc,cookie:'bcc_consent='+record+'; bcc_consent='+record};
 const w2={...w,document:doc2};vm.runInNewContext(fs.readFileSync(path.join(root,'packages/core/brendigo-cookieconsent.js'),'utf8'),{window:w2,globalThis:w2});
 w2.BrendigoCookieConsent.init({revision:'snapshot'});assert.equal(w2.BrendigoCookieConsent.getConsent(),null);
});
test('blocked cookie and storage access does not interrupt in-page revocation',()=>{
 const doc={readyState:'loading',documentElement:{lang:'en'},addEventListener(){},querySelectorAll(){return []}};
 Object.defineProperty(doc,'cookie',{get(){throw Error('blocked');},set(){throw Error('blocked');}});
 const w={document:doc,navigator:{},location:{protocol:'https:',href:'https://example.org/'},URL,AbortController,console};
 for(const name of ['localStorage','sessionStorage'])Object.defineProperty(w,name,{get(){throw Error('blocked');}});
 vm.runInNewContext(fs.readFileSync(path.join(root,'packages/core/brendigo-cookieconsent.js'),'utf8'),{window:w,globalThis:w});
 const cc=w.BrendigoCookieConsent;cc.init({});let revoked=0;
 cc.registerProvider({id:'stats',category:'analytics',onRevoke(){revoked++;}});
 cc.setConsent({analytics:true});cc.reset();assert.equal(revoked,1);assert.equal(cc.getConsent(),null);
 assert.equal(cc.auditLocal().localStorage.length,0);
});

test('stored category approval cannot silently authorize an undeclared-in-record service',()=>{
 const raw=encodeURIComponent(JSON.stringify({version:1,revision:'policy',date:new Date().toISOString(),categories:{analytics:true},services:{old:true}}));
 const doc={readyState:'loading',documentElement:{lang:'en'},cookie:'bcc_consent='+raw,addEventListener(){},querySelectorAll(){return []}};
 const w={document:doc,navigator:{},location:{protocol:'https:',href:'https://example.org/'},URL,console};
 vm.runInNewContext(fs.readFileSync(path.join(root,'packages/core/brendigo-cookieconsent.js'),'utf8'),{window:w,globalThis:w});
 const cc=w.BrendigoCookieConsent;cc.init({revision:'policy',services:[{id:'old',category:'analytics',name:'Old',toggleable:true},{id:'new',category:'analytics',name:'New',toggleable:true}]});
 assert.equal(cc.hasServiceConsent('old'),true);assert.equal(cc.hasServiceConsent('new'),false);
 cc.setConsent({analytics:true});assert.equal(cc.hasServiceConsent('new'),true);
});
test('resource category must match declared granular service',()=>{
 const activated=[];
 function source(category,service){return {getAttribute(k){return {'data-bcc-category':category,'data-bcc-service':service}[k]||null;},setAttribute(){},hasAttribute(){return false;},textContent:'',parentNode:{insertBefore(){activated.push(service+':'+category);}}};}
 const sources=[source('preferences','stats'),source('analytics','stats'),source('necessary','missing')];
 const doc={readyState:'loading',documentElement:{lang:'en'},cookie:'',addEventListener(){},querySelectorAll(sel){return sel.startsWith('script')?sources:[];},createElement(){return {setAttribute(){}};}};
 const w={document:doc,navigator:{},location:{protocol:'https:',href:'https://example.org/'},URL,console};
 vm.runInNewContext(fs.readFileSync(path.join(root,'packages/core/brendigo-cookieconsent.js'),'utf8'),{window:w,globalThis:w});
 const cc=w.BrendigoCookieConsent;cc.init({services:[{id:'stats',category:'analytics',name:'Stats',toggleable:true}]});
 cc.setConsent({analytics:true,preferences:true});assert.deepEqual(activated,['stats:analytics']);
});

test('new GPC signal revokes marketing without fabricating a user decision or regranting on signal removal',()=>{
 const doc={readyState:'loading',documentElement:{lang:'en'},cookie:'',addEventListener(){},querySelectorAll(){return []}};
 const w={document:doc,navigator:{globalPrivacyControl:false},location:{protocol:'https:',href:'https://example.org/'},URL,AbortController,console};
 vm.runInNewContext(fs.readFileSync(path.join(root,'packages/core/brendigo-cookieconsent.js'),'utf8'),{window:w,globalThis:w});
 const cc=w.BrendigoCookieConsent;let decisions=0,revokes=0;
 cc.init({onDecision(){decisions++;}});
 cc.registerProvider({id:'ads',category:'marketing',onRevoke(){revokes++;}});
 cc.setConsent({marketing:true});const date=cc.getConsentReceipt().decidedAt;
 w.navigator.globalPrivacyControl=true;assert.equal(cc.hasConsent('marketing'),false);
 cc.refresh();assert.equal(revokes,1);assert.equal(decisions,1);
 assert.equal(cc.getConsentReceipt().decidedAt,date);
 assert.equal(cc.getPrivacySignals().globalPrivacyControl,true);
 w.navigator.globalPrivacyControl=false;cc.refresh();assert.equal(cc.hasConsent('marketing'),false);
});
