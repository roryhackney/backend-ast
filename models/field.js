import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const FieldSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 200
    },
    inputType: {
        type: String,
        required: true,
        default: "text",
        enum: ["text", "number", "color", "image", "select"]
    },
    previousValues: Map,
    selectOptions: [String], //for select
    min: Number, //for numbers
    max: Number,
    default: {
        type: Schema.Types.Union,
        of: [String, Number]
    }
});

const model = new mongoose.Model("Field", FieldSchema);
export default model;