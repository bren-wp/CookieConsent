# Arhiviranje verzija politike i odluka o ponovnoj privoli

CookieConsent cookie uključuje `revision`, ISO datum i ograničen rok. Promjena revizije dovodi do odbijanja prethodne odluke u jezgri te se izbor treba ponovno prikazati; stranica mora uskladiti vrijednost i arhivu stvarnog teksta politike. To samo po sebi nije pravni dokaz.

## Postupak

1. Prije objave svake promjene politike snimiti **točan tekst ili PDF** u nepromjenjivu verzioniranu arhivu pod kontrolom operatora, npr. `archive/policy-2026-11-11.html`; izračunati SHA-256 i datum početka primjene.
2. U javnom indeksu održavati `revision`, naziv/version, datum početka, URL dokumenta, checksum i kratak opis promjene; ne objavljivati lažne povijesne podatke.
3. Procijeniti utječe li promjena na svrhe, pravnu osnovu, partnere, vrste cookiesa, rokove ili ostvarivanje prava.
4. Ako se opseg privole materijalno mijenja, povećati `revision` i ponovno tražiti odluku **prije** aktiviranja novog opcionalnog providera. Samo tipfeleri ili kozmetičke izmjene u pravilu ne zahtijevaju novi opt-in, ali treba zabilježiti procjenu.
5. Potvrditi preglednikom da novi posjetitelj dobiva opt-in, stari cookie s ranijom revizijom nije prihvaćen, a svi opcionalni zahtjevi ostaju blokirani do nove odluke.
6. Dokumentirati odluku (autor, datum, pravni review), provesti rollback na staru verziju koda i politike samo po usklađenoj proceduri, bez vraćanja nevaljane privole.

## Predložena javna polja
```json
{
  "revision": "2026-11-11-v2",
  "effective_date": "2026-11-11",
  "url": "/policy-archive/policy-2026-11-11.html",
  "sha256": "64-znamenkasti-SHA256-sadržaja",
  "substantive_change": true,
  "requires_new_consent": true
}
```

**Važno:** navedeni JSON je samo ilustracija polja, nije stvarna arhiva ni potvrda obveza stvarnog voditelja obrade. Dok pravne stranice ne budu verificirane, ne objavljujte dummy URL-ove.
