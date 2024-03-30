// password: VMazAd3nnS8jROiV

const mongoose = require("mongoose");

// mongodb connection function
const ConnectionDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://gowshickh09102021:EvJzBgCRL28POS3Q@cluster0.rawckxl.mongodb.net/"
    );
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.log("MongoDB connection error", error);
    process.exit(1);
  }
};
module.exports = ConnectionDB;
