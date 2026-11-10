# CookieConsent by Brendigo — instalacija i integracija

## Samostalna instalacija

1. Prekopirajte `packages/core/brendigo-cookieconsent.js` i `.css` na svoj hosting.
2. U `<head>` uključite lokalni CSS, `window.BCC_SITE_CONFIG` i skriptu s `defer` kao u glavnom README-u.
3. Postavite stvarnu politiku kolačića i vidljivu trajnu poveznicu za promjenu izbora (`data-bcc-open`).
4. Pregledajte sve treće strane i klasificirajte njihove tehnologije.

| Konfiguracija | Zadano | Opis |
|---|---|---|
| `language` | `auto` | `hr`, `en` ili jezik stranice |
| `policyUrl` | `/cookie-policy` | URL politike kolačića |
| `accentColor` | `#4357e8` | Hex boja |
| `revision` | `1` | Promjena zahtijeva novu privolu |
| `position` | `bottom-center` | Jedna od 9 pozicija |
| `surfaceColor` | `#ffffff` | Boja pozadine bannera |
| `textColor` | `#17223e` | Boja teksta; nizak kontrast automatski se ispravlja |
| `by Brendigo` | uvijek vidljivo | Nema opcije skrivanja potpisa u UI-u ni API-ju |
| ponovno otvaranje | uvijek dostupno | Trajni gumb za postavke privole |
| `consentDays` | `180` | Ograničeno na 1–365 dana |
| `cookieName` | `bcc_consent` | First-party kolačić |
| `translations` | — | Prilagođeni tekstovi po jeziku |
| `onChange` | — | Funkcija koja prima odabrane kategorije |

## Blokirane skripte i iframeovi

```html
<!-- Vanjska skripta se NE učitava dok korisnik ne dopusti kategoriju -->
<script type="text/plain" data-bcc-category="marketing"
        data-bcc-src="/assets/marketing.js"></script>

<!-- Inline skripta -->
<script type="text/plain" data-bcc-category="analytics">
  console.log('Aktivirano nakon privole');
</script>

<!-- Vanjski video -->
<iframe title="Vanjski video" data-bcc-category="marketing"
        data-bcc-src="https://example.org/embed/video"></iframe>
```

Za dodatne dinamički ubačene elemente pozovite `BrendigoCookieConsent.refresh()`.

**Važno:** svaka opcionalna integracija mora biti inertna prije prvog učitavanja. Ovaj sustav ne može blokirati normalne `<script src>`, pixele, dinamičke fetch pozive, server-side eventove ili HTML drugih dodataka ako nisu posebno povezani s upraviteljem privola.

## WordPress

Zahtjevi: WordPress 6.2+, PHP 7.4+.

- ZIP mora sadržavati mapu `brendigo-cookieconsent` i cijelu podmapu `assets`.
- Instalirajte preko administratorskog izbornika Dodaci; aktivirajte plugin.
- Pod **Postavke → CookieConsent** podesite 9 položaja bannera, tri boje, jezik, link, rok i reviziju privole. Odaberite Local ili CDN nakon objave verzioniranog paketa. Potpis je uvijek uključen.
- Za prijavljene WP skripte upišite `analytics:my-handle` ili `marketing:my-ad-handle` po retku.
- Dodajte `<button type="button" data-bcc-open>Postavke kolačića</button>` u footer.

Za inline skripte, piksele, embedove i izravno umetnute skripte iz tema ili drugih dodataka potrebne su posebne integracije. Skriptni *handle* razlikuje se od naziva datoteke ili URL-a.

## Revokacija

Nakon revokacije nije moguće automatski poništiti već izvršeni JS. Implementacija mora ukloniti vlastite dodatne kolačiće i zaustaviti vanjske servise u skladu s njihovim API-jem; po potrebi ponovno učitajte stranicu uz već spremljen odbijeni izbor.

## Testiranje

1. Privatni prozor, bez ranije privole: provjerite Network panel i kolačiće.
2. Odbij sve: ne smije se učitati nijedna opcionalna označena skripta.
3. Dopustite samo analitiku: smije se izvršiti samo analitička kategorija.
4. Osvježite stranicu: odluka ostaje.
5. Ponovno otvorite postavke i povucite privolu; provjerite zaustavljanje daljnjih zahtjeva i cleanup.
6. Testirajte mobilni prikaz, tipkovnicu, HR/EN, WCAG i više preglednika.

Privola se sprema u first-party cookie sa SameSite=Lax, Path=/ i Secure na HTTPS-u. Ne postoji centralni audit trail ili mrežna usluga.

**Za produkciju obvezno provjerite konkretne servise i primjenjive zakone.**

## CDN i Google Basic adapter

Upute za objavu `cookie.brendigo.com`, skriptni loader, DNS/TLS i opcionalni Consent Mode v2 adapter: [CDN vodič](CDN.hr.md). Koristite lokalni način kao zadani dok CDN nije provjeren.
