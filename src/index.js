const express = require('express');
const ApiProxy = require('./app/ApiProxy.js');
const InMemoryStorage = require('./storage/InMemoryStorage.js');

require('dotenv').config();

const app = express();
const proxy = new ApiProxy({
    apiUrl: 'https://api.nilu.no',
    storage: new InMemoryStorage()
});

app.get('/*', async (req, res) => {
    try {
        const response = await proxy.get(req.originalUrl);

        res.type(response.type);
        res.status(response.code);
        res.send(response.ok ? response.body : response.message);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

app.listen(process.env.LISTEN_PORT,  () => {
    console.log(`Server listening on port ${process.env.LISTEN_PORT}`);
});