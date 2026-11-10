# CDN: cookie.brendigo.com

## Što je izgrađeno, a što još treba postaviti

Repozitorij **priprema verzionirani CDN paket** sa skriptom, CSS-om, loaderom i opcionalnim Google adapterom. **Ne postavlja DNS, TLS, web-poslužitelj niti automatski objavljuje na domenu.** Adresa je predviđeno javno odredište i ne smije se predstavljati kao dostupna dok je stvarno ne provjerite.

Izgradnja:

```bash
npm run build:cdn
# Rezultat: dist/cdn/v0.3.0/
```

GitHub workflow **Package installers** izdaje `brendigo-cookieconsent-cdn.zip`. Nakon provjere i odobrenja, prenesite sadržaj mape `v0.3.0/` u dokumentni korijen za `https://cookie.brendigo.com/v0.3.0/`. Ne mijenjajte datoteke objavljene pod postojećim verzijskim URL-ovima.

## Jedan skriptni tag na HTML stranici

```html
<script>
  window.BCC_SITE_CONFIG = {
    language: 'hr',
    position: 'bottom-right',
    accentColor: '#4357e8',
    surfaceColor: '#ffffff',
    textColor: '#17223e',
    policyUrl: '/politika-kolacica',
    revision: '1'
  };
</script>
<script defer src="https://cookie.brendigo.com/v0.3.0/loader.js"></script>
```

Loader automatski učitava CSS i JS s istog *verzioniranog* CDN puta; ne kontaktira analitičke servise. Pohrana privole ostaje na domeni korisničke web-stranice.

**WordPress:** u postavci *Asset delivery* odaberite CDN tek nakon što su CSS i JS na domeni dostupni. Zadani način je lokalni i radi bez CDN-a.

## Nužni infrastrukturni koraci

1. DNS A/AAAA ili CNAME za `cookie.brendigo.com`.
2. Valjana HTTPS/TLS konfiguracija i automatska obnova certifikata.
3. Točan `Content-Type` za JavaScript (`text/javascript`) i CSS (`text/css`).
4. `Cache-Control: public, max-age=31536000, immutable` za nepromjenjive `/v0.3.0/*` datoteke, **ne** za promjenjive alias-e.
5. CSP korisničke stranice mora dopustiti `script-src` i `style-src` s `https://cookie.brendigo.com`; inline konfiguracijska skripta mora zadovoljiti nonce/hash CSP pravila.
6. Provjerite `Referrer-Policy`, politike logiranja, zadržavanje IP adresa, podugovaratelje i transparentnost u politici privatnosti vlasnika stranice.
7. Izradite health check i test iz više regija; ako CDN padne, prva posjeta bez bannera može ostaviti stranicu neusklađenom.
8. Distribuirajte i lokalnu verziju kao preporučeni način za kritične instalacije i strože postavke privatnosti.

**CDN zahtjev prenosi IP adresu posjetitelja mrežnom operatoru koji prima zahtjev.** Izbjegavajte set-cookie, analytics, suvišne logove i dodatne vanjske zahtjeve. Jasno navedite operatora i pravne osnove u obavijestima stranice. Ne koristite Google Analytics na samom CDN-u.

## Google Consent Mode v2 — opcionalni Basic adapter

Ako je potrebna ta integracija, uključite `google-consent-basic.js` **sinkrono** u `<head>` prije Google oznaka i prije CMP-a.

```html
<script src="https://cookie.brendigo.com/v0.3.0/google-consent-basic.js"></script>
<!-- Google skripte i dalje moraju biti BLOKIRANE do potrebne privole -->
<script defer src="https://cookie.brendigo.com/v0.3.0/loader.js"></script>
```

Adapter postavlja vrijednosti na `denied` i sluša CookieConsent događaje. Sam **ne učitava Google skripte**. Vlasnik web-stranice mora ispravno blokirati odgovarajuće Google tagove i provjeriti pozive u Google Tag Assistantu. Ovaj dodatak nije Google Certified CMP, nije IAB TCF implementacija i ne jamči mogućnost personaliziranog oglašavanja.
