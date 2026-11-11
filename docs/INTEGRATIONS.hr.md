# Integracije i blokiranje — CookieConsent by Brendigo

## Pravilo prije aktiviranja

Svi neobvezni skriptni elementi moraju biti inertni prije prve pozitivne odluke. Standardni `<script src="...">` se izvršava neovisno o banneru ako ga web-stranica sama učita. Nije dovoljno samo prikazati izbor.

## Vanjski JavaScript

~~~html
<script type="text/plain"
        data-bcc-category="analytics"
        data-bcc-service="site-statistics"
        data-bcc-src="/js/site-statistics.js"></script>
~~~

Kategorija mora biti poznata. Ako je dodan `data-bcc-service`, ta usluga mora postojati i biti odobrena. `data-bcc-src` dopušta samo HTTP(S) URL-ove. Izvorni JS može se izvršiti nakon aktivacije: oprez pri opozivu!

## Inline JavaScript

~~~html
<script type="text/plain" data-bcc-category="marketing">
  // Kod se aktivira tek nakon pozitivne odluke za marketing.
</script>
~~~

Kod ne smije biti aktiviran prije privole kroz drugu skriptu, tag manager, inline event handler ili serversku integraciju.

## Iframe i video

~~~html
<iframe title="Vanjski sadržaj"
        data-bcc-category="marketing"
        data-bcc-src="https://example.org/embed/video"></iframe>
~~~

Po povlačenju privole sustav uklanja `src` označenog iframea. Ne može automatski ukloniti postojeći sadržaj lokalne pohrane drugih domena.

## Dinamički dodani elementi

Nakon što tema/aplikacija ubaci nove inertne skripte ili iframeove, pozovite:

~~~javascript
BrendigoCookieConsent.refresh();
~~~

`refresh()` ne radi kompletnu mrežnu inspekciju; samo obrađuje označene DOM resurse.

## Lifecycle pružatelja

~~~javascript
const stop = BrendigoCookieConsent.registerProvider({
  id: "analytics-adapter",
  category: "analytics",
  serviceId: "site-statistics",
  onGrant() {
    // Učitati uslugu ili omogućiti slanje tek nakon ovlasti.
  },
  onRevoke() {
    // Zaustaviti slanje; provesti cleanup koji pružatelj podržava.
  }
});
~~~

Funkcije moraju biti idempotentne i ne smiju nesvjesno učitavati tuđe servise prije dopuštenja. Ponovno učitavanje stranice često je najsigurniji način za reset već izvršenog kompleksnog providera, ali servis i dalje mora poštovati prethodno spremljen odbijeni izbor.

## Google Consent Mode v2 Basic

Priloženi adapter postavlja početno stanje na `denied` i ažurira signale nakon izbora. **Basic** integracija podrazumijeva da Google oznake ostanu blokirane do potrebne privole. Sam adapter ne blokira sve Google skripte, nije certificirani CMP i nema IAB TCF mehanizam.

## WordPress i WooCommerce

WordPress može inertno označiti odabrane registrirane `script handles`. Nije automatski obuhvaćen sav inline kod iz tema ili dodataka. WooCommerce adapter štiti osnovne handleove košarice i naplate; analitika, oglašavanje i pojedini naplatni widgeti zahtijevaju zasebnu analizu.

## Sigurnost

Nemojte uključivati neprovjerene vanjske URL-ove, proizvoljne third-party skripte ili nesanitiziran HTML u konfiguraciju. Uz strogi CSP provjerite sigurnosne atribute `nonce`, `integrity`, `crossorigin`, `referrerpolicy` te dopuštene odredišne domene.

[API](API.hr.md) · [Konfiguracija](CONFIGURATION.hr.md) · [WooCommerce](WOOCOMMERCE.hr.md).

## YouTube i Vimeo — kontrolirani video adapter

Novi lokalni `video-embeds.js` podržava **YouTube (privacy-enhanced `youtube-nocookie.com`)** i **Vimeo (`dnt=1`)**. Ne učitava nijedan vanjski video prije privole; dopušteni su samo valjani video ID-ovi i unaprijed definirane HTTPS domene. Iframe se uklanja pri opozivu kategorije ili pojedinačne usluge.

```html
<div data-bcc-video="youtube" data-bcc-video-id="dQw4w9WgXcQ"
     data-bcc-category="marketing" data-bcc-video-title="Primjer videa">
  Video je dostupan nakon odobravanja marketing kategorije.
  <button type="button" data-bcc-open>Postavke kolačića</button>
</div>
<script defer src="/js/brendigo-cookieconsent.js"></script>
<script defer src="/js/video-embeds.js"></script>
```

Prilagodite kategoriju stvarnoj svrsi i ponašanju pružatelja; `preferences` je također podržana za opravdan funkcionalni slučaj. Za granularno uključivanje dodajte `data-bcc-service="video-provider-id"` i prijavite uslugu s `toggleable: true` u konfiguraciji jezgre. Pri dinamičkom dodavanju pozovite `BrendigoVideoEmbeds.refresh()`. Oznaka `data-bcc-video-id` nije proizvoljni URL.

**Ograničenje:** `youtube-nocookie.com` i `dnt=1` ne dokazuju potpunu odsutnost identifikatora nakon odobrenja i interakcije s playerom. Već poslani zahtjevi ne mogu se povući. Provjerite politike pružatelja, pravnu osnovu i stvarno ponašanje u Network tabu.
