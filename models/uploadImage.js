const mongoose = require('mongoose');
const ImageSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true,
    },
    type:{
        type: String,
        required: true,
    },
    image: {
        type: Buffer,
        required: true,
    }
});
module.exports = mongoose.model("Image",ImageSchema);