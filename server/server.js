const express = require('express');
const path = require('path');
const axios = require('axios');
const os = require('os');

const app = express();
const port = 3000;

let poids = [];
let temps = [];
let startTime = null;
let titre = 0;

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

const axiosInstance = axios.create({
    timeout: 20000,
});

app.get('/start_send', (req, res) => {
    res.json(titre);
  })

app.get('/start_receiv', (req, res) => {
    titre = req.query.text;
    console.log(titre);
    if (titre == 1) {
        poids = [];
        temps = [];
        startTime = Date.now();
    }
    res.send('Commande reçue');
});

app.get('/start', async (req, res) => {
    try {
        await axiosInstance.get('http://192.168.4.1/start');
        startTime = Date.now();
        res.send('Message envoyé');
    } catch (error) {
        res.status(500).send('Erreur d\'envoi du message');
    }
});

app.get('/start_test', async (req, res) => {
    try {
        await axiosInstance.get('http://192.168.4.1/start_test');
        res.send('Message envoyé');
    }
    catch (error){
        res.status(500).send('erreur du test');
    }
})

app.get('/poids', async (req, res) => {
    try {
        const response = await axiosInstance.get('http://192.168.4.1/poids');
        let pound = response.data;
        
        let elapsedMinutes = 0;
        if (startTime) {
            const currentTime = Date.now();
            elapsedMinutes = Math.floor((currentTime - startTime) / 1000);
            console.log(temps);
        }
        if (poids[poids.length - 1] != pound){
            poids.push(pound);
            temps.push(elapsedMinutes);
        }

        res.json({ poids, temps });
    } catch (error) {
        console.error('Erreur lors de la récupération du poids:', error);
        res.status(500).send('Erreur lors de la récupération du poids');
    }
});

function getLocalIp() {
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
        const interfaces = networkInterfaces[interfaceName];
        for (const iface of interfaces) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

app.listen(port, () => {
    const localIp = getLocalIp();
    console.log(`Serveur Node.js en écoute sur http://localhost:${port}`);
    console.log(`Serveur Node.js lancé à http://${localIp}:${port}`);
});