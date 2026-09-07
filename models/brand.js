import mongoose from "./connect.js";

const Schema = mongoose.Schema;

const BrandSchema = new Schema({
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

const model = mongoose.model("Brand", BrandSchema);

export default model;