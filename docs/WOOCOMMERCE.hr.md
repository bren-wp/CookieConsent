# WooCommerce integracija — CookieConsent by Brendigo

## Što ova integracija štiti

Ako je aktivan WooCommerce, dodatak može prikazati informativnu uslugu **WooCommerce — cart and checkout** i ne dopušta pogrešno pretvaranje sljedećih registriranih WooCommerce script handleova u neaktivne skripte:

- `woocommerce`
- `wc-cart-fragments`
- `wc-add-to-cart`
- `wc-checkout`
- `wc-cart`
- `wc-blocks-checkout`

To sprječava da administrator slučajno blokira ključne korake košarice/naplate preko polja `Gate WordPress script handles`.

U katalogu su naznačeni uobičajeni nazivi: `woocommerce_cart_hash`, `woocommerce_items_in_cart` i `wp_woocommerce_session_*`. Stvarni popis kolačića, iznimke i vrijeme zadržavanja ovise o konfiguraciji trgovine. Provjerite stvarnu svrhu i pravnu osnovu.

## Što integracija NAMJERNO ne radi

Ne daje automatsku privolu za Google Analytics, Meta Pixel, Google Ads, payment tracking, WooCommerce Analytics, marketing dodatke ni servisne skripte trećih strana. Ne provodi automatski audit svih WooCommerce ekstenzija. Nije univerzalni pravni certifikat za webshop.

## Prije produkcije

1. Testirajte dodavanje u košaricu, izmjenu količina, primjenu kupona, naplatu i kreiranje narudžbe s opcijom „Odbij sve”.
2. Provedite Network pregled svih opcionalnih usluga i skripti u temama i dodacima.
3. Svaku analitičku ili marketinšku skriptu zasebno označite i kontrolirajte.
4. Provjerite način pohrane i pravnu klasifikaciju konkretne naplatne integracije; funkcionalnost naplate može biti nužna, marketinško praćenje nije automatski nužno.
5. Nakon povlačenja privole provjerite da povezani pružatelji prestaju slati zahtjeve; po potrebi pozovite njihov cleanup/opt-out API ili ponovno učitajte stranicu.

**Upozorenje:** ova integracija je ograničeni zaštitni adapter za osnovne WooCommerce funkcije, a ne potpuni programatski adapter svih dodataka.
