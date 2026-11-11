# Dead code audit — CookieConsent by Brendigo

**Datum:** 10. 11. 2026. · **Vrsta:** interni pregled živosti koda, ovisnosti i dupliciranja

## Pregledane cjeline

- `packages/core/` — proizvodna JS/CSS jezgra, inicijalizacija i API.
- `wordpress/brendigo-cookieconsent/` — PHP plugin, admin preview, prijevodi i sinkronizirane JS/CSS kopije.
- `packages/integrations/` — Google Basic adapter.
- `cdn/`, `tools/` i `.github/workflows/` — loader, build, verzioniranje i isporuka.
- `website/`, `demo/` i `tests/` — javne datoteke, stvarno korišteni primjeri i provjere.

## Nalazi

| ID | Nalaz | Radnja |
|---|---|---|
| DC-01 | Dvostruki CSS `.bcc-root .bcc-banner[hidden]` i `.bcc-root .bcc-reopen[hidden]`. | Uklonjen ponovljeni blok, sačuvan jedan funkcionalni override |
| DC-02 | `listenForTabUpdates()` pozivao se u `init()` i ponovno u `mount()`; metoda ima zaštitu, no drugi poziv bio je suvišan. | Uklonjen poziv iz `mount()`, registracija ostaje prije DOM inicijalizacije |
| DC-03 | PHP test pomoću `eval` deklarirao je `WooCommerce` testni razred. | Zamijenjen kontroliranom PHP deklaracijom bez dinamičke evaluacije |
| DC-04 | WordPress JS/CSS kopije jednake su jezgrenim datotekama; naizgled dupliciran kod. | **Namjerno zadržano** radi lokalne WordPress isporuke, CI provjerava identične bajtove |
| DC-05 | WP.org kandidat izvodi se iz iste jezgre uz malene transformacije. | **Namjerno zadržano** kao odvojen build artefakt, nije drugi dugoročni izvorni projekt |
| DC-06 | `unregister` zatvarač u provider API-ju ima lokalnu definiciju i koristi se kao povratna vrijednost. | **Nije mrtav kod** |
| DC-07 | Web demonstracije i SVG ilustracije u README-u/ZIP-u koriste se kao funkcionalni primjeri i javna dokumentacija. | **Zadržano** |

## Izvršene provjere

- Pregledano **59 imenovanih funkcija** u JavaScript jezgri; heurističko pretraživanje referenci nije našlo funkciju koja se pojavljuje samo u deklaraciji (ta metoda sama po sebi nije dokaz dosegljivosti).
- Statički pregled 37 kodnih/testnih/CI datoteka za `eval`, `new Function`, `innerHTML`, inline događaje, nepotrebne runtime ovisnosti i `TODO/FIXME` oznake (jedini `eval` bio je u testu, koji je ispravljen).
- Jedinstveno pravilo `[hidden]` i samo jedan poziv inicijalizacije kanala imaju regresijske testove.
- WordPress i standalone kopije JS/CSS moraju ostati identične; uklanjanje duplikata iz ZIP-a pokvarilo bi lokalnu instalaciju.

## Što pregled ne može dokazati

Statički pretraživač ne može dokazati da je svaki event handler ili callback dosegljiv u svim preglednicima, da je svaki CSS selektor potreban na svakoj temi, niti da nijedna buduća ekstenzija ne dodaje mrtav kod. Za pouzdanu procjenu treba provesti browser coverage s reprezentativnim scenarijima, WordPress profiler i ručnu funkcionalnu provjeru.

## Politika daljnjeg održavanja

- Ne uvoditi drugi izvor istine za JS/CSS.
- Ne ostavljati testne helper-e ili `eval` u produkcijskom kodu.
- Nove funkcije moraju imati korištenje, dokumentaciju i test.
- CI mora blokirati regresije identificiranih duplikata i opasnih sinkova.
- Ne brisati namjerno odvojene isporuke bez migracijskog plana.

[Security audit](SECURITY-AUDIT.hr.md) · [Razvoj](DEVELOPMENT.md) · [ROADMAP](ROADMAP.md).

## Nadopuna revizije — v0.11.3 (11. 11. 2026.)

- **DC-08:** iz Shopify embe­da uklonjen je duplicirani inline konfiguracijski tok; postavke čita lokalni `shopify-config.js`, dok `shopify-privacy-bridge.js` zadržava samo komunikaciju s platformom.
- **DC-09:** više se ne zadržavaju stare datoteke u verzioniranom `dist/cdn` direktoriju nakon ponovnog builda. Sam manifest i ZIP pakiranje imaju jedinstven, kontroliran ulaz.
- **DC-10:** različite platforme i dalje svjesno isporučuju identičan runtime JS/CSS kao lokalne kopije; provjera jednakosti iz `tools/check-release.mjs` ostaje obvezna.
- Heuristički audit ne briše nepoznate callbackove, podatkovne atribute i lifecycle funkcije bez dokazanog nekorištenja. Stvarna pokrivenost izvršavanja zasebnih CMS sustava ostaje otvorena dok nisu dostupni reprezentativni staging environmenti.

- **DC-11:** `npm run check` sada rekurzivno obuhvaća sve izvorne JS/CJS/MJS datoteke u proizvodnim integracijama, testovima i alatima, umjesto ručno održavanog djelomičnog popisa. Riječ je o sintaktičkoj provjeri, ne dokazu izvršne dosegljivosti.
