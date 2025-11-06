const mongoosePaginate = require('mongoose-paginate-v2')
const timestampsPlugin = require('./plugins/timestampsPlugin');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');


const userSchema = new mongoose.Schema({
    id: {
        type: String,
        default: uuidv4,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 30,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    position: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Position',
        require: true
    },
    tel: {
        type: String,
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rol',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    last_name2: {
        type: String,
    },
    status: {
        type: Boolean,
        require: true
    },
    profileImg: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
    }
}, {
    toJSON: {
        transform: (doc, ret) => {
            if (ret.role instanceof mongoose.Types.ObjectId) {
                delete ret.role;
            }
            if (ret.role?.id) {
                ret.roleId = ret.role.id;
            }
            if (ret.position instanceof mongoose.Types.ObjectId) {
                delete ret.position;
            }
            if (ret.position?.id) {
                ret.positionId = ret.position.id;
            }
            if(ret.profileImg instanceof mongoose.Types.ObjectId){
                delete ret.profileUrl;
            }
            if (ret.profileImg?.id) {
                ret.profileImgId = ret.profileImg.id;
            }
            ret.fullName = `${ret?.name ?? ""} ${ret?.last_name ?? ""} ${ret?.last_name2 ?? ""}`
            delete ret.password;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
}).plugin(timestampsPlugin).plugin(mongoosePaginate);

module.exports = mongoose.model('User', userSchema);