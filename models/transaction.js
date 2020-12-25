const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
    time: {
        type: Date,
        required: true,
        default: Date.now,
    },
    items: [
        {
            name: {
                required: true,
                type: String,
            },
            quantity: {
                required: true,
                type: Number,
            },
        }
    ],
    amount: {
        type: Number,
        required: true
    },
    store: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Retail",
    },

});

module.exports = mongoose.model("Transaction",TransactionSchema);