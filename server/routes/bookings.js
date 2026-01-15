const express = require('express');
const router = express.Router();
const { db } = require('../database');

// GET all bookings
router.get('/', (req, res) => {
    const query = `
        SELECT 
            bookings.*,
            offers.name as offer_name,
            offers.location as offer_location
        FROM bookings
        LEFT JOIN offers ON bookings.offer_id = offers.id
        ORDER BY bookings.created_at DESC
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching bookings:', err);
            res.status(500).json({ error: 'Failed to fetch bookings' });
            return;
        }
        res.json(rows);
    });
});

// GET single booking by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    
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
    
    db.get(query, [id], (err, row) => {
        if (err) {
            console.error('Error fetching booking:', err);
            res.status(500).json({ error: 'Failed to fetch booking' });
            return;
        }
        
        if (!row) {
            res.status(404).json({ error: 'Booking not found' });
            return;
        }
        
        res.json(row);
    });
});

// POST new booking
router.post('/', (req, res) => {
    const { offerId, name, email, phone, checkinDate, checkoutDate, guestsCount, notes } = req.body;
    
    // Validate required fields
    if (!offerId || !name || !email || !phone || !checkinDate || !checkoutDate || !guestsCount) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }
    
    // Validate dates
    const checkin = new Date(checkinDate);
    const checkout = new Date(checkoutDate);
    
    if (checkin >= checkout) {
        res.status(400).json({ error: 'Checkout date must be after checkin date' });
        return;
    }
    
    // Check if offer exists
    db.get('SELECT * FROM offers WHERE id = ?', [offerId], (err, offer) => {
        if (err) {
            console.error('Error checking offer:', err);
            res.status(500).json({ error: 'Failed to validate offer' });
            return;
        }
        
        if (!offer) {
            res.status(404).json({ error: 'Offer not found' });
            return;
        }
        
        // Check if guests count is within capacity
        if (guestsCount > offer.capacity) {
            res.status(400).json({ error: `Maximum capacity is ${offer.capacity} guests` });
            return;
        }
        
        // Insert booking
        const query = `
            INSERT INTO bookings 
            (offer_id, name, email, phone, checkin_date, checkout_date, guests_count, notes) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [offerId, name, email, phone, checkinDate, checkoutDate, guestsCount, notes || ''];
        
        db.run(query, params, function(err) {
            if (err) {
                console.error('Error creating booking:', err);
                res.status(500).json({ error: 'Failed to create booking' });
                return;
            }
            
            res.status(201).json({
                id: this.lastID,
                message: 'Booking created successfully'
            });
        });
    });
});

// DELETE booking by ID
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM bookings WHERE id = ?', [id], function(err) {
        if (err) {
            console.error('Error deleting booking:', err);
            res.status(500).json({ error: 'Failed to delete booking' });
            return;
        }
        
        if (this.changes === 0) {
            res.status(404).json({ error: 'Booking not found' });
            return;
        }
        
        res.json({ message: 'Booking deleted successfully' });
    });
});

module.exports = router;
