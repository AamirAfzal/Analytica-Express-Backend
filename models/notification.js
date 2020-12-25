const mongoose = require('mongoose');
const { REGULAR } = require('../MLHelper/constants');
const Schema = mongoose.Schema;




const NotificationSchema = new Schema({
    type: {
        required: true,
        type: Number,
        default: REGULAR,
    },
    domain: {
        required: true,
        type: Number,
    },
    message: {
        type: String,
    },
    occuredOn: {
        type: Date,
        required: true,
        default: Date.now,
    },
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    target: {
        type: Schema.Types.ObjectId,
        required: true,
    }

});

module.exports = mongoose.model("Notification",  NotificationSchema);