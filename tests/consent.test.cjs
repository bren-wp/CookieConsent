'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const consent = require('../packages/core/brendigo-cookieconsent.js');

test('core can be loaded without DOM or third-party packages', () => {
  assert.equal(consent.version, '0.1.0');
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
