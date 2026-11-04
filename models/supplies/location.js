import mongoose from 'mongoose';

const Location = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
});

const model = mongoose.model("Location", Location);

export default model;