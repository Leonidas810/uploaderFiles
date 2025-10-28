const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const timestampsPlugin = require('./plugins/timestampsPlugin');
const mongoosePaginate = require('mongoose-paginate-v2');

const rolSchema = new mongoose.Schema({
    id: {
        type: String,
        default: uuidv4,
        unique: true
    },
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 30
    },
    key: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 30
    },
    level:{
        type: Number,
        required:true,
        max:10,
    },
    permissions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Permission'
        }
    ]
},
    {
        toJSON: {
            transform: (doc, ret) => {
                if (ret.permissions) {
                    ret.permissions = ret.permissions.filter(
                        key => !(key instanceof mongoose.Types.ObjectId)
                    );

                    if (ret.permissions.length === 0) {
                        delete ret.permissions;
                    }
                }
                ret.id = ret.id;
                delete ret._id;
                delete ret.__v;
            }
        }
    }
)
    .plugin(timestampsPlugin)
    .plugin(mongoosePaginate);

module.exports = mongoose.model('Rol', rolSchema);
