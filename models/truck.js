const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TruckSchema = new Schema({
    name: {
        required: true,
        type: String,
    },
    from : {
        required: true,
        type: String,
    },
    to: {
        required: true,
        type: String,
    },
    departTime: {
        required: true,
        type: String,
    },
    arrivalTime: {
        required: true,
        type: String,
    },
    temperatureThreshold : {
        required: true,
        type: Number,
    },
    humidityThreshold: {
        required: true,
        type: Number,
    },
    route :{
        required: true,
        type: Schema.Types.ObjectId,
        ref: "Route"
    },
    device: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: "Device"
    },
    user: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: "User",
    }
});

module.exports =  mongoose.model("Truck",TruckSchema);