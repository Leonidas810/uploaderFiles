const timestampsPlugin = require('./plugins/timestampsPlugin');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const CategorySchema = new mongoose.Schema({
    id: {
        type: String,
        default: uuidv4,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        minlength: 3,
    },
}, {
    toJSON: {
        transform: (doc,ret) => {
            delete ret.password;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
}).plugin(timestampsPlugin);

module.exports = mongoose.model('Category', CategorySchema)