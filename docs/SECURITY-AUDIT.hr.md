# Security audit — CookieConsent by Brendigo

**Datum:** 10. 11. 2026. · **Vrsta:** source-level sigurnosni pregled i regresijske provjere · **Status:** interni audit, nije neovisni penetracijski test

## Obuhvat

Pregledani su JS/CSS jezgre, namjerno mirrorrirane WP datoteke, PHP administratorske kontrole, REST/HTTP odsutnost, inline i vanjski resursi, service provider API, cookie zapis, CDN loader, demo HTML, build skripte, ZIP pakiranje, GitHub Actions, WP.org kandidat i regresijski testovi.

Automatizirani pregled obuhvatio je **37 kodnih/testnih/CI datoteka** te izravnu analizu najosjetljivijih tokova u jezgri i WordPressu. Dodatna verifikacija: `npm test`, `npm run check`, PHP kompatibilnost i Playwright/axe-core u CI-u, stvarni WordPress 6.2/latest smoke test i službeni Plugin Check izvještaj. Ovi rezultati ne obuhvaćaju tuđe teme, stvarne hosting postavke, sve ekstenzije, mrežne konfiguracije, fuzzing ili neovisni red-team.

## Nalazi i provedene mjere

| ID | Razina | Nalaz | Stanje |
|---|---|---|---|
| SEC-01 | Srednja | Zapis privole provjeravao je format datuma, ali ne i protek dozvoljenog roka. Obnovljeni / ručno vraćeni cookie mogao se ponovno prihvatiti. | **Ispravljeno**: strogi ISO datum, budući datum, maksimalna duljina i `consentDays` rok |
| SEC-02 | Srednja | Izvori su mogli biti na HTTP protokolu čak i s HTTPS stranice, što bi omogućilo aktivni mixed content ili downgrade. | **Ispravljeno**: HTTPS stranica prihvaća samo HTTPS URL-ove; URL-ovi s username/password se odbijaju |
| SEC-03 | Niska | Demo sadržavao HTML `onclick` atribut koji otežava strogi CSP. | **Ispravljeno**: zamijenjen navigacijskom poveznicom bez inline event handlera |
| SEC-04 | Niska | PHP testni fixture koristio je `eval` samo za deklaraciju testnog razreda. | **Ispravljeno**: kontrolirana runtime deklaracija bez dinamičkog izvršavanja teksta |
| SEC-05 | Niska | Duplicirano CSS pravilo za `[hidden]` i nepotrebna druga registracija `BroadcastChannel`. | **Ispravljeno**: uklonjeni duplikati, uvedene regresije |
| SEC-06 | Potencijalno visoka, ovisi o implementaciji | Ručno označena `type=text/plain` skripta jednom aktivirana ne može se univerzalno zaustaviti samo uklanjanjem `<script>` čvora. | **Otvoreno po dizajnu**: integracije moraju imati `onRevoke` cleanup; prijevoz testirati |
| SEC-07 | Potencijalno visoka, ovisi o implementaciji | Neoznačeni JS, inline skripte drugih dodataka, server-side događaji i cross-origin cookies nisu univerzalno blokirani. | **Otvoreno**: potrebni audit stvarne stranice, mrežnih zahtjeva i svih pružatelja |
| SEC-08 | Srednja za dokazivost | Privola je lokalni korisnički cookie, bez digitalnog potpisa i poslužiteljske evidencije. | **Dokumentirano**: `getConsentReceipt` nije dokaz sukladan svim dokaznim obvezama |
| SEC-09 | Srednja za privatnost | Ako se izabere CDN, operator hostinga vidi mrežne metapodatke i mogući IP u logovima. | **Dokumentirano**: lokalno učitavanje zadano, retencija i DNS/TLS politika nisu potvrđeni |
| SEC-10 | Srednja, specifično za direktorij | Obvezni javni potpis i CDN mod službenog ZIP-a sukobljavaju se s pravilima WordPress.org direktorija. | **Ublaženo**: zaseban lokalni WP.org kandidat s dobrovoljnim potpisom; treba službeno odobrenje |

## Obrana u dubinu

- JavaScript koristi sigurne tekstne DOM izlaze umjesto `innerHTML` sinkova za unose korisnika.
- Nijedna od pregledanih produktnih JS datoteka ne koristi `eval`, `new Function`, `document.write` ili izvršavanje proizvoljnog koda s udaljenog servisa.
- Poziv u DOM-u za aktivaciju inertnih označenih skripti namjeran je integracijski mehanizam, a ne automatska procjena njihove pravne osnove.
- WordPress postavke filtriraju dopuštene opcije, URL-ove, tekst i pravila čišćenja; import/export zahtijevaju `manage_options` i nonce.
- HTML izlaz WordPress shortcoda escapira tekst, URL-ove i atribute.
- JSON se ograničava veličinom, shemom, dopuštenim ključevima i sanitizacijom. Konfiguracija ne uvozi privolu.
- Kod lokalnog načina rada ne postoji obvezna vanjska mrežna ovisnost.
- GPC ograničava marketing, ali ne zamjenjuje regionalni opt-out backend.
- Web/CDN artefakti proizvode se deterministički i mogu se provjeriti SHA-256 vrijednostima; hash nije kriptografski potpis izdavatelja.

## Dodatni potrebni testovi

1. **Neovisni pentest** svih WordPress administratorskih endpointova (authenticated/unprivileged), uvoza, shortcodea, CSP i third-party integracija.
2. **Stvarna WordPress/WooCommerce instalacija** sa svim aktivnim temama, checkout gatewayima i CDN/cache dodatcima.
3. **Ručno testiranje privatnosti**: Network/devtools + proxy, prije/prilikom/poslije privole, zasebni pružatelji i povlačenje.
4. **Skeniranje server-side obrade** i evidencije privola kada je primjenjivo.
5. **Zaštita opskrbnog lanca**: nadzor GitHub Actions prava, obnova ovisnosti, integritet release artefakata i objava sigurnosnih ažuriranja.
6. **Pravna i pristupačna validacija** za stvarne tekstove i ciljne jurisdikcije; CI ne daje certifikaciju.

## Zaključak

U obuhvaćenom izvornom kodu popravljene su konkretne sigurnosne i robusnosne pogreške. Preostali rizici odnose se ponajviše na treće servise, preglednik, poslužitelj, raspored učitavanja, lokalnu evidenciju i vanjski hosting. **Ovaj dokument nije dokaz da je sustav bez ranjivosti niti da je usklađen sa svim zakonima.**

[Sigurnosne smjernice](SECURITY.md) · [Roadmap](ROADMAP.md) · [Produkcijska provjera](GO-LIVE.hr.md).

## Popravak međukartične sinkronizacije

Uveden je dodatni `storage` event kanal uz BroadcastChannel, s porukama koje sadrže samo reviziju politike, timestamp i lokalni brojač. Time se smanjuje rizik gubitka sinkronizacije u preglednicima koji privremeno ograničavaju BroadcastChannel. Nema prijenosa sadržaja privole na udaljeni server; za oba kanala potreban je isti origin.

## Dodatna revizija za v0.11.3 (11. 11. 2026.)

Ovo je nadopuna internog pregleda iz prethodne verzije, ne vanjski penetracijski test.

| ID | Razina | Nalaz | Korektivna mjera |
|---|---|---|---|
| SEC-11 | Srednja | Shopify most ažurirao je Customer Privacy API samo pri novoj odluci. Obnovljena prethodna privola, cross-tab promjena i izričit reset nisu u svim putovima propagirani. | Vanjski bootstrap povezuje `onConsent` i `onChange` s mostom; `null` znači opoziv svih opcionalnih kategorija; deduplicirane identične odluke i dodani Node regresijski testovi. |
| SEC-12 | Niska do srednja | Shopify embed izvršavao je konfiguraciju kroz inline JS; to otežava strogi CSP i pregled izlaza Liquid vrijednosti. | Konfiguracija se prenosi preko Liquid `escape` atributa neizvršivog `meta` elementa, a obrađuje u zasebnoj lokalnoj datoteci; uklonjen izvršivi inline JS iz embe­da. |
| SEC-13 | Niska do srednja | CDN validator slijedio je redirect i učitavao puni odgovor bez gornje granice veličine. | Redirect se odbija prije praćenja cilja; `Content-Length` i streaming sadržaj imaju limit 2 MiB; SHA-256 provjera ostaje obvezna. |
| SEC-14 | Niska | Preostale datoteke u direktoriju ranijeg CDN builda mogle su završiti u lokalno pakiranoj distribuciji bez stavke u manifestu. | Prije generiranja svakog verzioniranog CDN bundlea briše se isključivo njegov ciljni build direktorij; regresijski test provjerava uklanjanje datoteke bez manifesta. |

**Provjera i granice:** Repo sadrži automatizirane regresije za navedene slučajeve, ali nijedna izolirana provjera ne dokazuje kompatibilnost s konkretnom Shopify trgovinom, realnim PrestaShop hostingom ili konfiguracijom `cookie.brendigo.com`. Posebno provjeriti Shopify pixel gating, CSP, ponovni pokušaj nakon privremenog API neuspjeha, zaštitu web kolačića i kvalitetu revocation cleanupa. Za zakonitost i sigurnost stvarne instalacije potrebni su staging, vanjski pentest i pravna analiza.

## Supply-chain nadopuna za v0.11.4

- GitHub Actions `checkout`, `upload-artifact` i `setup-php` vezani su na pregledane 40-znamenkaste commit SHA-ove (refovi `v4.2.2`, `v4.6.2`, `2.37.2` provjereni na GitHubu 11. 11. 2026.).
- `npm run audit:supply-chain` odbija nepinane vanjske Actions reference i produkcijske npm ovisnosti; testovi i build ostaju bez produkcijskih npm paketa.
- **Otvoreni rizici:** instaliranje browser test paketa i WordPress/WooCommerce/plugin-check tijekom CI-a koristi vanjske repozitorije; `wp-cli.phar` se dohvaća kao vanjski artefakt bez ugrađene checksum/provenance potvrde. Potrebni su zaključane testne ovisnosti, hash/provenance provjere i neovisni supply-chain review. Statička provjera nije neovisni pentest.

## Nova revizija — v0.11.5 (11. 11. 2026.)

- **SEC-11 (ispravljeno za WordPress bootstrap):** WordPress opcije prethodno su se serializirale u izvršni inline JS `window.BCC_SITE_CONFIG` preko `wp_add_inline_script`. Pod strogim `script-src` CSP-om to može biti odbijeno. Novi `wp_head` meta JSON s `JSON_HEX_*` i `esc_attr` uparuje se s lokalnim `wp-config.js`, s učitavanjem prije osnovne skripte i automatskim testom bez `unsafe-inline`.
- **SEC-12 (dodatna obrana):** CDN loader propagira nonce, crossorigin i referrerpolicy oznake iz vlastite script oznake; nipošto ne generira nonce ili ne mijenja politika servera.
- **Preostale granice:** za cjelokupni WordPress CSP potrebna su pravila svih tema i pluginova. CSS-in-JS/inline stilovi mogu zahtijevati posebnu `style-src` politiku; `nonce` se ne može automatski koristiti za proizvoljne 3rd-party skripte. Neovisni pentest i CSP provjera stvarnih instalacija i dalje su otvoreni.
