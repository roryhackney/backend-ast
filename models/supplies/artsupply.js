import mongoose from 'mongoose';
import { validateInteger } from '../helpers';

const Schema = mongoose.Schema;
const ArtSupplySchema = new Schema({
    name: {
        type: String,
        required: true,
        maxLength: 200,
        trim: true
    },
    fields: [{
        type: Schema.Types.ObjectId,
        ref: "Field"
        //location, brand, line, quality, quantity, onWishlist, onHatelist, category - all supplies
        //color, material, size, tip type, ......, demoImage, itemImage - depends on ArtSupply
    }]
});

const model = new mongoose.Model("ArtSupply", ArtSupplySchema);
export default model;