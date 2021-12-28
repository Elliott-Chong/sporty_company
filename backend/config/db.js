const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

const connectDB = async () => {
  try {
    await mongoose.connect(db);
    console.log("MongoDB Connected...");
  } catch (error) {
    console.log("elle error", error);
    process.exit(1);
  }
};

module.exports = connectDB;