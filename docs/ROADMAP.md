# Razvojni plan — CookieConsent by Brendigo

**Razvojni cilj: v0.10.0 (testno izdanje)** · Revizija 10. 11. 2026. · [Dokumentacija](README.md) · [Povijest](CHANGELOG.md)

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

## B. Integracije i produkcijska kvaliteta — otvoreni zadaci

- [ ] Potvrditi stvarne WooCommerce košarice i checkout tokove s konkretnim gatewayima, temama i dodatcima.
- [ ] Potvrditi CSP, nonce/hash konfiguraciju, opt-in i opoziv na reprezentativnim produkcijskim/staging web-stranicama.
- [ ] Dodati i dokumentirati integracijske adaptere za konkretne pružatelje prema stvarnim zahtjevima korisnika; svaki s testom opoziva i upravljanjem učitavanjem.
- [ ] Proširiti browser-visible skeniranje uz jasnu granicu: ne vidi HttpOnly, cross-origin i server-side događaje.
- [ ] Provjeriti mobile/desktop raspored, zoom 200–400 %, RTL i ručne čitače ekrana.
- [ ] Dodati stvarne metrike prvog učitavanja (CPU, mreža) na više uređaja; postoje testovi veličine statičnih paketa.
- [ ] Provjeriti sigurnost s neovisnim penetration testom i reviewom dependency/CI supply-chain.
- [ ] Potvrditi stvarno hosting okruženje shared hostinga i sukobe s cache/minifier dodacima.

## C. Infrastruktura, pravne obveze i javna distribucija — ovisi o vanjskom pristupu

- [ ] Postaviti i potvrditi DNS, HTTPS/TLS, hosting, cache pravila, politiku logova i monitoring za `cookie.brendigo.com`.
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

**Status:** glavne funkcije u repozitoriju su isporučene. Vanjski deployment, neovisna certifikacija i sve stvarne integracije nisu označeni dovršenima bez dokaza.
