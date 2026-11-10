# Usporedba funkcija — CookieConsent by Brendigo i Orestbida CookieConsent

Datum: 10. studenoga 2026.

Referentni projekt: https://github.com/orestbida/cookieconsent
Interaktivni primjer: https://playground.cookieconsent.orestbida.com/
Dokumentacija: https://cookieconsent.orestbida.com/reference/configuration-reference.html

**Projekt Orestbida ima MIT licenciju. U ovom radu preneseni su opći koncepti, ne tuđi izvorni kod, HTML, CSS ni vizualni identitet.** Ne tvrdimo da Brendigo već ima sve njegove mogućnosti ili da je pravno superioran.

| Funkcija | Orestbida | Brendigo |
|---|---|---|
| Vanilla JS i samostalni CSS | Da | Da |
| Vizualni playground s promjenom položaja, stila, teme, gumba i prijevoda | Da | Da, neovisan demo konfigurator |
| Kategorije i popis usluga | Da | Da, s pojedinačnim odabirom označenih pružatelja |
| Pravila automatskog brisanja first-party kolačića | Da | Da, konfigurirane liste uz provjeru domene/putanje |
| Opt-in po zadanim postavkama | Da | Da, bez automatskog uključivanja neobveznih kategorija |
| Opt-out način | Da | Ne, svjesno izostavljen zbog konzervativne EU opt-in politike |
| Odvojena konfiguracija modalnih prozora | Da | Pozicija/drawer prozora i raspored gumba |
| Prilagodba boja i tema | Da | Da |
| GPC | Da | Da, marketing je ograničen signalom |
| WP administratorski dodatak | Nije dio osnovnog vanilla paketa | Da, vlastita implementacija |
| WooCommerce cart/checkout zaštitni adapter | Nije primarna komponenta | Da, ograničen adapter |
| CDN distribucija | Moguće putem javnih CDN-ova | Vlastiti verzionirani CDN paket; domena još nije objavljena |
| Lokalni audit browser-vidljivih podataka | Nije primarna mogućnost | Da, uz jasno dokumentirana ograničenja |
| Google CMP certifikacija / IAB TCF | Ne podrazumijeva se samom upotrebom biblioteke | Nije certificirano |
| Stalni potpis distributera | Nije osnovno ponašanje | „by Brendigo” u službenoj distribuciji |

## Granice sigurnosti i zakonitosti

Ni vizualni editor ni izbornik kategorija sami po sebi ne zaustavljaju sve neovlaštene trackere. Potrebno je provjeriti sve vanjske skripte, server-side zahtjeve i third-party kolačiće.

## Daljnji razvoj

Prioriteti: naprednije prilagođavanje sadržaja i prijevoda u WordPressu, dodatne teme, izvoz/uvoz standalone konfiguracije, bolji prikaz usluga, pravi testovi s WordPress/WooCommerce instalacijama i ručni audit pristupačnosti.
