# Pristupačnost — CookieConsent by Brendigo

## Implementirane mogućnosti

- Odvojeni gumbi **Prihvati sve**, **Odbij sve** i **Postavke** na prvom sloju.
- Semantički dialog s oznakom naslova, fokusom i kontrolom tipkovnice.
- Povrat fokusa nakon zatvaranja modala.
- Kontrole kategorija i pojedinačnih usluga s odgovarajućim oznakama.
- Poveznice pružatelja odvojene su od checkbox kontrola.
- Devet pozicija uz mobilna ograničenja širine i visine.
- Automatska prilagodba kontrasta teksta u odnosu na pozadinu.
- Podrška za RTL/arapski i mogućnost isključivanja animacija.

## Automatizirani testovi

GitHub CI izvodi Playwright testove u **Chromiumu, Firefoxu i WebKitu**. `axe-core` provjerava odabrane WCAG 2.0/2.1 A/AA pravila za banner i dialog. Ovi testovi su automatizirani smoke testovi, **ne formalni WCAG certifikat**.

## Ručni testni scenariji

1. Koristite samo Tab, Shift+Tab, Enter, Space i Escape; ne smije se izgubiti fokus.
2. Provjerite redoslijed prvog sloja i jednak pristup odbijanju i prihvaćanju.
3. Otvorite/zatvorite dialog i provjerite vraćanje fokusa na prethodnu kontrolu.
4. Povećajte zoom na 200 % i 400 %; provjerite pomicanje bez horizontalnog gubitka funkcija.
5. Testirajte uske mobitele, krajoliki položaj i sustavsku opciju smanjenih animacija.
6. Izvršite ručne provjere čitačima ekrana (NVDA + Firefox/Chrome, VoiceOver + Safari, TalkBack + Android).
7. Provjerite svaki jezik, RTL i tekstove prilagođene u WordPressu.
8. Potvrdite kontrast i vidljive fokusne obrube za vlastite boje teme.

## Poznata ograničenja

Automatizirani alat ne može procijeniti razumljivost svih pravnih tekstova, kvalitetu čitanja u svakom screen readeru ili ponašanje drugih dodataka i tema. Ručna provjera ostaje uvjet produkcijskog prihvata.

[Produkcijska kontrolna lista](GO-LIVE.hr.md).
