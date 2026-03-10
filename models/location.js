import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxLength: 200,
        trim: true
    },
    description: {
        type: String,
        required: true,
        maxLength: 300,
        trim: true
    }
});

const model = mongoose.model("Location", LocationSchema);

export default model;