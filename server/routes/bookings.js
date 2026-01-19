const express = require('express');
const router = express.Router();
const { db } = require('../database');

// ten plik ma endpointy do rezerwacji

// get zwraca liste rezerwacji razem z danymi oferty
router.get('/', (req, res) => {
    // to query laczy bookings z offers
    const query = `
        SELECT 
            bookings.*,
            offers.name as offer_name,
            offers.location as offer_location
        FROM bookings
        LEFT JOIN offers ON bookings.offer_id = offers.id
        ORDER BY bookings.created_at DESC
    `;
    
    // db all zwraca tablice rekordow
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching bookings:', err);
            res.status(500).json({ error: 'Failed to fetch bookings' });
            return;
        }
        // jak ok to json
        res.json(rows);
    });
});

// get z id zwraca jedna rezerwacje
router.get('/:id', (req, res) => {
    // id jest w sciezce
    const { id } = req.params;
    
    // tu dociagamy tez cene i nazwe oferty
    const query = `
        SELECT 
            bookings.*,
            offers.name as offer_name,
            offers.location as offer_location,
            offers.price as offer_price
        FROM bookings
        LEFT JOIN offers ON bookings.offer_id = offers.id
        WHERE bookings.id = ?
    `;
    
    // db get zwraca jeden rekord
    db.get(query, [id], (err, row) => {
        if (err) {
            console.error('Error fetching booking:', err);
            res.status(500).json({ error: 'Failed to fetch booking' });
            return;
        }
        
        // jak nie ma to 404
        if (!row) {
            res.status(404).json({ error: 'Booking not found' });
            return;
        }
        
        // jak jest to json
        res.json(row);
    });
});

// post tworzy rezerwacje
router.post('/', (req, res) => {
    // bierzemy dane z body
    const { offerId, name, email, phone, checkinDate, checkoutDate, guestsCount, notes } = req.body;
    
    // walidacja czy pola sa
    if (!offerId || !name || !email || !phone || !checkinDate || !checkoutDate || !guestsCount) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }
    
    // walidacja dat
    const checkin = new Date(checkinDate);
    const checkout = new Date(checkoutDate);
    
    // jak data nie jest ok to gettime zwroci nan
    if (isNaN(checkin.getTime()) || isNaN(checkout.getTime())) {
        res.status(400).json({ error: 'Invalid date format' });
        return;
    }
    
    // checkin musi byc przed checkout
    if (checkin >= checkout) {
        res.status(400).json({ error: 'Checkout date must be after checkin date' });
        return;
    }
    
    // sprawdzamy czy oferta istnieje
    db.get('SELECT * FROM offers WHERE id = ?', [offerId], (err, offer) => {
        if (err) {
            console.error('Error checking offer:', err);
            res.status(500).json({ error: 'Failed to validate offer' });
            return;
        }
        
        // jak nie ma oferty to 404
        if (!offer) {
            res.status(404).json({ error: 'Offer not found' });
            return;
        }
        
        // sprawdzamy liczbe gosci
        if (guestsCount <= 0 || guestsCount > offer.capacity) {
            res.status(400).json({ error: `Guest count must be between 1 and ${offer.capacity}` });
            return;
        }
        
        // robimy insert do bookings
        const query = `
            INSERT INTO bookings 
            (offer_id, name, email, phone, checkin_date, checkout_date, guests_count, notes) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        // notes moze byc puste
        const params = [offerId, name, email, phone, checkinDate, checkoutDate, guestsCount, notes || ''];
        
        // db run wykona insert
        db.run(query, params, function(err) {
            if (err) {
                console.error('Error creating booking:', err);
                res.status(500).json({ error: 'Failed to create booking' });
                return;
            }
            
            // zwracamy id nowej rezerwacji
            res.status(201).json({
                id: this.lastID,
                message: 'Booking created successfully'
            });
        });
    });
});

// delete usuwa rezerwacje
router.delete('/:id', (req, res) => {
    // id z url
    const { id } = req.params;
    
    // db run usunie rekord
    db.run('DELETE FROM bookings WHERE id = ?', [id], function(err) {
        if (err) {
            console.error('Error deleting booking:', err);
            res.status(500).json({ error: 'Failed to delete booking' });
            return;
        }
        
        // changes mowi ile rekordow skasowalo
        if (this.changes === 0) {
            res.status(404).json({ error: 'Booking not found' });
            return;
        }
        
        // jak ok to info
        res.json({ message: 'Booking deleted successfully' });
    });
});

// export router
module.exports = router;
