const express = require('express');
const router = express.Router();
const { db } = require('../database');

// GET all offers or search offers
router.get('/', (req, res) => {
    const { location, checkin, checkout, guests } = req.query;
    
    let query = 'SELECT * FROM offers WHERE 1=1';
    const params = [];
    
    // Add filters based on query parameters
    if (location) {
        query += ' AND location LIKE ?';
        params.push(`%${location}%`);
    }
    
    if (guests) {
        const guestsNum = parseInt(guests);
        if (!isNaN(guestsNum) && guestsNum > 0) {
            query += ' AND capacity >= ?';
            params.push(guestsNum);
        }
    }
    
    // Note: Future enhancement - implement date-based availability check
    // to prevent double-booking of the same offer
    
    query += ' ORDER BY created_at DESC';
    
    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Error fetching offers:', err);
            res.status(500).json({ error: 'Failed to fetch offers' });
            return;
        }
        res.json(rows);
    });
});

// GET single offer by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT * FROM offers WHERE id = ?', [id], (err, row) => {
        if (err) {
            console.error('Error fetching offer:', err);
            res.status(500).json({ error: 'Failed to fetch offer' });
            return;
        }
        
        if (!row) {
            res.status(404).json({ error: 'Offer not found' });
            return;
        }
        
        res.json(row);
    });
});

// POST new offer (admin functionality)
router.post('/', (req, res) => {
    const { name, location, description, capacity, price } = req.body;
    
    // Validate required fields
    if (!name || !location || !capacity || !price) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }
    
    const query = 'INSERT INTO offers (name, location, description, capacity, price) VALUES (?, ?, ?, ?, ?)';
    const params = [name, location, description || '', capacity, price];
    
    db.run(query, params, function(err) {
        if (err) {
            console.error('Error creating offer:', err);
            res.status(500).json({ error: 'Failed to create offer' });
            return;
        }
        
        res.status(201).json({
            id: this.lastID,
            message: 'Offer created successfully'
        });
    });
});

module.exports = router;
