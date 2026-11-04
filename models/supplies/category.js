import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const Category = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
});

const model = mongoose.model("Category", Category);

export default model;