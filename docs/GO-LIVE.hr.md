# Produkcijski prihvatni popis — CookieConsent by Brendigo

**Označite samo stavke koje su stvarno provjerene na konkretnoj web-stranici.**

## Instalacija

- [ ] Službeni ZIP odgovara testiranom izdanju i sha256 provjeri.
- [ ] JS/CSS i politika kolačića dostupni su putem HTTPS-a.
- [ ] Lokalni ili CDN resursi ispravno se učitavaju i nije prisutan 404/MIME/CSP problem.
- [ ] `revision` se ažurira kada je to pravno/tehnički potrebno.
- [ ] Nema vanjskog runtime trackera koji se učitava kroz sam banner.

## Privola

- [ ] U čistom privatnom prozoru opcionalni servisi nisu učitani prije odabira.
- [ ] „Odbij sve” zaustavlja sve neobvezne skripte i druge izvore praćenja.
- [ ] „Prihvati sve” dopušta samo unaprijed jasno opisane svrhe.
- [ ] Pojedinačni servis može se uključiti i isključiti neovisno kada je implementiran.
- [ ] Ponovno učitavanje stranice zadržava važeću odluku.
- [ ] Promjena i opoziv dostupni su trajno kroz postavke.
- [ ] Opcionalni pružatelji nakon opoziva ne šalju buduće događaje.
- [ ] First-party cleanup pravila ne brišu nužne, sesijske i košarične podatke.
- [ ] Sinkronizacija među karticama radi kada preglednik podržava BroadcastChannel.
- [ ] Korisnik može preuzeti lokalnu potvrdu; sadržaj ne uključuje osobne identifikatore.

## Dizajn i pristupačnost

- [ ] Testirano 9 položaja i konfigurirana tema na mobitelu i desktopu.
- [ ] HR, EN, DE, IT, ES, FR i AR imaju ispravne oznake, ako se koriste.
- [ ] RTL i tipkovnička navigacija su ispravni.
- [ ] Provjerene su screen-reader oznake, kontrast, fokus i povećanje 200–400 %.
- [ ] Potpis **by Brendigo** ostaje vidljiv u službenoj distribuciji.

## WordPress i WooCommerce

- [ ] Testirana stvarna WordPress/PHP instalacija i sukobi dodataka.
- [ ] Provjereni caching i minifier redoslijed.
- [ ] Testirani WooCommerce košarica, kuponi, checkout i završetak narudžbe.
- [ ] Napravljen backup postavki prije importa/nadogradnje.
- [ ] Odvojeno su auditirani svi marketinški i analitički WP dodaci.

## Pravna i sigurnosna provjera

- [ ] Popis kolačića/podataka u dokumentaciji odgovara stvarnim zahtjevima.
- [ ] Pravna osnova, iznimke, svrhe i rokovi provjereni su za ciljnu jurisdikciju.
- [ ] Po potrebi provjerena obveza dokazivosti i evidentiranja privole.
- [ ] Odrađen sigurnosni pregled, osobito third-party skripti i CSP-a.
- [ ] Ako je aktivan CDN: potvrđeni operator, IP logovi, TLS, retencija i monitoring.

**Ne označavati stavke samo na temelju CI rezultata.** [Sigurnost](SECURITY.md) · [Pravne smjernice](COMPLIANCE.hr.md).

## Operativni prihvat — nova automatizacija

- [ ] Pokrenuti `npm run verify:deployment -- https://cookie.brendigo.com` nakon stvarnog uploada (status, MIME, SHA-256).
- [ ] Pokrenuti `npm run verify:hosting -- https://cookie.brendigo.com` i sačuvati `dist/hosting/latest-report.json` (DNS, TLS, HTTP sigurnosna zaglavlja, cache).
- [ ] Provjeriti privolu, checkout i povlačenje na stvarnoj reprezentativnoj trgovini te ažurirati staging zapisnik.
- [ ] Iz GitHub Actions preuzeti sintetička Chromium mjerenja. Ne predstavljati ih kao real-device/RUM ili manualnu screen-reader provjeru.
- [ ] Potvrditi odabranog operatera/CDN, trajanje i obujam logova, pristupe i način brisanja.
