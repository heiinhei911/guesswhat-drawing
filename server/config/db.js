const mongoose = require("mongoose");
const config = require("dotenv").config();
const db = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
    });
    console.log('MongoDB is connected to "draw"');
  } catch (err) {
    console.error(`MongoDB Error: ${err.message}`);
  }
};

module.exports = connectDB;
