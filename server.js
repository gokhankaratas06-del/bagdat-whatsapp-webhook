const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Gelen JSON verilerini okuyabilmek için
app.use(express.json());

// Ana sayfa kontrolü (Sitenin çalıştığını görmek için)
app.get('/', (req, res) => {
    res.send('WhatsApp Webhook Sunucusu Aktif!');
});

// META DOĞRULAMA ROTASI (İşte burası eksik veya hatalıydı)
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const verifyToken = process.env.WEBHOOK_VERIFY_TOKEN || 'bagdat_verify_2026';

    if (mode && token) {
        if (mode === 'subscribe' && token === verifyToken) {
            console.log('WEBHOOK_VERIFIED');
            return res.status(200).send(challenge);
        } else {
            return res.sendStatus(403);
        }
    }
    return res.sendStatus(400);
});

// İleride mesajları almak için kullanılacak POST rotası
app.post('/webhook', (req, res) => {
    const body = req.body;
    console.log('Gelen Mesaj Verisi:', JSON.stringify(body, null, 2));
    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor...`);
});
