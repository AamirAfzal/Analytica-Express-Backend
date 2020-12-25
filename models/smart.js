const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SmartSchema = new Schema({
    name: {
        required: true,
        type: String,
    },
    createdAt: {
        required: true,
        type: Date,
        default: Date.now,
    },
    location: {
        lat: {
            required: true,
            type: Number,
        },
        long: {
            required: true,
            type: Number,
        }
    },
    user: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "User",
    },
    device: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Device",
    }
});

module.exports = mongoose.model("Smart",SmartSchema);

