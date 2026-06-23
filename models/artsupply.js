import mongoose from 'mongoose';
import { validateInteger } from './helpers';

const Schema = mongoose.Schema;
const ArtSupplySchema = new Schema({
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
    },
    type: {
        type: Schema.Types.ObjectId,
        ref: "Type",
        required: true
    },
    location: {
        type: Schema.Types.ObjectId,
        ref: "Location",
        required: true
    },
    brand: {
        type: Schema.Types.ObjectId,
        ref: "Brand",
    },
    itemImagePath: String,
    demoImagePath: String,
    quality: {
        type: Number,
        min: 1,
        max: 5,
        validator: validateInteger
    },
    quantity: {
        type: Number,
        min: 0,
        max: 100,
        required: true,
        validate: validateIntegers
    },
    onWishlist: {
        type: Boolean,
        required: true,
        default: false
    }
});

const model = new mongoose.Model("ArtSupply", ArtSupplySchema);
export default model;