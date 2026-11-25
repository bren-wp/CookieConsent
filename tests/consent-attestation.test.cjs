'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {generateKeyPairSync}=require('node:crypto');
const {attestReceipt,verifyAttestation}=require('../tools/consent-attestation.cjs');
function receipt(){return {schema:'brendigo-consent-receipt-v1',product:'CookieConsent by Brendigo',
 revision:'policy-v1',decidedAt:'2026-01-01T00:00:00.000Z',categories:{necessary:true,preferences:false,analytics:true,marketing:false},
 services:{stats:true},gpc:false,localOnly:true};}
test('attestation authenticates bytes, scope and key using independently trusted public key',()=>{
 const {privateKey,publicKey}=generateKeyPairSync('ed25519');
 const options={scope:'example.org',keyId:'key-1',privateKey};
 const trusted={scope:options.scope,keyId:options.keyId,publicKey};
 const signed=attestReceipt(receipt(),options);
 assert.equal(verifyAttestation(JSON.parse(JSON.stringify(signed)),trusted),true);
 assert.equal(verifyAttestation(signed,{...trusted,scope:'another.example'}),false);
 assert.equal(verifyAttestation(signed,{...trusted,keyId:'key-2'}),false);
 assert.equal(verifyAttestation(signed,{...trusted,publicKey:generateKeyPairSync('ed25519').publicKey}),false);
 signed.payload.receipt.categories.analytics=false;
 assert.equal(verifyAttestation(signed,trusted),false);
});
test('attestation excludes unknown personal fields and invalid consent shape',()=>{
 const {privateKey}=generateKeyPairSync('ed25519');
 const options={scope:'example.org',keyId:'key-1',privateKey};
 assert.throws(()=>attestReceipt({...receipt(),ip:'192.0.2.1'},options),/Invalid consent receipt/);
 const r=receipt();r.categories.necessary=false;
 assert.throws(()=>attestReceipt(r,options),/Invalid consent receipt/);
 assert.throws(()=>attestReceipt(receipt(),{...options,privateKey:null}),/private KeyObject/);
});
