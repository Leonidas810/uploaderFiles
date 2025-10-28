const mongoose = require('mongoose');

module.exports = function timestampsPlugin(schema, options) {
    schema.add({
        createdAt: {
            type: Date,
            default: Date.now
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        updatedAt: {
            type: Date,
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        deletedAt: {
            type: Date,
        },
        deletedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    });
};
