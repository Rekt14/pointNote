// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000; // Usa la porta fornita da Render o 3000

// --- CONFIGURAZIONE DATABASE ---
// SOSTITUISCI CON LA TUA STRINGA DI CONNESSIONE DI MONGODB
const MONGODB_URI = "TUA_STRINGA_DI_CONNESSIONE_MONGODB"; 

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connesso a MongoDB!'))
    .catch(err => console.error('❌ Errore di connessione a DB:', err));
    
// --- MIDDLEWARE ---
// Abilita CORS per permettere al tuo frontend di fare richieste
app.use(cors()); 
// Parsa il body delle richieste in formato JSON
app.use(express.json());

// --- ROUTES ---
// L'endpoint per il salvataggio verrà aggiunto al Passo 3

app.get('/', (req, res) => {
    res.send('PointNote Backend attivo!');
});

// Avvio del Server
app.listen(PORT, () => {
    console.log(`Server avviato sulla porta ${PORT}`);
});