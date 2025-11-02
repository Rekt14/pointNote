// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// --- CONFIGURAZIONE MONGODB E MODELLO ---

// SOSTITUISCI CON LA TUA STRINGA DI CONNESSIONE DI MONGODB
const MONGODB_URI = process.env.MONGODB_URI || "TUA_STRINGA_DI_CONNESSIONE_MONGODB"; 

// 1. Definizione dello Schema (integrato qui)
const gameScoreSchema = new mongoose.Schema({
    timestamp: { 
        type: Date, 
        default: Date.now,
        required: true
    },
    finalScores: {
        type: [
            {
                name: { type: String, required: true },
                score: { type: Number, required: true }
            }
        ],
        required: true
    }
}, { collection: 'PointNote' }); 

// 2. Creazione del Modello (integrato qui)
const GameScore = mongoose.model('PointNoteModel', gameScoreSchema);

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connesso a MongoDB!'))
    .catch(err => console.error('❌ Errore di connessione a DB:', err));
    
// --- MIDDLEWARE ---
// Permette al frontend di fare richieste cross-origin
app.use(cors()); 
// Parsa il body JSON
app.use(express.json());

// --- ROUTES ---

// Endpoint di test
app.get('/', (req, res) => {
    res.send('PointNote Backend attivo!');
});

// Endpoint POST per salvare il punteggio finale
app.post('/api/scores', async (req, res) => {
    try {
        const { finalScores } = req.body; 

        if (!finalScores || !Array.isArray(finalScores) || finalScores.length === 0) {
            return res.status(400).send({ message: 'Dati punteggio non validi.' });
        }

        // 1. Salva il nuovo punteggio
        const newScore = new GameScore({ finalScores });
        await newScore.save();

        // 2. Logica per mantenere solo gli ultimi 5 record
        const MAX_RECORDS = 10;
        const count = await GameScore.countDocuments();

        if (count > MAX_RECORDS) {
            // Trova il record con il 'timestamp' più vecchio (sort: 1)
            const oldestScore = await GameScore.findOne().sort({ timestamp: 1 }); 
            if (oldestScore) {
                await GameScore.deleteOne({ _id: oldestScore._id });
                console.log(`Record più vecchio eliminato: ${oldestScore._id}`);
            }
        }

        res.status(201).send({ message: 'Punteggio salvato con successo e limite mantenuto.' });

    } catch (error) {
        console.error('❌ Errore nel salvataggio del punteggio:', error);
        res.status(500).send({ message: 'Errore interno del server.' });
    }
});

// ====================================================================
// Endpoint GET per recuperare gli ultimi 5 punteggi salvati
// ====================================================================

app.get('/api/scores', async (req, res) => {
    try {
        // Trova i 5 record più recenti (sort: -1 = decrescente per timestamp)
        const recentScores = await GameScore.find({})
            .sort({ timestamp: -1 }) 
            .limit(5); 

        // Invia i record al frontend
        res.status(200).json(recentScores);

    } catch (error) {
        console.error('❌ Errore nel recupero dei punteggi:', error);
        res.status(500).send({ message: 'Errore interno del server nel recupero dati.' });
    }
});

// Avvio del Server
app.listen(PORT, () => {
    console.log(`Server avviato sulla porta ${PORT}`);
});


