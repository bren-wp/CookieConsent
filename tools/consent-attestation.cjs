'use strict';
// Optional SERVER-SIDE primitive. Never bundle a private key in a browser,
// plugin ZIP, CDN, or source repository. No HTTP endpoint or data collection.
const {sign,verify}=require('node:crypto');
const CATEGORIES=['necessary','preferences','analytics','marketing'];
const keys=(obj,expected)=>obj && typeof obj==='object' && !Array.isArray(obj) &&
  Object.keys(obj).length===expected.length && expected.every(k=>Object.hasOwn(obj,k));
const identifier=value=>typeof value==='string' && /^[a-zA-Z0-9._:-]{1,120}$/.test(value);
function date(value){
  if(typeof value!=='string'||value.length!==24)return false;
  const time=new Date(value);
  return Number.isFinite(time.getTime())&&time.toISOString()===value;
}
function canonicalReceipt(input){
  if(!keys(input,['schema','product','revision','decidedAt','categories','services','gpc','localOnly']) ||
    input.schema!=='brendigo-consent-receipt-v1'||input.product!=='CookieConsent by Brendigo'||
    typeof input.revision!=='string'||!input.revision.length||input.revision.length>160||
    !date(input.decidedAt)||typeof input.gpc!=='boolean'||input.localOnly!==true||
    !keys(input.categories,CATEGORIES)||input.categories.necessary!==true||
    !CATEGORIES.every(k=>typeof input.categories[k]==='boolean')||
    (input.gpc&&input.categories.marketing)||
    !input.services||typeof input.services!=='object'||Array.isArray(input.services)||
    Object.keys(input.services).length>24)throw new TypeError('Invalid consent receipt');
  const services=Object.create(null);
  for(const id of Object.keys(input.services).sort()){
    if(!/^[a-zA-Z0-9._-]{1,64}$/.test(id)||typeof input.services[id]!=='boolean')
      throw new TypeError('Invalid service consent');
    services[id]=input.services[id];
  }
  return {schema:input.schema,product:input.product,revision:input.revision,
    decidedAt:input.decidedAt,categories:Object.fromEntries(CATEGORIES.map(k=>[k,input.categories[k]])),
    services,gpc:input.gpc,localOnly:true};
}
function canonicalPayload(input){
  if(!keys(input,['schema','scope','keyId','attestedAt','receipt'])||
    input.schema!=='brendigo-consent-attestation-v1'||!identifier(input.scope)||
    !identifier(input.keyId)||!date(input.attestedAt))throw new TypeError('Invalid attestation');
  const receipt=canonicalReceipt(input.receipt);
  if(receipt.decidedAt>input.attestedAt)throw new TypeError('Decision time is in the future');
  return {schema:input.schema,scope:input.scope,keyId:input.keyId,attestedAt:input.attestedAt,receipt};
}
function bytes(payload){return Buffer.from(JSON.stringify(payload),'utf8');}
function attestReceipt(receipt,{scope,keyId,privateKey}){
  if(!privateKey||privateKey.type!=='private'||privateKey.asymmetricKeyType!=='ed25519')
    throw new TypeError('An operator-owned Ed25519 private KeyObject is required');
  const payload=canonicalPayload({schema:'brendigo-consent-attestation-v1',scope,keyId,
    attestedAt:new Date().toISOString(),receipt});
  return {payload,signature:sign(null,bytes(payload),privateKey).toString('base64url')};
}
function verifyAttestation(envelope,{scope,keyId,publicKey}){
  try{
    if(!publicKey||publicKey.type!=='public'||publicKey.asymmetricKeyType!=='ed25519'||
      !keys(envelope,['payload','signature'])||typeof envelope.signature!=='string'||
      !/^[A-Za-z0-9_-]{86}$/.test(envelope.signature))return false;
    const payload=canonicalPayload(envelope.payload);
    if(payload.scope!==scope||payload.keyId!==keyId)return false;
    const signature=Buffer.from(envelope.signature,'base64url');
    if(signature.length!==64||signature.toString('base64url')!==envelope.signature)return false;
    return verify(null,bytes(payload),publicKey,signature);
  }catch(_){return false;}
}
module.exports={attestReceipt,verifyAttestation};
