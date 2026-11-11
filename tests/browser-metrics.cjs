'use strict';
/**
 * Synthetic browser load report: resource transfer size, navigation timing
 * and Chromium CPU usage from CDP. Not a real-device or field (RUM) result.
 */
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const profiles=[
 {name:'desktop',width:1365,height:768,cpuSlowdown:1,latencyMs:0},
 {name:'mobile-simulated',width:390,height:844,cpuSlowdown:4,latencyMs:75},
 {name:'narrow-mobile-simulated',width:320,height:568,cpuSlowdown:4,latencyMs:100}
];
const mime={'js':'application/javascript','css':'text/css','html':'text/html','svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 const u=new URL(req.url,'http://127.0.0.1'),file=path.resolve(root,'.'+u.pathname);
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
   res.writeHead(404).end();return;
 }
 const type=mime[path.extname(file).slice(1)]||'application/octet-stream';
 res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'});
 fs.createReadStream(file).pipe(res);
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin='http://127.0.0.1:'+server.address().port;
 let browser;
 try{
   browser=await chromium.launch({headless:true,args:['--no-sandbox']});
   const results=[];
   for(const profile of profiles){
     const context=await browser.newContext({viewport:{width:profile.width,height:profile.height}});
     const page=await context.newPage();
     const cdp=await context.newCDPSession(page);
     await cdp.send('Performance.enable');
     await cdp.send('Emulation.setCPUThrottlingRate',{rate:profile.cpuSlowdown});
     await cdp.send('Network.enable');
     await cdp.send('Network.emulateNetworkConditions',{
       offline:false,latency:profile.latencyMs,downloadThroughput:-1,uploadThroughput:-1
     });
     const errors=[];
     page.on('pageerror',error=>errors.push(error.message));
     await page.goto(origin+'/demo/index.html?preview=1',{waitUntil:'load'});
     await page.locator('.bcc-banner').waitFor({state:'visible'});
     const timing=await page.evaluate(()=>{
       const n=performance.getEntriesByType('navigation')[0];
       const resources=performance.getEntriesByType('resource');
       return {
         domContentLoadedMs:Math.round(n.domContentLoadedEventEnd),
         loadEventMs:Math.round(n.loadEventEnd),
         resourceCount:resources.length,
         transferBytes:resources.reduce((sum,r)=>sum+(r.transferSize||0),0),
         decodedBytes:resources.reduce((sum,r)=>sum+(r.decodedBodySize||0),0),
         horizontalOverflow:document.documentElement.scrollWidth>innerWidth
       };
     });
     const raw=await cdp.send('Performance.getMetrics');
     const byName=Object.fromEntries(raw.metrics.map(entry=>[entry.name,entry.value]));
     assert.equal(errors.length,0,errors.join(';'));
     results.push({
       profile:profile.name,viewport:{width:profile.width,height:profile.height},
       simulatedCpuSlowdown:profile.cpuSlowdown,latencyMs:profile.latencyMs,
       ...timing,scriptDurationMs:Math.round((byName.ScriptDuration||0)*1000),
       taskDurationMs:Math.round((byName.TaskDuration||0)*1000),
       jsHeapBytes:Math.round(byName.JSHeapUsedSize||0)
     });
     await context.close();
   }
   const output={schema:'bcc-synthetic-browser-metrics-v1',
     label:'CI synthetic Chromium measurements; not field/real device data',
     collectedAt:new Date().toISOString(),browser:'Chromium via Playwright',results};
   const filename=path.join(root,'dist','metrics','browser.json');
   fs.mkdirSync(path.dirname(filename),{recursive:true});
   fs.writeFileSync(filename,JSON.stringify(output,null,2)+'\n');
   console.log(JSON.stringify(output,null,2));
 }finally{
   if(browser)await browser.close();
   await new Promise(resolve=>server.close(resolve));
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
