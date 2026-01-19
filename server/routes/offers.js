const express = require('express');
const router = express.Router();
const { db } = require('../database');

// ten plik ma endpointy do ofert

// get na glowna sciezke zwraca wszystkie oferty albo filtruje
router.get('/', (req, res) => {
    // bierzemy parametry z query string
    const { location, checkin, checkout, guests } = req.query;
    
    // startujemy od query ktore zawsze jest prawdziwe
    let query = 'SELECT * FROM offers WHERE 1=1';
    // tu zbieramy parametry do sqlite
    const params = [];
    
    // doklejamy filtry jak sa podane
    if (location) {
        // like robi wyszukiwanie po fragmencie tekstu
        query += ' AND location LIKE ?';
        params.push(`%${location}%`);
    }
    
    // guests filtruje po pojemnosci
    if (guests) {
        // parseint robi liczbe z tekstu
        const guestsNum = parseInt(guests);
        // sprawdzamy czy to ma sens
        if (!isNaN(guestsNum) && guestsNum > 0) {
            // capacity musi byc wieksze albo rowne
            query += ' AND capacity >= ?';
            params.push(guestsNum);
        }
    }
    
    // checkin i checkout na razie nie sa uzyte
    // pozniej mozna dorobic sprawdzanie dostepnosci z bookings
    
    // sortujemy po dacie dodania
    query += ' ORDER BY created_at DESC';
    
    // db all zwraca tablice wierszy
    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Error fetching offers:', err);
            // 500 bo to blad serwera
            res.status(500).json({ error: 'Failed to fetch offers' });
            return;
        }
        // jak ok to zwracamy json
        res.json(rows);
    });
});

// get z id zwraca jedna oferte
router.get('/:id', (req, res) => {
    // id bierzemy z parametru sciezki
    const { id } = req.params;
    
    // db get zwraca jeden wiersz
    db.get('SELECT * FROM offers WHERE id = ?', [id], (err, row) => {
        if (err) {
            console.error('Error fetching offer:', err);
            res.status(500).json({ error: 'Failed to fetch offer' });
            return;
        }
        
        // jak nie ma rekordu to 404
        if (!row) {
            res.status(404).json({ error: 'Offer not found' });
            return;
        }
        
        // jak jest rekord to wysylamy
        res.json(row);
    });
});

// post dodaje nowa oferte
router.post('/', (req, res) => {
    // dane bierzemy z body
    const { name, location, description, capacity, price } = req.body;
    
    // walidacja podstawowych pol
    if (!name || !location || !capacity || !price) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }
    
    // przygotowujemy insert
    const query = 'INSERT INTO offers (name, location, description, capacity, price) VALUES (?, ?, ?, ?, ?)';
    // description moze byc puste
    const params = [name, location, description || '', capacity, price];
    
    // db run wykona insert
    db.run(query, params, function(err) {
        if (err) {
            console.error('Error creating offer:', err);
            res.status(500).json({ error: 'Failed to create offer' });
            return;
        }
        
        // this lastid to id nowego rekordu
        res.status(201).json({
            id: this.lastID,
            message: 'Offer created successfully'
        });
    });
});

// export router zeby app mogl go podpiac
module.exports = router;
