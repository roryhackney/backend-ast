//Had to add this for Mongoose to connect, for some reason
//https://medium.com/@nuwan.thuduwage/how-i-fixed-the-querysrv-econnrefused-mongodb-connection-error-in-node-js-08753a3ecac4
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

async function connectMongoose() {
    const mongoDB = process.env.DB;
    try {
        await mongoose.connect(mongoDB);
        mongoose.connection.on("error", (err) => {
            console.error("MongoDB connection error:", err);
        });
        mongoose.connection.on("disconnected", () => {
            console.warn("MongoDB disconnected");
        });
        return mongoose;
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
        process.exit(1);
    }
}

async function connect() {
    try {
        return await connectMongoose();
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
        process.exit(1);
    }
}

export default connect;