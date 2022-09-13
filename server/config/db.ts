import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();
const db = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    if (db) await mongoose.connect(db);
    console.log('MongoDB is connected to "draw"');
  } catch (err) {
    if (err instanceof Error) {
      console.error(`MongoDB Error: ${err.message}`);
    } else {
      console.error("Unexpected error:", err);
    }
  }
};

export default connectDB;
