import mongoose from 'mongoose';
import { validateInteger } from '../helpers';

const Schema = mongoose.Schema;
const ArtSupplySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category"
    },
    location: {
        type: Schema.Types.ObjectId,
        ref: "Location"
    },
    quality: {
        type: Number,
        min: 1,
        max: 5,
        validate: validateInteger,
        required: true
    },
    list: {
        type: String,
        enum: ["Love", "Hate", "Wish"]
    },
    fields: [{
        type: Schema.Types.ObjectId,
        ref: "Field"
    }]
});

const model = new mongoose.Model("ArtSupply", ArtSupplySchema);
export default model;