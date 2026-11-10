# Instalacija i prvi koraci — CookieConsent by Brendigo

**Verzija:** 0.10.0 · [README](../README.md) · [Dokumentacijski indeks](README.md)

## 1. Samostalna HTML/PHP instalacija

1. Preuzmite službeni `cookieconsent-brendigo-standalone.zip` ili prenesite `packages/core/brendigo-cookieconsent.css` i `.js` na svoj hosting.
2. Uključite CSS, konfiguraciju i JavaScript u pravilnom redoslijedu.
3. Povežite stvarnu politiku kolačića kroz `policyUrl` i definirajte smisleni `revision`.
4. Popišite neobvezne skripte i iframeove te ih **učinite inertnima prije prve posjete**.
5. Testirajte funkcionalnost u anonimnom prozoru.

~~~html
<link rel="stylesheet" href="/assets/brendigo-cookieconsent.css">
<script>
  window.BCC_SITE_CONFIG = {
    language: "hr",
    position: "bottom-center",
    theme: "custom",
    accentColor: "#4357e8",
    policyUrl: "/politika-kolacica",
    revision: "2026-11",
    consentDays: 180
  };
</script>
<script defer src="/assets/brendigo-cookieconsent.js"></script>
~~~

## 2. Označavanje neobveznih resursa

~~~html
<script type="text/plain"
        data-bcc-category="analytics"
        data-bcc-src="/assets/analytics.js"></script>

<script type="text/plain" data-bcc-category="marketing">
  // Kod se ne pokreće do marketinške privole.
</script>

<iframe title="Vanjski sadržaj" data-bcc-category="marketing"
        data-bcc-src="https://example.org/embed"></iframe>

<button type="button" data-bcc-open>Postavke kolačića</button>
~~~

Za dinamički ubačene označene resurse koristite `BrendigoCookieConsent.refresh()`. Neoznačene skripte, poslužiteljska obrada i vanjska pohrana nisu univerzalno zaustavljeni. [Integracije](INTEGRATIONS.hr.md).

## 3. Izgled i više jezika

Postoji devet položaja bannera, tri stila i tri teme. Jezici: hrvatski, engleski, njemački, talijanski, španjolski, francuski i arapski. Možete prilagoditi naslov, opis, gumbe i druge oznake; boje se validiraju i kontrast teksta automatski poboljšava.

Sve dostupne opcije: [Konfiguracija](CONFIGURATION.hr.md).

## 4. WordPress

ZIP instalirajte kroz **Dodaci → Dodaj novi → Prenesi dodatak**, zatim otvorite **Postavke → CookieConsent**. Dostupne su postavke položaja, tema, jezika, kataloga usluga, editor prijevoda, vizualni pregled, JSON backup i opcionalni Google Basic adapter.

[Kompletan WordPress vodič](WORDPRESS.hr.md). Za WooCommerce vrijedi [poseban kontrolni popis](WOOCOMMERCE.hr.md).

## 5. CDN

Verzionirani paket namijenjen je domeni `cookie.brendigo.com`. Publiciranje zahtijeva stvarni DNS, HTTPS i upload. **Repozitorij ne postavlja hosting samostalno.** Detalji: [CDN](CDN.hr.md).

## 6. Provjera nakon instalacije

- U privatnom prozoru obrišite prethodne kolačiće.
- Prije odluke provjerite Network: nema neobveznih zahtjeva.
- Testirajte `Odbij sve`, `Prihvati sve` i pojedinačni izbor.
- Ponovno učitajte stranicu; provjerite trajnost privole.
- Ponovno otvorite postavke i povucite odobrene kategorije.
- Provjerite zaustavljanje servisnih zahtjeva i dostupni cookie cleanup.
- Testirajte drugi tab iste stranice, RTL i mobilni prikaz.
- Provjerite da je u službenom prikazu vidljiv `by Brendigo`.
- Provedite [produkcijski kontrolni popis](GO-LIVE.hr.md).

## 7. Lokalni razvoj

~~~bash
npm run check
npm test
npm run build:cdn
python3 tools/package.py
python3 -m http.server 8000
~~~

Otvorite `http://localhost:8000/demo/configurator.html`. Lokalna potvrda odabira dostupna je kroz `getConsentReceipt()` i gumb u postavkama nakon odluke; [opis ograničenja](CONSENT-RECEIPT.hr.md).

## Javni katalog kolačića

Za Vanilla JS dodajte element `<div id="cookie-catalog"></div>` i nakon inicijalizacije pozovite `BrendigoCookieConsent.renderCatalog('#cookie-catalog')`. Na WordPress stranici upotrijebite shortcode `[brendigo_cookie_catalog language="hr"]`. Informacije moraju odražavati stvarne usluge stranice.
