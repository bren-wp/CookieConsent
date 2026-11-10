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
          }
          for(const [lang,expected] of [['hr','Odbij sve'],['en','Reject all'],
            ['de','Alle ablehnen'],['it','Rifiuta tutti']]){
            const qs=new URLSearchParams({preview:'1',language:lang,style:'compact'});
            await page.goto(origin+'/demo/index.html?'+qs);
            await page.locator('.bcc-banner').waitFor({state:'visible'});
            assert.equal(await page.locator('.bcc-banner-actions').getByRole('button',{name:expected}).count(),1);
          }
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
