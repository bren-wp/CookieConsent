# Povijest promjena — CookieConsent by Brendigo

Ovdje se opisuje funkcionalni razvoj službene grane. Zapisi označeni kao testne verzije nisu tvrdnja da je sva produkcijska ili regulatorna validacija obavljena.

## 0.8.1 — testno izdanje

- Korektivno izdanje: dokumentacija, jezgra, WordPress dodatak i CDN ponovno su usklađeni na istu verziju.
- Dodana je provjera usklađenosti verzija koja se mora izvršiti prije objave.

- Lokalna JSON potvrda korisnikova odabira s datumom i revizijom; preuzimanje u dijalogu postavki.
- `onFirstConsent`, `onConsent` i `onDecision` callbackovi.
- Sinkronizacija odabira među karticama iste domene, bez prijenosa vrijednosti privole.
- WordPress editor teksta bannera po jeziku uz sanitizaciju.
- Nova struktura dokumentacije, puni API i konfiguracijski vodič.
- Regresijski testovi za potvrdu izbora, sinkronizaciju i prikaz.

## 0.7.0 — testno izdanje

- Napredniji samostalni konfigurator tema, rasporeda gumba, prijevoda i JSON izvoza.
- Granularni prekidači pojedinačnih usluga i pravila čišćenja dostupnih first-party kolačića.
- Ispravak skrivanja bannera u svim položajima.
- Chromium, Firefox i WebKit E2E te automatizirane accessibility provjere.

## 0.6.0 — razvojna faza

- Prošireni izgled bannera, dodatni jezici i RTL.
- Reproducibilni ZIP paketi, CDN manifest i administratorske funkcije.

## 0.5.0 i starije — razvojni temelji

- Vanilla JS/CSS jezgra, WordPress dodatak, HR/EN, četiri kategorije i trajni prikaz postavki.
- Devet položaja bannera i boje.
- Pružatelji usluga, lifecycle integracije, Google Basic adapter.
- Lokalni browser audit, JSON backup WordPress postavki, WooCommerce zaštitni adapter.

Za sadržaj trenutnog izdanja i preostale zadatke pogledajte [ROADMAP.md](ROADMAP.md).
