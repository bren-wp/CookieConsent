# Arhitektura — CookieConsent by Brendigo

## Slojevi

| Sloj | Lokacija | Uloga |
|---|---|---|
| Jezgra | `packages/core/brendigo-cookieconsent.js` | odluke, pohrana, modal, resursi, događaji i lokalna potvrda |
| CSS | `packages/core/brendigo-cookieconsent.css` | dizajn i devet pozicija, teme, RTL, vidljivost i responsivnost |
| WordPress | `wordpress/brendigo-cookieconsent/` | admin postavke, sanitizacija, registrirani WP skriptni handleovi |
| Google Basic adapter | `packages/integrations/google-consent-basic.js` | opcionalni signali, bez samostalnog učitavanja Google oznaka |
| CDN | `cdn/loader.js` i `tools/build-cdn.mjs` | verzionirani loader i reproducibilan payload |
| Demo | `demo/` | interaktivni konfigurator i primjeri privole |
| Testovi | `tests/` i `.github/workflows/` | JS/PHP provjere, stvarni browseri i ZIP integritet |
| Pakiranje | `tools/package.py` | reproducibilne samostalne/WP/CDN ZIP datoteke |

## Tok korisnikova izbora

1. Web-stranica učitava CSS, konfiguraciju i jezgru.
2. Jezgra provjerava vlastiti first-party cookie i trenutačnu reviziju politike.
3. Ako nema važeće odluke, prikazuje se banner i neobvezne označene skripte ostaju inertne.
4. Korisnik donosi izbor ili otvara granularne postavke.
5. Jezgra sprema kategorije i po potrebi pojedinačne usluge.
6. Slijede lokalni događaji/callbackovi, lifecycle sinkronizacija i obrada označenih resursa.
7. Pri povlačenju pozivaju se opozivni hookovi, uklanjaju se izvori označenih iframeova, primjenjuju konfigurirana pravila čišćenja dostupnih first-party cookiesa.
8. Ako postoji više kartica iste stranice, `BroadcastChannel` obavještava druge instance da ponovno učitaju cookie.

## Podatkovni model

Pohrana je verzionirani JSON zapis kodiran u first-party cookie, s revizijom politike, ISO datumom, kategorijama i mogućim stanjima usluga. Nije digitalno potpisan. Ne uključuje IP, osobno ime ili vanjski korisnički identifikator.

## Privatnost po dizajnu

Samostalna i lokalna WordPress instalacija nema obvezan mrežni zahtjev prema Brendigo infrastrukturi. CDN verzija zahtijeva mrežni zahtjev do operatora hostinga i može biti povezana s pristupnim logovima; pravilnik čuvanja, TLS i podugovaratelji odgovornost su operatora.

## Granice izolacije

API ne može automatski spriječiti skripte koje su već uključene klasičnim `<script>` tagom, server-side obradu, druge domene ili potpuno zaustaviti izvršeni JavaScript. To je integracijska obveza teme, aplikacije ili dodataka koji upravljaju tim servisima.

## Potpis i licencija

Distribucija prikazuje `by Brendigo` bez sučeljskog prekidača. Softver je pod MIT licencijom; tehničko jamstvo trajnog prikaza u modificiranom kodu nije moguće.
