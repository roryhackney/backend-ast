import mongoose from "mongoose";
const Schema = mongoose.Schema;

const TypeSchema = new Schema({
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
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    fields: [{
        type: Schema.Types.ObjectId,
        ref: "Field"
    }]
});

const model = mongoose.model("Type", TypeSchema);

export default model;