# Sigurnost i tehničke granice

## Načela
- Nema slanja privole Brendigo poslužiteljima i nema vanjskih runtime biblioteka.
- UI tekstovi ispisuju se preko sigurnog `textContent` API-ja.
- Link politike kolačića ograničen je na HTTP(S).
- Pohrana: first-party cookie, SameSite=Lax, Secure na HTTPS-u.
- WordPress Settings API, provjera `manage_options` prava i sanitizacija postavki.
- Neobvezne skripte moraju biti inertne prije učitavanja.

## Granice koje treba dokumentirati
- Consent cookie nije autentikacijski token i čitljiv je vlastitom JavaScriptu.
- Skripte koje su već izvršene ne mogu se poništiti samo promjenom oznake.
- Ne brišu se automatski već stvoreni cookies trećih strana.
- Ostale WP inline skripte, pixeli i servisi nisu obuhvaćeni generičkim filtrom.
- Nema server-side dokaza privole ni obrade prava ispitanika.
- Kompatibilnost sa svim CSP postavkama i alatima za praćenje nije potvrđena.

## Prijava problema

Za sigurnosne ranjivosti koristite privatnu GitHub sigurnosnu prijavu ako je omogućenja. Ne objavljujte podatke koji olakšavaju zlouporabu na javnom issueju.

## Provjere

`npm test`, `npm run check`, `php -l` i browser testovi čine početnu provjeru; oni ne zamjenjuju penetracijski test niti profesionalni security audit.

## v0.3.0 integracijski hookovi

`registerProvider()` je namijenjen kontroliranim integracijama razvijatelja web-stranice. Funkcije `onGrant` i `onRevoke` izvršavaju se samo za poznate kategorije i ne zaustavljaju automatski već izvršene nepoznate skripte. Callbackovi mogu izazvati zahtjeve prema vlastitim trećim stranama: autor integracije mora poštovati valjanu privolu i provjeriti svoje cleanup funkcije.

Katalog pružatelja služi informiranju posjetitelja, **ne autorizaciji skripti**. Poveznice prihvaćaju HTTP(S) URL-ove, tekst se prikazuje kroz `textContent`, a URL-ovi iz administratorskih postavki se sanitiziraju. Za proizvodnu implementaciju preporučuje se HTTPS za sve vanjske politike.

U dijalogu detalji pružatelja više se ne nalaze unutar `<label>` elementa koji mijenja izbor kategorije, čime su poveznice odvojene od aktivacije checkboxa.

Nema automatskog brisanja cookiesa trećih strana, dokaznog server-side dnevnika, IP geolokacije ni skenera skripti.

## Dodatne provjere u v0.4.0

- `data-bcc-src` skripte i iframeovi provjeravaju URL shemu (HTTP i HTTPS). Nevažeci ili netipični protokoli ostaju inertni.
- `auditLocal()` je isključivo lokalni API; preglednički podaci se ne šalju na CDN, server ili treće strane.
- WordPress JSON import i export zahtijevaju administratorske ovlasti; import je ograničen na 64 KiB, podržanu shemu i sanitizaciju svih opcija. Podaci se spremaju tek nakon provjere.
- Komponente čuvaju stalni potpis *by Brendigo*. MIT dopušta izmjene koda i nije mehanizam za tehničko onemogućavanje skrivanja.
- Automatizirani Chromium testovi provjeravaju neke tokove, ali ne zamjenjuju puni WCAG audit, security pentest, certifikaciju CMP-a i stručni pravni pregled.
