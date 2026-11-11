# Staging matrica — produkcijska kvaliteta CookieConsent

**Status:** procedure za korisnikovu **stvarnu** instalaciju; označavati rezultate samo uz URL, hash, verzije i logove.

## Okruženja

| Površina | Testni slučaj | Dokaz |
|---|---|---|
| WordPress + WooCommerce Classic | virtualni proizvod, BACS checkout, odbijanje privole | CI artefakt i lokalni broj narudžbe |
| WooCommerce Checkout Blocks | kartica/checkout, bez prekida sessiona | Staging URL, video ili HAR s uklonjenim tokenima |
| Gatewayi (Stripe/PayPal/lokalne banke) | sandbox autorizacija/odustajanje/povrat | Gateway testni ID, verzija dodatka |
| Cache/minifier | optimizacija skripti, defer/async, delay-all-JS, page cache | Popis dodataka i njihovih isključenja za BCC core |
| CSP | nonce/hash, skripte, stilovi, povezivanje providera | Response headers + console |
| Mobilni preglednici | Android Chrome, iOS Safari, tipkovnica/voiceover/talkback | model, OS, screenshot i prijavljen kontrast |
| Različiti CMS-ovi | Joomla/Drupal/Shopify/Magento/OpenCart/PrestaShop aktivacija i deaktivacija | konkretna verzija, tema, testni kupac |
| CDN | DNS, TLS, MIME, immutable, monitoring, rollback | izvještaji `verify:deployment` i `verify:hosting` |

## Staging scenariji

- Privatni prozor: nijedan opcionalni piksel, iframe ili zahtjev prije odluke; HAR mora pokazati samo nužne zahtjeve.
- Odbij sve, zatim košarica, checkout, kupon, završetak narudžbe; nužni tokeni ostaju.
- Prihvati sve, opoziv i ponovno učitavanje; provjeriti **buduće** zahtjeve i cleanup po provideru.
- Pojedinačne usluge, GPC, više otvorenih kartica, ponovno traženje privole nakon promjene revizije.
- Mjerenja: navigacija na mobilnom/desktopu, performanse, 200–400 % povećanje, RTL, screen-reader i bez horizontalnog pomicanja bannera.
- Cache: odvojeni korisnički izbori ne smiju se curiti kroz zajednički server-side cache. BCC konfiguracija ne smije biti optimizirana tako da preuzimanje trackera nastane prije odluke.

## Dokumentiranje nalaza

Svaki bug zapisati s ID, severity, pogođenom stranicom, koracima, očekivanim/stvarnim rezultatom, snimkom, verzijom teme/dodatka, network request ID i ishodom regresijskog testa. Prije stabilnog 1.0 zatvoriti sve kritične nalaze ili eksplicitno dokumentirati podržane granice.

**CI nije zamjena za ovaj potpisani staging prihvat.**

### Povećanje i pristupačnost

Skripta za sintetičke performanse zapisuje i aproksimaciju `CSS zoom` na faktorima 2× i 4× (širinu bannera, broj vidljivih gumba i horizontalno prelijevanje). **CSS zoom nije isto što i preglednički zoom**. Ručno i dalje provjeriti WCAG reflow pri 320 CSS piksela, povećanje teksta, VoiceOver/TalkBack/NVDA/Jaws, RTL redoslijed i fokus, te otvaranje dijaloga nakon 400 %.
