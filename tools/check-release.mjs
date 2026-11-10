#!/usr/bin/env node
// Block releases if distributed assets or documentation use inconsistent versions.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const version=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version;
if(!/^\d+\.\d+\.\d+$/.test(version))throw Error('Invalid release version');
const required=[
 ['packages/core/brendigo-cookieconsent.js',"var VERSION = '"+version+"'"],
 ['wordpress/brendigo-cookieconsent/assets/brendigo-cookieconsent.js',"var VERSION = '"+version+"'"],
 ['wordpress/brendigo-cookieconsent/brendigo-cookieconsent.php',"const VERSION = '"+version+"'"],
 ['wordpress/brendigo-cookieconsent/brendigo-cookieconsent.php','Version: '+version],
 ['wordpress/brendigo-cookieconsent/readme.txt','Stable tag: '+version],
 ['cdn/loader.js','v'+version],
 ['README.md','version-'+version],
 ['README.md','/v'+version+'/loader.js'],
 ['docs/CDN.hr.md','/v'+version+'/loader.js'],
 ['docs/COMPATIBILITY.md','v'+version],
 ['docs/ROADMAP.md',version],
 ['.github/workflows/ci.yml','dist/cdn/v'+version+'/manifest.json'],
 ['.github/workflows/package.yml','dist/cdn/v'+version+'/manifest.json'],
 ['tests/consent.test.cjs',"consent.version, '"+version+"'"]
];
const errors=[];
for(const [filename,expected] of required){
 const source=fs.readFileSync(path.join(root,filename),'utf8');
 if(!source.includes(expected))errors.push(filename+' missing '+expected);
}
for(const ext of ['js','css']){
 const a=fs.readFileSync(path.join(root,'packages/core/brendigo-cookieconsent.'+ext));
 const b=fs.readFileSync(path.join(root,'wordpress/brendigo-cookieconsent/assets/brendigo-cookieconsent.'+ext));
 if(!a.equals(b))errors.push('Core and WordPress '+ext+' differ');
}
if(errors.length){errors.forEach(x=>process.stderr.write('FAIL '+x+'\n'));process.exit(1);}
process.stdout.write('Version consistency OK: v'+version+'\n');
