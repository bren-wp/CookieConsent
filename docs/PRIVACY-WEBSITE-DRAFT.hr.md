# Predložak politike privatnosti javnog weba — CookieConsent by Brendigo

**Status: DRAFT — NE OBJAVLJIVATI kao završnu politiku dok operator ne popuni i provjeri označena polja.**
Datum tehničke pripreme: 11. 11. 2026.

## 1. Voditelj obrade i kontakti
Voditelj obrade: **[PUNI REGISTRIRANI NAZIV OPERATORA]**, poslovna adresa **[ADRESA, DRŽAVA]**. Kontakt za privatnost: **[POTVRĐENI EMAIL]**. Službeni kontakt za ostvarivanje prava: **[EMAIL/ADRESA]**. Ako je primjenjivo, DPO: **[KONTAKT DPO-a ili navesti da nije imenovan]**.

Brendigo je naziv proizvoda i autora koda; ne smije se pretpostaviti da je identičan pravnom voditelju obrade bez potvrde.

## 2. Koji se podaci obrađuju
Javna statična web-stranica prema pregledanom izvornom kodu nema ugrađenu marketinšku analitiku, prijavu korisnika niti središnje slanje vrijednosti privole. Hosting/CDN ipak **može** obrađivati IP adresu, korisnički agent, datum/vrijeme zahtjeva, URL putanju, status i sigurnosne logove. Ovaj odjeljak potrebno je prilagoditi stvarno aktivnim proxy/CDN i hosting uslugama.

Sama CookieConsent jezgra može zapisati korisnikov izbor u first-party cookie odredišne web-stranice, po lokalno definiranoj politici. **Vlasnik integrirane web-stranice** odgovoran je za njezinu politiku kolačića, svrhe i treće strane.

## 3. Svrhe i pravna osnova
Sigurnost, pružanje sadržaja i zaštita od zlouporabe: **[KONKRETNA OSNOVA, test balansiranja interesa prema potrebi]**. Ako se uključuju analitički ili oglašivački alati, svaka dodatna svrha, primatelj i pravna osnova moraju se pojedinačno navesti i uskladiti s primjenjivim pravilima privole.

## 4. Primatelji i lokacije
Hosting: **[PROVIDER, ZEMLJA, ULOGA]**. CDN: **[PROVIDER, REGIJE, ZEMLJA]**. Sigurnosni/DNS servisi: **[POPIS]**. Međunarodni prijenosi i primijenjene zaštitne mjere: **[POTVRĐENI DOKUMENTI]**.

## 5. Rokovi pohrane
Web/proxy/CDN access logovi: **[BROJ DANA I SISTEM BRISANJA]**.
Sigurnosni incidenti: **[KRITERIJ I DOKAZ O ROKU]**.
Kolačić privole na integriranim stranicama: do konfiguriranog `consentDays` (1–365 dana), ili prije pri promjeni revizije/odluke.

## 6. Prava i pritužbe
Za zahtjeve za pristup, ispravak, brisanje, ograničenje, prigovor i druga primjenjiva prava koristite **[POTVRĐEN KONTAKT]**. Za Hrvatsku: Agencija za zaštitu osobnih podataka (AZOP), https://azop.hr/ . Navedite postupak identifikacije podnositelja bez nepotrebnog prikupljanja novih podataka.

## 7. Sigurnost, kolačići i promjene
Korisničke vrijednosti privole ne prenose se na Brendigo API u lokalnom načinu rada. Ako se odabere vanjski CDN, tehnički zahtjev prema CDN-u i dalje otkriva mrežne metapodatke operatoru te mora biti obuhvaćen politikom. Za opis nužnih i dodatnih kolačića izraditi stvarni inventar po instalaciji.

Politiku ažurirati nakon promjene pružatelja, svrha, primatelja ili roka obrade, te objaviti datum učinka i poveznicu na prethodne verzije.

## Prihvatni zapis prije objave
- [ ] Pravni identitet i kontakt provjerila je osoba ovlaštena za operatora.
- [ ] Napravljen je stvarni inventar web servera, CDN/hostinga, logova i cookieja.
- [ ] Potvrđeni su retencija, ugovori, primatelji, lokacije i međunarodni prijenosi.
- [ ] Tekst je pregledao kvalificirani pravni/DPO stručnjak za stvarnu namjenu.
- [ ] Tek se tada predložak može pretvoriti u produkcijski `website/privacy.html`.
