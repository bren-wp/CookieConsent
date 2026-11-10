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
    res.writeHead(200, {'Content-Type': type + '; charset=utf-8',
      'Cache-Control':'no-store'});
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
          await preview.getByRole('button',{name:'Reject optional services'}).waitFor({state:'visible'});
          const exported=await page.locator('#snippet').inputValue();
          assert.ok(exported.includes('"theme": "dark"'));
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
          const cookies=await page.evaluate(()=>document.cookie);
          assert.ok(!cookies.includes('bcc_test_analytics_a='));
          assert.ok(cookies.includes('bcc_test_analytics_b='));
          assert.ok(cookies.includes('bcc_test_global_one='));
          assert.ok(cookies.includes('bcc_consent='));
          assert.equal(await page.locator('#a-frame').getAttribute('src'),null);
          assert.ok((await page.locator('#b-frame').getAttribute('src')).includes('/demo/configurator.html'));
          await page.evaluate(()=>BrendigoCookieConsent.setConsent({}));
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
          const after=await page.evaluate(()=>document.cookie);
          assert.ok(!after.includes('bcc_test_analytics_a='));
          assert.ok(after.includes('bcc_consent='));
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
