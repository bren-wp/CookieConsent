# Matrica provjera — CookieConsent by Brendigo

**Izdanje:** v0.11.4 — sigurnosna i integracijska zakrpa · [ROADMAP](ROADMAP.md) · [Sigurnost](SECURITY-AUDIT.hr.md)

Zeleni GitHub CI znači da su prošli **konkretni automatizirani scenariji**. Ne znači da je svaki CMS dodatak funkcionalno validiran u stvarnoj trgovini.

| Sustav | Izvorne datoteke i ZIP | Statičke provjere | Izolirani runtime test | Stvarna instalacija |
|---|---|---|---|---|
| Vanilla JS/CSS | Da | Node, lint, size budget | Chromium, Firefox, WebKit E2E | Po web-stranici |
| WordPress | Da | PHP 7.4/8.1–8.4, Plugin Check kandidat | Da, WP 6.2/latest + MySQL + WooCommerce smoke | Posebna produkcijska tema nije provjerena |
| Joomla 5 | Da | PHP, XML, lokalni asseti | PHP API stub: event → asseti | **Nije potvrđena** |
| Drupal 10/11 | Da | PHP, YAML, lokalni asseti | PHP API stub: public/admin attachment | **Nije potvrđena** |
| Shopify | Theme App Extension izvor | Liquid schema, JS, lokalni asseti | Simulirani Customer Privacy API: odabir / GPC / late init | **Nije potvrđena; treba Shopify app** |
| Magento 2.4 | Da | PHP, XML, composer.json, asseti | PHP API stub: store-scope JSON i sanitizacija | **Nije potvrđena** |
| OpenCart 4 | Da | PHP, JSON, arhiva, asseti | PHP API stub: zaglavlje i korijenske URL putanje | **Nije potvrđena** |
| PrestaShop 8/9 | Da | PHP, XML, lokalni asseti | PHP API stub: hooks, konfiguracija i HTML/JSON | **Nije potvrđena** |
| Web / CDN | Pripremljen ZIP | Sadržaj, hash i manifest | Lokalni web demo i browser E2E | **Nema potvrđenog DNS/TLS deploya** |

## Obveze prije produkcije

1. Instalirati točno odgovarajući ZIP na staging platformu s konkretnom verzijom, temom, cacheom i checkout integracijama.
2. Provjeriti da su opcionalne skripte i drugi zahtjevi blokirani **prije** privole te zaustavljeni nakon opoziva.
3. Provjeriti ugradnju bez JS fatal errora, HTTP 404, CSP pogrešaka, gubitka sessiona i prekida checkouta.
4. Provjeriti pristupačnost i svih sedam jezika; testirati prihvat/odbijanje/reviziju/pojedinačne usluge.
5. Nakon objave CDN-a provjeriti HTTPS, MIME, cache, verzionirane URL-ove i mrežne logove.
6. Obaviti stvaran sigurnosni i pravni pregled ciljne instalacije.

**Nijedan preglednik, CMS ili pravni sustav ne dopušta jamstvo apsolutne bezgrešnosti samo temeljem statičkih provjera.**

**Dodatno za v0.11.4:** Shopify CSP-safe bootstrap, restored/reset consent regresije, CDN redirect + size-limit zaštita i reproducibilni clean-build testovi. Stvarne CMS instalacije nisu potvrđene samo ovim testovima.

**Od v0.11.4:** planirani realni WooCommerce BACS checkout u Playwrightu, CSP nonce regresija, video revocation testovi, ograničeni mrežni inventar i sintetički CPU/transfer profili. Za svako izdanje CI log i instalacijski test treba provjeriti prije označavanja rezultata prolaznim.
