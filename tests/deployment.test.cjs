'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {createHash}=require('node:crypto'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),version=require('../package.json').version;
test('deployment verifier validates reachable files and checksum manifest on local HTTP',async()=>{
 const files={};
 for(const [name,source] of [
  ['loader.js','cdn/loader.js'],
  ['brendigo-cookieconsent.js','packages/core/brendigo-cookieconsent.js'],
  ['brendigo-cookieconsent.css','packages/core/brendigo-cookieconsent.css'],
  ['google-consent-basic.js','packages/integrations/google-consent-basic.js'],
  ['LICENSE','LICENSE']
 ])files[name]=fs.readFileSync(path.join(root,source));
 const manifest={schema:1,version,origin:'http://127.0.0.1',files:{}};
 for(const [name,body] of Object.entries(files))manifest.files[name]={
  size:body.length,sha256:createHash('sha256').update(body).digest('hex')};
 const server=http.createServer((req,res)=>{
  const u=new URL(req.url,'http://127.0.0.1'),name=u.pathname.split('/').pop();
  const isFile=u.pathname.startsWith('/v'+version+'/');
  const body= isFile && name==='manifest.json' ? Buffer.from(JSON.stringify(manifest)) :
    isFile ? files[name] :
    u.pathname==='/' ? fs.readFileSync(path.join(root,'website/index.html')) :
    ['/en.html','/installation.html','/legal.html'].includes(u.pathname)
      ?fs.readFileSync(path.join(root,'website'+u.pathname)):
    u.pathname==='/demo/index.html'?fs.readFileSync(path.join(root,'demo/index.html')):null;
  if(!body){res.writeHead(404).end();return;}
  const mime=name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':
    name.endsWith('.json')?'application/json':'text/html';
  res.writeHead(200,{'content-type':mime});res.end(body);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  const url='http://127.0.0.1:'+server.address().port+'/';
  const output=await new Promise((resolve,reject)=>{
   const child=spawn(process.execPath,['tools/verify-deployment.mjs',url],{cwd:root});
   let text='';
   child.stdout.on('data',chunk=>text+=chunk.toString());
   child.stderr.on('data',chunk=>text+=chunk.toString());
   child.once('error',reject);
   child.once('close',code=>code===0?resolve(text):reject(Error(text)));
  });
  assert.match(output,/PASS: website and CDN/);
  // The checked website is local. This test never claims public DNS is live.
 }finally{await new Promise(resolve=>server.close(resolve));}
});
