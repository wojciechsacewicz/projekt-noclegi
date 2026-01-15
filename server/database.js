const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const DB_PATH = path.join(__dirname, '../database.db');

// Create database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Initialize database tables
function initialize() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Create offers table
            db.run(`
                CREATE TABLE IF NOT EXISTS offers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    location TEXT NOT NULL,
                    description TEXT,
                    capacity INTEGER NOT NULL,
                    price REAL NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
            });

            // Create bookings table
            db.run(`
                CREATE TABLE IF NOT EXISTS bookings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    offer_id INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    phone TEXT NOT NULL,
                    checkin_date DATE NOT NULL,
                    checkout_date DATE NOT NULL,
                    guests_count INTEGER NOT NULL,
                    notes TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (offer_id) REFERENCES offers(id)
                )
            `, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
            });

            // Insert sample offers if table is empty
            db.get('SELECT COUNT(*) as count FROM offers', (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (row.count === 0) {
                    const sampleOffers = [
                        ['Apartament w Centrum', 'Warszawa', 'Nowoczesny apartament w centrum miasta', 4, 250],
                        ['Domek nad Jeziorem', 'Mazury', 'Przytulny domek z widokiem na jezioro', 6, 350],
                        ['Górskie Schronisko', 'Zakopane', 'Komfortowe schronisko w Tatrach', 8, 200],
                        ['Willa nad Morzem', 'Gdańsk', 'Luksusowa willa 50m od plaży', 10, 500]
                    ];

                    const stmt = db.prepare('INSERT INTO offers (name, location, description, capacity, price) VALUES (?, ?, ?, ?, ?)');
                    
                    sampleOffers.forEach(offer => {
                        stmt.run(offer);
                    });
                    
                    stmt.finalize((err) => {
                        if (err) {
                            reject(err);
                        } else {
                            console.log('Sample offers inserted successfully');
                            resolve();
                        }
                    });
                } else {
                    resolve();
                }
            });
        });
    });
}

// Export database connection and initialize function
module.exports = {
    db,
    initialize
};
