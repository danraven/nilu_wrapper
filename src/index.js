const express = require('express');
require('dotenv').config();

const app = express();

app.listen(process.env.LISTEN_PORT,  () => {
    console.log(`Server listening on port ${process.env.LISTEN_PORT}`);
});