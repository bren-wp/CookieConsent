# Razvoj, testiranje i doprinos — CookieConsent by Brendigo

## Zahtjevi

Node.js 18+, Python 3, PHP 7.4+ i Git. Nema potrebnih JS runtime paketa za posjetitelje. Playwright i axe-core koriste se samo u razvojnom/CI okruženju.

## Lokalni ciklus

~~~bash
npm run check
npm test
php -l wordpress/brendigo-cookieconsent/brendigo-cookieconsent.php
php tests/wp-settings.php
npm run build:cdn
python3 tools/package.py
python3 tools/package.py --verify
python3 -m http.server 8000
~~~

Otvorite `http://localhost:8000/demo/configurator.html` i `http://localhost:8000/demo/services.html`.

## Browser E2E

~~~bash
npm install --no-save --no-package-lock playwright@1.56.1 axe-core@4.10.3
npx playwright install --with-deps chromium firefox webkit
BCC_BROWSER=chromium npm run test:browser
BCC_BROWSER=firefox npm run test:browser
BCC_BROWSER=webkit npm run test:browser
~~~

CI koristi matricu Chromium/Firefox/WebKit i PHP 7.4, 8.1–8.4. Ispitivanje stvarnog WordPress hostinga, screen readera i specifičnih dodataka nije obuhvaćeno tim izoliranim testovima.

## Pravila izmjena

- Uskladite `packages/core/*.js/css` s `wordpress/brendigo-cookieconsent/assets/` kopijama. CI provjerava bitnu istovjetnost.
- Svaka nova opcija mora imati zadanu vrijednost, sanitizaciju u WP-u, dokumentaciju i test.
- Svaka promjena privole mora poštovati početni opt-in i GPC ograničenje marketinga.
- Nemojte učitavati bilo kakav tracker ili CDN ovisnost u osnovnom runtimeu.
- Zadržite vidljivi `by Brendigo` u službenim artefaktima.
- Ne tvrdite da je funkcija testirana ili zakonski odobrena bez dokaza.
- Dodajte E2E test za prihvaćanje, odbijanje, ponovno otvaranje i revokaciju kada mijenjate te tokove.

## Izdavanje

Verziju treba uskladiti u `package.json`, JS/PHP/CSS zaglavljima, CDN uputama, WordPress readmeu, CI putanjama i testnim očekivanjima. [RELEASE.md](RELEASE.md) opisuje reproducibilno ZIP paketiranje i objavu GitHub prereleasea nakon zelenog CI-a.

## Sigurnost

Sigurnosne nalaze prijavite privatno, bez objavljivanja aktivnih exploit detalja u javnoj raspravi. [SECURITY.md](SECURITY.md).
