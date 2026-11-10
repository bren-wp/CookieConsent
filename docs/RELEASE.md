# Izdavanje i reproducibilnost — CookieConsent by Brendigo

## Verzije i paketi

Aktualna testna verzija: **0.8.1**. Službeno izdanje koristi GitHub tag `v0.8.1` i sadrži tri različita ZIP paketa.

| Paket | Namjena |
|---|---|
| `cookieconsent-brendigo-standalone.zip` | HTML/PHP stranice i ostali CMS templateovi |
| `brendigo-cookieconsent-wordpress.zip` | instalacija kroz WordPress administrator |
| `brendigo-cookieconsent-cdn.zip` | verzionirani direktorij za vlastiti CDN hosting |

## Usklađenost verzija

`npm run check` provjerava da su `package.json`, jezgreni JavaScript/PHP, WordPress readme, CDN loader, testovi, dokumentacijski URL-ovi i CI build putanje usklađeni. Izdanje mora koristiti **isti SHA** koji je prošao CI. Prije stvarne produkcije potreban je poseban instalacijski i sigurnosni audit.

## Lokalna provjera

~~~bash
npm run check
npm test
php -l wordpress/brendigo-cookieconsent/brendigo-cookieconsent.php
php tests/wp-settings.php
npm run build:cdn
python3 tools/package.py
python3 tools/package.py --verify
~~~

Paketiranje koristi stabilan redoslijed datoteka, fiksne ZIP datume i SHA-256 provjeru sadržaja. Hash vrijednost mora biti ista pri ponovnoj izradi u istom Python/zlib okruženju. CDN `manifest.json` sadrži hash i veličinu artefakata, ali nije digitalni potpis.

## GitHub Actions

- `ci.yml`: JS i PHP provjere, browser E2E (Chromium, Firefox, WebKit) i automatizirane WCAG A/AA provjere.
- `package.yml`: tri ZIP paketa u Actions Artifacts, neovisno o produkciji.
- `publish.yml`: javni GitHub **prerelease** tek nakon uspješnog CI push događaja na `main` vlastitog repozitorija. Revalidira točno testirani commit i ne mijenja već objavljeni tag.

Provjerite status svih poslova **prije** preuzimanja konačnih paketa. CI ne postavlja hosting/CDN i ne daje pravni certifikat.

## Kontrolna lista za novo izdanje

- [ ] Uskladiti verzije u `package.json`, JS/PHP kodu, CDN putanji, testovima, WP readmeu i uputama.
- [ ] Obnoviti README, API, INSTALL i CHANGELOG.
- [ ] Provjeriti identične jezgrene WP i samostalne JS/CSS datoteke.
- [ ] Provjeriti izostanak nepoželjnih vanjskih runtime ovisnosti.
- [ ] Provjeriti reset, opoziv, servisne kontrole i prvi posjet.
- [ ] Provjeriti sadržaj sva tri ZIP-a i hash.
- [ ] Obaviti dodatnu provjeru stvarnog WordPress/hostinga prije produkcije.

## Potpis i licencija

Službena distribucija prikazuje `by Brendigo` bez konfiguracijskog prekidača. MIT licencija dopušta modifikacije izvornog koda i ne omogućuje tehničko jamstvo neuklonjivosti. Sačuvajte zakonski potrebnu licencnu obavijest.
