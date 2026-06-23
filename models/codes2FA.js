import validateInteger from "./helpers.js";
import mongoose from "./connect.js";

const Schema = mongoose.Schema;


const Code2FASchema = new Schema({
    code: {
        type: Number,
        required: true,
        min: 100000,
        max: 999999,
        validate: validateInteger
    },
    timestamp: {
        type: Number,
        required: true,
        min: 0,
        validate: validateInteger
    }
});

const model = mongoose.model("Codes2FA", Code2FASchema);
export default model;