import mongoose from "mongoose"
import { ENV } from "./env.js";

export const connectDB = async () => {
    try{
        //Check if link to db exists
        const {MONGO_URI} = ENV;
        if (!MONGO_URI) throw new Error("MONGO_URI is not set");

        const conn = await mongoose.connect(ENV.MONGO_URI);
        console.log("MONGODB CONNECTED: ", conn.connection.host);
    } catch (error) {
        console.log("Error connecting to MONGODB: ", error);
        process.exit(1); //0 status code means success 1 means fail
    }
}