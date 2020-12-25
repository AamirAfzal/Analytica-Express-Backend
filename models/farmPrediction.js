const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const FarmPredictionSchema =new Schema({
    farm: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: "Farm",
    },
    predictedOn: {
        required: true,
        type: Date,
        default: Date.now,
    },
    prediction: [
        {
            required: true,
            type: String,
        }
    ],
    predictionType: {
        type: Number,
        max: 3,
        min: 0,
        required: true,
    }
});

module.exports = mongoose.model("FarmPrediction",FarmPredictionSchema);