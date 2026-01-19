// ten plik ogarnia frontend czyli logike w przegladarce
// tu jest pobieranie ofert i wysylanie rezerwacji

// baza url do api
const API_BASE_URL = 'http://localhost:3000/api';

// czekamy az html sie zaladuje
document.addEventListener('DOMContentLoaded', () => {
    // bierzemy elementy ktore sa na roznych stronach
    const searchForm = document.getElementById('search-form');
    const bookingForm = document.getElementById('booking-form');

    // jak jest formularz wyszukiwania to jestesmy na index
    if (searchForm) {
        initializeSearchPage();
    }

    // jak jest formularz rezerwacji to jestesmy na booking
    if (bookingForm) {
        initializeBookingPage();
    }
});

// start logiki na stronie wyszukiwania
function initializeSearchPage() {
    // pobieramy formularz
    const searchForm = document.getElementById('search-form');
    // pobieramy kontener na oferty
    const offersList = document.getElementById('offers-list');

    // na start ladujemy oferty bez filtrow
    loadOffers();

    // obsluga submit
    searchForm.addEventListener('submit', (e) => {
        // blokujemy przeladowanie strony
        e.preventDefault();
        // formdata zbiera pola po name
        const formData = new FormData(searchForm);
        // skladamy obiekt parametrow
        const searchParams = {
            location: formData.get('location'),
            checkin: formData.get('checkin'),
            checkout: formData.get('checkout'),
            guests: formData.get('guests')
        };
        // ladujemy oferty z parametrami
        loadOffers(searchParams);
    });
}

// pobiera oferty z api
async function loadOffers(searchParams = {}) {
    // tu wstawimy html z ofertami
    const offersList = document.getElementById('offers-list');
    
    try {
        // zamieniamy parametry na query string
        const queryString = new URLSearchParams(searchParams).toString();
        // budujemy url do endpointu
        const url = `${API_BASE_URL}/offers${queryString ? '?' + queryString : ''}`;
        
        // fetch robi request
        const response = await fetch(url);
        
        // jak status nie jest ok to robimy blad
        if (!response.ok) {
            throw new Error('Failed to load offers');
        }
        
        // json daje tablice ofert
        const offers = await response.json();
        // renderujemy
        displayOffers(offers);
        
    } catch (error) {
        // jak cos padnie to wypisujemy
        console.error('Error loading offers:', error);
        // i pokazujemy komunikat
        offersList.innerHTML = '<p>Błąd podczas ładowania ofert. Spróbuj ponownie później.</p>';
    }
}

// wyswietla oferty w html
function displayOffers(offers) {
    // bierzemy kontener
    const offersList = document.getElementById('offers-list');
    
    // jak nie ma wynikow to komunikat
    if (offers.length === 0) {
        offersList.innerHTML = '<p>Nie znaleziono ofert spełniających kryteria wyszukiwania.</p>';
        return;
    }
    
    // map robi html dla kazdej oferty
    offersList.innerHTML = offers.map(offer => `
        <div class="offer-card">
            <h3>${offer.name}</h3>
            <p><strong>Lokalizacja:</strong> ${offer.location}</p>
            <p><strong>Opis:</strong> ${offer.description}</p>
            <p><strong>Pojemność:</strong> ${offer.capacity} osób</p>
            <p class="price">${offer.price} zł/noc</p>
            <button class="btn-primary" onclick="goToBooking(${offer.id})">Zarezerwuj</button>
        </div>
    `).join('');
}

// przejscie na strone rezerwacji
function goToBooking(offerId) {
    // przekazujemy offerid w query string
    window.location.href = `booking.html?offerId=${offerId}`;
}

// start logiki na stronie rezerwacji
function initializeBookingPage() {
    // bierzemy formularz
    const bookingForm = document.getElementById('booking-form');
    // bierzemy parametry z url
    const urlParams = new URLSearchParams(window.location.search);
    // wyciagamy offerid
    const offerId = urlParams.get('offerId');
    
    // jak jest offerid w url to wpisujemy w input
    if (offerId) {
        document.getElementById('offer-id').value = offerId;
    }
    
    // obsluga submit rezerwacji
    bookingForm.addEventListener('submit', async (e) => {
        // blokujemy przeladowanie
        e.preventDefault();
        // wysylamy request
        await submitBooking();
    });
}

// wysyla rezerwacje do api
async function submitBooking() {
    // bierzemy formularz
    const bookingForm = document.getElementById('booking-form');
    // bierzemy miejsce na wynik
    const resultDiv = document.getElementById('booking-result');
    // zbieramy dane z formularza
    const formData = new FormData(bookingForm);
    
    // skladamy obiekt ktory pojdzie do api
    const bookingData = {
        // parseint bo input number i tak daje string
        offerId: parseInt(formData.get('offerId')),
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        checkinDate: formData.get('checkinDate'),
        checkoutDate: formData.get('checkoutDate'),
        // to tez ma byc liczba
        guestsCount: parseInt(formData.get('guestsCount')),
        notes: formData.get('notes')
    };
    
    try {
        // fetch z post
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // body musi byc string
            body: JSON.stringify(bookingData)
        });
        
        // jak status nie ok to blad
        if (!response.ok) {
            throw new Error('Failed to create booking');
        }
        
        // wynik z api
        const result = await response.json();
        
        // pokazujemy sukces
        resultDiv.className = 'result-message success';
        resultDiv.textContent = `Rezerwacja została utworzona pomyślnie! Numer rezerwacji: ${result.id}`;
        
        // czyscimy formularz
        bookingForm.reset();
        
    } catch (error) {
        // logujemy blad
        console.error('Error creating booking:', error);
        // pokazujemy blad
        resultDiv.className = 'result-message error';
        resultDiv.textContent = 'Wystąpił błąd podczas tworzenia rezerwacji. Spróbuj ponownie.';
    }
}
