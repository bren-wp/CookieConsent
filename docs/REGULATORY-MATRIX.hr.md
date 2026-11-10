# Regulatorna matrica — CookieConsent by Brendigo

**Ažurirano: 10. studenoga 2026.**

Ovaj dokument pripada isključivo Brendigo implementaciji i ne uključuje provjeru konkretne web-stranice. Ovaj dokument opisuje tehničku podršku i potrebne korake vlasnika web-stranice; nije pravno mišljenje, certificirana CMP usluga ili automatska jamstvena izjava o usklađenosti.

## Univerzalni konzervativni način

Prije prve pozitivne privole jezgra dopušta samo označene **nužne** kategorije. Analitika, marketing i funkcionalne neobvezne tehnologije ostaju blokirane ako su pravilno integrirane putem BCC oznaka. Dostupni su „Prihvati sve”, „Odbij sve” i „Postavke” bez unaprijed označenih izbornih kategorija. Privola se može promijeniti na stalno dostupnom gumbu.

**Ovo nije automatski blokator cijelog weba.** Skripte, pikseli, dodatci, serverski pozivi i kolačići izvan BCC kontrole zahtijevaju zasebnu integraciju.

| Područje | Opći zahtjev / oprez | Podrška sustava | Preostali rad |
|---|---|---|---|
| EU/EGP i Hrvatska | Za neizuzete tehnologije potrebno je odgovarajuće informiranje i zakonita privola prije aktiviranja | Globalni opt-in, ekvivalentne odluke, granularne kategorije i trajno ponovno otvaranje | Auditi po pružatelju, evidencija privole, stvarna pravila i nacionalne iznimke |
| Ujedinjena Kraljevina | PECR i UK GDPR; ICO je ažurirao pravila o iznimkama i jednostavnom prigovoru 2026. | Konzervativni opt-in, dostupno povlačenje | Provjeriti iznimke za statistiku/izgled, obveze prigovora, trajanje i evidenciju |
| SAD | Državni propisi nisu jednaki. GPC može označavati zahtjev protiv prodaje/dijeljenja podataka | GPC isključuje BCC marketinšku kategoriju | Backend opt-out, Do Not Sell/Share, prava ispitanika, signal prema pružateljima, state-specific notices |
| Brazil | LGPD zahtijeva valjanu pravnu osnovu, transparentnost i ostvarivanje prava | Privole po kategorijama i informacijski katalog | Obrada prava, međunarodni prijenosi, evidencija i kategorizacija prema primjeni |
| Ostale jurisdikcije | Nacionalna pravila mogu imati posebne iznimke, dobnim uvjetima ili modelima prigovora | Bez lažnog određivanja lokacije; jednako konzervativni opt-in | Lokalno pravno mišljenje i prilagodba sadržaja i procesa |

## Google Consent Mode v2

Projekt sadrži **opcijski Basic adapter** koji postavlja početna stanja na denied i ažurira signale nakon promjene odabira. Prema Googleovoj dokumentaciji, Basic način zahtijeva da Google tagovi **uopće ne budu učitani prije privole**. Adapter **ne provodi automatsko blokiranje svih Google oznaka**, ne zamjenjuje Google-certified CMP i nema IAB TCF implementaciju.

## Povlačenje privole

Nakon opoziva, jezgra javlja `brendigo:consentrevoked`, poziva registrirani `onRevoke` i uklanja `src` označenih iframeova. Već izvršeni JS, poslani podaci, server-side tracker i third-party cookies nisu pod generičkom kontrolom. Svaki pružatelj zahtijeva vlastiti cleanup i dokumentiranu mogućnost prestanka obrade.

## Vidljivi potpis

„by Brendigo” uvijek je uključen u službenom sučelju; ne daje i ne ograničava privatnopravnu privolu. MIT licencija dopušta izmjene koda. Tehnički ne postoji apsolutno neuklonjiv tekst u otvorenom JS/CSS kodu.

## Mjerodavni izvori

- [EDPB — Cookie Banner Taskforce, 18. siječnja 2023.](https://www.edpb.europa.eu/documents/task-force-report/report-of-the-work-undertaken-by-the-cookie-banner-taskforce_en)
- [ICO — Storage and Access Technologies, ažurirano 29. travnja 2026.](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/)
- [ICO — Iznimke za tehnologije pohrane/pristupa](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/)
- [Google — Basic i Advanced Consent Mode](https://developers.google.com/tag-platform/security/concepts/consent-mode)
- [CPPA — Global Privacy Control](https://cppa.ca.gov/announcements/2025/20250909.html)


## Tehnički dodaci u izdanju 0.8.1

- Korisnik može dobiti lokalnu JSON potvrdu odabira; potvrda nije digitalno ovjerena i ne zamjenjuje evidenciju kada je ona propisana.
- Odabir se sinkronizira među otvorenim karticama istog origina ako je dostupna podrška preglednika.
- WordPress tekstovi bannera mogu se urediti na podržanim jezicima, ali vlasnik mora osigurati istinit i razumljiv sadržaj.
- Potpis `by Brendigo` prikazan je u službenoj distribuciji i ne utječe na pravnu valjanost korisnikova izbora.
