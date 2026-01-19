const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// ten plik ogarnia polaczenie z sqlite i tworzy tabele

// tu mamy sciezke do pliku bazy
const DB_PATH = path.join(__dirname, '../database.db');

// tu tworzymy polaczenie do bazy
const db = new sqlite3.Database(DB_PATH, (err) => {
    // callback odpali sie jak sqlite otworzy plik
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// ta funkcja wklada przykladowe dane do tabel
function initialize() {
    return new Promise((resolve, reject) => {
        // serialize robi ze zapytania wykonuja sie po kolei
        db.serialize(() => {
            // tu sprawdzamy czy offers jest puste
            db.get('SELECT COUNT(*) as count FROM offers', (err, row) => {
                // jak jest blad to przerywamy
                if (err) {
                    reject(err);
                    return;
                }

                // jak nie ma rekordow to dodajemy przyklady
                if (row.count === 0) {
                    // te dane sa tylko na start zeby bylo co wyswietlac
                    const sampleOffers = [
                        ['Apartament w Centrum', 'Warszawa', 'Nowoczesny apartament w centrum miasta', 4, 250],
                        ['Domek nad Jeziorem', 'Mazury', 'Przytulny domek z widokiem na jezioro', 6, 350],
                        ['Górskie Schronisko', 'Zakopane', 'Komfortowe schronisko w Tatrach', 8, 200],
                        ['Willa nad Morzem', 'Gdańsk', 'Luksusowa willa 50m od plaży', 10, 500]
                    ];

                    // prepare jest szybsze jak robimy wiele insertow
                    const stmt = db.prepare('INSERT INTO offers (name, location, description, capacity, price) VALUES (?, ?, ?, ?, ?)');
                    
                    // lecimy po tablicy i wrzucamy rekord po rekordzie
                    sampleOffers.forEach(offer => {
                        stmt.run(offer);
                    });
                    
                    // finalize zamyka statement
                    stmt.finalize((err) => {
                        if (err) {
                            reject(err);
                        } else {
                            console.log('Sample offers inserted successfully');
                            // jak wszystko poszlo to resolve
                            resolve();
                        }
                    });
                } else {
                    // jak juz sa dane to nic nie robimy
                    resolve();
                }
            });
        });
    });
}

// eksportujemy db i initialize do reszty serwera
module.exports = {
    db,
    initialize
};
