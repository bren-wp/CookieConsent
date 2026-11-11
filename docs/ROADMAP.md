# Razvojni plan — CookieConsent by Brendigo

**Aktualno testno izdanje: v0.11.3** · Revizija 10. 11. 2026. · [Dokumentacija](README.md) · [Povijest](CHANGELOG.md)

Projekt razlikuje **implementirano**, **automatizirano provjereno**, **ovisno o produkcijskoj instalaciji** i **vanjsku certifikaciju**. Svi preostali zadaci ostaju vidljivi. Zeleni CI ne zamjenjuje neovisnu sigurnosnu, pravnu ili pristupačnu validaciju.

## A. Implementirano i pokriveno testovima

- [x] Vanilla JS/CSS jezgra bez obveznih npm runtime ovisnosti, lokalno učitavanje, 7 jezika i RTL.
- [x] Kategorije privole, jednako dostupan izbor prihvaćanja i odbijanja, GPC ograničenje marketinga.
- [x] Devet položaja bannera, tri stila, teme, boje, redoslijed gumba i zaseban položaj dijaloga.
- [x] Pojedinačne usluge, ručno označeni inertni JS/iframe resursi, provider lifecycle i first-party cleanup pravila.
- [x] Lokalna potvrda korisnikova odabira, kontrola datuma/roka i sinkronizacija istog origina između kartica.
- [x] Siguran samostalni JSON import/izvoz, interaktivni konfigurator i njegov poboljšani prikaz/prevodivi tekst.
- [x] Javni višejezični katalog usluga: web API `renderCatalog` i WordPress shortcode `[brendigo_cookie_catalog]`.
- [x] Ograničeni browser-visible skener `scanLocalResources`, bez praćenja korisnika ili centralnog slanja.
- [x] WordPress administracija, editor prijevoda, JSON backup, opcionalno blokiranje registriranih handleova.
- [x] Ograničeni WooCommerce adapter za očuvanje nužnih skripti i prikaz usluga.
- [x] Opcionalni Google Consent Mode v2 Basic adapter (nije zamjena za blokiranje tagova).
- [x] HR/EN statična web-stranica te vlastiti CDN build i dokumentirani hosting koraci.
- [x] Reproducibilni ZIP paketi: standalone, Brendigo WordPress, WordPress.org **kandidat**, CDN i statična web-stranica.
- [x] Stvarni smoke testovi WordPress 6.2 / latest na MySQL-u i WooCommerce aktivacije.
- [x] CI: Node, PHP 7.4 i 8.1–8.4, Chromium/Firefox/WebKit i automatizirane provjere pristupačnosti.
- [x] Interni [sigurnosni audit](SECURITY-AUDIT.hr.md) i [dead-code audit](DEAD-CODE-AUDIT.hr.md), regresijski testovi i JS/CSS performance budget.
- [x] Odvojena WordPress.org kandidatska distribucija s lokalnim resursima i dobrovoljnim potpisom; službeni Plugin Check kao CI kontrola.

## Korekcije — v0.11.3

- [x] Shopify: lokalni CSP-kompatibilni bootstrap, sinkronizacija spremljenog odabira, cross-tab promjena i resetiranja s Customer Privacy API-jem.
- [x] PrestaShop: apsolutna putanja iz korijena modula umjesto relativnih ruta na ugniježđenim stranicama.
- [x] CDN: odbijanje redirecta, ograničenje HTTP odgovora i čišćenje zastarjelih build datoteka uz regresije.
- [ ] Potvrditi stvarne Shopify/PrestaShop izvedbe na reprezentativnim produkcijskim/staging trgovinama.

## Nove platformske integracije — v0.11.0

- [x] Joomla 5 system plugin s lokalnim WebAssetManager resursima i administratorovim postavkama.
- [x] Drupal 10/11 modul s konfiguracijskim obrascem, schema datotekama i `hook_page_attachments`.
- [x] Shopify Theme App Extension s `compliance_head` blokom i Customer Privacy API adapterom (samo uz posjetiteljevu odluku).
- [x] Magento 2.4 modul s layoutom, konfiguracijom po store scopeu i sigurnom JSON serialization.
- [x] OpenCart 4 native extension s administracijom i eventom za storefront header.
- [x] PrestaShop 8/9 modul s nativnim hookovima i administratorskim obrascem.
- [x] Reproducibilno pakiranje svih šest integracija te statičke provjere PHP/XML/JSON/Shopify schema datoteka.
- [x] Izolirani runtime PHP stub testovi: Joomla, Drupal, Magento, OpenCart i PrestaShop; Shopify Customer Privacy simulacija.
- [x] Ispravljeni OpenCart apsolutni store-root resursi, inertna CSP konfiguracija i Shopify bridge inicijalizacija.
- [x] HTTP/HTTPS web/CDN validator s manifestom, MIME provjerama i SHA-256 te lokalni test validatora.
- [ ] Runtime instalacijski i checkout testovi na stvarnim Joomla, Drupal, Shopify, Magento, OpenCart i PrestaShop trgovinama.
- [ ] Shopify aplikaciju registrirati/objaviti preko Shopify CLI i potvrditi Customer Privacy API ponašanje u development storeu.
- [ ] Testirati stvarni cache, CSP, teme, automatizirano blokiranje i opoziv svih vanjskih servisnih dodataka po platformi.

[Instalacija svih šest](CMS-INTEGRATIONS.hr.md).

## B. Integracije i produkcijska kvaliteta — otvoreni zadaci

- [ ] Potvrditi stvarne WooCommerce košarice i checkout tokove s konkretnim gatewayima, temama i dodatcima.
- [ ] Potvrditi CSP, nonce/hash konfiguraciju, opt-in i opoziv na reprezentativnim produkcijskim/staging web-stranicama.
- [x] YouTube/Vimeo iframe adapter s kontrolom učitavanja i opoziva, WordPress shortcodeom te browser testom; ostali pružatelji i dalje zahtijevaju zasebne adaptere i analizu.
- [x] Pasivni browser-visible skener nadopunjen je ograničenim ResourceTiming metapodacima, redakcijom URL query/fragmenta te izričitim popisom nedostupnih HttpOnly, cross-origin i server-side podataka.
- [ ] Provjeriti mobile/desktop raspored, zoom 200–400 %, RTL i ručne čitače ekrana.
- [x] CI dodaje sintetička Chromium mjerenja prvog učitavanja (desktop i dva simulirana mobilna profila, CPU slowdown, ResourceTiming i transfer size); **stvarna mjerenja na fizičkim uređajima i RUM ostaju otvoreni**.
- [x] Pinani GitHub Actions SHA-ovi i uveden statički supply-chain gate; **neovisni pentest, provenance i checksum testnih preuzimanja ostaju otvoreni**.
- [ ] Potvrditi stvarno hosting okruženje shared hostinga i sukobe s cache/minifier dodacima.

## C. Infrastruktura, pravne obveze i javna distribucija — ovisi o vanjskom pristupu

- [ ] Potvrditi stvarno postavljen DNS, HTTPS/TLS, hosting, cache pravila, politiku logova i monitoring za `cookie.brendigo.com`. Uveden je lokalni read-only alat `npm run verify:hosting -- https://cookie.brendigo.com` (TLS, DNS, MIME, sigurnosna zaglavlja); objava i javni prihvat i dalje nisu dokazani.
- [ ] Dovršiti produkcijsku politiku privatnosti web-stranice proizvoda s pravim operatorom, kontaktom i retencijom logova.
- [ ] Obaviti stvarni pravni pregled ciljne web-stranice prema HR/EU i ostalim primjenjivim jurisdikcijama.
- [ ] Provjeriti je li za oglašivački use-case potreban certificirani CMP/IAB TCF; nema automatske certifikacije samom instalacijom.
- [ ] Poslati zaseban WordPress.org kandidat na direktorij s potvrđenim `Contributors` računom i proći službeni ljudski review.
- [ ] Ako je za konkretan projekt potrebna serverska evidencija privola, projektirati odvojeni zakonit ledger s minimizacijom, rokom čuvanja, obvezama pristupa i sigurnosti.
- [ ] Dokumentirati arhiviranje prijašnjih verzija politike i procjenu ponovnog traženja privole na stvarnoj stranici.

## Kriteriji za stabilnu verziju 1.0

1. Uspješan CI na točnom izdanom commitu, bez blokirajućih Plugin Check pogrešaka.
2. Potvrđeni integracijski testovi web/WP/WooCommerce i povlačenja privole na stvarnim instalacijama.
3. Nema poznatih kritičnih sigurnosnih rizika u podržanim integracijama.
4. Dokumentirana ograničenja svakog vanjskog servisa, GDPR/ePrivacy/HR regulatorna analiza i razumljiva dokumentacija.
5. Operativni monitoring, sigurnosna ažuriranja i plan rollbacka za javnu CDN infrastrukturu.

**Status:** glavne funkcije i šest dodatnih izvorišnih CMS integracija isporučeni su u repozitoriju. Vanjski deployment, neovisna certifikacija i sve stvarne integracije nisu označeni dovršenima bez dokaza.
