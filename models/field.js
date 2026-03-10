import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const FieldSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 200
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxLength: 300
    },
    isRequired: {
        type: Boolean,
        required: true,
        default: false
    },
    inputType: {
        type: String,
        required: true,
        default: "text",
        enum: ["text", "number", "color", "image", "radio", "checkboxes"]
    },
    options: [String], //for checkboxes/radios
    regex: String, //for text, etc
    min: Number, //for numbers
    max: Number,
    step: Number,
});

const model = new mongoose.Model("Field", FieldSchema);
export default model;