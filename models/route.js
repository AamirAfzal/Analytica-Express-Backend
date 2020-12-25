const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RouteSchema = new Schema({
    from: {
        required: true,
        type: String,
    },
    to: {
        required: true,
        type: String,
    },
    name: {
        required: true,
        type: String,
    },
    averageShockValue: {
        required: true,
        type: Number,
    },
    user: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: "User",
    }
});

module.exports = mongoose.model("Route",RouteSchema);
