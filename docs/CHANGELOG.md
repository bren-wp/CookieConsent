# Povijest promjena — CookieConsent by Brendigo

## 0.11.3 — testna sigurnosna i integracijska zakrpa

- Shopify: spremni odabiri, promjene između kartica i reset/povlačenje privole usklađuju se s Customer Privacy API-jem. Ponavljanje iste odluke ne pokreće suvišne zahtjeve.
- Shopify: Liquid postavke idu kroz escapirane HTML meta atribute i lokalnu bootstrap skriptu umjesto izvršivog inline JavaScripta; dodani su regresijski testovi.
- PrestaShop: putanje lokalnih CSS/JS resursa počinju od korijena modula, uključujući instalacije trgovine u poddirektoriju.
- CDN: validator odbija preusmjeravanja, ograničava veličinu odgovora na 2 MiB i nastavlja potvrđivati hash manifest; build čisti stare artefakte prije pakiranja.
- Ispravljen link iz kataloga demo usluga prema korijenskoj naslovnici javnog website ZIP-a.\n- Dopunjeni sigurnosni i dead-code nalazi; i dalje su obavezni stvarni CMS/storefront testovi, neovisni sigurnosni pregled te validacija objavljenog DNS/HTTPS hostinga.


## 0.11.2 — testno izdanje

- OpenCart 4: URL-ovi resursa iz korijena trgovine, CSP-sigurna JSON konfiguracija i odvojeni bootstrap.
- Shopify: ponovno povezivanje s Customer Privacy API-jem nakon učitavanja, ograničen red posljednje privole, test GPC-a.
- Stvarni PHP izvršni smoke testovi pet platformskih adaptera u izoliranim okvirima; sve stvarne platforme i dalje zahtijevaju staging instalaciju.
- Javni katalog platformi na engleskom webu, popravljena središnja dokumentacija i matrica kvalitete.
- CLI provjera postavljenog weba/CDN-a: HTTPS, status, MIME, verzija, SHA-256; lokalni test bez vanjske mreže.
- Održano pakiranje 11 zasebnih ZIP-a i postupak objave samo nakon uspješnog CI-a.



## 0.11.1 — testna zakrpa

- Sinkronizacija privole poboljšana je pri povratku na karticu (focus/pageshow/visibilitychange).
- Uz BroadcastChannel koristi se i storage događaj s isključivo tehničkim signalom, bez vrijednosti korisnikove privole.
- Stabilizirani su browser testovi za Safari/WebKit fallback, te su ažurirane kopije jezgre svih CMS dodataka.
- Ponovno je reproducibilno pakirano svih 11 izdanja.



## 0.11.0 — testno izdanje

- Joomla 5 system plugin s administratorskim poljima i lokalnim resursima.
- Drupal 10/11 modul s konfiguracijskim obrascem, libraries i schema.
- Shopify Theme App Extension s Customer Privacy API adapterom i `compliance_head` blokom.
- Magento 2.4 native modul s layoutom i store-scope postavkama.
- OpenCart 4 native extension, event i admin konfiguracija.
- PrestaShop 8/9 modul, front-office hookovi i administratorski obrazac.
- Šest novih distribucijskih arhiva, platform-specific static validation i reproducibilno ZIP pakiranje.
- Vodič za integracije i ažuriran ROADMAP; production smoke testovi na navedenim platformama ostaju otvoreni.



## 0.10.0 — testno izdanje

- Sigurnosna provjera spremljenih privola: strogi datum, ograničenje trajanja i ponovno otvaranje pri isteku.
- Zaštita URL-ova: HTTPS web ne aktivira HTTP resurse niti URL-ove s ugrađenim vjerodajnicama.
- Uklonjeni su duplicirano CSS pravilo, suvišna inicijalizacija kanala i dinamički PHP testni fixture.
- Reproducibilni sigurnosni i dead-code audit izvještaji, automatizirani source-audit testovi.
- Statički performance budget za runtime JS/CSS bez vanjskih runtime ovisnosti.
- Popravljen je preview konfiguratora pri brzim izmjenama teksta i prijevoda.
- Dopunjeni dokumentacija, razvojni plan i testovi kolačića i first-party cleanup-a.



Ovdje se opisuje funkcionalni razvoj službene grane. Zapisi označeni kao testne verzije nisu tvrdnja da je sva produkcijska ili regulatorna validacija obavljena.

## 0.8.1 — testno izdanje

- Korektivno izdanje: dokumentacija, jezgra, WordPress dodatak i CDN ponovno su usklađeni na istu verziju.
- Dodana je provjera usklađenosti verzija koja se mora izvršiti prije objave.

- Lokalna JSON potvrda korisnikova odabira s datumom i revizijom; preuzimanje u dijalogu postavki.
- `onFirstConsent`, `onConsent` i `onDecision` callbackovi.
- Sinkronizacija odabira među karticama iste domene, bez prijenosa vrijednosti privole.
- WordPress editor teksta bannera po jeziku uz sanitizaciju.
- Nova struktura dokumentacije, puni API i konfiguracijski vodič.
- Regresijski testovi za potvrdu izbora, sinkronizaciju i prikaz.

## 0.7.0 — testno izdanje

- Napredniji samostalni konfigurator tema, rasporeda gumba, prijevoda i JSON izvoza.
- Granularni prekidači pojedinačnih usluga i pravila čišćenja dostupnih first-party kolačića.
- Ispravak skrivanja bannera u svim položajima.
- Chromium, Firefox i WebKit E2E te automatizirane accessibility provjere.

## 0.6.0 — razvojna faza

- Prošireni izgled bannera, dodatni jezici i RTL.
- Reproducibilni ZIP paketi, CDN manifest i administratorske funkcije.

## 0.5.0 i starije — razvojni temelji

- Vanilla JS/CSS jezgra, WordPress dodatak, HR/EN, četiri kategorije i trajni prikaz postavki.
- Devet položaja bannera i boje.
- Pružatelji usluga, lifecycle integracije, Google Basic adapter.
- Lokalni browser audit, JSON backup WordPress postavki, WooCommerce zaštitni adapter.

Za sadržaj trenutnog izdanja i preostale zadatke pogledajte [ROADMAP.md](ROADMAP.md).
