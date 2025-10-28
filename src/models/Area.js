const timestampsPlugin = require('./plugins/timestampsPlugin');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2')
const { v4: uuidv4 } = require('uuid');

const areaSchema = new mongoose.Schema({
    id: {
        type: String,
        default: uuidv4,
        unique: true
    },
    name: {
        type: String,
        require: true
    },
    status: {
        type: Boolean,
        require: true,
        default: true,
    }
}, {
    toJSON: {
        transform: (doc, ret) => {
            ret.id = ret.id;
            delete ret._id;
            delete ret.__v;
        }
    }
}).plugin(timestampsPlugin).plugin(mongoosePaginate);

module.exports = mongoose.model('Area', areaSchema);