// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Check which page we're on
    const searchForm = document.getElementById('search-form');
    const bookingForm = document.getElementById('booking-form');

    if (searchForm) {
        initializeSearchPage();
    }

    if (bookingForm) {
        initializeBookingPage();
    }
});

// Search page functionality
function initializeSearchPage() {
    const searchForm = document.getElementById('search-form');
    const offersList = document.getElementById('offers-list');

    // Load all offers on page load
    loadOffers();

    // Handle search form submission
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(searchForm);
        const searchParams = {
            location: formData.get('location'),
            checkin: formData.get('checkin'),
            checkout: formData.get('checkout'),
            guests: formData.get('guests')
        };
        loadOffers(searchParams);
    });
}

// Load offers from API
async function loadOffers(searchParams = {}) {
    const offersList = document.getElementById('offers-list');
    
    try {
        // Build query string
        const queryString = new URLSearchParams(searchParams).toString();
        const url = `${API_BASE_URL}/offers${queryString ? '?' + queryString : ''}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Failed to load offers');
        }
        
        const offers = await response.json();
        displayOffers(offers);
        
    } catch (error) {
        console.error('Error loading offers:', error);
        offersList.innerHTML = '<p>Błąd podczas ładowania ofert. Spróbuj ponownie później.</p>';
    }
}

// Display offers in the list
function displayOffers(offers) {
    const offersList = document.getElementById('offers-list');
    
    if (offers.length === 0) {
        offersList.innerHTML = '<p>Nie znaleziono ofert spełniających kryteria wyszukiwania.</p>';
        return;
    }
    
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

// Navigate to booking page with offer ID
function goToBooking(offerId) {
    window.location.href = `booking.html?offerId=${offerId}`;
}

// Booking page functionality
function initializeBookingPage() {
    const bookingForm = document.getElementById('booking-form');
    const urlParams = new URLSearchParams(window.location.search);
    const offerId = urlParams.get('offerId');
    
    // Pre-fill offer ID if provided
    if (offerId) {
        document.getElementById('offer-id').value = offerId;
    }
    
    // Handle booking form submission
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitBooking();
    });
}

// Submit booking to API
async function submitBooking() {
    const bookingForm = document.getElementById('booking-form');
    const resultDiv = document.getElementById('booking-result');
    const formData = new FormData(bookingForm);
    
    const bookingData = {
        offerId: parseInt(formData.get('offerId')),
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        checkinDate: formData.get('checkinDate'),
        checkoutDate: formData.get('checkoutDate'),
        guestsCount: parseInt(formData.get('guestsCount')),
        notes: formData.get('notes')
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to create booking');
        }
        
        const result = await response.json();
        
        // Show success message
        resultDiv.className = 'result-message success';
        resultDiv.textContent = `Rezerwacja została utworzona pomyślnie! Numer rezerwacji: ${result.id}`;
        
        // Reset form
        bookingForm.reset();
        
    } catch (error) {
        console.error('Error creating booking:', error);
        resultDiv.className = 'result-message error';
        resultDiv.textContent = 'Wystąpił błąd podczas tworzenia rezerwacji. Spróbuj ponownie.';
    }
}
