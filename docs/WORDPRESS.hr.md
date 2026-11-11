# WordPress vodič — CookieConsent by Brendigo

**Zahtjevi:** WordPress 6.2+, PHP 7.4+ · **Izdanje:** 0.11.7

## Instalacija

1. Preuzmite `brendigo-cookieconsent-wordpress.zip` iz službenog [GitHub izdanja](https://github.com/bren-wp/CookieConsent/releases).
2. WordPress: **Dodaci → Dodaj novi → Prenesi dodatak**.
3. Aktivirajte dodatak i otvorite **Postavke → CookieConsent**.
4. Postavite istinitu URL adresu politike kolačića, jezik, reviziju i dizajn.
5. Na staging okruženju provjerite odbijanje, prihvaćanje, djelomični odabir, kupnju i povlačenje.

## Administratorske kontrole

| Postavka | Mogućnosti |
|---|---|
| Jezik i smjer | `auto`, HR, EN, DE, IT, ES, FR, AR; automatski LTR/RTL |
| Položaj bannera | 9 položaja |
| Stil | standard, compact, minimal |
| Tema i boje | custom/light/dark, naglasak, pozadina, tekst |
| Dijalog | sredina, lijeva ili desna bočna ploča |
| Gumbi | redoslijed, jednaka vizualna istaknutost |
| Animacije | mogućnost isključivanja |
| Politika | poveznica na pravila, revizija privole, trajanje 1–365 dana |
| Katalog | kategorija, pružatelj, svrha, cookies, rok, privacy URL, opcionalni ID |
| Pravila čišćenja | izričiti nazivi/prefiksi dostupnih first-party cookiesa |
| WordPress skripte | ručno mapiranje `kategorija:handle` za registrirane skripte |
| Google Basic | opcionalni adapter; zahtijeva zasebno blokiranje Google oznaka |
| Izvori | lokalno (zadano) ili CDN nakon stvarne objave datoteka |
| Brendigo potpis | obvezan u službenom prikazu, bez opcije skrivanja |
| Backup | administratorski JSON izvoz i sanitizirani uvoz |

## Uređivanje tekstova

U odjeljku **Banner text editor** odaberite jezik i uređujte naslov, opis i glavne gumbe. Prazna polja koriste ugrađeni prijevod. Napredno JSON polje podržava ostale oznake. Polja se sanitiziraju kao tekst; HTML nije dopušten. **Visual preview** prikazuje orijentacijski izgled, no ne zamjenjuje test na javnoj stranici.

## Katalog usluga

Svaka linija može sadržavati:

~~~text
analytics|Moja statistika|Mjerenje korištenja|_stats|90 dana|https://example.org/privacy|site-statistics
marketing|Oglašavanje|Mjerenje kampanja|_ads|180 dana|https://example.org/privacy|ads-service
~~~

Sedmi dio, `ID`, omogućuje prekidač pojedinačne usluge. Ne upisujte URL s dodatnim okomitim crtama `|`. Nakon spremanja provjerite konačni prikaz i stvarne izvore mrežnih zahtjeva.

## Blokiranje registriranih skripti

~~~text
analytics:site-analytics-handle
marketing:custom-ads-handle
~~~

Upišite **WordPress handle**, ne putanju datoteke. Filtar radi za označene registrirane WP skripte, ali **ne** za sve inline skripte, dinamičke ugradnje, iframeove, server-side eventove ili sve dodatke. Kritične WooCommerce skripte osnovne košarice/naplate imaju posebnu zaštitu.

## Izvoz i uvoz

**Export JSON configuration** preuzima konfiguraciju. Za uvoz zalijepite sadržaj u **Import and replace settings**. Potrebne su administratorske ovlasti, nonce provjera, valjana shema i sanitizacija. Uvoz zamjenjuje postojeće postavke: prije njega napravite backup. Samostalni JSON iz demo konfiguratora nije isti format kao WordPress import.

## Lokalno ili CDN

Lokalne datoteke zadana su opcija i ne trebaju Brendigo poslužitelj. CDN opciju uključite tek nakon DNS/TLS konfiguracije i testiranja svih potrebnih verzioniranih resursa. [CDN vodič](CDN.hr.md).

## Posebna pažnja pri nadogradnji

- Zabilježite postojeću `revision` vrijednost i odluku o tome treba li privolu ponovno tražiti.
- Potvrdite kompatibilnost s caching/minification dodacima i CSP pravilima.
- Testirajte jezične varijante, opcionalne skripte te sve načine naplate.
- Usporedite mrežne zahtjeve u anonimnom prozoru prije i nakon izbora.
- Ne poistovjećujte izolirane PHP provjere s testiranjem pune WordPress instalacije.

[WooCommerce](WOOCOMMERCE.hr.md) · [Otklanjanje problema](TROUBLESHOOTING.hr.md) · [Prihvatni test](GO-LIVE.hr.md).

## Metapodaci i WordPress.org direktorij

Službeni paket ima `Plugin URI: https://cookie.brendigo.com`, `Author: Brendigo`, `Author URI: https://brendigo.com` i `Contributors: brendigo` u WordPress `readme.txt`. Za javni WordPress.org direktorij `Contributors` mora odgovarati stvarnom WordPress.org računu.

**Razlika u pravilima:** brendirani GitHub ZIP ostavlja stalni potpis `by Brendigo` i nudi opcionalno učitavanje CDN skripti. Pravila WordPress.org direktorija zahtijevaju da javni kredit bude izboran i zadano isključen te u pravilu ne dopuštaju vanjsko učitavanje običnog plug-in JS/CSS koda. Stoga se **ne smije tvrditi** da je ova brendirana distribucija već odobrena za WordPress.org. Za direktorij je potrebna prilagođena distribucija uz zaseban Plugin Check audit. Službena dokumentacija: https://developer.wordpress.org/plugins/wordpress-org/detailed-plugin-guidelines/ .

## Ugradnja videozapisa uz privolu

`[brendigo_consent_video provider="youtube" id="dQw4w9WgXcQ" category="marketing" title="Video"]`
ili
`[brendigo_consent_video provider="vimeo" id="12345678" category="preferences" title="Video"]`.

WordPress generira samo lokalni placeholder bez iframea. Priložena skripta `video-embeds.js` učitava video tek nakon privole, a pri opozivu uklanja iframe. Opcionalni `service_id` mora odgovarati prijavljenoj granularnoj usluzi. Svi nazivi i ID-ovi sanitiziraju se; proizvoljni embed URL nije dopušten. Ovaj shortcode ne zamjenjuje klasifikaciju i informiranje o stvarnoj namjeni videa.

## Strogi Content Security Policy (CSP) — v0.11.5

Brendigo WordPress dodatak šalje konfiguraciju kao escapirani `<meta name="brendigo-cookieconsent-config" content="...">` prije JavaScript datoteka u `wp_head` (prioritet 8), a mali lokalni `assets/wp-config.js` čita JSON i postavlja `window.BCC_SITE_CONFIG`. Jezgra ovisi o bootstrapu i učitava se poslije njega; nije potreban inline JS ili `unsafe-inline` za konfiguraciju privola.

**Za produkciju:** dopustite relevantne izvore u `script-src` (`'self'` u lokalnom modu, ili i odobreni `https://cookie.brendigo.com` za opcijski CDN). Kod strožih `script-src 'nonce-...'` pravila host mora dodijeliti nonce relevantnim skriptnim oznakama, osobito uz `strict-dynamic`. `style-src`/`style-src-attr` zahtijevaju posebno testiranje zbog dinamičkih UI stilova i same WordPress teme. Ne pretpostavljajte da ostali dodaci prestaju koristiti inline kod.

Provjerite u Developer Tools da HTML sadrži `brendigo-cookieconsent-config` i `wp-config.js` prije jezgre, bez `window.BCC_SITE_CONFIG = ...` inline skripte, a zatim anonimni opt-in, odbijanje i opoziv.

## Prilagodba dimenzija i dizajna — v0.11.6

U **Postavke → CookieConsent → Size, spacing and typography** sada se uređuju širina bannera u px, mobilna širina u postocima, padding, zaobljenost bannera/gumba, razmak od ruba, veličina naslova i opisa te visina gumba. Boje, devet položaja, stilovi, tema, RTL i prijevodi ostaju u istom administratorskom sučelju. Sve nove vrijednosti koriste strogu serversku sanitizaciju i prikazuju se u vizualnom pregledu.

**Posebne vrijednosti:** `0` znači koristi zadani stil za širinu/padding/razmak/tekst/gumb; `-1` znači zadani stil za zaobljenost. Broj 0 za zaobljenost znači kvadratni rub, a ne automatski. `mobile_width=100` znači puni raspoloživi mobilni prostor unutar sigurnih rubova.

Nakon spremanja testirati desktop, 390 px i 320 px viewport te naplatu i aktivaciju odbijanja. Vizualni preview u WordPressu je ilustracija; HTML demo konfigurator koristi stvarnu jezgru i pruža pouzdaniju usporedbu.

## Brzi predlošci i pregled širina — v0.11.7

Iznad obrasca postavki četiri su **brza dizajnerska predloška** (Uravnoteženi / Plutajući / Minimalni / Tamni premium). Primjenjuju samo raspored, veličine, tipografiju i boje i **ne spremaju ništa** dok se ne pritisne WordPressov gumb `Spremi promjene`. Ne mijenjaju kategorije, postojeće kolačiće, privolu posjetitelja ni URL politike.

Ilustrativni WordPress pregled ima gumbe Desktop / Mobitel 390 px / Mobitel 320 px, prikazuje objašnjenje omjera kontrasta teksta i gumba te uključuje ispravnu svijetlu/tamnu podlogu. Za vizualnu provjeru stvarnog motora i svih responzivnih ograničenja koristite i javni HTML konfigurator; WordPress preview namjerno nije zamjena za prikaz u punom web pregledniku.


**Mobilna širina u previewu:** WP ilustrativni uređaj sada uvažava postotak `mobile_width` između 82 % i 100 % (i maksimalne rubove) bez mijenjanja produkcijske CSS jezgre. Nevrijedni brojevi u previewu vraćaju se na 100 %; PHP validacija potvrđuje spremljenu vrijednost pri spremanju.
