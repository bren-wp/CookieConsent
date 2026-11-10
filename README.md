<div align="center">
  <img src="assets/brand/readme-cover.svg" width="100%" alt="CookieConsent by Brendigo — upravljanje privatnošću">
</div>

# CookieConsent by Brendigo

**Vaša privatnost. Vaš izbor.**  
Samostalni sustav za informiranje posjetitelja i upravljanje privolama na HTML/PHP stranicama, WordPressu i projektima koji mogu uključiti JavaScript i CSS.

[![GitHub CI](https://github.com/bren-wp/CookieConsent/actions/workflows/ci.yml/badge.svg)](https://github.com/bren-wp/CookieConsent/actions/workflows/ci.yml)
![Version](https://img.shields.io/badge/version-0.9.0-4357e8)
![License](https://img.shields.io/badge/license-MIT-26387a)
![Runtime](https://img.shields.io/badge/runtime_dependencies-0-brightgreen)
![Brand](https://img.shields.io/badge/by-Brendigo-4357e8)

**[Službena web-stranica](https://cookie.brendigo.com)** · **[Najnovija izdanja](https://github.com/bren-wp/CookieConsent/releases)** · **[Interaktivni konfigurator](demo/configurator.html)** · **[Dokumentacija](docs/README.md)** · **[Razvojni plan](docs/ROADMAP.md)** · **[Brendigo](https://brendigo.com)**

> **Status: v0.9.0 — testno izdanje.** Sustav omogućuje implementaciju upravljanja privolama, ali ne jamči usklađenost pojedine web-stranice i nema status certificiranog CMP-a. Nije automatski blokator svih vanjskih servisa.

## Što dobivate

| Područje | Funkcionalnosti |
|---|---|
| Privola | Nužno, funkcionalno, analitika, marketing; odluke Prihvati sve / Odbij sve / Postavke |
| Granularnost | Pojedinačne usluge s vlastitim identifikatorima; kategorije, svrha, rok i poveznica pružatelja |
| Dizajn | 9 položaja bannera, 3 izgleda, svijetla/tamna/vlastita tema, boje, raspored gumba i položaj modala |
| Lokalizacija | HR, EN, DE, IT, ES, FR i AR uz RTL; tekstovi prilagodljivi po jeziku |
| Pristupačnost | Tipkovnica, kontrola fokusa, semantičke oznake, smanjene animacije, automatizirane A/AA provjere |
| Integracije | Ručno označene skripte/iframeovi, lifecycle API, registracija pružatelja, GPC |
| Povlačenje | Ponovno otvaranje postavki, callbackovi na opoziv, opcionalna pravila brisanja dostupnih first-party kolačića |
| Transparentnost | Lokalna potvrda korisnikova odabira, pregled vidljivih kolačića i browser pohrane |
| Više kartica | Sinkronizacija odabira na istoj domeni bez slanja sadržaja privole |
| WordPress | Administratorske postavke, vizualni pregled, katalog, editor tekstova, JSON backup, ručno blokiranje WP handleova |
| WooCommerce | Zaštita ključnih registriranih skripti košarice i naplate od slučajnog blokiranja |
| Isporuka | Samostalni ZIP, WordPress ZIP, verzionirani CDN ZIP i web-stranica ZIP; bez vanjskih runtime biblioteka |

![Ilustracija izgleda bannera](assets/brand/banner-preview.svg)

*Ilustracija je grafički prikaz proizvoda, a ne dokaz da je određena instalacija testirana. Za interakciju otvorite [lokalni demo](demo/index.html), [konfigurator](demo/configurator.html) ili [demo pojedinačnih usluga](demo/services.html).*

## Brza instalacija — HTML ili PHP

Prenesite datoteke iz `packages/core/` na vlastiti hosting i dodajte:

~~~html
<link rel="stylesheet" href="/assets/brendigo-cookieconsent.css">
<script>
  window.BCC_SITE_CONFIG = {
    language: "hr",
    position: "bottom-right",
    bannerStyle: "compact",
    theme: "custom",
    accentColor: "#4357e8",
    surfaceColor: "#ffffff",
    textColor: "#17223e",
    policyUrl: "/politika-kolacica",
    revision: "1"
  };
</script>
<script defer src="/assets/brendigo-cookieconsent.js"></script>
~~~

Neobvezne vanjske skripte označite prije učitavanja:

~~~html
<script type="text/plain"
        data-bcc-category="analytics"
        data-bcc-src="/assets/analytics.js"></script>

<button type="button" data-bcc-open>Postavke kolačića</button>
~~~

Skripte koje web-stranica sama izvrši, neoznačene iframeove, piksele i server-side događaje sustav **ne može univerzalno zaustaviti**. Detalji: [Instalacija](docs/INSTALL.hr.md) i [Integracije](docs/INTEGRATIONS.hr.md).

## Službena web-stranica

Dvojezična, responzivna stranica projekta nalazi se u [website/](website/) i distribuira se i kao `cookieconsent-brendigo-website.zip`. Paket sadrži lokalne demonstracije, JS/CSS jezgru i verzionirane CDN datoteke. Predviđena javna adresa je [cookie.brendigo.com](https://cookie.brendigo.com), no domena **nije potvrđena kao postavljena niti se sama aktivira iz GitHuba**. Autor je [Brendigo](https://brendigo.com).

## WordPress

1. Preuzmite `brendigo-cookieconsent-wordpress.zip` iz [GitHub Releases](https://github.com/bren-wp/CookieConsent/releases).
2. Otvorite **Dodaci → Dodaj novi → Prenesi dodatak** i aktivirajte dodatak.
3. Otvorite **Postavke → CookieConsent**. Podesite izgled, jezik, politiku kolačića, reviziju privole, usluge i opcionalne integracije.
4. Koristite ugrađeni vizualni pregled, editor tekstova po jeziku i JSON izvoz/uvoz konfiguracije.
5. Provjerite sve stvarne skripte i zahtjeve pri prvoj posjeti, prihvaćanju, odbijanju i povlačenju privole.

**Službeni metapodaci:** Plugin URI [cookie.brendigo.com](https://cookie.brendigo.com), autor **Brendigo**, Author URI [brendigo.com](https://brendigo.com), `Contributors: brendigo`. **Važno:** WordPress.org direktorij ima posebna pravila o obveznom prikazu zasluga i vanjskom učitavanju koda. Trenutačna brendirana ZIP distribucija nije proglašena odobrenom za WordPress.org direktorij.

**Preduvjeti:** WordPress 6.2+ i PHP 7.4+. Izolirani CI testovi nisu zamjena za testiranje konkretnog hostinga. [Potpune WordPress upute](docs/WORDPRESS.hr.md).

## Vlastiti CDN — cookie.brendigo.com

Projekt priprema verzionirani paket za predviđenu adresu:

~~~html
<script>
  window.BCC_SITE_CONFIG = {
    language: "hr",
    policyUrl: "/politika-kolacica",
    revision: "1"
  };
</script>
<script defer src="https://cookie.brendigo.com/v0.9.0/loader.js"></script>
~~~

**Ta adresa nije automatski aktivirana objavom GitHub paketa.** Prije primjene moraju biti postavljeni DNS, HTTPS/TLS i stvarno posluživanje datoteka. Zadana WordPress opcija ostaje lokalno učitavanje. [CDN vodič](docs/CDN.hr.md).

## Kontrola pojedinačnih usluga

~~~javascript
window.BCC_SITE_CONFIG = {
  language: "hr",
  revision: "2026-11",
  services: [{
    id: "site-statistics",
    category: "analytics",
    toggleable: true,
    name: "Statistika web-stranice",
    purpose: "Mjerenje posjećenosti.",
    cookies: "_site_stats",
    duration: "90 dana",
    privacyUrl: "/politika-privatnosti"
  }]
};
~~~

Ovo je opis i kontrola usluge **samo ako je ta usluga uistinu povezana sa sustavom blokiranja**. Katalog sam ne presreće svaki zahtjev.

## JavaScript API

~~~javascript
const cc = window.BrendigoCookieConsent;
cc.getConsent();                  // null ili kategorije
cc.getServiceConsent();           // detaljan odabir usluga
cc.hasConsent("analytics");       // status kategorije
cc.hasServiceConsent("site-statistics");
cc.openPreferences();              // ponovno otvaranje
cc.getConsentReceipt();            // lokalni prikaz korisnikove odluke
cc.downloadConsentReceipt();       // JSON kopija za korisnika
cc.auditLocal();                   // lokalni, ograničeni browser audit
cc.refresh();                      // obrada novo dodanih označenih resursa
cc.reset();                        // poništavanje spremljenog izbora
~~~

[Događaji, povratne funkcije, detaljan API i primjeri](docs/API.hr.md).

## Lokalni razvoj i provjere

~~~bash
npm run check
npm test
npm run build:cdn
python3 tools/package.py
python3 tools/package.py --verify

# Pregled demonstracije
python3 -m http.server 8000
# Otvoriti http://localhost:8000/demo/configurator.html
~~~

Browser E2E koristi Playwright i axe-core **samo kao razvojne/testne alate**. Testna matrica obuhvaća Chromium, Firefox i WebKit, dok PHP kompatibilnost prolazi izolirane provjere za PHP 7.4 i 8.1–8.4. Detalji: [Razvoj i testiranje](docs/DEVELOPMENT.md), [Kompatibilnost](docs/COMPATIBILITY.md).

## Dokumentacija

| Tema | Dokument |
|---|---|
| Početak i kompletna instalacija | [INSTALL.hr.md](docs/INSTALL.hr.md) |
| Sve konfiguracijske opcije | [CONFIGURATION.hr.md](docs/CONFIGURATION.hr.md) |
| JavaScript API i događaji | [API.hr.md](docs/API.hr.md) |
| WordPress administrator i backup | [WORDPRESS.hr.md](docs/WORDPRESS.hr.md) |
| CDN, verzioniranje i hosting | [CDN.hr.md](docs/CDN.hr.md) |
| Integracije i blokiranje | [INTEGRATIONS.hr.md](docs/INTEGRATIONS.hr.md) |
| Lokalna potvrda privole | [CONSENT-RECEIPT.hr.md](docs/CONSENT-RECEIPT.hr.md) |
| Sigurnost i privatnost | [SECURITY.md](docs/SECURITY.md) |
| Pristupačnost | [ACCESSIBILITY.hr.md](docs/ACCESSIBILITY.hr.md) |
| Zakonski kontrolni popis | [COMPLIANCE.hr.md](docs/COMPLIANCE.hr.md) |
| Produkcijski prihvatni test | [GO-LIVE.hr.md](docs/GO-LIVE.hr.md) |
| Otklanjanje problema | [TROUBLESHOOTING.hr.md](docs/TROUBLESHOOTING.hr.md) |
| Plan razvoja i promjene | [ROADMAP.md](docs/ROADMAP.md) · [CHANGELOG.md](docs/CHANGELOG.md) |

Cjelokupan sadržaj: [docs/README.md](docs/README.md).

## Produkcijska odgovornost

Za svaku web-stranicu treba utvrditi sve pružatelje, pravne osnove, svrhe, kolačiće, vrijeme čuvanja, međunarodne prijenose, načine povlačenja i eventualne obveze evidencije privole. Projekt ne provodi potpun skener, ne briše cookies drugih domena i ne garantira zakonsku sukladnost samom instalacijom. Google Consent Mode v2 Basic adapter je opcionalan i zahtijeva pravilno blokiranje oznaka.

U službenoj distribuciji stalno se prikazuje **by Brendigo** i ne postoji postavka za njegovo isključivanje. MIT licencija ipak dopušta izmjenu izvornog koda i CSS-a; apsolutnu tehničku neuklonjivost nije moguće jamčiti.

---

**CookieConsent by Brendigo** · © 2026 **[Brendigo](https://brendigo.com)** · [MIT licencija](LICENSE) · [GitHub projekt](https://github.com/bren-wp/CookieConsent)
