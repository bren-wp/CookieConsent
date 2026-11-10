# Pravna kontrolna lista — CookieConsent by Brendigo

**Ovaj dokument nije pravni savjet ni certifikat sukladnosti.** Funkcionalnost upravitelja privole samo je jedan od elemenata usklađene web-stranice.

## EU / EGP / Hrvatska

- Inventurirajte kolačiće, lokalnu pohranu, piksele, third-party iframeove, skripte i usluge.
- Nužne tehnologije klasificirajte samo kad doista ispunjavaju zakonske iznimke.
- Prije privole blokirajte neobvezne tehnologije, uključujući marketing i analitiku kad je privola potrebna.
- Osigurajte ravnopravan pristup gumbima **Prihvati sve**, **Odbij sve** i **Postavke**.
- Nemojte unaprijed odabirati neobvezne kategorije ili koristiti zavaravajuće dizajne.
- Omogućite trajno, jednostavno povlačenje privole i uklanjanje neobveznih tehnologija nakon povlačenja.
- Opišite naziv svakog pružatelja, svrhu, primatelje, rok i način upravljanja.
- Provjerite potrebe za evidencijom privole i odgovarajućim dokazima, poštujući minimizaciju podataka.

## UK

Aktualizirane ICO smjernice za tehnologije pohrane i pristupa završene su 29. travnja 2026. Neke iznimke i obveze promijenile su se kroz UK Data (Use and Access) Act: za pojedine tehnologije može vrijediti poseban režim, pa se ne smije automatski tvrditi da je privola uvijek jedina pravna osnova. Odbijanje neizuzetih tehnologija mora ostati jednako jednostavno kao prihvaćanje. Smjernice: https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/

## SAD

GPC je signal koji u nekim jurisdikcijama predstavlja zahtjev za odbijanje prodaje ili dijeljenja podataka. U ovoj verziji marketing je konzervativno onemogućen uz GPC. To **ne zamjenjuje** pravila specifične države, prava korisnika, status prodaje/dijeljenja ili backend obradu.

## Brazil i druge jurisdikcije

Za LGPD i ostala nacionalna pravila zasebno provjerite pravnu osnovu, obavijesti, svrhe i prava ispitanika. Sama prisutnost bannera ne može jamčiti zakonsku sukladnost.

## Trenutna ograničenja

- Nema automatskog skenera ili automatskog blokiranja neoznačenih trackera.
- Nema brisanja kolačića trećih strana ni poništavanja već izvršenog JavaScripta.
- Nema server-side revizijskog dnevnika.
- Opt-in Google Consent Mode v2 Basic adapter uključen je kao zasebna integracija. Ne učitava Google tagove; sam ne može automatski blokirati sve njihove načine ubacivanja. IAB TCF i certificirani Google CMP status nisu implementirani.
- Nema GeoIP segmentacije ili cjelovitog opt-out postupka za američke propise.

## Referentni izvori

- [EDPB Cookie Banner Taskforce](https://www.edpb.europa.eu/our-work-tools/our-documents/other/report-work-undertaken-cookie-banner-taskforce_en)
- [ICO: How do we manage consent in practice?](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/how-do-we-manage-consent-in-practice)
- [CNIL: Dark patterns in cookie banners](https://cnil-d10.cnil.fr/en/dark-patterns-cookie-banners-cnil-issues-formal-notice-website-publishers)
- [California Privacy Protection Agency: GPC](https://cppa.ca.gov/announcements/2025/20250909.html)
- [Google consent mode guidance](https://developers.google.com/tag-platform/security/guides/consent)

Provjerite novije propise i smjernice prije svake produkcijske implementacije.

## CDN i službeni potpis

CDN domena u produkciji može obrađivati IP adrese posjetitelja i metapodatke zahtjeva i zato zahtijeva odgovarajuću obavijest, konfiguraciju logiranja, sigurnost prijenosa i ugovorne procjene. Potpis **by Brendigo** mora se pojaviti u službenom prikazu; vizualni kredit nije pravno potreban za valjanu privolu. Postojeća MIT licencija zahtijeva očuvanje licencne obavijesti, ali ne jamči da vlasnik modificirane kopije neće sakriti vidljivi kredit.

## v0.3.0 — transparentnost pružatelja

Prošireni katalog služi informiranju o pružatelju, svrsi, kolačićima, trajanju i politici privatnosti. Nijedna inventura se ne može smatrati automatskom ni potpunom: vlasnik web-stranice mora je redovito uspoređivati sa stvarnim mrežnim zahtjevima i stanjem preglednika. Dodani lifecycle callbackovi ne mogu automatski obrisati kolačiće drugih domena, a rollback aktivnog JavaScripta nije univerzalno moguć.

Google Basic adapter se opcionalno uključuje u WordPressu; ne učitava i ne blokira sve tagove automatski. Sva ograničenja Google CMP certifikacije i IAB TCF-a i dalje vrijede.
