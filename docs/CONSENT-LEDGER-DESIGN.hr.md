# Arhitektura opcionalne serverske evidencije privola — nacrt

**Status:** opcionalna SQLite serverska primitiva u `tools/consent_ledger.py`; nije aktivirana ni integrirana u javni runtime. SQL nacrt ispod ostaje prijedlog za buduću višekorisničku produkcijsku implementaciju.
**Temeljna odluka:** server-side ledger nije potreban za svaku integraciju; prije uvođenja mora biti definiran dokazni zahtjev, voditelj obrade, pravna osnova i rok čuvanja.

## Tok podataka

1. Korisnik odlučuje nakon jasnog opt-ina na svojoj web-stranici.
2. Ako ga operator **izričito konfigurira**, backend generira slučajan pseudonimni token sa životnim vijekom i zapisuje odluku uz verziju obavijesti.
3. Poslužitelj verificira origin, CSRF token, autentifikaciju sesije gdje primjenjivo i validira shemu, vrste, revision i veličinu payload-a. Browser nije autoritet za legitimnost privole niti smije proizvoljno potpisivati receipt.
4. Događaj se zapisuje u minimalni append-only audit log. Ispravci i opozivi se zapisuju kao novi događaji, bez prepisivanja starih dokaza.
5. Backend omogućuje kontrolu pristupa, izvoz i brisanje/pseudonimizaciju prema utvrđenim pravima i obvezama; automatizirano uklanjanje nakon retencije.

## Predložena SQL shema (nije instalacijski skript)

```sql
CREATE TABLE consent_ledger_events (
  event_id BINARY(16) PRIMARY KEY,
  subject_token_hash BINARY(32) NOT NULL,
  policy_revision VARCHAR(60) NOT NULL,
  purpose_schema_version SMALLINT UNSIGNED NOT NULL,
  categories_json JSON NOT NULL,
  services_json JSON NOT NULL,
  event_type ENUM('decision','withdrawal','policy_change') NOT NULL,
  recorded_at DATETIME(6) NOT NULL,
  expires_at DATETIME(6) NOT NULL,
  signing_key_id VARCHAR(32) NOT NULL,
  integrity_tag BINARY(32) NOT NULL,
  INDEX idx_token (subject_token_hash, recorded_at),
  INDEX idx_expiry (expires_at)
);
```

`subject_token_hash` mora biti računat kao HMAC tajnog, rotirajućeg poslužiteljskog ključa nad slučajnim tokenom, **ne** hash IP adrese ili email adrese. `integrity_tag` je HMAC nad kanonskim zapisom događaja za detekciju manipulacije; ključevi su izvan repozitorija i baze, s rotacijom i kontrolom pristupa.

## Privatnost i sigurnost

- Bez zadane pohrane IP adresa, user-agenta, geo-lokacije ili fingerprinta.
- Stroga kontrola pristupa, audit svakog administratorskog čitanja, enkripcija transporta i baze, backup i rollback.
- Ograničen CORS; nikad univerzalni unauthenticated endpoint s trajnom pohranom.
- Retencija se određuje prema pravnoj svrsi, a ne proizvoljno; provesti erase job i backup retention.
- Važno: evidencija odluke ne dokazuje da nijedan tracker nije bio aktiviran prije privole — zaseban network audit ostaje potreban.

## Dodatne obveze prije razvoja
Potvrditi voditelja obrade, nositelja ledger infrastrukture, svrhu, prava, obavijest, DPIA kada je potrebna, podatkovne ugovore i testove integriteta. Ovaj dokument ne predstavlja produkcijski ledger.

## Implementirana lokalna SQLite primitiva

Operator sam kreira privatnu bazu izvan web root-a, generira ključ od najmanje 32 slučajna bajta i slučajne 32-bajtne tokene subjekta. `ConsentLedger` zahtijeva eksplicitni scope, revision, key ID, rok čuvanja i katalog servisnih kategorija. Metode `record`, `history`, `purge_expired` i `erase_subject` ne otvaraju HTTP endpoint. Svaki događaj je transakcijski spremljen i autentificiran HMAC-SHA256; replay istog request ID-a za isti subjekt je idempotentan, konflikt se odbija. Subjekt se sprema kao domenski odvojeni HMAC, ne kao izvorni token. Podržani su decision, withdrawal i gpc_optout. Test: `python3 tests/consent_ledger_test.py`.

Ograničenja: operator mora osigurati autentifikaciju, CSRF/origin, autorizaciju, privatne dozvole datoteka, enkripciju diska/backupa, raspored retencije i životni ciklus ključa. Primitiva ne dokazuje da je browserov iskaz istinit. HMAC pojedinačnih događaja ne otkriva brisanje cijelog zapisa ili rollback baze; neovisno sidro i rotacija ključeva nisu implementirani. Nema automatskog slanja podataka, browser identifikatora, IP/UA evidencije niti produkcijske integracije. Ne distribuirati privatni ključ.
