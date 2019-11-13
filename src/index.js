const express = require('express');
const ApiProxy = require('./app/ApiProxy.js');
const StorageFactory = require('./storage/StorageFactory.js');
const winston = require('winston');

require('dotenv').config();

const app = express();
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'server.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({ format: winston.format.simple() }));
}

const proxy = new ApiProxy(process.env.API_URL, StorageFactory.createStorage(process.env.STORAGE_TYPE), logger);
logger.info('API proxy set up', { type: process.env.STORAGE_TYPE });

app.get('/*', async (req, res) => {
    try {
        const response = await proxy.get(req.originalUrl);

        res.type(response.type);
        res.status(response.code);
        res.send(response.ok ? response.body : response.message);
    } catch (e) {
        logger.error(e.message);
        res.status(500).send('Internal server error');
    }
});

app.listen(process.env.LISTEN_PORT,  () => {
    logger.info(`Server listening on port ${process.env.LISTEN_PORT}`);
});
