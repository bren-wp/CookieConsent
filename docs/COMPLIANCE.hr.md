# Pravna kontrolna lista — CookieConsent by Brendigo

**Ažurirano: 10. 11. 2026.** Ovaj dokument nije pravno mišljenje ili potvrda zakonske sukladnosti. Alat daje tehničke kontrole, a vlasnik web-stranice odgovoran je za ispravnu primjenu, transparentnost i nadzor svih usluga.

## Hrvatska, EU i EGP

- [ ] Napraviti stvaran popis cookiesa, lokalne pohrane, skripti, iframeova, piksela i server-side zahtjeva.
- [ ] Jasno razlikovati nužne tehnologije od neobveznih prema primjenjivim iznimkama.
- [ ] Blokirati neobvezne tehnologije prije odgovarajuće privole.
- [ ] Osigurati razumljivo informiranje: naziv pružatelja, svrha, primatelji, trajanje i prijenosi.
- [ ] Omogućiti ravnopravan, nezavaravajući izbor prihvaćanja/odbijanja te granularne postavke.
- [ ] Ostaviti jasan i jednostavan način promjene i povlačenja odluke.
- [ ] Odvojeno procijeniti dokazivost i eventualnu potrebu za evidencijom privole.
- [ ] Provjeriti međunarodne prijenose, sigurnost, politiku privatnosti i ulogu pružatelja.
- [ ] Obnoviti `revision` kada su promjene bitne za opseg privole.

## Ujedinjena Kraljevina

UK PECR i UK GDPR imaju dodatna pravila i određene iznimke. ICO je 2026. ažurirao smjernice za storage/access tehnologije; prije primjene potrebno je provjeriti aktualnu primjenjivost iznimaka i mogućnost prigovora, umjesto pretpostavke da je svaki cookie u svakoj situaciji isti.

## Sjedinjene Države

GPC može predstavljati zahtjev prema određenim državnim zakonima; Brendigo jezgra konzervativno isključuje marketing uz taj signal. Time **nije** implementiran potpuni Do Not Sell/Share postupak, backend opt-out, zahtjevi ispitanika ili obveze određene države.

## Brazil i druge jurisdikcije

Provjerite LGPD i druga nacionalna pravila prema stvarnim svrhama, pravnim osnovama, obvezama obavještavanja i pravima ispitanika. Ne postoji automatska regionalna klasifikacija.

## Potvrda i povlačenje

`getConsentReceipt()` omogućuje lokalnu kopiju izbora korisniku, ali ne predstavlja neovisno ovjeren dokaz. `onRevoke` i cleanup pravila pomažu zaustaviti priključene servise, no ne mogu automatski poništiti ranije zahtjeve ili izbrisati third-party/HttpOnly cookies.

## Google Consent Mode v2 Basic

Opcionalni adapter postavlja konzervativni početni status signala. Vlasnik stranice i dalje mora pravilno odgoditi Google skripte u Basic načinu, testirati Tag Assistant te provjeriti je li za konkretnu primjenu potrebna posebna CMP certifikacija.

## CDN

`cookie.brendigo.com`, nakon postavljanja, može obrađivati IP i metapodatke zahtjeva putem infrastrukturnih logova. Operator i vlasnik stranice moraju utvrditi pravne osnove, retenciju, ugovorne obveze i transparentnost. Sam GitHub ZIP ne znači da je CDN aktivan.

## Službeni izvori za provjeru

- [EDPB — Cookie Banner Taskforce](https://www.edpb.europa.eu/documents/task-force-report/report-of-the-work-undertaken-by-the-cookie-banner-taskforce_en)
- [ICO — Storage and Access Technologies](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/)
- [Google — Consent Mode](https://developers.google.com/tag-platform/security/concepts/consent-mode)
- [CPPA — California Privacy Protection Agency](https://cppa.ca.gov/)

Izvori se mogu promijeniti; konzultirajte aktualne tekstove i pravni savjet prije produkcije.

## Google oglašavanje: razdvajanje slučajeva

Za oglašivače s Google oznakama provjerava se pravilna konfiguracija Consent Mode v2, blokiranje tagova i prikaz relevantnih signala. Za izdavače s personaliziranim Google oglasima u EGP/UK/Švicarskoj provjerava se dodatna obveza **Google-certified CMP + IAB TCF 2.3**. Navedeni zahtjev ne zadovoljava osnovni Brendigo adapter. [Službena Google CMP pravila](https://support.google.com/adsense/answer/13554116).
