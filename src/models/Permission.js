const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const timestampsPlugin = require('./plugins/timestampsPlugin');
const mongoosePaginate = require('mongoose-paginate-v2');

const permissionSchema = new mongoose.Schema({
    id: {
        type: String,
        default: uuidv4,
        unique: true
    },
    name: { // Human readeable
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    key: { // Machine redeable
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 50
    },
    description: {
        type: String,
        maxlength: 200
    },
    resource: {
        type: String,
        required: true
    },
    action: { 
        type: String,
        required: true
    }
}, {
    toJSON: {
        transform: (doc, ret) => {
            ret.id = ret.id;
            delete ret._id;
            delete ret.__v;
        }
    }
})
    .plugin(timestampsPlugin)
    .plugin(mongoosePaginate);

module.exports = mongoose.model('Permission', permissionSchema);
