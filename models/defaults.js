import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const DefaultsSchema = new Schema({
    brand: {
        type: Schema.Types.ObjectId,
        ref: "Brand",
    },
    type: {
        type: Schema.Types.ObjectId,
        ref: "Type",
        required: true,
    },
    description: {
        type: String,
        required: true,
        maxLength: 300,
        trim: true,
    },
    location: {
        type: Schema.Types.ObjectId,
        ref: "Location",
        required: true,
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
    fields: [{
        field: {type: Schema.Types.ObjectId, ref: "Field"},
        value: {type: Schema.Types.Union, of: [String, Number, [String]]}
    }]
});

export default new mongoose.Model("Defaults", DefaultsSchema);
