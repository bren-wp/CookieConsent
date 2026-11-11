#!/usr/bin/env node
/**
 * Syntax-check every tracked source location that can ship JavaScript.
 * Skips build outputs and dependencies; PHP syntax is validated separately in CI.
 */
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const roots=['cdn','packages','wordpress','joomla','drupal','shopify',
  'magento','opencart','prestashop','website','demo','tests','tools'];
const files=[];
function walk(dir){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())walk(full);
    else if(entry.isFile() && /\.(?:js|cjs|mjs)$/.test(entry.name))files.push(full);
  }
}
for(const location of roots)walk(path.join(root,location));
let errors=0;
for(const filename of files.sort()){
  const result=spawnSync(process.execPath,['--check',filename],{
    encoding:'utf8',maxBuffer:1024*1024
  });
  if(result.error || result.status!==0){
    errors++;
    process.stderr.write('FAIL '+path.relative(root,filename)+'\n');
    process.stderr.write(String(result.error||result.stderr||result.stdout||'Unknown syntax error'));
  }
}
if(!files.length || errors){
  process.stderr.write('JavaScript syntax audit failed: '+errors+' / '+files.length+'\n');
  process.exit(1);
}
process.stdout.write('JavaScript syntax checked: '+files.length+' files\n');
