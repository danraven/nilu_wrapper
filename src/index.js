const express = require('express');
const ApiProxy = require('./app/ApiProxy.js');
const InMemoryStorage = require('./storage/InMemoryStorage.js');
const winston = require('winston');

require('dotenv').config();

const app = express();
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'server.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({ format: winston.format.simple() }));
}

const proxy = new ApiProxy('https://api.nilu.no', new InMemoryStorage(), logger);

app.get('/*', async (req, res) => {
    try {
        const response = await proxy.get(req.originalUrl);

        res.type(response.type);
        res.status(response.code);
        res.send(response.ok ? response.body : response.message);
    } catch (e) {
        logger.error(e.message);
        res.status(500).send(e.message);
    }
});

app.listen(process.env.LISTEN_PORT,  () => {
    logger.info(`Server listening on port ${process.env.LISTEN_PORT}`);
});