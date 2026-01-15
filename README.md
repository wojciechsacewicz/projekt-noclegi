# projekt-noclegi
Projekt zaliczeniowy na laboratoria Języków Skryptowych współtworzony z kolegą.

## Opis projektu

Aplikacja do rezerwacji noclegów zbudowana z wykorzystaniem Node.js, Express i SQLite.

## Struktura projektu

```
projekt-noclegi/
├── public/                    # Pliki statyczne (frontend)
│   ├── index.html            # Strona wyszukiwania
│   ├── booking.html          # Formularz rezerwacji
│   ├── styles.css            # Style CSS
│   ├── script.js             # JavaScript po stronie klienta
│   └── images/               # Katalog na obrazy
├── server/                    # Backend aplikacji
│   ├── app.js                # Główny plik serwera Express
│   ├── database.js           # Konfiguracja bazy SQLite
│   └── routes/               # Trasy API
│       ├── offers.js         # Endpointy dla ofert
│       └── bookings.js       # Endpointy dla rezerwacji
├── package.json              # Zależności projektu
└── .gitignore                # Ignorowane pliki
```

## Funkcjonalności

- 🔍 Wyszukiwanie dostępnych ofert noclegowych
- 📝 Formularz rezerwacji
- 💾 Baza danych SQLite do przechowywania ofert i rezerwacji
- 🌐 API RESTful dla ofert i rezerwacji
- 📱 Responsywny interfejs użytkownika

## Instalacja

1. Sklonuj repozytorium:
```bash
git clone https://github.com/wojciechsacewicz/projekt-noclegi.git
cd projekt-noclegi
```

2. Zainstaluj zależności:
```bash
npm install
```

## Uruchomienie

### Tryb produkcyjny:
```bash
npm start
```

### Tryb deweloperski (z automatycznym restartem):
```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem: `http://localhost:3000`

## API Endpoints

### Oferty (Offers)

- `GET /api/offers` - Pobierz wszystkie oferty
  - Query params: `location`, `checkin`, `checkout`, `guests`
- `GET /api/offers/:id` - Pobierz ofertę po ID
- `POST /api/offers` - Utwórz nową ofertę

### Rezerwacje (Bookings)

- `GET /api/bookings` - Pobierz wszystkie rezerwacje
- `GET /api/bookings/:id` - Pobierz rezerwację po ID
- `POST /api/bookings` - Utwórz nową rezerwację
- `DELETE /api/bookings/:id` - Usuń rezerwację

## Technologie

- **Backend:** Node.js, Express.js
- **Baza danych:** SQLite3
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Dodatkowe:** CORS, Body-parser

## Baza danych

Baza danych SQLite jest automatycznie inicjalizowana przy pierwszym uruchomieniu aplikacji. Zawiera przykładowe dane:

- 4 przykładowe oferty noclegowe (Warszawa, Mazury, Zakopane, Gdańsk)
- Automatycznie tworzone tabele `offers` i `bookings`

## Licencja

ISC
