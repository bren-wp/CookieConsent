# Konfiguracija — CookieConsent by Brendigo

**Izdanje:** 0.8.1 · [Dokumentacijski indeks](README.md) · [API](API.hr.md)

Konfiguracija se postavlja u `window.BCC_SITE_CONFIG` prije učitavanja `brendigo-cookieconsent.js`. Parametri se učitavaju jednom pri inicijalizaciji. U WordPressu dostupni su kroz **Postavke → CookieConsent**, osim tamo gdje je izričito navedeno da je potrebna prilagođena integracija.

## Osnovni primjer

~~~html
<script>
  window.BCC_SITE_CONFIG = {
    language: "hr",
    revision: "2026-11",
    policyUrl: "/politika-kolacica",
    position: "bottom-right",
    bannerStyle: "compact",
    theme: "custom",
    preferencesPosition: "right",
    accentColor: "#4357e8",
    surfaceColor: "#ffffff",
    textColor: "#17223e",
    consentDays: 180
  };
</script>
<script defer src="/assets/brendigo-cookieconsent.js"></script>
~~~

## Prikaz i UX

| Opcija | Zadana vrijednost | Dopušteno |
|---|---|---|
| `language` | `auto` | `auto`, `hr`, `en`, `de`, `it`, `es`, `fr`, `ar` |
| `direction` | `auto` | `auto`, `ltr`, `rtl` |
| `position` | `bottom-center` | `bottom-center`, `bottom-left`, `bottom-right`, `bottom-bar`, `top-center`, `top-left`, `top-right`, `top-bar`, `center` |
| `bannerStyle` | `standard` | `standard`, `compact`, `minimal` |
| `theme` | `custom` | `custom`, `light`, `dark` |
| `preferencesPosition` | `center` | `center`, `left`, `right` |
| `accentColor` | `#4357e8` | šesterocifrena HEX boja |
| `surfaceColor` | `#ffffff` | šesterocifrena HEX boja; koristi se za `custom` temu |
| `textColor` | `#17223e` | šesterocifrena HEX boja; automatski se poboljšava kontrast |
| `flipButtons` | `false` | promjena redoslijeda glavnih odluka |
| `equalWeightButtons` | `true` | vizualna istaknutost prihvaćanja i odbijanja |
| `disableAnimations` | `false` | smanjen broj animacija u prikazu |

Promjena izgleda ne smije sakriti mogućnost odbijanja niti prikriti pristup postavkama. `theme: "dark"` ili `"light"` koriste odgovarajuće površinske boje, pa vrijednosti za `custom` temu neće nužno biti vidljive.

## Politika i pohrana

| Opcija | Zadano | Napomena |
|---|---|---|
| `policyUrl` | `/cookie-policy` | poveznica na vlastitu politiku kolačića; HTTP(S) URL |
| `revision` | `1` | promijenite kada se promijene svrhe ili sadržaj politike koji zahtijeva novu privolu |
| `cookieName` | `bcc_consent` | isključivo slova, brojevi, `-`, `_`, najviše 60 znakova |
| `consentDays` | `180` | iznos pohrane u danima, stvarna vrijednost ograničena na 1–365 |
| `services` | `[]` | opis i granularni odabir usluga |
| `cookieCleanupRules` | `[]` | samo imenovani first-party cookies dostupni JavaScriptu |
| `translations` | nema | objekti teksta prema jeziku; koristi se običan tekst, ne HTML |

Odluka se sprema kao first-party cookie s `Path=/`, `SameSite=Lax` i `Secure` na HTTPS-u. Ista odluka nije server-side potvrda koja se može neovisno ovjeriti.

## Pojedinačna usluga

~~~javascript
services: [{
  id: "local-statistics",
  category: "analytics",
  toggleable: true,
  name: "Statistika",
  purpose: "Analiza korištenja web-stranice.",
  cookies: "_site_stats",
  duration: "90 dana",
  privacyUrl: "/politika-privatnosti"
}]
~~~

Identifikator `id` mora biti jedinstven. Ako pružatelj nema ID, vidljiv je informativno, ali nema vlastiti prekidač. Povezani HTML resurs navodi `data-bcc-service="local-statistics"` uz kategoriju. Bez pravilnog označavanja katalog ništa ne blokira.

## Pravila čišćenja first-party cookiesa

~~~javascript
cookieCleanupRules: [
  {category:"analytics",name:"_gid",path:"/"},
  {category:"marketing",prefix:"_ads_",serviceId:"my-ad-provider",path:"/"}
]
~~~

`name` označava točan naziv, `prefix` doslovni prefiks (nije regularni izraz). Ne postavljajte pravila koja brišu sesiju, prijavu, košaricu ili nužne podatke. Pravila ne mogu obrisati `HttpOnly` kolačiće niti kolačiće drugog origina.

## Prilagodba prijevoda

~~~javascript
translations: {
  hr: {
    heading: "Odaberite privatnost",
    intro: "Analitičke i marketinške usluge pokreću se samo prema vašem izboru.",
    accept: "Prihvati sve",
    reject: "Odbij sve",
    settings: "Prilagodi",
    receipt: "Preuzmi potvrdu odabira"
  }
}
~~~

WordPress nudi vizualni editor naslova, opisa i triju glavnih gumba te odvojeno napredno JSON polje za ostale oznake. Podržano je sedam jezika. Povratni jezici i kontrast automatski se obrađuju u JS/CSS jezgri.

## Callbackovi

| Opcija | Kada se poziva |
|---|---|
| `onChange(consent)` | prilikom lokalne promjene |
| `onFirstConsent(receipt)` | kod prve odluke za aktualnu reviziju |
| `onConsent(receipt)` | kod postojeće odluke pri učitavanju te nakon nove odluke |
| `onDecision(change)` | nakon lokalne odluke; sadrži promijenjene kategorije i usluge |

Callbackovi se ne koriste za automatsku telemetriju; implementator određuje ponašanje. Događaji: [API](API.hr.md).

## Sigurnosna pravila

Ne interpolirajte neprovjerene URL-ove u `data-bcc-src`. Za vanjske resurse prihvaćaju se HTTP(S) URL-ovi, ali to samo po sebi ne potvrđuje da je odredišni server siguran. Ako imate CSP, uskladite `script-src`, `style-src`, nonce/hash i `frame-src` s konkretnom konfiguracijom. [Integracije](INTEGRATIONS.hr.md).
