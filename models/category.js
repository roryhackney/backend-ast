import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
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

const model = mongoose.model("Category", CategorySchema);

export default model;