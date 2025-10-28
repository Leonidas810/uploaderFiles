const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
require('dotenv').config();

//Database connection 
const connectDB = require('./src/config/database');
//Cors
const corsMiddleware = require('./src/config/cors');

const app = express();
app.use(corsMiddleware);
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//database connection
connectDB();

//Depends
require("./src/models")

//<--Middleware-->
const authMiddleware = require('./src/middleware/authMiddleware');

//import routes
const profileImgRoutes = require('./src/routes/profileImg');

app.use('/api/upload', authMiddleware, profileImgRoutes);

//start server
if (process.env.NODE_ENV !== "test") {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
module.exports = app;