const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@fullstackopen.wt8f6l3.mongodb.net/?retryWrites=true&w=majority&appName=fullStackOpen`;
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Mongo DB connected")
    } catch (err) {
        console.error('MongoDb connection error:', err);
        process.exit(1);
    }
}

module.exports = connectDB;