#!/usr/bin/env node
/**
 * Verify a DEPLOYED Brendigo website and versioned CDN without modifying it.
 * Usage: node tools/verify-deployment.mjs --website https://cookie.brendigo.com
 *        node tools/verify-deployment.mjs --cdn https://api.brendigo.com/cookieconsent/
 * HTTP is accepted only on localhost for local CI tests.
 */
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const version=JSON.parse(readFileSync(path.join(root,'package.json'),'utf8')).version;
const args=process.argv.slice(2);
const mode=args[0]==='--website'?'website':args[0]==='--cdn'?'cdn':'combined';
if(args.length!==(mode==='combined'?1:2))throw Error('Supply --website URL or --cdn URL (or a local combined test URL)');
const origin=new URL(args[mode==='combined'?0:1]);
const local=['localhost','127.0.0.1','[::1]'].includes(origin.hostname);
if(origin.protocol!=='https:' && !(local && origin.protocol==='http:')) {
  throw new Error('Only HTTPS origins and local HTTP test servers are permitted.');
}
if(origin.username || origin.password || origin.search || origin.hash ||
   (mode!=='cdn' && origin.pathname!=='/') ||
   (mode==='cdn' && !/^\/(?:[A-Za-z0-9_-]+\/)*$/.test(origin.pathname))) {
  throw new Error('Supply a valid website origin or CDN directory URL with trailing slash.');
}
if(mode==='combined' && !local)throw Error('Combined mode is only for local tests; use explicit website and CDN checks.');
async function get(target, expectedMime){
  const url=new URL(target.replace(/^\//,''),origin);
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),12000);
  try {
    const res=await fetch(url,{redirect:'manual',signal:controller.signal,
      headers:{'Accept':'*/*','User-Agent':'Brendigo-CDN-Deployment-Validator/1'}});
    if(res.status >= 300 && res.status < 400)throw new Error(target+' redirect is not allowed');
    if(!res.ok)throw new Error(target+' HTTP '+res.status);
    if(new URL(res.url).origin!==origin.origin)throw new Error(target+' redirected to another origin');
    const mime=res.headers.get('content-type') || '';
    if(expectedMime && !expectedMime.test(mime))throw new Error(target+' unexpected MIME '+mime);
    // Do not buffer unbounded or attacker-controlled responses in the validator.
    const maxBytes=2*1024*1024;
    const advertised=res.headers.get('content-length');
    if(advertised !== null && Number(advertised)>maxBytes) {
      throw new Error(target+' exceeds the 2 MiB validation limit');
    }
    if(!res.body)throw new Error(target+' has no response body');
    const reader=res.body.getReader();
    const chunks=[];let length=0;
    for(;;){
      const part=await reader.read();
      if(part.done)break;
      length+=part.value.byteLength;
      if(length>maxBytes){
        await reader.cancel();
        throw new Error(target+' exceeds the 2 MiB validation limit');
      }
      chunks.push(Buffer.from(part.value));
    }
    const body=Buffer.concat(chunks,length);
    if(!body.length)throw new Error(target+' is empty');
    console.log('OK ',res.status,body.length+' B',target);
    return body;
  }finally{clearTimeout(timeout);}
}
const html=/^text\/html\b/i;
const json=/^application\/json\b/i;
const css=/^text\/css\b/i;
const script=/^(?:text|application)\/(?:javascript|ecmascript)\b/i;
if(mode!=='cdn'){
for(const page of ['/','/en.html','/installation.html','/legal.html','/demo/index.html']){
  const bytes=await get(page,html);
  if(!bytes.toString('utf8').includes('CookieConsent'))throw new Error(page+' missing product identity');
}
console.log('PASS: website pages are reachable.');
}
if(mode!=='website'){
const prefix='/v'+version+'/';
const manifest=JSON.parse((await get(prefix+'manifest.json',json)).toString('utf8'));
if(manifest.version!==version || manifest.schema!==1 || !manifest.files ||
    typeof manifest.files!=='object')throw new Error('CDN manifest version/schema mismatch');
const trustedSources={
  'loader.js':'cdn/loader.js',
  'brendigo-cookieconsent.js':'packages/core/brendigo-cookieconsent.js',
  'brendigo-cookieconsent.css':'packages/core/brendigo-cookieconsent.css',
  'google-consent-basic.js':'packages/integrations/google-consent-basic.js',
  'video-embeds.js':'packages/integrations/video-embeds.js',
  'LICENSE':'LICENSE'
};
for(const [name,source] of Object.entries(trustedSources)){
  const listed=manifest.files[name];
  if(!listed || !/^[a-f0-9]{64}$/.test(listed.sha256))throw new Error('Missing checksum '+name);
  const expect=name.endsWith('.js')?script:name.endsWith('.css')?css:null;
  const bytes=await get(prefix+name,expect);
  if(bytes.length!==listed.size)throw new Error(name+' size differs from manifest');
  const sha=createHash('sha256').update(bytes).digest('hex');
  if(sha!==listed.sha256)throw new Error(name+' checksum differs from manifest');
  const trusted=readFileSync(path.join(root,source));
  const trustedSha=createHash('sha256').update(trusted).digest('hex');
  if(sha!==trustedSha || bytes.length!==trusted.length)
    throw new Error(name+' differs from trusted checkout');
}
console.log('PASS: CDN v'+version+' is reachable with expected MIME and trusted SHA-256.');
}
if(mode==='combined')console.log('PASS: website and CDN');
