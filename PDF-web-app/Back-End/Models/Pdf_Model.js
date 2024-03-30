const mongoose = require("mongoose");

const PdfSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  fileName: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
  },
  filePath: { 
    type: String,
    required: true,
  },
});

const Pdf = mongoose.model("Pdf", PdfSchema);

module.exports = Pdf;
