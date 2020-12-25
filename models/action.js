const mongoose = require('mongoose');
const ActionSchema = new mongoose.Schema({
    name: {
        required: false,
        type: String,
    },
    sensor: {
        required: true,
        type:mongoose.Schema.Types.ObjectId,
        ref:"Sensor",
    },
    condition: {
        type: String,
        required: true,
    },
    value: {
        type: Number,
        required: true,
    },
    action: {
        type: String,
        required: true
    },
    to: {
        type:String,
        required: true
    }
});
module.exports = mongoose.model("Action",ActionSchema);