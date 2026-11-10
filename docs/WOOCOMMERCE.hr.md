# WooCommerce integracija — CookieConsent by Brendigo

## Svrha

Ako je prisutan WooCommerce, sustav štiti od slučajnog blokiranja odabrane, poznate registrirane skripte osnovne košarice i naplate. Također može prikazati informativnu kategoriju standardnih WooCommerce cookiesa.

## Zaštićeni registrirani handleovi

- `woocommerce`
- `wc-cart-fragments`
- `wc-add-to-cart`
- `wc-checkout`
- `wc-cart`
- `wc-blocks-checkout`

Sama prisutnost tog adaptera **ne znači** da su svi dodaci i teme provjereni, da je svaki payment widget nužan ili da su sve WooCommerce skripte obuhvaćene.

## Standardni informativni cookies

Tipični nazivi uključuju `woocommerce_cart_hash`, `woocommerce_items_in_cart` i `wp_woocommerce_session_*`. Stvarni cookies i vrijeme čuvanja ovise o konfiguraciji, verziji WooCommercea i povezanim dodacima. Provjerite stvarnu klasifikaciju i trajanje na konkretnoj trgovini.

## Što nije automatski dopušteno

- Web statistika i marketing.
- Oglašivački pikseli i mjerenje kampanja.
- Vanjski video/iframeovi i prošireni analitički dodaci.
- Svaka dodatna usluga naplate koja koristi nepotrebno praćenje.
- Server-side događaji prema marketinškim sustavima.

## Testni scenariji

1. Odbijte sve neobvezne kategorije u privatnom prozoru.
2. Dodajte proizvod, izmijenite količinu i upotrijebite kupon.
3. Prođite checkout bez opcionih trackera.
4. Provjerite potvrdu narudžbe i e-mail obavijesti.
5. Odobrite samo jednu neobveznu kategoriju i provjerite mrežne zahtjeve.
6. Povucite privolu i provjerite da povezani servisi prestaju slati daljnje događaje.
7. Ponovite s uključenim cache/minify dodacima i stvarnim gatewayom.

Automatizirani PHP testovi trenutačno provjeravaju izoliranu logiku adaptera, **ne kompletan živ WooCommerce checkout**.

[WordPress](WORDPRESS.hr.md) · [Produkcijska kontrolna lista](GO-LIVE.hr.md).
