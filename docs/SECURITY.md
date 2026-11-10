# Sigurnost i privatnost — CookieConsent by Brendigo

## Prijava ranjivosti

Ne objavljujte aktivne exploit detalje, ključeve ili osobne podatke javno. Koristite privatni sigurnosni kanal projekta (ako je omogućen) ili službeni kontakt na https://brendigo.com. Za obične probleme koristite [GitHub Issues](https://github.com/bren-wp/CookieConsent/issues).

## Implementirane zaštite

- Vanilla JS/CSS jezgra bez obveznih vanjskih runtime biblioteka.
- Sanitizacija pozicija, tema, boja i drugih dopuštenih vrijednosti.
- Tekst opisa usluga prikazuje se kao tekst, ne kao proizvoljan HTML.
- Vanjski označeni JS/iframe URL-ovi prihvaćaju samo HTTP(S) shemu.
- Granularni servisi koriste ograničene identifikatore i dopuštene kategorije.
- WordPress administratorski JSON import/export zahtijeva prava i provjeru noncea.
- Administratorska konfiguracija filtrira nedopuštene ključeve, tekstove, URL-ove i pravila.
- Ograničena pravila brisanja samo imenovanih dostupnih first-party cookiesa; nema proizvoljnog regex izvršavanja.
- GPC konzervativno onemogućuje marketinšku kategoriju.
- Lokalna potvrda korisnikova izbora nema IP, ime ili centralno slanje na poslužitelj.
- Sinkronizacija više kartica šalje samo signal revizije, ne sam sadržaj odluke.
- Priložene su automatizirane provjere u tri preglednika i više PHP verzija.

## Integracijske odgovornosti

- Svi vanjski servisi moraju biti klasificirani prije uključivanja.
- Ne uključivati standardne neobvezne skripte prije valjane privole.
- Provjeriti CSP, nonce, SRI, iframe domene, WordPress optimizatore i caching.
- API callbackovi pružatelja moraju sigurno obrađivati opoziv.
- Nemoguće je univerzalno zaustaviti već izvršen JS, server-side praćenje ili cookies drugih domena.
- Pravila brisanja ne smiju ukloniti sesiju, prijavu, košaricu ili sigurnosne kolačiće.

## CDN i IP podaci

Kod lokalne instalacije nema obveznog Brendigo mrežnog zahtjeva. Ako je odabran CDN, hoster može obraditi IP adresu i metapodatke pristupa. Hosting politika, retencija, podugovaratelji, dostupnost i HTTPS moraju se potvrditi zasebno.

## Status i ograničenja

Zeleni CI **nije** neovisni sigurnosni audit ili penetracijski test. Ne postoji centralni consent ledger, digitalno potpisana potvrda, certificirani CMP, automatsko brisanje third-party cookiesa niti univerzalni tracking skener.

[Pravna kontrolna lista](COMPLIANCE.hr.md) · [Pristupačnost](ACCESSIBILITY.hr.md) · [Produkcijski kontrolni popis](GO-LIVE.hr.md).
