# Lokalna potvrda korisnikova izbora

**CookieConsent by Brendigo v0.8.1** omogućuje korisniku preuzimanje vlastite kopije aktivnog izbora iz prozora postavki privole.

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

**Dodatni detalj sinkronizacije:** uz BroadcastChannel koristi se i StorageEvent, pri čemu lokalna pohrana sadrži samo reviziju i tehnički signal promjene, ne stvarni izbor kategorija ili usluga. Zapis se može ukloniti pri čišćenju lokalne pohrane preglednika.

## Opcionalna serverska kriptografska atestacija (v0.11.8)

`tools/consent-attestation.cjs` pruža dvije Node.js funkcije, `attestReceipt(receipt, {scope, keyId, privateKey})` i `verifyAttestation(envelope, {scope, keyId, publicKey})`. Operator mora držati vlastiti Ed25519 privatni ključ izvan repozitorija, browsera i CDN-a, a verifikator mora pribaviti javni ključ iz neovisnog pouzdanog izvora. Potpis obuhvaća kanonizirani zapis, scope, keyId i vrijeme atestacije. Nepoznata polja, IP adresa i drugi proizvoljni atributi odbijaju se.

Ovo je pomoćna serverska kriptografska primitiva, ne gotov Consent Ledger niti potvrda da je klijentov iskaz istinit. Operator mora zasebno validirati stvarnu odluku prema svojoj politici, autentificirati i autorizirati zahtjev, riješiti replay, retenciju, reviziju, opoziv i upravljanje ključevima. Potpis ne dokazuje identitet posjetitelja, pravnu valjanost privole ili povijest povlačenja. Nema HTTP endpointa, automatskog slanja ili centralnog registra; zadani browser runtime ostaje lokalni.
