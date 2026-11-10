# CMS i webshop integracije — CookieConsent by Brendigo

**Aktualna verzija izvornog koda:** 0.11.2 · Autor: **Brendigo** · Web: [brendigo.com](https://brendigo.com) · Projekt: [cookie.brendigo.com](https://cookie.brendigo.com)

Projekt nudi **šest zasebnih integracija**, uz postojeće izdanje za WordPress i samostalnu JS/CSS jezgru. Sve uključuju lokalnu kopiju jezgre CookieConsent by Brendigo; njezin naziv, ponašanje i zasluge ostaju usklađeni. Integracije nisu centralni SaaS, ne šalju odluke o privoli Brendigu i nisu univerzalni blokator svih third-party tehnologija.

## Pregled instalacijskih paketa

| Platforma | Verzija / arhitektura | Paket iz izdanja | Upute |
|---|---|---|---|
| Joomla | Joomla 5.x system plugin | `brendigo-cookieconsent-joomla.zip` | [joomla/README.md](../joomla/README.md) |
| Drupal | Drupal 10/11 custom module | `brendigo-cookieconsent-drupal.zip` | [drupal/README.md](../drupal/README.md) |
| Shopify | Theme App Extension | `brendigo-cookieconsent-shopify-extension.zip` (**izvorni kod**) | [shopify/README.md](../shopify/README.md) |
| Magento | Magento 2.4 module | `brendigo-cookieconsent-magento.zip` | [magento/README.md](../magento/README.md) |
| OpenCart | OpenCart 4 native extension | `brendigo.ocmod.zip` | [opencart/README.md](../opencart/README.md) |
| PrestaShop | PrestaShop 8/9 module | `brendigocookieconsent-prestashop.zip` | [prestashop/README.md](../prestashop/README.md) |

Preuzimanje: [GitHub Releases](https://github.com/bren-wp/CookieConsent/releases).

## 1. Joomla 5

Otvorite **System → Install Extensions** i prenesite `brendigo-cookieconsent-joomla.zip`. Omogućite system plugin i postavite jezik, poziciju, URL politike, reviziju i boju. Joomla koristi svoj Dependency Injection provider i event `onBeforeCompileHead`, a CSS/JS se poslužuju lokalno preko WebAssetManagera. Testirajte redoslijed učitavanja i sve druge dodatke na stagingu.

## 2. Drupal 10/11

Otkopirajte direktorij `brendigo_cookieconsent` u `web/modules/custom/`, zatim:

~~~bash
drush en brendigo_cookieconsent -y
drush cr
~~~

Postavke su na `/admin/config/system/brendigo-cookieconsent` i zahtijevaju dopuštenje `administer site configuration`. Modul koristi `hook_page_attachments()`, lokalne Drupal libraries i serijalizirane `drupalSettings` podatke; ne prikazuje banner na administratorskim rutama.

## 3. Shopify

Shopify paket **nije ZIP koji se instalira u trgovinu**. Potrebna je registrirana Shopify aplikacija. U njen direktorij `extensions/` kopirajte `extensions/brendigo-cookieconsent/`, deployajte preko Shopify CLI-ja:

~~~bash
shopify app deploy
~~~

Aktivirajte **Online Store → Themes → Customize → App embeds → Consent banner**, zatim postavite parametre. Liquid App Embed koristi `target: compliance_head` radi rane integracije. Dodatna skripta sinkronizira *isključivo korisnikove nove odluke* sa službenim Shopify Customer Privacy API-jem (v0.2); ne manipulira Shopify kolačićima i ne proglašava privolu bez posjetiteljeve akcije.

**Ograničenje:** Theme App Extension ne prikazuje vlastiti blok u Shopify checkoutu. Za kupnju, Shopify-managed piksele i prava na podatke vrijede pravila i mehanizmi Shopify platforme. Mora se provjeriti rad na razvojnoj trgovini i spriječiti preklapanje dvaju sučelja privole.

## 4. Magento 2.4

Raspakirajte ZIP u korijen Magento instalacije, tako da datoteke završe pod `app/code/Brendigo/CookieConsent/`:

~~~bash
bin/magento module:enable Brendigo_CookieConsent
bin/magento setup:upgrade
bin/magento setup:di:compile
bin/magento setup:static-content:deploy -f
bin/magento cache:flush
~~~

Postavke su u **Stores → Configuration → General → CookieConsent by Brendigo**. Korišteni su native module registration, layout, scope config i server-side JSON sanitizacija. Provjerite CSP i checkout u stvarnoj temi; dodatak ne može automatski zaustaviti ranije izvršene skripte drugih modula.

## 5. OpenCart 4

Prenesite **točno** `brendigo.ocmod.zip` kroz **Extensions → Installer**, instalirajte ga i potom omogućite pod **Extensions → Extensions → Modules**. Naziv ZIP-a je važan: OpenCart ga raspakirava u `extension/brendigo/`, što mora odgovarati namespaceovima kontrolera i event rutama. Modul koristi event `catalog/view/common/header/after`, s putanjama relativnima korijenu trgovine (ne URL-u proizvoda). Konfiguracija se čita iz inertnog JSON bloka, a skripte su lokalne i učitavaju se redoslijedom bootstrap → jezgra. Dodijelite administratorske ovlasti za izmjenu ekstenzije i testirajte prilagođenu temu.

## 6. PrestaShop 8/9

Prenesite `brendigocookieconsent-prestashop.zip` kroz **Modules → Module Manager → Upload a module**. Otvorite konfiguraciju, postavite jezik, poziciju, politiku i reviziju. Modul koristi `displayHeader` za siguran konfiguracijski JSON blok, a `actionFrontControllerSetMedia` za lokalne skripte i CSS.

## Preduvjeti produkcijske upotrebe

1. Prije pristanka **blokirajte sve neobvezne** skripte, piksele, iframeove i prenositelje server-side događaja; sam banner ih ne otkriva niti klasificira.
2. Popišite stvarne pružatelje, svrhe, trajanja, cookies i privacy URLs te ih unesite u katalog/politiku web-stranice.
3. Testirajte prihvaćanje, odbijanje, granularni izbor, ponovno učitavanje, povlačenje i ponašanje u više kartica.
4. Potvrdite pristupačnost, CSP, konfliktnu temu, cache i checkout; posebno kod e-commerce platformi.
5. Primijenite pravnu provjeru prema ciljnoj državi; nema jamstva automatske usklađenosti ni statusa certificiranog CMP-a.

## Stvarni status testiranja

Implementirani su **nativne datoteke i lokalno pakiranje**, a CI provjerava izvorne kopije, JS testove, PHP sintaksu, XML/JSON manifeste, Shopify Liquid schema JSON i reproducibilnost ZIP-ova. **Nisu izvršene stvarne instalacije** šest platformi u ovom repozitoriju; bez njih se ne može tvrditi da su potpuni produkcijski integracijski testovi prošli. Dodatno se izvode **izolirani PHP adapter-smoke testovi** za Joomla, Drupal, Magento, OpenCart i PrestaShop uz simulirane platformske API-je te Node.js testovi za Shopify Customer Privacy most. Ti testovi mogu otkriti pogreške u vlastitom kodu, ali ne dokazuju kompatibilnost s produkcijskom platformom. Pogledajte [matricu provjera](QUALITY-GATES.hr.md).

[Roadmap](ROADMAP.md) · [Kontrolni popis prije objave](GO-LIVE.hr.md) · [Arhitektura](ARCHITECTURE.hr.md) · [Sigurnost](SECURITY.md).
