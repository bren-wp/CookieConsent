'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const root=path.resolve(__dirname,'..');
const limits=[
 {path:'packages/core/brendigo-cookieconsent.js',raw:90*1024,gzip:30*1024},
 {path:'packages/core/brendigo-cookieconsent.css',raw:32*1024,gzip:14*1024}
];
test('runtime JS/CSS bundle size budgets',()=>{
 for(const budget of limits){
   const bytes=fs.readFileSync(path.join(root,budget.path));
   const zipped=zlib.gzipSync(bytes,{level:9});
   assert.ok(bytes.length<=budget.raw,budget.path+' raw size '+bytes.length+' exceeds '+budget.raw);
   assert.ok(zipped.length<=budget.gzip,budget.path+' gzip size '+zipped.length+' exceeds '+budget.gzip);
 }
});
test('privacy runtime has no third-party npm production dependencies',()=>{
 const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
 assert.equal(Object.keys(pkg.dependencies||{}).length,0);
 assert.equal(Object.keys(pkg.optionalDependencies||{}).length,0);
});
