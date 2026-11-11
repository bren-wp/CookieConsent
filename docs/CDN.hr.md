# CDN distribucija — cookie.brendigo.com

**Izdanje: 0.11.5.** Repozitorij generira verzionirani CDN paket, ali **ne postavlja DNS, TLS ili produkcijsko posluživanje**. Prije upotrebe URL mora biti provjeren s stvarnim HTTPS zahtjevom.

## Izrada

~~~bash
npm run build:cdn
# dist/cdn/v0.11.5/
python3 tools/package.py
python3 tools/package.py --verify
~~~

Sadržaj verzioniranog direktorija: `loader.js`, `brendigo-cookieconsent.js`, `brendigo-cookieconsent.css`, opcionalni `google-consent-basic.js`, `manifest.json` i licenca.

## Ugradnja

~~~html
<script>
  window.BCC_SITE_CONFIG = {
    language: "hr",
    revision: "2026-11",
    policyUrl: "/politika-kolacica",
    position: "bottom-right",
    theme: "custom"
  };
</script>
<script defer src="https://cookie.brendigo.com/v0.11.5/loader.js"></script>
~~~

Loader čita verzionirani URL vlastite datoteke i uključuje CSS i jezgru s istog prefiksa. Ne koristi vanjski analytics. WordPress može odabrati CDN kroz postavke, ali samo nakon postavljanja datoteka.

## Konfiguracija infrastrukture

1. DNS A/AAAA ili CNAME za `cookie.brendigo.com`.
2. Valjani HTTPS/TLS certifikat s automatskom obnovom.
3. MIME tipovi `text/javascript` i `text/css`.
4. `Cache-Control: public, max-age=31536000, immutable` za nepromjenjive `/v0.11.5/*` resurse.
5. Ne prepisivati već objavljene verzionirane datoteke; za izmjene izdati novu verziju.
6. Uskladiti CSP (`script-src` i `style-src`), a ako postoji inline konfiguracija, nonce/hash pravila.
7. Odrediti `Referrer-Policy`, evidenciju zahtjeva, retenciju logova i podugovaratelje.
8. Provjeriti dostupnost iz više regija te strategiju za nedostupnost CDN-a.
9. Zadržati lokalni način kao preporučeni fallback na kritičnim stranicama.
10. Potvrditi objavu kroz `manifest.json` i lokalne SHA-256 vrijednosti.

**Privatnost:** CDN operator pri mrežnom zahtjevu može vidjeti IP adresu i metapodatke zahtjeva. Takvu infrastrukturu i pravne osnove treba opisati u politici privatnosti. Sam paket ne šalje vrijednosti privole na Brendigo poslužitelje.

## Google Consent Mode v2 Basic (opcionalno)

~~~html
<script src="https://cookie.brendigo.com/v0.11.5/google-consent-basic.js"></script>
<!-- Google oznake moraju ostati blokirane do potrebne privole. -->
<script defer src="https://cookie.brendigo.com/v0.11.5/loader.js"></script>
~~~

Adapter nije certificirani CMP, ne implementira IAB TCF i ne blokira automatski sve načine uključivanja Google oznaka. Testirajte redoslijed i mrežne zahtjeve na ciljnoj stranici.

[Integracije](INTEGRATIONS.hr.md) · [Distribucija](RELEASE.md).

## Automatizirani HTTP/HTTPS prihvat nakon deploya

Iz kloniranog repozitorija pokrenite `npm run verify:deployment -- https://cookie.brendigo.com`. Skripta provjerava stvarne HTTP statusne kodove, MIME, javnu dostupnost, deklarirani CDN manifest i SHA-256 sadržaja. Za javne domene obvezan je HTTPS. [Potpune upute](DEPLOY.hr.md).

## DNS/TLS i HTTP provjera iz produkcijskog okruženja

Nakon objave pokrenite `npm run verify:hosting -- https://cookie.brendigo.com`.
Alat je read-only i provjerava DNS, TLS certifikat, status/MIME i upozorava na nedostatak HSTS, CSP, Referrer-Policy, nosniff i immutable cache. Sprema dokaz u `dist/hosting/latest-report.json`. Ne otvara portove i ne uređuje DNS. Upozorenja je potrebno procijeniti u stvarnom hosting kontekstu; trenutni GitHub CI sam ne potvrđuje javni host.

Za pravilno cacheiranje `/v*/` koristite nepromjenjive verzionirane resurse. `/index.html` i pravni sadržaji trebaju kraći cache i mogućnost invalidacije. Prije uključivanja CDN načina osigurajte lokalni fallback.

## Nasljeđivanje noncea (v0.11.5)

Ako host ima CSP i postavi valjan `nonce` na `<script src=".../loader.js" nonce="..."></script>`, loader sada prenosi isti nonce na verzionirani JavaScript i CSS koji sam dodaje. Način rada s `strict-dynamic` i `style-src` ovisi o stvarnim CSP direktivama. Nonce mora generirati hosting po HTTP odgovoru, nikada ne smije biti hardkodiran ili dijeljen među odgovorima. CDNs ne ovjeravaju samu politiku privatnosti niti dopuštenja pružatelja.
