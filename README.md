<div align="center"><img src="assets/brand/readme-cover.svg" alt="CookieConsent by Brendigo — Your privacy. Your choice." width="100%"></div>

# 🍪 CookieConsent by Brendigo

**Your privacy. Your choice.** · **Vaša privatnost, vaš izbor.**

> Univerzalni sustav za upravljanje kolačićima i privolama za obične web-stranice, PHP i WordPress. Bez obveznog CDN-a, vanjskog računa ili pretplate.

[![CI](https://github.com/bren-wp/CookieConsent/actions/workflows/ci.yml/badge.svg)](https://github.com/bren-wp/CookieConsent/actions/workflows/ci.yml)
![Version](https://img.shields.io/badge/version-0.1.0-4357e8)
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
| 🌍 | **HR + EN:** automatski jezik, prilagodljivi tekstovi |
| 🧩 | **WordPress:** lokalni dodatak s postavkama i blokiranjem odabranih registriranih skripti |
| 🔌 | **Više platformi:** HTML, PHP, WordPress i ostali CMS-ovi s vlastitim JS/CSS |
| 🧠 | **GPC:** konzervativno onemogućava marketinšku kategoriju uz Global Privacy Control |
| ♿ | **Pristupačnost:** tipkovnica, fokus, oznake dijaloga, mobilni raspored |
| 🎨 | **Brending:** boja, politika kolačića, opcionalni potpis by Brendigo |

## 🖼️ Izgled

![Ilustrativni prikaz cookie bannera](assets/brand/banner-preview.svg)

*Ilustracija dizajna. Funkcionalni interaktivni prikaz: [demo/index.html](demo/index.html).*

## 🚀 Brza instalacija — HTML, PHP i drugi CMS-ovi

Prenesite datoteke iz [packages/core](packages/core) na vlastiti hosting, primjerice u `/assets/`.

```html
<link rel="stylesheet" href="/assets/brendigo-cookieconsent.css">
<script>
  window.BCC_SITE_CONFIG = {
    language: "hr",
    policyUrl: "/politika-kolacica",
    revision: "1",
    showBranding: true
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
3. Pod **Postavke → CookieConsent** prilagodite jezik, boju, pravila kolačića, trajanje i reviziju privole.
4. Po potrebi klasificirajte **registrirane WordPress script handles**, primjerice:

```text
analytics:my-analytics
marketing:my-ad-script
```

**Zahtjevi:** WordPress 6.2+ i PHP 7.4+. Filtar za skriptne nazive ne blokira automatski inline skripte, piksele i vanjske ugradnje drugih dodataka.

Automatski ZIP paketi dostupni su u **Actions → Package installers → Artifacts**, nakon uspješne izrade.

## 🧰 JavaScript API

```javascript
const cc = window.BrendigoCookieConsent;
cc.getConsent();              // null ili objekt kategorija
cc.hasConsent("analytics");    // true / false
cc.openPreferences();          // otvara postavke
cc.reset();                    // briše odabir
cc.refresh();                  // procesira novo dodane označene elemente

window.addEventListener("brendigo:consentchange", (event) => {
  console.log(event.detail.consent);
});
```

Revokacija sprečava novo aktiviranje označenih skripti, ali **ne može poništiti već izvršen JavaScript niti automatski obrisati kolačiće trećih strana**. Integrirajte čišćenje i ponovno učitavanje za svaki servis zasebno.

## 📁 Struktura

```text
CookieConsent/
├── packages/core/             # Samostalni JS i CSS
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

## ⚖️ Zakonska usklađenost i ograničenja

**v0.1.0 je prva razvojna verzija, nije certificirani CMP niti jamstvo usklađenosti s GDPR-om, ePrivacy pravilima, UK PECR-om, LGPD-om ili američkim zakonima.** Za svaku web-stranicu potrebno je provjeriti stvarne servise, podatke, kategorije, trajanje kolačića, dokaze privole i pravo na povlačenje.

Trenutačno **nisu implementirani** automatski skener, server-side evidencija privole, IAB TCF, Google-certified CMP status, Google Consent Mode v2, GeoIP ni potpuni US privacy opt-out proces.

[Pravna kontrolna lista](docs/COMPLIANCE.hr.md) · [Sigurnost i ograničenja](docs/SECURITY.md) · [Plan razvoja](docs/ROADMAP.md)

## 💙 Built by Brendigo

Neovisna implementacija pod identitetom **CookieConsent by Brendigo**. Naziv CookieConsent koriste i drugi open-source projekti; naš projekt ne preuzima njihov identitet ni njihov izvorni kod.

🌐 [brendigo.com](https://brendigo.com) · 💻 [GitHub](https://github.com/bren-wp/CookieConsent) · 📄 [MIT](LICENSE)

**© 2026 Brendigo.**
