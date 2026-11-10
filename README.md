<div align="center"><img src="assets/brand/readme-cover.svg" alt="CookieConsent by Brendigo — Your privacy. Your choice." width="100%"></div>

# 🍪 CookieConsent by Brendigo

**Your privacy. Your choice.** · **Vaša privatnost, vaš izbor.**

> Univerzalni sustav za upravljanje kolačićima i privolama za obične web-stranice, PHP i WordPress. Bez obveznog CDN-a, vanjskog računa ili pretplate.

[![CI](https://github.com/bren-wp/CookieConsent/actions/workflows/ci.yml/badge.svg)](https://github.com/bren-wp/CookieConsent/actions/workflows/ci.yml)
![Version](https://img.shields.io/badge/version-0.7.0-4357e8)
![License](https://img.shields.io/badge/license-MIT-green)
![Runtime](https://img.shields.io/badge/runtime%20dependencies-0-brightgreen)
![Author](https://img.shields.io/badge/by-Brendigo-26387a)

**Projekt:** [GitHub](https://github.com/bren-wp/CookieConsent) · **Autor:** [Brendigo](https://brendigo.com) · **Licencija:** [MIT](LICENSE)

## ✨ Zašto CookieConsent?

| | Mogućnost |
|---|---|
| 🛡️ | **Privatnost:** neobvezne kategorije isključene su dok korisnik ne odabere privolu |
| ✅ | **Jasne odluke:** Prihvati sve, Odbij sve i Postavke na prvom sloju |
| 🎛️ | **Četiri kategorije:** nužni, funkcionalni, analitički i marketinški kolačići |
| 🌍 | **HR, EN, DE, IT:** automatski jezik, prilagodljivi tekstovi |
| 🧩 | **WordPress:** lokalni dodatak s postavkama i blokiranjem odabranih registriranih skripti |
| 🔌 | **Više platformi:** HTML, PHP, WordPress i ostali CMS-ovi s vlastitim JS/CSS |
| 🧠 | **GPC:** konzervativno onemogućava marketinšku kategoriju uz Global Privacy Control |
| ♿ | **Pristupačnost:** tipkovnica, fokus, oznake dijaloga, mobilni raspored |
| 🎨 | **Brending:** devet pozicija, boje gumba, pozadine i teksta, stalni potpis by Brendigo |
| 🔁 | **Stalni pristup:** automatski gumb za ponovno otvaranje postavki nakon izbora |
| 🌐 | **CDN ili lokalno:** verzionirani paket za `cookie.brendigo.com` |
| 📈 | **Google Basic adapter:** opcionalan Consent Mode v2 adapter uz ručno blokiranje Google tagova |
| 🔄 | **Integracijski lifecycle:** `onGrant` i `onRevoke` za servise i povlačenje privole |
| 🖌️ | **Vizualni konfigurator:** devet pozicija, tri stila, boje i jezici |
| 📋 | **Katalog pružatelja:** detalji servisa, svrha, kolačića, rokova i politika privatnosti |
| 🔎 | **Lokalna dijagnostika:** popis dostupnih kolačića, browser storage ključeva i oznaka resursa, bez slanja podataka |
| 📤 | **WP JSON backup:** administratorski izvoz i sanitizirani uvoz postavki |

## 🖼️ Izgled

![Ilustrativni prikaz cookie bannera](assets/brand/banner-preview.svg)

*Ilustracija dizajna. Funkcionalni prikaz: [demo/index.html](demo/index.html). Za isprobavanje svih devet položaja, boja i četiri jezika koristite [vizualni konfigurator](demo/configurator.html).*

## 🚀 Brza instalacija — HTML, PHP i drugi CMS-ovi

Prenesite datoteke iz [packages/core](packages/core) na vlastiti hosting, primjerice u `/assets/`.

```html
<link rel="stylesheet" href="/assets/brendigo-cookieconsent.css">
<script>
  window.BCC_SITE_CONFIG = {
    language: "hr",
    policyUrl: "/politika-kolacica",
    revision: "1",
    position: "bottom-right",
    bannerStyle: "compact",
    accentColor: "#4357e8",
    surfaceColor: "#ffffff",
    textColor: "#17223e"
  };
</script>
<script defer src="/assets/brendigo-cookieconsent.js"></script>
```

Označite *opcionalne* skripte kako se ne bi pokretale prije privole:

```html
<script type="text/plain" data-bcc-category="analytics"
        data-bcc-src="/assets/my-analytics.js"></script>
<button type="button" data-bcc-open>Postavke kolačića</button>
```

**Važno:** alat blokira samo izričito označene skripte i iframeove; ostale skripte i pixeli koje stranica sama pokreće nisu automatski blokirani. Neophodna je inventura svih servisa i testiranje Network panela preglednika.

📖 [Upute za integraciju](docs/INSTALL.hr.md).

## 🧩 WordPress dodatak

Izvorni dodatak je u [wordpress/brendigo-cookieconsent](wordpress/brendigo-cookieconsent).

1. Pakirajte cijelu mapu `brendigo-cookieconsent` u ZIP s tom mapom u korijenu.
2. U WordPressu otvorite **Dodaci → Dodaj novi → Prenesi dodatak**, instalirajte ZIP i aktivirajte ga.
3. Pod **Postavke → CookieConsent** odaberite **9 pozicija**, boje gumba/pozadine/teksta, jezik, politiku kolačića, trajanje i reviziju privole. Potpis **by Brendigo** nije moguće isključiti u postavkama. Dodajte katalog usluga i po potrebi uključite Google Basic adapter.
4. Po potrebi klasificirajte **registrirane WordPress script handles**, primjerice:

```text
analytics:my-analytics
marketing:my-ad-script
```

**Zahtjevi:** WordPress 6.2+ i PHP 7.4+. Filtar za skriptne nazive ne blokira automatski inline skripte, piksele i vanjske ugradnje drugih dodataka.

Automatski ZIP paketi dostupni su u **Actions → Package installers → Artifacts**. Kada kompletan CI prođe, zaseban workflow objavljuje *prerelease* pod [GitHub Releases](https://github.com/bren-wp/CookieConsent/releases), ako verzija još nije objavljena.

## 🌐 CDN — cookie.brendigo.com

Pripremljena je verzionirana distribucija za CDN. **DNS, TLS i javno posluživanje nisu automatski postavljeni; URL nije potvrđen kao dostupan.** Nakon stvarnog postavljanja CDN datoteka:

```html
<script>
  window.BCC_SITE_CONFIG = {
    language: 'hr', position: 'bottom-right',
    bannerStyle: 'compact',
    accentColor: '#4357e8',
    surfaceColor: '#ffffff', textColor: '#17223e',
    policyUrl: '/politika-kolacica', revision: '1'
  };
</script>
<script defer src="https://cookie.brendigo.com/v0.7.0/loader.js"></script>
```

U paketu je opt-in `google-consent-basic.js` adapter za Google Consent Mode v2. Ne uključuje Google tagove i ne zamjenjuje ispravno blokiranje oznaka prije privole. Detalji: [CDN vodič](docs/CDN.hr.md).

## 📋 Katalog usluga

Svaka integracija može biti prikazana u detaljnim postavkama (bez automatskog autoriziranja njezinih skripti):

```javascript
window.BCC_SITE_CONFIG = {
  language: "hr",
  services: [{
    category: "analytics",
    name: "Primjer analitike",
    purpose: "Anonimizirana statistika korištenja",
    cookies: "_example",
    duration: "13 mjeseci",
    privacyUrl: "https://example.org/privacy"
  }]
};
```

WordPress postavke sadrže katalog u formatu **kategorija|naziv|svrha|kolačići|trajanje|URL** (jedan servis po retku). Podaci su isključivo informativni: skripte se moraju zasebno klasificirati i blokirati.

## 🔄 Lifecycle integracija

```javascript
const unregister = BrendigoCookieConsent.registerProvider({
  id: "my-analytics",
  category: "analytics",
  onGrant: () => { /* učitaj vlastiti dopušteni adapter */ },
  onRevoke: () => { /* zaustavi slanje i očisti kolačiće u vlastitoj domeni */ }
});
// unregister() pri uklanjanju integracije
```

Pozivi se izvršavaju kada se stanje kategorije promijeni. **Povlačenje ne briše automatski kolačiće drugih domena i ne može poništiti ranije izvršene skripte.** Vlasnik stranice mora osigurati odgovarajući cleanup i zaustavljanje vanjskog servisa.

## 🧰 JavaScript API

```javascript
const cc = window.BrendigoCookieConsent;
cc.getConsent();              // null ili objekt kategorija
cc.hasConsent("analytics");    // true / false
cc.openPreferences();          // otvara postavke
cc.reset();                    // briše odabir
cc.refresh();                  // procesira novo dodane označene elemente
cc.auditLocal();               // lokalni pregled vidljivih kolačića/resursa (ne šalje podatke)

window.addEventListener("brendigo:consentchange", (event) => {
  console.log(event.detail.consent);
});
```

Revokacija sprečava novo aktiviranje označenih skripti, ali **ne može poništiti već izvršen JavaScript niti automatski obrisati kolačiće trećih strana**. Integrirajte čišćenje i ponovno učitavanje za svaki servis zasebno.

## 🔐 WordPress sigurnosna kopija konfiguracije

U **Postavke → CookieConsent** nalazi se **Export JSON configuration** za pohranu konfiguracije i **Import and replace settings** za vraćanje prethodno izvezenih podataka. Import zahtijeva administratorsku ovlast i nonce, provjerava shemu, veličinu i sanitizira sva polja.

## 🐘 Kompatibilnost PHP/WordPress

CI obuhvaća PHP **7.4, 8.1, 8.2, 8.3 i 8.4** te izolirane testove validacije WordPress postavki i WooCommerce adaptera. To **nije** potpuni funkcionalni test na instaliranom WordPress sustavu ili zajedničkom hostingu. [WooCommerce upute](docs/WOOCOMMERCE.hr.md).

## 🧪 Browser testovi

`npm test` pokreće lokalne unit/integration testove bez dodatnih ovisnosti. Odvojeni GitHub CI posao instalira Playwright i Chromium, Firefox i WebKit **isključivo za testove** te provjerava prvu posjetu, odbijanje, prihvaćanje, ponovno otvaranje i povlačenje privole, označene iframeove, stilove, tipkovnicu i automatizirane WCAG 2.0/2.1 A/AA provjere kroz axe-core.

```bash
npm install --no-save --no-package-lock playwright@1.56.1 axe-core@4.10.3
npx playwright install --with-deps chromium
npm run test:browser
```

CDN i lokalni paketi i dalje nemaju vanjskih runtime biblioteka. Za izradu provjerljivih ZIP paketa koristite `python3 tools/package.py`; dokumentacija: [Distribucija](docs/RELEASE.md).

## 📁 Struktura

```text
CookieConsent/
├── demo/configurator.html     # Vizualni konfigurator bannera
├── packages/core/             # Samostalni JS i CSS
├── packages/integrations/     # Opcionalni Google Basic adapter
├── cdn/                       # Loader za cookie.brendigo.com
├── tools/build-cdn.mjs        # Verzionirani CDN paket
├── wordpress/
│   └── brendigo-cookieconsent/ # WordPress plugin s lokalnim datotekama
├── demo/index.html            # Interaktivni lokalni demo
├── assets/brand/              # Autorski SVG vizuali
├── docs/                      # Integracija i pravni okvir
├── tests/                     # Jedinični testovi bez ovisnosti
└── .github/workflows/         # CI i ZIP paketiranje
```

## 🧪 Razvoj

```bash
npm test
npm run check
php -l wordpress/brendigo-cookieconsent/brendigo-cookieconsent.php
python3 -m http.server 8000
# Otvorite http://localhost:8000/demo/
```

## 🧭 Podržane platforme i regulatorne granice

Pogledajte [matricu kompatibilnosti](docs/COMPATIBILITY.md), [regulatornu matricu](docs/REGULATORY-MATRIX.hr.md) i [kontrolni popis za produkciju](docs/GO-LIVE.hr.md). Zahtjevi se razlikuju prema usluzi i jurisdikciji; globalno primjenjujemo konzervativni opt-in i ne zaključujemo automatski lokaciju posjetitelja.

## ⚖️ Zakonska usklađenost i ograničenja

**v0.7.0 je funkcionalno testno izdanje, nije certificirani CMP niti jamstvo usklađenosti s GDPR-om, ePrivacy pravilima, UK PECR-om, LGPD-om ili američkim zakonima.** Za svaku web-stranicu potrebno je provjeriti stvarne servise, podatke, kategorije, trajanje kolačića, dokaze privole i pravo na povlačenje.

Trenutačno **nisu implementirani** automatski skener, server-side evidencija privole, IAB TCF, Google-certified CMP status, automatsko blokiranje Google oznaka, GeoIP ni potpuni US privacy opt-out proces. Postoji **opcionalni Google Consent Mode v2 Basic adapter** koji zahtijeva zasebnu integraciju i testiranje.

[Pravna kontrolna lista](docs/COMPLIANCE.hr.md) · [Sigurnost i ograničenja](docs/SECURITY.md) · [Plan razvoja](docs/ROADMAP.md)

## 💙 Built by Brendigo

Neovisna implementacija pod identitetom **CookieConsent by Brendigo**. Naziv CookieConsent koriste i drugi open-source projekti; naš projekt ne preuzima njihov identitet ni njihov izvorni kod.

🌐 [brendigo.com](https://brendigo.com) · 💻 [GitHub](https://github.com/bren-wp/CookieConsent) · 📄 [MIT](LICENSE)

**© 2026 Brendigo.** Potpis je obvezan u službenoj distribuciji. Budući da se kod distribuira pod MIT licencijom, administrator s pristupom izvornom kodu i CSS-u može ga tehnički izmijeniti; vidljivost se ne može kriptografski jamčiti.

## Usporedba funkcionalnosti i napredni playground

[Usporedba s Orestbida CookieConsent](docs/COMPARE-ORESTBIDA.hr.md) i [interaktivni Brendigo konfigurator](demo/configurator.html) daju pregled dostupnih značajki bez kopiranja izvornog koda drugog projekta. Konfigurator može izvesti JSON, ali taj format nije automatski WordPress import format.
