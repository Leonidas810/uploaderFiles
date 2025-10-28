const cors = require('cors');
require('dotenv').config();

const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
    credentials: true,
};

module.exports = cors(corsOptions);
