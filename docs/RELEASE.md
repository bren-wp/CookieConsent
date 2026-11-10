# Izdavanje i reproducibilnost — CookieConsent by Brendigo

## Verzije i paketi

Aktualna testna verzija: **0.11.1**. Službeno izdanje koristi GitHub tag `v0.11.1` i sadrži jedanaest ZIP paketa.

| Paket | Namjena |
|---|---|
| `cookieconsent-brendigo-standalone.zip` | HTML/PHP stranice i ostali CMS templateovi |
| `brendigo-cookieconsent-wordpress.zip` | službena Brendigo GitHub distribucija |
| `brendigo-cookieconsent-wordpress-org.zip` | lokalni WordPress.org kandidat; nije službeno odobren |
| `brendigo-cookieconsent-cdn.zip` | verzionirani direktorij za vlastiti CDN hosting |
| `cookieconsent-brendigo-website.zip` | dvojezični web s lokalnim demonstracijama i verzioniranim CDN resursima |
| `brendigo-cookieconsent-joomla.zip` | Joomla 5 system plugin; instalacijski ZIP |
| `brendigo-cookieconsent-drupal.zip` | Drupal 10/11 module directory u ZIP-u |
| `brendigo-cookieconsent-shopify-extension.zip` | Shopify Theme App Extension **izvorni paket**, nije samostalni install ZIP |
| `brendigo-cookieconsent-magento.zip` | Magento 2.4 app/code/Brendigo/CookieConsent |
| `brendigo.ocmod.zip` | OpenCart 4 native extension, otpakira se u extension/brendigo |
| `brendigocookieconsent-prestashop.zip` | PrestaShop 8/9 native module |

## Usklađenost verzija

`npm run check` provjerava da su `package.json`, jezgreni JavaScript/PHP, WordPress readme, CDN loader, testovi, dokumentacijski URL-ovi i CI build putanje usklađeni. Izdanje mora koristiti **isti SHA** koji je prošao CI. Prije stvarne produkcije potreban je poseban instalacijski i sigurnosni audit.

## Lokalna provjera

~~~bash
npm run check
npm test
php -l wordpress/brendigo-cookieconsent/brendigo-cookieconsent.php
php tests/wp-settings.php
npm run build:cdn
npm run build:wporg
npm run audit:source
npm run validate:platforms
python3 tools/package.py
python3 tools/package.py --verify
~~~

Paketiranje koristi stabilan redoslijed datoteka, fiksne ZIP datume i SHA-256 provjeru sadržaja. Hash vrijednost mora biti ista pri ponovnoj izradi u istom Python/zlib okruženju. CDN `manifest.json` sadrži hash i veličinu artefakata, ali nije digitalni potpis.

## GitHub Actions

- `ci.yml`: JS i PHP provjere, browser E2E (Chromium, Firefox, WebKit) i automatizirane WCAG A/AA provjere.
- `package.yml`: jedanaest ZIP paketa u Actions Artifacts, neovisno o produkciji.
- `publish.yml`: javni GitHub **prerelease** tek nakon uspješnog CI push događaja na `main` vlastitog repozitorija. Revalidira točno testirani commit i ne mijenja već objavljeni tag.

Provjerite status svih poslova **prije** preuzimanja konačnih paketa. CI ne postavlja hosting/CDN i ne daje pravni certifikat.

## Kontrolna lista za novo izdanje

- [ ] Uskladiti verzije u `package.json`, JS/PHP kodu, CDN putanji, testovima, WP readmeu i uputama.
- [ ] Obnoviti README, API, INSTALL i CHANGELOG.
- [ ] Provjeriti identične jezgrene WP i samostalne JS/CSS datoteke.
- [ ] Provjeriti izostanak nepoželjnih vanjskih runtime ovisnosti.
- [ ] Provjeriti reset, opoziv, servisne kontrole i prvi posjet.
- [ ] Provjeriti sadržaj svih jedanaest ZIP-ova i hash.
- [ ] Obaviti dodatnu provjeru stvarnog WordPress/hostinga prije produkcije.

## Potpis i licencija

Službena distribucija prikazuje `by Brendigo` bez konfiguracijskog prekidača. MIT licencija dopušta modifikacije izvornog koda i ne omogućuje tehničko jamstvo neuklonjivosti. Sačuvajte zakonski potrebnu licencnu obavijest.

## Provjera objavljenog weba i CDN-a

Nakon postavljanja HTML i CDN datoteka na stvarni server pokrenite `npm run verify:deployment -- https://cookie.brendigo.com`. Skripta **ne objavljuje** datoteke i ne mijenja DNS. [Deployment](DEPLOY.hr.md).
