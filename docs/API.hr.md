# JavaScript API — CookieConsent by Brendigo

**Izdanje:** 0.8.1 · [Konfiguracija](CONFIGURATION.hr.md) · [Integracije](INTEGRATIONS.hr.md)

## Inicijalizacija

Predviđena uporaba je definiranje `window.BCC_SITE_CONFIG` **prije** uključivanja jezgrene skripte. Konfiguracija se učitava jednom; ponovni poziv `init()` ne zamjenjuje već aktivnu konfiguraciju.

~~~javascript
const cmp = window.BrendigoCookieConsent;
cmp.init({language:"hr",revision:"2026-11"}); // za ručnu integraciju
~~~

Ako je skripta uključena standardnim `BCC_SITE_CONFIG` načinom, ručni `init()` nije potreban.

## Javne metode

| Metoda | Rezultat / učinak |
|---|---|
| `getConsent()` | `null` prije odluke, inače kopija stanja kategorija |
| `hasConsent("analytics")` | `boolean` za zadanu kategoriju |
| `getServiceConsent()` | kopija stanja usluga s identificiranim prekidačima |
| `hasServiceConsent("id")` | `boolean` za konkretnu uslugu |
| `setConsent({analytics:true})` | sprema kategorijski odabir |
| `setDetailedConsent({categories,services})` | sprema odabir kategorija i pojedinačnih usluga |
| `getConsentReceipt()` | lokalna korisnička potvrda ili `null` |
| `downloadConsentReceipt()` | pokušava preuzeti JSON potvrdu, vraća `boolean` |
| `openPreferences()` | otvara modal s kategorijama i pružateljima |
| `reset()` | poništava spremljenu privolu i vraća banner |
| `refresh()` | obrađuje naknadno ubačene označene skripte/iframeove |
| `scanLocalResources()` | Prošireni lokalni pregled browser-visible resursa, bez mrežnog slanja |
| `getCatalog()` | Sigurna kopija konfiguriranih usluga |
| `renderCatalog(target)` | Dostupan višejezični HTML katalog (tekstni DOM API) |
| `initFromJSON(raw)` | Ručni uvoz dozvoljene samostalne JSON konfiguracije prije inicijalizacije |
| `auditLocal()` | lokalno dostupan popis kolačića, pohrane i oznaka resursa |
| `registerProvider(definition)` | registracija lifecycle callbackova; vraća unregister funkciju |

Nužna kategorija uvijek je uključena kao kategorija. GPC ograničava marketinšku kategoriju. Metode ne daju zakonsku klasifikaciju konkretnim servisima.

## Granularna privola

~~~javascript
cmp.setDetailedConsent({
  categories: {necessary:true,analytics:true,marketing:false},
  services: {"site-analytics":true,"heatmaps":false}
});
console.log(cmp.hasServiceConsent("site-analytics"));
~~~

`services` vrijednosti djeluju samo za valjano definirane `toggleable` usluge u konfiguraciji. Ne mijenjajte odabir posjetitelja automatski bez opravdanog razloga.

## Lifecycle pružatelja

~~~javascript
const unregister = cmp.registerProvider({
  id: "site-analytics-provider",
  category: "analytics",
  serviceId: "site-analytics",
  onGrant(consent) {
    // Pokrenuti samo odobreni servis.
  },
  onRevoke(consent) {
    // Zaustaviti slanje zahtjeva i očistiti podatke koje servis dopušta.
  }
});
~~~

`serviceId` nije obvezan; bez njega pružatelj prati kategoriju. Callbackovi moraju biti idempotentni. `onRevoke` ne može poništiti zahtjeve koji su već izvršeni, niti obrisati third-party/HttpOnly cookies.

## Browser događaji

Sustav šalje događaje na `window`:

- `brendigo:consentready` — nakon pripreme prve prikazane instance i čitanja pohrane.
- `brendigo:consentchange` — nakon promjene odabira ili reseta.
- `brendigo:consentfirst` — prvi lokalni izbor za trenutačnu reviziju.
- `brendigo:consentrevoked` — kada je povučena prethodno dana kategorija ili usluga.

~~~javascript
window.addEventListener("brendigo:consentchange", event => {
  const {consent, services, gpc} = event.detail;
  // Sinkronizirati vlastiti pružatelj samo ako postoji odgovarajuća privola.
});
~~~

`detail` sadrži `consent`, `services` i `gpc`. Svi se događaji odvijaju lokalno. Ako callback pogriješi, implementacija pokušava izolirati pogrešku umjesto da prekine sučelje.

## Sinkronizacija više kartica

Ako preglednik podržava `BroadcastChannel`, kartice istog origina primaju obavijest o promjeni. Poruka je samo obavijest s revizijom; tab ponovno čita first-party cookie i provodi lokalni refresh. Nema slanja sadržaja privole na druge domene.

## Potvrda korisnikove odluke

~~~javascript
const receipt = cmp.getConsentReceipt();
if (receipt) {
  // receipt.decidedAt, receipt.revision, receipt.categories, receipt.services
  cmp.downloadConsentReceipt();
}
~~~

To je korisnikova **lokalna, nekriptografska** kopija, a ne serverski ili pravno ovjeren dokaz. [Potvrda privole](CONSENT-RECEIPT.hr.md).

## Sigurni import i javni katalog

`BrendigoCookieConsent.utils.parseConfigurationJSON(raw)` vraća sanirani objekt dozvoljenih postavki ili `null`; očekuje `schema: "brendigo-cookieconsent-standalone-v1"`. `initFromJSON(raw)` prihvaća samo valjanu konfiguraciju prije inicijalizacije. Nikada ne uvozi korisnikovu privolu.

`renderCatalog('#my-catalog')` stvara preglednu višejezičnu tablicu za deklarirane usluge. Ne skenira automatski sve kolačiće niti klasificira treće strane.

### Fallback kada BroadcastChannel nije podržan

Uz `BroadcastChannel`, jezgra koristi i standardni `storage` događaj za isti origin. U `localStorage` se zapisuje samo tehnički signal `bcc-consent-update:<cookieName>` s revizijom politike, vremenom i lokalnim brojačem **bez sadržaja privole ili identifikatora korisnika**. Prijemna kartica ponovno čita vlastiti first-party cookie. Ako su obje mogućnosti blokirane, promjena postaje vidljiva pri ponovnom učitavanju.
