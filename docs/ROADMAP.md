# Razvojni plan — CookieConsent by Brendigo

**Aktualno izdanje: 0.8.0 (testno)** · Ažurirano: 10. 11. 2026. · [Dokumentacija](README.md) · [Promjene](CHANGELOG.md)

Ovaj plan razlikuje **implementirano u kodu**, **automatizirano testirano** i **neprovjereno u stvarnoj produkciji**. Dokumentacija ne predstavlja potvrdu regulatorne certifikacije.

## Funkcionalnosti isporučene u projektu

| Područje | Stanje |
|---|---|
| Samostalna Vanilla JS/CSS jezgra bez obveznih runtime ovisnosti | Implementirano |
| HR/EN/DE/IT/ES/FR/AR, uključujući RTL | Implementirano |
| Jednostavno i granularno upravljanje privolom | Implementirano |
| GPC ograničenje marketinga | Implementirano |
| Devet pozicija bannera, tri stila, teme, boje i redoslijed gumba | Implementirano |
| Prilagodba mjesta prozora postavki, fokus i tipkovnica | Implementirano |
| Katalog usluga, pojedinačni prekidači i ručno označeni JS/iframe resursi | Implementirano |
| Lifecycle pružatelja (odobrenje/opoziv), dostupna first-party cleanup pravila | Implementirano |
| Lokalna potvrda korisnikova izbora i JSON preuzimanje | Implementirano |
| Sinkronizacija privole između kartica istog origina | Implementirano |
| WordPress administracija, preview, editor jezika i JSON backup | Implementirano |
| Ograničeni WooCommerce adapter za nužne skripte košarice/naplate | Implementirano |
| Google Consent Mode v2 Basic adapter | Opcionalno implementirano; konfiguracija tagova mora se testirati |
| Lokalni pregled JS-dostupnih cookiesa i storage ključeva | Implementirano; nije puni skener |
| Reproducibilni ZIP-ovi: standalone, WordPress i CDN | Implementirano |
| CI: Node, PHP 7.4 i 8.1–8.4, Chromium/Firefox/WebKit, automatizirani axe-core | Automatizirano testirano u pokrivenim scenarijima |
| Stalni potpis `by Brendigo` u službenom UI-ju | Implementirano, ne kriptografski neuklonjivo |

## Prioritet A — produkcijska pouzdanost

- [ ] Pokrenuti automatizirane testove nad stvarnim WordPress instalacijama, više WP verzija i hosting konfiguracija.
- [ ] Testirati WooCommerce košaricu, checkout i platne servise u stvarnim webshopovima.
- [ ] Neovisni sigurnosni audit i penetracijski test.
- [ ] Ručna WCAG/čitač-ekrana provjera, 200–400 % zoom i mobilne orijentacije.
- [ ] Potvrditi obradu svih dinamičkih trackera nakon promjene i povlačenja privole.
- [ ] Provjeriti CSP, nonce, opt-in i cleanup s konkretnim temama i minification dodacima.
- [ ] Sustavno mjeriti performanse i regresije pri nadogradnji.

## Prioritet B — integracije i transparentnost

- [ ] Opcionalni dodatci/adapteri za analitiku i marketinške pružatelje, svaki s zasebnim testom.
- [ ] Napredniji katalog kolačića po web-stranici i višejezična javna tablica.
- [ ] Automatizirani skener preglednički dostupnih resursa, uz jasno istaknute granice (HttpOnly/cross-origin/server-side).
- [ ] Zasebni CMS adapteri ondje gdje se pokažu potrebnima; Vanilla instalacija ostaje standard.
- [ ] Samostalni import validirane JSON konfiguracije u frontend integraciji, uz ograničenja i siguran parser.
- [ ] Povratne informacije i dodatno poboljšanje konfiguratora na malim ekranima.

## Prioritet C — infrastruktura i regulatorna primjena

- [ ] Postaviti DNS, TLS, hosting, log-policy i monitoring za `cookie.brendigo.com`.
- [ ] Obaviti pravni pregled primjene na HR/EU i svim drugim ciljnim jurisdikcijama.
- [ ] Procijeniti je li potrebno certificiranje za konkretan oglašivački ekosustav, npr. Google CMP / IAB TCF.
- [ ] Ako je potreban poslužiteljski consent ledger, projektirati ga kao zasebnu, zakonito utemeljenu komponentu uz minimizaciju i retenciju.
- [ ] Dokumentirati proces ažuriranja javne politike, povijesnih verzija i revizija privole.

## Kriteriji za stabilnu v1.0

Izdanje se ne proglašava stabilnim samo zbog zelenog CI-a: potrebne su potvrđene stvarne instalacije, bez regresija prihvaćanja/odbijanja/opoziva, provjereni scenariji s pružateljima i održiv proces sigurnosnih nadogradnji.

**Neposredan sljedeći korak:** završiti aktualne regresijske testove i objaviti usklađene distribucijske pakete v0.8.0, nakon čega slijedi testiranje na stvarnom WordPressu.
