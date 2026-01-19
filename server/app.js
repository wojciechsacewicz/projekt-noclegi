const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./database');

// ten plik odpala backend czyli serwer api i pliki statyczne
// tutaj tez spinamy routing i start bazy sqlite

// tu wczytujemy trasy czyli osobne pliki z endpointami
const offersRoutes = require('./routes/offers');
const bookingsRoutes = require('./routes/bookings');

// express
const app = express();
const PORT = process.env.PORT || 3000;

// funkcje ktore robia cos przed obsluga tras
// cors pozwala na requesty z przegladarki
app.use(cors());
// json zamienia body na obiekt w req body
app.use(bodyParser.json());
// urlencoded pozwala wyslac formy
app.use(bodyParser.urlencoded({ extended: true }));

// tu serwujemy pliki z public czyli html css js
app.use(express.static(path.join(__dirname, '../public')));

// tu podpina sie api pod wspolna sciezke
app.use('/api/offers', offersRoutes);
app.use('/api/bookings', bookingsRoutes);

// tu jest glowna strona z wyszukiwarka
app.get('/', (req, res) => {
    // tu od razu wysylamy index html
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// na start robimy init bazy a dopiero potem odpalamy serwer
db.initialize()
    .then(() => {
        // dopiero jak baza jest gotowa to robimy listen
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        // jak init bazy padnie to wypisujemy blad i konczymy proces
        console.error('Failed to initialize database:', error);
        process.exit(1);
    });

// eksportujemy app zeby dalo sie testowac lub importowac
module.exports = app;
