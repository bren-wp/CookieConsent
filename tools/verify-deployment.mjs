#!/usr/bin/env node
/**
 * Verify a DEPLOYED Brendigo website and versioned CDN without modifying it.
 * Usage: node tools/verify-deployment.mjs https://cookie.brendigo.com
 * HTTP is accepted only on localhost for local CI tests.
 */
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const version=JSON.parse(readFileSync(path.join(root,'package.json'),'utf8')).version;
const raw=process.argv[2] || 'https://cookie.brendigo.com';
const origin=new URL(raw);
const local=['localhost','127.0.0.1','[::1]'].includes(origin.hostname);
if(origin.protocol!=='https:' && !(local && origin.protocol==='http:')) {
  throw new Error('Only HTTPS origins and local HTTP test servers are permitted.');
}
if(origin.username || origin.password || origin.pathname!=='/' || origin.search || origin.hash) {
  throw new Error('Supply an origin URL only, without credentials, path or query.');
}
async function get(target, expectedMime){
  const url=new URL(target,origin);
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),12000);
  try {
    const res=await fetch(url,{redirect:'follow',signal:controller.signal,
      headers:{'Accept':'*/*','User-Agent':'Brendigo-CDN-Deployment-Validator/1'}});
    if(!res.ok)throw new Error(target+' HTTP '+res.status);
    if(new URL(res.url).origin!==origin.origin)throw new Error(target+' redirected to another origin');
    const mime=res.headers.get('content-type') || '';
    if(expectedMime && !expectedMime.test(mime))throw new Error(target+' unexpected MIME '+mime);
    const body=Buffer.from(await res.arrayBuffer());
    if(!body.length)throw new Error(target+' is empty');
    console.log('OK ',res.status,body.length+' B',target);
    return body;
  }finally{clearTimeout(timeout);}
}
const html=/^text\/html\b/i;
const json=/^application\/json\b/i;
const css=/^text\/css\b/i;
const script=/^(?:text|application)\/(?:javascript|ecmascript)\b/i;
for(const page of ['/','/en.html','/installation.html','/legal.html','/demo/index.html']){
  const bytes=await get(page,html);
  if(!bytes.toString('utf8').includes('CookieConsent'))throw new Error(page+' missing product identity');
}
const prefix='/v'+version+'/';
const manifest=JSON.parse((await get(prefix+'manifest.json',json)).toString('utf8'));
if(manifest.version!==version || manifest.schema!==1 || !manifest.files ||
    typeof manifest.files!=='object')throw new Error('CDN manifest version/schema mismatch');
for(const name of ['loader.js','brendigo-cookieconsent.js',
  'brendigo-cookieconsent.css','google-consent-basic.js','LICENSE']){
  const listed=manifest.files[name];
  if(!listed || !/^[a-f0-9]{64}$/.test(listed.sha256))throw new Error('Missing checksum '+name);
  const expect=name.endsWith('.js')?script:name.endsWith('.css')?css:null;
  const bytes=await get(prefix+name,expect);
  if(bytes.length!==listed.size)throw new Error(name+' size differs from manifest');
  const sha=createHash('sha256').update(bytes).digest('hex');
  if(sha!==listed.sha256)throw new Error(name+' checksum differs from manifest');
}
console.log('PASS: website and CDN v'+version+' are reachable with expected MIME and SHA-256.');
