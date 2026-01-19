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
app.use(bodyParser.json());

// urlencoded pozwala wyslac formy
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/offers', offersRoutes);
app.use('/api/bookings', bookingsRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

db.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    });

module.exports = app;
