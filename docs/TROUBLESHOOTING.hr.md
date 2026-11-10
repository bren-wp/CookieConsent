# Otklanjanje problema — CookieConsent by Brendigo

## Banner se ne prikazuje

1. Provjerite učitava li se `brendigo-cookieconsent.js` (Network 200, ispravna MIME vrsta).
2. Potvrdite da je `BCC_SITE_CONFIG` definiran prije skripte.
3. Provjerite je li korisnik već donio odluku; za test koristite `BrendigoCookieConsent.reset()`.
4. Provjerite `revision` i odgovarajući first-party cookie.
5. Potvrdite da CSS teme ili agresivni minifier ne sakrivaju element `.bcc-root`.

## Banner ostaje vidljiv nakon odabira

Provjerite postoji li CSS pravilo koje nadjačava `[hidden]`. Službeni CSS koristi eksplicitno `display:none!important` za skrivenu komponentu. Testirajte svih devet pozicija.

## Skripta se pokreće bez privole

Potražite obične `<script src>`, inline kod, tag managere, `fetch` i druge ekstenzije koje pokreću servis mimo označenih inertnih elemenata. Katalog usluga ne može automatski zaustaviti te zahtjeve. U Network panelu testirajte čistu prvu posjetu.

## Skripta se ne pokreće nakon prihvaćanja

Provjerite `data-bcc-category`, opcionalni `data-bcc-service`, URL shemu, CSP, CORS i pogreške konzole. Ako element dodaje SPA nakon prve inicijalizacije, pozovite `refresh()`.

## Promjena privole ne uklanja tuđe cookies

`onRevoke` ne može obrisati HttpOnly ni cross-origin cookies. Za prvi-party cookies konfigurirajte sigurna pravila prema nazivu/putanji; za vanjske servise implementirajte njihov cleanup/opt-out API ili drugo zakonito rješenje.

## WordPress promjene se ne vide

Provjerite cache stranice, cache minifiera, optimizaciju skripti, verziju asseta i jesu li postavke spremljene. Po potrebi testirajte na stagingu bez kombiniranja JS datoteka.

## CDN ne radi

Provjerite DNS, TLS, postojanje `/v0.8.0/` datoteka, sadržaj `manifest.json`, MIME, CSP, cache i mrežnu dostupnost. Dok infrastruktura nije dostupna, koristite lokalne datoteke.

## Izvoz/uvoz WordPress postavki ne uspijeva

Uvoz očekuje export format `brendigo-cookieconsent-options-v1`, ne samostalni konfiguracijski JSON iz demonstracije. Potrebne su administratorske ovlasti, nonce i dopuštena veličina. Napravite backup prije promjene.

## Browser test ne prolazi

1. `npm run check` i `npm test`
2. `npm install --no-save --no-package-lock playwright@1.56.1 axe-core@4.10.3`
3. `npx playwright install --with-deps chromium`
4. `BCC_BROWSER=chromium npm run test:browser` (analogno `firefox` ili `webkit`)

Test može otkriti stvarnu pogrešku ili promjenu asinkronog ponašanja. Ne isključujte test bez analize ispisa.

[Podrška](SUPPORT.hr.md) · [Sigurnost](SECURITY.md).
