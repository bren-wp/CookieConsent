# Distribucija i reproducibilnost — CookieConsent by Brendigo

## Paketiranje

Pripremite izdanje bez obveznih npm produkcijskih ovisnosti:

```bash
npm run check
npm test
npm run build:cdn
python3 tools/package.py
python3 tools/package.py --verify
```

U mapi `dist/` nastaju tri ZIP paketa: samostalni paket, WordPress dodatak i verzionirani CDN paket.

Za ZIP koriste se fiksni datumi (1. 1. 2020.), stabilan redoslijed putanja i jednake permisije. Izrada istog paketa u istom Python/zlib okruženju mora dati identičan SHA-256. U CI-u se ZIP ponovno izrađuje i provjerava identičnost.

CDN `manifest.json` nema varijabilni `generatedAt` timestamp i bilježi SHA-256 i veličinu svake datoteke. Koristi se za provjeru integriteta, **ne** za digitalni potpis ili certifikaciju CDN-a.

## Što je potrebno za produkciju

- Odobrenje sadržaja pravila kolačića za konkretan web.
- Prijenos datoteka na stvarni hosting i provjera da `cookie.brendigo.com` posluživanje radi preko HTTPS-a.
- Skeniranje svih neobveznih skripti i mrežnih zahtjeva u produkciji.
- Po potrebi certifikacija za ekosustave koji je zahtijevaju (npr. Google CMP/TCF), što ovaj projekt ne dodjeljuje sam sebi.
- Provjera integracija i revokacije u svim korištenim preglednicima i urednicima.
- Sigurnosne i pristupačne provjere dodataka/tema konkretne stranice.

## Potpis

U službenom sučelju `by Brendigo` stalno je prisutan i ne postoji postavka za njegovo isključivanje. Open-source MIT licencija dopušta izmjene izvornog koda; zato tehničko jamstvo neuklonjivosti nije moguće bez drugačijeg licenciranja i distribucijskog modela.
