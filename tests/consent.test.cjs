'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const consent = require('../packages/core/brendigo-cookieconsent.js');

test('core can be loaded without DOM or third-party packages', () => {
  assert.equal(consent.version, '0.7.0');
  assert.equal(typeof consent.init, 'function');
});
test('optional categories are denied by default', () => {
  assert.deepEqual(consent.utils.normalizeConsent({}), {
    necessary: true, preferences: false, analytics: false, marketing: false
  });
});
test('essential category is always on and values must be explicit booleans', () => {
  const c = consent.utils.normalizeConsent({ necessary: false, analytics: 'true', preferences: true });
  assert.deepEqual(c, {necessary: true, preferences: true, analytics: false, marketing: false});
});
test('GPC suppresses marketing even after accepting all', () => {
  assert.equal(consent.utils.normalizeConsent({marketing: true, analytics: true}, true).marketing, false);
});
test('a persisted record parses only for the current policy revision', () => {
  const data = consent.utils.encodeRecord({analytics: true}, 'revision-2', '2026-11-10T18:00:00.000Z');
  assert.equal(consent.utils.parseRecord(data, 'revision-2').analytics, true);
  assert.equal(consent.utils.parseRecord(data, 'revision-1'), null);
});
test('malformed cookie payload cannot bypass default denial', () => {
  assert.equal(consent.utils.parseRecord('%XX', '1'), null);
  assert.equal(consent.utils.parseRecord(encodeURIComponent('{"version":1}'), '1'), null);
});

test('unknown position fails closed to a supported banner location', () => {
  assert.equal(consent.utils.sanitizePosition('bottom-left'), 'bottom-left');
  assert.equal(consent.utils.sanitizePosition('top-bar'), 'top-bar');
  assert.equal(consent.utils.sanitizePosition('position:fixed;display:none'), 'bottom-center');
});
test('only six-digit hex colors are accepted', () => {
  assert.equal(consent.utils.sanitizeColor('#abc123', '#ffffff'), '#abc123');
  assert.equal(consent.utils.sanitizeColor('transparent', '#ffffff'), '#ffffff');
  assert.equal(consent.utils.sanitizeColor('#fff', '#ffffff'), '#ffffff');
});
test('foreground colors reach at least 4.5:1 contrast', () => {
  for (const background of ['#ffffff','#000000','#777777','#4357e8','#faf7db']) {
    const chosen = consent.utils.accessibleText('#ddddee', background);
    assert.ok(consent.utils.contrastRatio(chosen, background) >= 4.5,
      'contrast for '+background+' should be accessible');
  }
});
test('core attribution does not expose a disabling option', () => {
  const fs = require('node:fs');
  const source = fs.readFileSync(require('node:path').join(__dirname, '../packages/core/brendigo-cookieconsent.js'),'utf8');
  assert.match(source, /'by Brendigo'/);
  assert.doesNotMatch(source, /config\.showBranding|options\.showBranding/);
});

test('service metadata is limited to known categories and safe lengths', () => {
  const services = consent.utils.normalizeServices([
    {category: 'analytics', name:'Example Analytics', purpose:'Aggregate site metrics', cookies:'_example', duration:'13 months',privacyUrl:'https://example.org'},
    {category: 'unknown', name:'Should not appear'},
    {category: 'marketing', name:'   '}
  ]);
  assert.equal(services.length,1);
  assert.equal(services[0].name,'Example Analytics');
  assert.equal(services[0].category,'analytics');
});
test('service metadata trims oversized strings', () => {
  const result=consent.utils.normalizeServices([{category:'analytics',name:'X'.repeat(500),purpose:'p'.repeat(500)}]);
  assert.equal(result[0].name.length,120);
  assert.equal(result[0].purpose.length,350);
});

test('style sanitizer accepts the supported variants only', () => {
  for (const style of ['standard', 'compact', 'minimal'])
    assert.equal(consent.utils.sanitizeStyle(style), style);
  assert.equal(consent.utils.sanitizeStyle('display:none'), 'standard');
});
test('local audit is explicit, read-only and absent in Node without a DOM', () => {
  assert.deepEqual(consent.auditLocal(),{
    cookies:[],localStorage:[],sessionStorage:[],scripts:[],iframes:[]
  });
});

test('direction sanitizer constrains RTL to known modes', () => {
  assert.equal(consent.utils.sanitizeDirection('auto'),'auto');
  assert.equal(consent.utils.sanitizeDirection('rtl'),'rtl');
  assert.equal(consent.utils.sanitizeDirection('ltr'),'ltr');
  assert.equal(consent.utils.sanitizeDirection('rtl;display:none'),'auto');
});

test('service configuration rejects duplicate IDs and caps cookie size', () => {
  const items = Array.from({length:50},(_,i)=>({
    id:'service-'+i,category:'analytics',name:'Service '+i,toggleable:true
  }));
  const normalized=consent.utils.normalizeServices(items);
  assert.equal(normalized.length,50);
  assert.equal(normalized.filter(x=>x.toggleable).length,24);
  const dup=consent.utils.normalizeServices([
    {id:'same',category:'analytics',name:'first',toggleable:true},
    {id:'same',category:'marketing',name:'second',toggleable:true}
  ]);
  assert.equal(dup[1].toggleable,false);
});
test('cleanup requires explicit safe cookie names or literal prefixes', () => {
  const rules=consent.utils.normalizeCleanupRules([
    {category:'analytics',prefix:'_ga',serviceId:'google-analytics'},
    {category:'analytics',name:'_gid',path:'/'},
    {category:'necessary',name:'session'},
    {category:'marketing',prefix:'.*'},
    {category:'marketing',name:'foo;Path=/'}
  ]);
  assert.equal(rules.length,2);
  assert.equal(rules[0].serviceId,'google-analytics');
  assert.equal(rules[0].prefix,'_ga');
  assert.equal(rules[1].name,'_gid');
});
test('service choices persist alongside category consent in a backward compatible record',()=>{
  const encoded=consent.utils.encodeRecord(
    {analytics:true},'policy-1','2026-11-10T15:00:00.000Z',{'stats-a':true,'stats-b':false});
  assert.equal(consent.utils.parseRecord(encoded,'policy-1',false).analytics,true);
  const services=consent.utils.parseServiceRecord(encoded,'policy-1',false);
  assert.equal(services['stats-a'],true);
  assert.equal(services['stats-b'],false);
  assert.equal(consent.utils.parseServiceRecord(encoded,'policy-2',false),null);
});
