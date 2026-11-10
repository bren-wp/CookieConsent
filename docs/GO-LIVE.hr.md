# Produkcijska kontrolna lista — CookieConsent by Brendigo

## Prije objave

1. [ ] Popišite sve stvarne skripte, vanjske iframeove, lokalno pohranjene identifikatore, HttpOnly cookies, piksele i server-side eventove.
2. [ ] Za svaku stavku utvrdite kategoriju, pravnu osnovu, svrhu, pružatelja, primatelje, rok i eventualne međunarodne prijenose.
3. [ ] Sve neobvezne integracije moraju biti inertne prije izbora korisnika. Testirati Network u anonimnom prozoru i bez kolačića.
4. [ ] Odbijanje mora ostaviti sve neobvezne tehnologije neaktivnima; prihvaćanje treba aktivirati samo odobrene kategorije.
5. [ ] Opoziv mora obavijestiti stvarne providere, zaustaviti buduće eventove i provesti cleanup koliko je moguće; provjeriti stvarni mrežni promet.
6. [ ] Dodajte istinita Pravila o kolačićima i Politiku privatnosti u jezicima korisnika, uključujući CDN operatora ako koristite CDN.
7. [ ] Testirajte spremanje i ponovno traženje privole pri promjeni pravila (`revision`).
8. [ ] Provjerite izvoz WordPress konfiguracije i sigurnosnu kopiju prije importa.
9. [ ] Testirajte mobilni prikaz, tipkovnicu, različite DPI/zoom vrijednosti, govorne tehnologije i visoki kontrast.
10. [ ] Ako je WooCommerce aktivan, provjerite košaricu, kupone, plaćanje i čuvanje narudžbi s odbijenim opcionalnim privolama.
11. [ ] Za Google oznake provjerite Basic redoslijed i uključivanje tek nakon potrebne privole; ako je potrebna certifikacija CMP-a, ne proglašavajte ovaj alat certificiranim.
12. [ ] Ako koristite `cookie.brendigo.com`, provjerite DNS, TLS, CORS/CSP (gdje je primjenjivo), cache-control, MIME vrste, logiranje i dostupnost CDN-a, kao i fallback.
13. [ ] Pravni stručnjak treba potvrditi pravnu osnovu, iznimke i sadržaj za svaku ciljnu jurisdikciju.
14. [ ] Potvrdite izvješće sigurnosne provjere i provjeru privole nakon deploya.

**Ovaj popis je vodič za prihvatno testiranje, a ne dokaz da su gore navedene radnje izvršene.**

## Ograničenje odgovornosti

Consent cookie sam po sebi **nije kriptografski dokaz** valjanog pristanka i moguće ga je izmijeniti s iste domene. Ako je potreban dokaz na razini poslužitelja, implementirajte odgovarajući, zakonito utemeljen consent ledger i politiku čuvanja dokaza na vlastitoj infrastrukturi.
