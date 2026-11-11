'use strict';
/**
 * Real Chromium end-to-end smoke tests. Browser dependency is installed in CI
 * only: no runtime dependencies are shipped with CookieConsent.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const {chromium, firefox, webkit} = require('playwright');
const browserName=process.env.BCC_BROWSER || 'chromium';
const selectedBrowser={chromium,firefox,webkit}[browserName];
if (!selectedBrowser) throw new Error('Unsupported BCC_BROWSER value');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const repoRoot = path.resolve(__dirname, '..');
function makeServer() {
  return http.createServer((req, res) => {
    let p;
    try { p = new URL(req.url, 'http://localhost').pathname; }
    catch (_) { res.writeHead(400).end(); return; }
    const resolved = path.resolve(repoRoot, '.' + p);
    if (!resolved.startsWith(repoRoot + path.sep) || !fs.existsSync(resolved) ||
        !fs.statSync(resolved).isFile()) {
      res.writeHead(404).end(); return;
    }
    const type = p.endsWith('.js') ? 'text/javascript' :
      p.endsWith('.css') ? 'text/css' : 'text/html';
    const headers={'Content-Type': type + '; charset=utf-8', 'Cache-Control':'no-store'};
    if(p==='/demo/csp.html' || p==='/demo/wp-csp.html') {
      headers['Content-Security-Policy'] = "default-src 'none'; script-src 'self' 'nonce-bcc-test-nonce'; style-src 'self' 'unsafe-inline'; img-src data:; frame-src 'self'; connect-src 'self'; base-uri 'none'; object-src 'none'";
    }
    res.writeHead(200, headers);
    fs.createReadStream(resolved).pipe(res);
  });
}
test('real Chromium smoke tests: consent, persistence, resources, keyboard and styles',
  {timeout:180000}, async t => {
    const server = makeServer();
    await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
    const origin='http://127.0.0.1:'+server.address().port;
    let browser;
    try {
      browser=await selectedBrowser.launch({
        headless:true, args:browserName==='chromium' ? ['--no-sandbox'] : []
      });
      await t.test('no optional tracker fires before choice; reject all and reopen', async () => {
        const context=await browser.newContext();
        try {
          const page=await context.newPage();
          await page.goto(origin+'/demo/index.html');
          await page.locator('.bcc-banner').waitFor({state:'visible'});
          assert.equal(await page.locator('#analytics-status').textContent(),'nije pokrenut');
          assert.equal(await page.locator('.bcc-banner-actions button').count(),3);
          assert.equal(await page.locator('.bcc-banner .bcc-credit').textContent(),'by Brendigo');
          await page.locator('.bcc-banner-actions').getByRole('button',{name:'Odbij sve'}).click();
          assert.equal(await page.evaluate(()=>BrendigoCookieConsent.hasConsent('analytics')),false);
          await page.reload();
          assert.equal(await page.locator('.bcc-banner').isVisible(),false);
          await page.getByRole('button',{name:'Postavke kolačića'}).click();
          const dialog=page.getByRole('dialog',{name:'Postavke privatnosti'});
          assert.equal(await dialog.isVisible(),true);
          await page.keyboard.press('Escape');
          assert.equal(await dialog.count(),0);
        } finally { await context.close(); }
      });
      await t.test('accept executes a gated script only after consent and survives reload',async()=>{
        const context=await browser.newContext();
        try {
          const page=await context.newPage();
          await page.goto(origin+'/demo/index.html');
          await page.locator('.bcc-banner').waitFor({state:'visible'});
          assert.equal(await page.locator('#analytics-status').textContent(),'nije pokrenut');
          await page.locator('.bcc-banner-actions').getByRole('button',{name:'Prihvati sve'}).click();
          await page.waitForFunction(()=>document.querySelector('#analytics-status')?.textContent==='pokrenut nakon privole');
          assert.equal(await page.evaluate(()=>BrendigoCookieConsent.hasConsent('analytics')),true);
          await page.reload();
          assert.equal(await page.locator('.bcc-banner').isVisible(),false);
          assert.equal(await page.locator('#analytics-status').textContent(),'pokrenut nakon privole');
          await page.getByRole('button',{name:'Postavke kolačića'}).click();
          await page.getByRole('dialog').getByRole('button',{name:'Odbij sve'}).click();
          assert.equal(await page.evaluate(()=>BrendigoCookieConsent.hasConsent('analytics')),false);
        }finally{await context.close();}
      });
      await t.test('gated iframe revokes and unsafe script URLs stay inactive',async()=>{
        const context=await browser.newContext();
        try {
          const page=await context.newPage();
          await page.goto(origin+'/demo/index.html');
          await page.locator('.bcc-banner').waitFor({state:'visible'});
          await page.evaluate(()=>{
            const iframe=document.createElement('iframe');
            iframe.id='gated-test';iframe.title='Gated test frame';
            iframe.dataset.bccCategory='marketing';
            iframe.dataset.bccSrc='/demo/configurator.html';
            document.body.appendChild(iframe);
            const script=document.createElement('script');
            script.id='unsafe-test';script.type='text/plain';
            script.dataset.bccCategory='analytics';
            script.dataset.bccSrc='javascript:alert(1)';
            document.body.appendChild(script);
            BrendigoCookieConsent.refresh();
          });
          assert.equal(await page.locator('#gated-test').getAttribute('src'),null);
          await page.evaluate(()=>BrendigoCookieConsent.setConsent({marketing:true,analytics:true}));
          assert.ok((await page.locator('#gated-test').getAttribute('src')).includes('/demo/configurator.html'));
          assert.equal(await page.locator('#unsafe-test').getAttribute('data-bcc-activated'),null);
          await page.evaluate(()=>BrendigoCookieConsent.setConsent({}));
          assert.equal(await page.locator('#gated-test').getAttribute('src'),null);
        }finally{await context.close();}
      });
      await t.test('nine positions, three styles and four languages mount without horizontal overflow',async()=>{
        const context=await browser.newContext({viewport:{width:375,height:740}});
        try{
          const page=await context.newPage();
          for(const position of ['bottom-center','bottom-left','bottom-right','bottom-bar',
            'top-center','top-left','top-right','top-bar','center']){
            const qs=new URLSearchParams({preview:'1',position,style:'minimal',language:'hr'});
            await page.goto(origin+'/demo/index.html?'+qs);
            await page.locator('.bcc-banner').waitFor({state:'visible'});
            assert.equal(await page.locator('.bcc-root').getAttribute('class')
              .then(x=>x.includes('bcc-position-'+position)),true);
            assert.equal(await page.locator('.bcc-banner .bcc-credit').isVisible(),true);
            assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,
              'horizontal overflow at '+position);
            await page.evaluate(()=>BrendigoCookieConsent.setConsent({}));
            await page.locator('.bcc-banner').waitFor({state:'hidden'});
            assert.equal(await page.locator('.bcc-banner').isVisible(),false,
              'consented banner must be hidden at '+position);
          }
          for(const [lang,expected] of [['hr','Odbij sve'],['en','Reject all'],
            ['de','Alle ablehnen'],['it','Rifiuta tutti'],['ar','رفض الكل']]){
            const qs=new URLSearchParams({preview:'1',language:lang,style:'compact'});
            await page.goto(origin+'/demo/index.html?'+qs);
            await page.locator('.bcc-banner').waitFor({state:'visible'});
            assert.equal(await page.locator('.bcc-banner-actions').getByRole('button',{name:expected}).count(),1);
            if(lang==='ar') assert.equal(await page.locator('.bcc-root').getAttribute('dir'),'rtl');
          }
        }finally{await context.close();}
      });
      await t.test('responsive layout controls preserve choice access on mobile and desktop',async()=>{
        for(const viewport of [{width:1440,height:900},{width:390,height:844},
          {width:320,height:620}]){
          const context=await browser.newContext({viewport});
          try{
            const page=await context.newPage();
            await page.goto(origin+'/demo/index.html?'+new URLSearchParams({
              preview:'1',position:'bottom-right',bannerWidth:'960',
              mobileWidth:'88',bannerPadding:'24',bannerRadius:'0',
              bannerOffset:'32',headingSize:'26',bodySize:'16',
              buttonHeight:'48',buttonRadius:'12'
            }));
            await page.locator('.bcc-banner').waitFor({state:'visible'});
            const data=await page.evaluate(()=>{
              const b=document.querySelector('.bcc-banner');
              const root=document.querySelector('.bcc-root');
              const buttons=Array.from(b.querySelectorAll('button'));
              return {width:b.getBoundingClientRect().width,
                left:b.getBoundingClientRect().left,
                right:b.getBoundingClientRect().right,
                radius:getComputedStyle(b).borderTopLeftRadius,
                font:getComputedStyle(b.querySelector('h2')).fontSize,
                minHeight:getComputedStyle(buttons[0]).minHeight,
                visible:buttons.filter(x=>x.getClientRects().length).length,
                overflow:document.documentElement.scrollWidth>window.innerWidth,
                custom:root.classList.contains('bcc-has-width')};
            });
            assert.ok(data.custom);
            assert.equal(data.radius,'0px');
            assert.equal(data.font,'26px');
            assert.equal(data.minHeight,'48px');
            assert.equal(data.visible,3);
            assert.equal(data.overflow,false,'horizontal overflow '+viewport.width);
            assert.ok(data.left>=-1 && data.right<=viewport.width+1,
              'banner contained within viewport '+viewport.width);
            await page.locator('.bcc-banner-actions').getByRole('button',{name:'Odbij sve'}).click();
            assert.equal(await page.evaluate(()=>BrendigoCookieConsent.hasConsent('marketing')),false);
          }finally{await context.close();}
        }
      });
      await t.test('automated WCAG A/AA checks for banner and preference dialog',async()=>{
        const context=await browser.newContext({viewport:{width:390,height:844}});
        try{
          const page=await context.newPage();
          await page.goto(origin+'/demo/index.html?preview=1');
          await page.locator('.bcc-banner').waitFor({state:'visible'});
          await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
          async function checkAxe(screen){
            const failures=await page.evaluate(async()=>{
              const result=await window.axe.run(document.querySelector('.bcc-root'),{
                runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}
              });
              return result.violations.map(v=>({id:v.id,impact:v.impact,
                nodes:v.nodes.slice(0,3).map(n=>n.target.join(' '))}));
            });
            assert.deepEqual(failures,[],screen+' should have no automated WCAG A/AA violations');
          }
          await checkAxe('banner');
          await page.locator('.bcc-banner-actions').getByRole('button',{name:'Postavke'}).click();
          await page.getByRole('dialog').waitFor({state:'visible'});
          await checkAxe('preferences');
        }finally{await context.close();}
      });
      await t.test('configurator previews advanced layout, translations, and downloads a standalone JSON',async()=>{
        const context=await browser.newContext({acceptDownloads:true});
        try {
          const page=await context.newPage();
          await page.goto(origin+'/demo/configurator.html');
          await page.locator('#theme').selectOption('dark');
          await page.locator('#bannerWidth').fill('930');
          await page.locator('#bannerRadius').fill('10');
          await page.locator('#mobileWidth').fill('88');
          await page.locator('#buttonHeight').fill('50');
          await page.locator('#prefs').selectOption('right');
          await page.locator('#language').selectOption('en');
          await page.locator('#flip').check();
          await page.locator('#equal').uncheck();
          await page.locator('#heading').fill('Privacy settings by Brendigo');
          await page.locator('#intro').fill('Only selected services can load.');
          await page.locator('#accept').fill('Allow chosen services');
          await page.locator('#reject').fill('Reject optional services');
          const preview=page.frameLocator('#preview');
          await preview.locator('.bcc-banner').waitFor({state:'visible'});
          await page.waitForFunction(() => {
            const frame=document.getElementById('preview');
            return frame && frame.contentWindow && frame.contentWindow.location.search.includes('theme=dark');
          });
          assert.equal(await preview.locator('.bcc-root').getAttribute('class').then(x=>x.includes('bcc-theme-dark')),true);
          assert.equal(await preview.locator('.bcc-banner h2').textContent(),'Privacy settings by Brendigo');
          await page.waitForFunction(() => {
            const frame=document.getElementById('preview');
            if(!frame || !frame.contentWindow) return false;
            try {
              const url=new URL(frame.contentWindow.location.href);
              const buttons=Array.from(frame.contentDocument.querySelectorAll('.bcc-banner-actions button'));
              return url.searchParams.get('reject') === 'Reject optional services'
                && buttons.some(b=>b.textContent.trim()==='Reject optional services');
            } catch (_) { return false; }
          },null,{timeout:15000});
          const exported=await page.locator('#snippet').inputValue();
          assert.ok(exported.includes('"theme": "dark"'));
          assert.ok(exported.includes('"bannerWidth": 930'));
          assert.ok(exported.includes('"mobileWidth": 88'));
          assert.ok(exported.includes('"buttonHeight": 50'));
          assert.ok(exported.includes('"preferencesPosition": "right"'));
          const dl=page.waitForEvent('download');
          await page.getByRole('button',{name:'Preuzmi JSON konfiguraciju'}).click();
          const download=await dl;
          assert.equal(download.suggestedFilename(),'brendigo-cookieconsent-config.json');
        } finally {await context.close();}
      });
      await t.test('individual service switches control only the selected tracker',async()=>{
        const context=await browser.newContext();
        try{
          const page=await context.newPage();
          await page.goto(origin+'/demo/services.html');
          await page.locator('.bcc-banner').waitFor({state:'visible'});
          assert.equal(await page.locator('#a-status').textContent(),'not loaded');
          assert.equal(await page.locator('#b-status').textContent(),'not loaded');
          await page.locator('.bcc-banner-actions').getByRole('button',{name:'Customize'}).click();
          await page.getByRole('dialog').getByRole('checkbox',{name:'Service A'}).check();
          await page.getByRole('dialog').getByRole('button',{name:'Save my choices'}).click();
          assert.equal(await page.locator('#a-status').textContent(),'loaded');
          assert.equal(await page.locator('#b-status').textContent(),'not loaded');
          assert.equal(await page.locator('#a-frame').getAttribute('src'),
            new URL('/demo/configurator.html',origin).href);
          assert.equal(await page.locator('#b-frame').getAttribute('src'),null);
          const state=await page.evaluate(()=>BrendigoCookieConsent.getServiceConsent());
          assert.equal(state['stats-a'],true);assert.equal(state['stats-b'],false);
          assert.equal(await page.evaluate(()=>window.unknownServiceExecuted),undefined);
          const beforeReload=await page.evaluate(()=>document.cookie);
          assert.match(beforeReload,/bcc_consent=/,'consent record must exist before reload');
          await page.reload();
          const afterReload=await page.evaluate(()=>({
            rawCookie:document.cookie,
            consent:window.BrendigoCookieConsent?.getConsent(),
            services:window.BrendigoCookieConsent?.getServiceConsent()
          }));
          assert.ok(afterReload.consent, 'Consent must persist after reload; '+JSON.stringify({
            beforeReload, afterReload
          }));
          await page.locator('.bcc-banner').waitFor({state:'hidden'});
          const saved=await page.evaluate(()=>BrendigoCookieConsent.getServiceConsent());
          assert.equal(saved['stats-a'],true);assert.equal(saved['stats-b'],false);
          assert.equal(await page.locator('#b-status').textContent(),'not loaded');
        }finally{await context.close();}
      });
      await t.test('privacy receipt and lifecycle hooks are local, persistent and revision-aware',async()=>{
        const context=await browser.newContext();
        try{
          const page=await context.newPage();
          await page.goto(origin+'/demo/services.html');
          await page.locator('.bcc-banner').waitFor({state:'visible'});
          assert.equal(await page.evaluate(()=>BrendigoCookieConsent.getConsentReceipt()),null);
          await page.locator('.bcc-banner-actions').getByRole('button',{name:'Reject all'}).click();
          const first=await page.evaluate(()=>({
            receipt:BrendigoCookieConsent.getConsentReceipt(),
            events:window.bccDecisionEvents
          }));
          assert.equal(first.receipt.localOnly,true);
          assert.equal(first.receipt.revision,'services-v1');
          assert.equal(first.receipt.categories.analytics,false);
          assert.ok(Number.isFinite(Date.parse(first.receipt.decidedAt)));
          assert.deepEqual(first.events.map(e=>e.type),['first','consent','decision']);
          await page.getByRole('button',{name:'Cookie settings'}).click();
          const receiptDownload=page.waitForEvent('download');
          await page.getByRole('dialog').getByRole('button',
            {name:'Download my consent receipt'}).click();
          const downloaded=await receiptDownload;
          assert.equal(downloaded.suggestedFilename(),'brendigo-consent-receipt.json');
          await page.getByRole('dialog').getByRole('button',{name:'Close'}).click();
          await page.reload();
          const after=await page.evaluate(()=>({
            receipt:BrendigoCookieConsent.getConsentReceipt(),
            events:window.bccDecisionEvents
          }));
          assert.equal(after.receipt.decidedAt,first.receipt.decidedAt);
          assert.deepEqual(after.events.map(e=>e.type),['consent']);
          await page.evaluate(()=>BrendigoCookieConsent.reset());
          assert.equal(await page.evaluate(()=>BrendigoCookieConsent.getConsentReceipt()),null);
        }finally{await context.close();}
      });
      await t.test('same-origin tabs synchronize acceptance and withdrawal without sharing consent on the wire',async()=>{
        const context=await browser.newContext();
        try{
          const a=await context.newPage(), b=await context.newPage();
          await a.goto(origin+'/demo/services.html');
          await b.goto(origin+'/demo/services.html');
          await a.locator('.bcc-banner').waitFor({state:'visible'});
          await b.locator('.bcc-banner').waitFor({state:'visible'});
          await a.locator('.bcc-banner-actions').getByRole('button',{name:'Accept all'}).click();
          await b.waitForFunction(()=>BrendigoCookieConsent.hasConsent('analytics')===true);
          await b.locator('.bcc-banner').waitFor({state:'hidden'});
          const receipt=await b.evaluate(()=>BrendigoCookieConsent.getConsentReceipt());
          assert.equal(receipt.categories.analytics,true);
          await b.evaluate(()=>BrendigoCookieConsent.reset());
          await a.waitForFunction(()=>BrendigoCookieConsent.getConsent()===null);
          await a.locator('.bcc-banner').waitFor({state:'visible'});
          assert.equal(await a.evaluate(()=>BrendigoCookieConsent.getConsentReceipt()),null);
        }finally{await context.close();}
      });
      await t.test('StorageEvent fallback reconciles same-origin cookie without BroadcastChannel',async()=>{
        const context=await browser.newContext();
        try{
          await context.addInitScript(()=>{
            try { Object.defineProperty(window,'BroadcastChannel',{value:undefined,configurable:true}); }
            catch (_) { window.BroadcastChannel=undefined; }
          });
          const a=await context.newPage(), b=await context.newPage();
          await a.goto(origin+'/demo/services.html');
          await b.goto(origin+'/demo/services.html');
          await a.locator('.bcc-banner').waitFor({state:'visible'});
          await b.locator('.bcc-banner').waitFor({state:'visible'});
          await a.locator('.bcc-banner-actions').getByRole('button',{name:'Accept all'}).click();
          // WebKit headless can suppress cross-window StorageEvents. Inject a
          // standards-shaped event after copying the shared first-party cookie
          // to test the actual receiver independently of engine scheduling.
          const saved=await a.evaluate(()=>document.cookie.split(';')
            .map(part=>part.trim()).find(part=>part.startsWith('bcc_consent=')));
          assert.ok(saved);
          await b.evaluate(cookie=>{
            document.cookie=cookie+'; Path=/; SameSite=Lax';
            window.dispatchEvent(new StorageEvent('storage',{
              key:'bcc-consent-update:bcc_consent',
              newValue:'services-v1|test|1'
            }));
          },saved);
          await b.waitForFunction(()=>BrendigoCookieConsent.hasConsent('analytics')===true);
          await b.evaluate(()=>BrendigoCookieConsent.reset());
          await a.evaluate(()=>{
            document.cookie='bcc_consent=; Path=/; Max-Age=0; SameSite=Lax';
            window.dispatchEvent(new StorageEvent('storage',{
              key:'bcc-consent-update:bcc_consent',
              newValue:'services-v1|test|2'
            }));
          });
          await a.waitForFunction(()=>BrendigoCookieConsent.getConsent()===null);
        } finally { await context.close(); }
      });
      await t.test('first-party cleanup honors service IDs and protects the consent cookie',async()=>{
        const context=await browser.newContext();
        try{
          const page=await context.newPage();
          await page.goto(origin+'/demo/services.html');
          await page.locator('.bcc-banner').waitFor({state:'visible'});
          await page.evaluate(()=>{
            BrendigoCookieConsent.setDetailedConsent({
              categories:{analytics:true},
              services:{'stats-a':true,'stats-b':true}
            });
          });
          // Both service iframes navigate to same-origin demos. Let the
          // navigations settle before creating test cookies; Firefox can
          // otherwise invalidate the cookie observer while a frame commits.
          await page.frameLocator('#a-frame').locator('body').waitFor({state:'attached'});
          await page.frameLocator('#b-frame').locator('body').waitFor({state:'attached'});
          await page.evaluate(()=>{
            document.cookie='bcc_test_analytics_a=1; Path=/; SameSite=Lax';
            document.cookie='bcc_test_analytics_b=1; Path=/; SameSite=Lax';
            document.cookie='bcc_test_global_one=1; Path=/; SameSite=Lax';
          });
          const events=await page.evaluate(()=>{
            window.bccServiceEvents=[];
            const unregister=BrendigoCookieConsent.registerProvider({
              id:'service-check',category:'analytics',serviceId:'stats-a',
              onGrant:()=>bccServiceEvents.push('grant'),
              onRevoke:()=>bccServiceEvents.push('revoke')
            });
            BrendigoCookieConsent.setDetailedConsent({
              categories:{analytics:true},
              services:{'stats-a':false,'stats-b':true}
            });
            unregister();
            return window.bccServiceEvents;
          });
          assert.deepEqual(events,['grant','revoke']);
          await page.waitForFunction(()=>!document.cookie.includes('bcc_test_analytics_a='),null,{timeout:10000});
          const cookies=await page.evaluate(()=>document.cookie);
          assert.ok(!cookies.includes('bcc_test_analytics_a='));
          assert.ok(cookies.includes('bcc_test_analytics_b='));
          assert.ok(cookies.includes('bcc_test_global_one='));
          assert.ok(cookies.includes('bcc_consent='));
          assert.equal(await page.locator('#a-frame').getAttribute('src'),null);
          assert.ok((await page.locator('#b-frame').getAttribute('src')).includes('/demo/configurator.html'));
          await page.evaluate(()=>BrendigoCookieConsent.setConsent({}));
          await page.waitForFunction(()=>!document.cookie.includes('bcc_test_analytics_b=') &&
            !document.cookie.includes('bcc_test_global_one='),null,{timeout:5000});
          const after=await page.evaluate(()=>document.cookie);
          assert.ok(!after.includes('bcc_test_analytics_b='));
          assert.ok(!after.includes('bcc_test_global_one='));
          assert.ok(after.includes('bcc_consent='));
        }finally{await context.close();}
      });
      await t.test('rejecting before choice also clears explicitly listed first-party cookies',async()=>{
        const context=await browser.newContext();
        try{
          const page=await context.newPage();
          await page.goto(origin+'/demo/services.html');
          await page.locator('.bcc-banner').waitFor({state:'visible'});
          await page.evaluate(()=>{
            document.cookie='bcc_test_analytics_a=1; Path=/; SameSite=Lax';
            BrendigoCookieConsent.setConsent({});
          });
          await page.waitForFunction(()=>!document.cookie.includes('bcc_test_analytics_a='),null,{timeout:5000});
          const after=await page.evaluate(()=>document.cookie);
          assert.ok(!after.includes('bcc_test_analytics_a='));
          assert.ok(after.includes('bcc_consent='));
        }finally{await context.close();}
      });
      await t.test('standalone configurator imports and preserves safe JSON fields',async()=>{
        const context=await browser.newContext();
        try {
          const page=await context.newPage();
          await page.goto(origin+'/demo/configurator.html');
          const config={schema:'brendigo-cookieconsent-standalone-v1',config:{
            language:'en',position:'top-right',theme:'dark',revision:'import-v1',
            services:[{id:'statistics',toggleable:true,category:'analytics',name:'Statistics'}],
            translations:{en:{heading:'Imported privacy heading'}}
          }};
          await page.locator('#configFile').setInputFiles({
            name:'config.json',mimeType:'application/json',
            buffer:Buffer.from(JSON.stringify(config))
          });
          await page.waitForFunction(()=>document.querySelector('#message')?.textContent?.includes('uspješno'));
          assert.equal(await page.locator('#theme').inputValue(),'dark');
          assert.equal(await page.locator('#position').inputValue(),'top-right');
          const snippet=await page.locator('#snippet').inputValue();
          assert.ok(snippet.includes('"revision": "import-v1"'));
          assert.ok(snippet.includes('"services"'));
          await page.locator('#configFile').setInputFiles({
            name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{}')
          });
          await page.waitForFunction(()=>document.querySelector('#message')?.textContent?.includes('Nevaljana'));
        } finally { await context.close(); }
      });
      await t.test('public multilingual catalog uses text nodes and safe links',async()=>{
        const context=await browser.newContext();
        try{
          const page=await context.newPage();
          await page.goto(origin+'/demo/catalog.html');
          assert.equal(await page.locator('.bcc-catalog tbody tr').count(),2);
          assert.equal(await page.locator('.bcc-catalog caption').textContent(),'Katalog kolačića i usluga');
          assert.equal(await page.locator('.bcc-catalog tbody a').count(),2);
          assert.equal(await page.locator('.bcc-catalog tbody script').count(),0);
        }finally{await context.close();}
      });

      await t.test('YouTube/Vimeo providers remain absent before consent and stop after withdrawal',async()=>{
        const context=await browser.newContext();
        try{
          const page=await context.newPage();
          const observed=[];
          await page.route('https://www.youtube-nocookie.com/**',async route=>{
            observed.push(route.request().url());
            await route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>Stub</title>'});
          });
          await page.route('https://player.vimeo.com/**',async route=>{
            observed.push(route.request().url());
            await route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>Stub</title>'});
          });
          await page.goto(origin+'/demo/index.html?preview=1');
          await page.locator('.bcc-banner').waitFor({state:'visible'});
          await page.evaluate(()=>{
            for(const [provider,id,category] of [
              ['youtube','dQw4w9WgXcQ','marketing'],['vimeo','12345678','preferences']
            ]){
              const node=document.createElement('div');
              node.id='video-'+provider;
              node.dataset.bccVideo=provider;
              node.dataset.bccVideoId=id;
              node.dataset.bccCategory=category;
              document.body.appendChild(node);
            }
          });
          await page.addScriptTag({url:origin+'/packages/integrations/video-embeds.js'});
          assert.equal(await page.locator('[data-bcc-video-frame]').count(),0);
          assert.equal(observed.length,0,'provider cannot fetch before consent');
          await page.evaluate(()=>BrendigoCookieConsent.setConsent({preferences:true,marketing:true}));
          assert.equal(await page.locator('[data-bcc-video-frame]').count(),2);
          assert.match(await page.locator('#video-youtube iframe').getAttribute('src'),
            /^https:\/\/www\.youtube-nocookie\.com\/embed\//);
          assert.match(await page.locator('#video-vimeo iframe').getAttribute('src'),
            /^https:\/\/player\.vimeo\.com\/video\//);
          await page.evaluate(()=>BrendigoCookieConsent.setConsent({preferences:true,marketing:false}));
          assert.equal(await page.locator('#video-youtube iframe').count(),0);
          assert.equal(await page.locator('#video-vimeo iframe').count(),1);
          await page.evaluate(()=>BrendigoCookieConsent.reset());
          assert.equal(await page.locator('[data-bcc-video-frame]').count(),0);
          await page.evaluate(()=>{
            const bad=document.createElement('div');
            bad.dataset.bccVideo='youtube';
            bad.dataset.bccVideoId='javascript:bad';
            bad.dataset.bccCategory='marketing';
            document.body.appendChild(bad);
            BrendigoVideoEmbeds.refresh();
            BrendigoCookieConsent.setConsent({marketing:true});
          });
          assert.equal(await page.locator('[data-bcc-video-id="javascript:bad"] iframe').count(),0,
            'invalid embed ID never creates a frame');
        }finally{await context.close();}
      });
      await t.test('strict CSP allows nonce-gated opt-in and no dynamic inline evaluation',async()=>{
        const context=await browser.newContext();
        try{
          const page=await context.newPage();
          const violations=[];
          page.on('console',message=>{
            if(message.type()==='error' && /content security policy|refused to (?:execute|load|apply)/i.test(message.text()))
              violations.push(message.text());
          });
          page.on('pageerror',error=>violations.push(error.message));
          await page.goto(origin+'/demo/csp.html');
          await page.locator('.bcc-banner').waitFor({state:'visible'});
          assert.equal(await page.evaluate(()=>window.__BCC_CSP_EXECUTED__||0),0);
          await page.locator('.bcc-banner-actions').getByRole('button',{name:'Prihvati sve'}).click();
          assert.equal(await page.evaluate(()=>window.__BCC_CSP_EXECUTED__||0),1);
          assert.deepEqual(violations,[],'strict CSP should not block the permitted nonce code');
        }finally{await context.close();}
      });
      await t.test('WordPress meta configuration boots under strict CSP with no inline code',async()=>{
        const context=await browser.newContext();
        try {
          const page=await context.newPage();
          const csp=[];
          page.on('console',message=>{
            if(message.type()==='error' && /content security policy|refused to (?:execute|load|apply)/i.test(message.text()))
              csp.push(message.text());
          });
          page.on('pageerror',error=>csp.push(error.message));
          await page.goto(origin+'/demo/wp-csp.html');
          await page.locator('.bcc-banner').waitFor({state:'visible'});
          assert.equal(await page.evaluate(()=>BCC_SITE_CONFIG.language),'en');
          assert.equal(await page.evaluate(()=>BrendigoCookieConsent.version),'0.11.6');
          assert.equal(await page.locator('.bcc-banner-actions').getByRole('button',{name:'Reject all'}).count(),1);
          assert.equal(await page.evaluate(()=>BrendigoCookieConsent.hasConsent('analytics')),false);
          await page.locator('.bcc-banner-actions').getByRole('button',{name:'Reject all'}).click();
          assert.equal(await page.evaluate(()=>BrendigoCookieConsent.hasConsent('analytics')),false);
          assert.deepEqual(csp,[],'script-src without unsafe-inline must not block WordPress config');
        }finally{await context.close();}
      });
      await t.test('resource scan exposes neither query tokens nor cookie values',async()=>{
        const context=await browser.newContext();
        try{
          const page=await context.newPage();
          await page.goto(origin+'/demo/index.html?preview=1');
          await page.evaluate(()=>{
            document.cookie='scan_cookie=SUPERPRIVATE; Path=/';
            const script=document.createElement('script');
            script.type='text/plain';
            script.dataset.bccCategory='analytics';
            script.dataset.bccSrc='https://stats.example/collect?token=HIDDENQUERY';
            document.body.appendChild(script);
          });
          const report=await page.evaluate(()=>BrendigoCookieConsent.scanLocalResources());
          assert.equal(report.schema,'brendigo-local-audit-v2');
          assert.ok(Array.isArray(report.resourceRequests));
          assert.ok(report.cookies.includes('scan_cookie'));
          assert.ok(!JSON.stringify(report).includes('SUPERPRIVATE'));
          assert.ok(!JSON.stringify(report).includes('HIDDENQUERY'));
          assert.ok(report.limitations.some(x=>x.includes('cross-origin')));
        }finally{await context.close();}
      });
      await t.test('cookie inventory does not send data and focus remains within dialog',async()=>{
        const context=await browser.newContext();
        try{
          const page=await context.newPage();
          await page.goto(origin+'/demo/index.html');
          await page.locator('.bcc-banner').waitFor({state:'visible'});
          await page.locator('.bcc-banner-actions').getByRole('button',{name:'Postavke'}).click();
          const dialog=page.getByRole('dialog');
          assert.equal(await dialog.isVisible(),true);
          assert.equal(await dialog.locator('.bcc-service-policy').count(),0);
          assert.equal(await page.evaluate(()=>document.activeElement.closest('[role="dialog"]')!==null),true);
          await page.keyboard.press('Escape');
          assert.equal(await dialog.count(),0);
          const audit=await page.evaluate(()=>BrendigoCookieConsent.auditLocal());
          assert.ok(Array.isArray(audit.cookies));
          assert.ok(audit.scripts.some(x=>x.category==='analytics'));
        }finally{await context.close();}
      });
    }finally{
      if(browser)await browser.close();
      await new Promise(resolve=>server.close(resolve));
    }
  });
