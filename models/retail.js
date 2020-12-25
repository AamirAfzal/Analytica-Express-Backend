const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RetailSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
    },

    location: {
        lat: {
            required: true,
            type: String,
        },
        long: {
            required: true,
            type: String,
        }
    },
    shelves: [
        {
            sensor: {
                type: Schema.Types.ObjectId,
                ref: "Sensor",
                required: true,
            },
            weight: {
                type: Number,
                required: true,
            }
        },
    ],

    device: {
        type: mongoose.Types.ObjectId,
        ref: 'Device',
        required: true,
    }
});

module.exports = mongoose.model("Retail",RetailSchema);
