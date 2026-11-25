# Postavljanje weba i CDN-a — CookieConsent by Brendigo

**Prezentacijski origin:** https://cookie.brendigo.com · **CDN direktorij:** https://api.brendigo.com/cookieconsent/ · **Autor:** Brendigo · [Dokumentacija](README.md)

## 1. Izrada paketa (lokalno ili CI)

~~~bash
npm run check
npm test
npm run build:cdn
npm run build:wporg
python3 tools/package.py
python3 tools/package.py --verify
~~~

U `dist/` nalazi se samostalni ZIP, WordPress distribucije, šest platformskih integracija, CDN ZIP te **`cookieconsent-brendigo-website.zip`**. Za postavljanje weba raspakirajte **sadržaj web ZIP-a**, ne dodatni direktorij `website`, u document root domene. Paket sadrži `index.html`, `en.html`, `legal.html`, `demo/`, `packages/core/` te verzionirani `/v<verzija>/` direktorij.

## 2. Produkcijski web hosting

1. Postavite DNS za `cookie.brendigo.com` prema stvarnom hosting računu.
2. Aktivirajte valjani HTTPS/TLS certifikat i automatsku obnovu.
3. Prenesite sadržaj ZIP-a u odgovarajući document root (SFTP/FTP, upravljačka ploča ili deployment sustav).
4. Provjerite ispravan MIME za `.html`, `.js`, `.css` i `.json`.
5. Postavite odgovarajuće CSP, cache, `Referrer-Policy`, `X-Content-Type-Options` i ostale sigurnosne HTTP zaglavlje. Promjene prilagodite stvarnom serveru.
6. Za `/vX.Y.Z/` koristite zaseban, nepromjenjiv direktorij. Nemojte prepisivati već objavljene verzije.
7. Dokumentirajte operatora, logiranje IP-a, rokove čuvanja i podugovaratelje u stvarnoj politici privatnosti; generička pravna napomena nije dovršena politika.
8. Potvrdite sve release poveznice i da se prikazuje **by Brendigo**.
9. Prije prebacivanja WordPress dodataka ili klijentskih webova na CDN, provjerite javnu dostupnost i HTTPS.

## 3. Provjera stvarnog javnog deploymenta

Nakon postavljanja, iz kloniranog repozitorija pokrenite:

~~~bash
npm run verify:deployment -- --website https://cookie.brendigo.com
npm run verify:deployment -- --cdn https://api.brendigo.com/cookieconsent/
~~~

Provjera preuzima samo javne web/CDN datoteke, bez cookiesa, prijave ili podataka korisnika. Validira status, MIME, pravilan origin i SHA-256 svakog deklariranog resursa. Radi i na lokalnom HTTP test serveru, ali za javne domene zahtijeva HTTPS.

**Ne interpretirajte uspješan lokalni test kao dokaz da je domena javno dostupna.** Provjera mora biti izvršena prema stvarnom javnom URL-u.

## 4. Nadogradnja i rollback

- Sačuvajte prethodni `/vX.Y.Z/` direktorij.
- Prenesite novi direktorij bez zamjene postojećih datoteka.
- Izvršite provjeru SHA-256 i test korisnikova odbijanja, prihvaćanja, opoziva i realnih mrežnih zahtjeva.
- Promijenite reference na novu verziju tek nakon provjere.
- U slučaju regresije vratite prethodnu verziju i provjerite privole nakon promjene pravila.

## 5. Što se ovdje ne može izvršiti automatski

Sama GitHub objava ne postavlja DNS, certifikat, hosting, operatorove log politike ili CDN monitoring. Za te zadatke potreban je administrativni pristup ciljanoj infrastrukturi. Shopify traži i registriranu aplikaciju te razvojnu/produkcijsku trgovinu, a WordPress.org vlastiti račun i odobrenje.

[CDN tehničke pojedinosti](CDN.hr.md) · [Produkicjski prihvat](GO-LIVE.hr.md) · [Matrica testova](QUALITY-GATES.hr.md).

## Odvojeni CDN hosting

Raspakirajte sadržaj CDN ZIP-a (verzionirani `vX.Y.Z/` direktorij) u direktorij koji poslužuje `https://api.brendigo.com/cookieconsent/`. Ne prepisujte prethodne objavljene verzije. Prezentacijska stranica ostaje na `cookie.brendigo.com`. Prije prebacivanja korisnika na CDN provjerite DNS, TLS, MIME, cache, CORS i integritet datoteka prema checkoutu odgovarajućeg izdanja. Bez potvrđenog hostinga koristite lokalne resurse.
