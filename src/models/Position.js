const timestampsPlugin = require('./plugins/timestampsPlugin');
const mongoosePaginate = require('mongoose-paginate-v2')
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const PositionSchema = new mongoose.Schema({
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
    area: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Area',
        require: true,
    },
    level: {
        type: String,
        require: true
    },
    status: {
        type: Boolean,
        require: true,
        default: true,
    }
},
    {
        toJSON: {
            transform: (doc, ret) => {
                if (ret.area instanceof mongoose.Types.ObjectId) {
                    delete ret.area;
                }
                if (ret.area?.id) {
                    ret.areaId = ret.area.id;
                }
                ret.id = ret.id;
                delete ret._id;
                delete ret.__v;
            }
        }
    }).plugin(timestampsPlugin).plugin(mongoosePaginate);

module.exports = mongoose.model('Position', PositionSchema)