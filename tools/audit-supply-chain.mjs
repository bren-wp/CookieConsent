#!/usr/bin/env node
/**
 * No-network audit of CI action pinning and shipped runtime dependencies.
 * A pinned hash is not an independent review of that action or downloaded
 * executables; the latter still require trusted provenance and checksums.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'.github/workflows');
const workflowFiles=fs.readdirSync(dir).filter(name=>/\.ya?ml$/.test(name));
const failures=[];
for(const name of workflowFiles){
 const source=fs.readFileSync(path.join(dir,name),'utf8');
 for(const line of source.split(/\r?\n/)){
   const found=line.match(/^\s*-?\s*uses:\s*([^\s#]+)/);
   if(!found)continue;
   const value=found[1];
   if(!value.startsWith('./')&&!/^[\w.-]+\/[\w.-]+@[a-f0-9]{40}$/.test(value)){
     failures.push(name+' unpinned action: '+value);
   }
 }
}
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
if(Object.keys(pkg.dependencies||{}).length)failures.push('Unexpected production dependencies');
if(Object.keys(pkg.optionalDependencies||{}).length)failures.push('Unexpected optional production dependencies');
if(!workflowFiles.length)failures.push('No workflows audited');
if(failures.length){failures.forEach(x=>process.stderr.write('FAIL '+x+'\n'));process.exit(1);}
console.log('PASS supply-chain static gate: '+workflowFiles.length+' workflows; all remote actions pinned; no production npm dependencies.');
