# Web distribucija — CookieConsent by Brendigo

Ova mapa sadržava statičnu marketinšku web-stranicu spremnu za **pripremu** produkcijskog hostinga `cookie.brendigo.com`. Autor: **Brendigo**, https://brendigo.com. Službena adresa dodatka i skripte: https://cookie.brendigo.com.

## Lokalno testiranje

```bash
npm run build:cdn
python3 tools/package.py
python3 -m http.server 8000 --directory dist/website
```

Otvorite http://localhost:8000/. Paket uključuje web stranice, lokalne demo datoteke, jezgru i verzionirane CDN datoteke, tako da lokalni preview ne zahtijeva poseban CDN.

## Postavljanje domene

1. Osigurati DNS i HTTPS/TLS za `cookie.brendigo.com`.
2. Prenijeti sadržaj web ZIP-a u **document root**, uključujući `v0.11.5/`.
3. Provjeriti `/index.html`, `/installation.html`, `/en.html`, `/legal.html`, `/demo/index.html`, `/v0.11.5/loader.js`.
4. Postaviti odgovarajuće HTTP MIME tipove, CSP, cache i log policy. Ne mijenjati već objavljene verzionirane resurse.
5. **Prije javne objave** dodati točnu politiku privatnosti s identitetom voditelja obrade, kontaktom, server logovima i rokovima čuvanja; `legal.html` sadrži upozorenje, ali nije potpuna politika privatnosti.
6. Testirati release download poveznice na stvarnom izdanju.
7. Testirati stvarne cookies i opcionalne integracije, osobito CDN zahtjeve prema operatoru.

Projekt samostalno **ne** postavlja DNS, certifikate ili poslužiteljski hosting. Zeleni CI ne dokazuje javnu dostupnost.

**Brendigo** © 2026.

## CMS integracije

Na naslovnici je katalog platformskih dodataka: Joomla, Drupal, Shopify Theme App Extension, Magento, OpenCart i PrestaShop. Instalacija se provodi prema vodiču [docs/CMS-INTEGRATIONS.hr.md](../docs/CMS-INTEGRATIONS.hr.md) i zahtijeva odgovarajuću platformu.

## Provjera javnog URL-a

Nakon postavljanja na domenu pokrenite iz korijena izvornog repozitorija `npm run verify:deployment -- https://cookie.brendigo.com`. Validator provjerava HTTP status, MIME tipove, verzionirane resurse, CDN manifest i SHA-256, bez promjene hostinga. [Detaljne upute](../docs/DEPLOY.hr.md).
