const mongoose = require('mongoose');
const { stringify } = require('uuid');
const Schema = mongoose.Schema;

const FarmSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    latitude: {
        type: String,
        required: true,
    },
    longtitude: {
        type: String,
        required: true,
    },
    region: {
        type: String,
        required: true,
    },
    user :{
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "User",
    },
    device :{
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Device",
    }
});

module.exports =  mongoose.model("Farm",FarmSchema);