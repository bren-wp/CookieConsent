# Lokalna potvrda korisnikova izbora

**CookieConsent by Brendigo v0.8.0** omogućuje korisniku preuzimanje vlastite kopije aktivnog izbora iz prozora postavki privole.

## Sadržaj

~~~json
{
  "schema": "brendigo-consent-receipt-v1",
  "product": "CookieConsent by Brendigo",
  "revision": "2026-11",
  "decidedAt": "2026-11-10T20:00:00.000Z",
  "categories": {"necessary": true, "preferences": false, "analytics": false, "marketing": false},
  "services": {},
  "gpc": false,
  "localOnly": true
}
~~~

Primjer je demonstracijski. Stvarni datum nastaje pri posljednjem spremanju odabira. Ne dodaje se IP adresa, korisnički identifikator ili remote telemetrija.

## Preuzimanje

~~~javascript
const record = BrendigoCookieConsent.getConsentReceipt();
if (record) BrendigoCookieConsent.downloadConsentReceipt();
~~~

U prozoru postavki prikazuje se gumb za preuzimanje kada je odluka već spremljena. Pri `reset()` zapis više nije dostupan sve dok korisnik ne donese novu odluku. Revizija pravila utječe na valjanost prethodnog zapisa.

## Događaji i više kartica

`onFirstConsent` se pokreće pri prvoj odluci, `onConsent` pri učitavanju postojeće privole i nakon odluke, a `onDecision` pri lokalnom spremanju. Otvorene kartice iste domene razmjenjuju samo signal da je revizija promijenjena, a vrijednosti čitaju iz vlastitog first-party kolačića.

## Pravno ograničenje

**Lokalni JSON nije nepromjenjiv, nije digitalno potpisan, nije poslužiteljski ovjeren dokaz privole i ne može dokazati identitet korisnika.** Ako je za određenu primjenu potreban dokazni registar, mora se zasebno projektirati uz pravnu osnovu, minimizaciju, sigurnosna pravila i rokove čuvanja.

Sustav ne tvrdi da posjeduje centralnu bazu privola.
