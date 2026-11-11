#!/usr/bin/env node
/**
 * Read-only hosting acceptance for an explicitly chosen HTTPS origin.
 * Does not change DNS, certificates, cache policies or server settings.
 */
import {lookup} from 'node:dns/promises';
import tls from 'node:tls';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const version=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version;
const raw=process.argv[2]||'https://cookie.brendigo.com';
const origin=new URL(raw);
if(origin.protocol!=='https:' || origin.username || origin.password ||
   origin.search || origin.hash || origin.pathname!=='/' || origin.port){
 throw Error('Provide a public HTTPS origin only, without credentials, port, path or query');
}
const name=origin.hostname;
const report={schema:'brendigo-hosting-check-v1',origin:origin.origin,version,
  checkedAt:new Date().toISOString(),checks:{},warnings:[],errors:[]};
try{
 const addresses=await lookup(name,{all:true});
 if(!addresses.length)throw Error('No DNS A/AAAA records resolved');
 report.checks.dns=addresses.map(a=>({address:a.address,family:a.family}));
}catch(e){report.errors.push('DNS: '+e.message);}
if(!report.errors.length){
 try{
   const cert=await new Promise((resolve,reject)=>{
     const socket=tls.connect({host:name,port:443,servername:name,rejectUnauthorized:true});
     socket.setTimeout(12000,()=>socket.destroy(Error('TLS timeout')));
     socket.once('secureConnect',()=>{const value=socket.getPeerCertificate();
       socket.end();resolve(value);});
     socket.once('error',reject);
   });
   const expires=new Date(cert.valid_to),days=Math.floor((expires-Date.now())/86400000);
   report.checks.tls={expiresAt:expires.toISOString(),daysRemaining:days,subject:cert.subject?.CN||''};
   if(days<14)report.errors.push('TLS certificate expires in less than 14 days');
 }catch(e){report.errors.push('TLS: '+e.message);}
}
async function check(url,asset){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
 try{
   const res=await fetch(origin.origin+url,{method:'HEAD',redirect:'manual',signal:controller.signal});
   if(res.status>=300&&res.status<400)throw Error('unexpected redirect '+res.status);
   if(!res.ok)throw Error('HTTP '+res.status);
   const contentType=res.headers.get('content-type')||'';
   if(url.endsWith('.js')&&!/^(?:text|application)\/(?:javascript|ecmascript)/i.test(contentType))
     throw Error('bad JavaScript MIME: '+contentType);
   if(url.endsWith('.css')&&!/^text\/css\b/i.test(contentType))
     throw Error('bad stylesheet MIME: '+contentType);
   const headers=['cache-control','strict-transport-security',
     'content-security-policy','referrer-policy','x-content-type-options'];
   const found=Object.fromEntries(headers.map(key=>[key,res.headers.get(key)]));
   if(asset&&!/immutable/i.test(found['cache-control']||'')){
     report.warnings.push(url+' lacks immutable Cache-Control');
   }
   if(!asset){
     for(const k of ['strict-transport-security','content-security-policy',
       'referrer-policy','x-content-type-options']){
       if(!found[k])report.warnings.push(url+' missing '+k);
     }
   }
   return {status:res.status,mime:contentType,headers:found};
 }finally{clearTimeout(timer);}
}
if(!report.errors.length){
 for(const [url,asset] of [['/',false],['/legal.html',false],
   ['/v'+version+'/manifest.json',true],['/v'+version+'/loader.js',true],
   ['/v'+version+'/brendigo-cookieconsent.css',true]]){
   try{report.checks[url]=await check(url,asset);}
   catch(e){report.errors.push(url+': '+e.message);}
 }
}
const output=path.join(root,'dist','hosting','latest-report.json');
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(report.errors.length)process.exitCode=1;
