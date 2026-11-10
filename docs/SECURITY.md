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
