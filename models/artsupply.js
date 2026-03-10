import mongoose from 'mongoose';
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
        validate: {
            validator: function(val) {
                return Number.isInteger(val);
            },
            message: props => `${props.value} must be an integer 1-5.`
        }
    },
    quantity: {
        type: Number,
        min: 0,
        max: 100,
        required: true,
        validate: {
            validator: function(val) {
                return Number.isInteger(val);
            },
            message: props => `${props.value} must be an integer 0-100.`
        }
    },
    onWishlist: {
        type: Boolean,
        required: true,
        default: false
    }
});

const model = new mongoose.Model("ArtSupply", ArtSupplySchema);
export default model;