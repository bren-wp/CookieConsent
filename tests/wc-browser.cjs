'use strict';
/**
 * Real WooCommerce classic cart/checkout smoke on local WP + MySQL.
 * Only the built-in offline BACS gateway is used; no charge is made.
 */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const fixture=JSON.parse(fs.readFileSync(process.env.BCC_WC_FIXTURE,'utf8'));
 const origin='http://127.0.0.1:8080';
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
   const context=await browser.newContext({viewport:{width:1280,height:800}});
   const page=await context.newPage();
   const errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto(origin+'/?add-to-cart='+fixture.productId,{waitUntil:'domcontentloaded'});
   await page.goto(origin+'/?page_id='+fixture.cartId,{waitUntil:'domcontentloaded'});
   await page.locator('.woocommerce-cart-form').waitFor({timeout:30000});
   assert.match((await page.locator('.woocommerce-cart-form').innerText()).toLowerCase(),
     /automated checkout sample/);
   assert.ok(await page.locator('.bcc-root').count(),'cookie consent banner must exist on cart');
   const reject=page.locator('.bcc-banner-actions').getByRole('button',{name:/Odbij sve|Reject all/});
   if(await reject.count()) await reject.click();
   await page.goto(origin+'/?page_id='+fixture.checkoutId,{waitUntil:'domcontentloaded'});
   await page.locator('form.checkout').waitFor({timeout:30000});
   assert.ok(await page.locator('.bcc-root').count(),'cookie consent on checkout');
   await page.locator('#billing_first_name').fill('Test');
   await page.locator('#billing_last_name').fill('Kupac');
   await page.locator('#billing_email').fill('buyer@example.org');
   await page.locator('#billing_phone').fill('0910000000');
   await page.locator('#billing_country').selectOption('HR');
   // WooCommerce requires a state/county for HR and resets it on country change.
   await page.locator('#billing_state').selectOption({label:'Primorje-Gorski Kotar County'});
   await page.locator('#billing_address_1').fill('Testna 1');
   await page.locator('#billing_city').fill('Rijeka');
   await page.locator('#billing_postcode').fill('51000');
   const bacs=page.locator('#payment_method_bacs');
   await bacs.waitFor({state:'attached',timeout:30000});
   await bacs.check({force:true});
   const checkoutRequests=[];
   page.on('response',response=>{
     if(/wc-ajax=checkout|admin-ajax\.php/.test(response.url())){
       checkoutRequests.push({url:response.url(),status:response.status()});
     }
   });
   await page.locator('#place_order').click();
   try{
     await page.locator('.woocommerce-order').waitFor({timeout:20000});
   }catch(error){
     const notices=await page.locator('.woocommerce-error,.woocommerce-NoticeGroup,.wc-block-components-notice-banner').allInnerTexts();
     console.error('WooCommerce checkout diagnostic:',JSON.stringify({
       url:page.url(),notices,checkoutRequests,
       errors,html: (await page.locator('body').innerText()).slice(-2500)
     },null,2));
     throw error;
   }
   assert.ok((await page.locator('.woocommerce-order').innerText()).length>20);
   assert.deepEqual(errors,[], 'checkout must have no JS exceptions');
   console.log('PASS WooCommerce real browser cart -> checkout -> offline order with CookieConsent denied');
   await context.close();
 }finally{await browser.close();}
})().catch(err=>{console.error(err);process.exitCode=1;});
