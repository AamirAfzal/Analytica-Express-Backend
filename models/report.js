const mongoose = require('mongoose');
const ReportSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    reportItems: [
        {
            device: {
                type: String,
                required: true,
            },
            sensor: {
                type: String,
                required: true,
            },
            type: {
                required: true,
                type: String,
            }
        }
    ],
    time: {
        type: String,
        required: true,
    },
    user :{
        type: mongoose.Schema.Types.ObjectId,
        required: true, 
        ref: "User",
    },
    type: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    lastReportedAt: {
        type: Date,
        required:true,
        default: Date.now,
    }
    

});

module.exports =mongoose.model("Report",ReportSchema);