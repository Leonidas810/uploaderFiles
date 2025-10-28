const timestampsPlugin = require('./plugins/timestampsPlugin');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { v4: uuidv4 } = require('uuid');

/**
 * File schema representing uploaded files with versioning and metadata.
 * @typedef {Object} File
 * @property {string} id - Unique identifier for the file (UUID).
 * @property {string} key - Storage key or path for the file.
 * @property {string} originalName - Original name of the uploaded file.
 * @property {string} mimeType - MIME type of the file (e.g., "image/png").
 * @property {number} size - File size in bytes.
 * @property {string} type - File category/type (e.g., "image", "document").
 * @property {Array<Object>} versions - Array of file versions, each with its metadata.
 * @property {string} checksum - File checksum (e.g., MD5 or SHA256) for integrity checks.
 */
const fileSchema = new mongoose.Schema({
    id: {
        type: String,
        default: uuidv4,
        unique: true
    },
    key: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['profile_photo', 'document', 'report', 'other'],
        required: true
    },
    versions: {
        type: [
            {
                key: String,
                versionNumber: Number,
                size: Number,
                mimeType: String,
                checksum: String,
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        default: []
    },
    checksum: {
        type: String
    }
}, {
    toJSON: {
        transform: (doc, ret) => {
            ret.id = ret.id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

// Add plugins
fileSchema.plugin(timestampsPlugin);
fileSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('File', fileSchema);
