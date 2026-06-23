import validateInteger from "./helpers.js";
import mongoose from "./connect.js";

const Schema = mongoose.Schema;


const SessionSchema = new Schema({
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Number,
        required: true,
        min: 0,
        validate: validateInteger
    },
    expiresAt: {
        type: Number,
        required: true,
        min: 0,
        validate: validateInteger
    },
    address: {
        type: String,
        required: true
    }
});

const model = mongoose.model("Session", SessionSchema);
export default model;