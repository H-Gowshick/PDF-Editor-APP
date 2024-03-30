const Pdf = require("../Models/Pdf_Model"); 
const express = require("express"); 
const router = express.Router(); 
const multer = require("multer");
const path = require("path"); 
const fs = require("fs"); 
const { PDFDocument } = require("pdf-lib"); 
const os = require('os'); 

// configure multer for PDF uploads with a dynamic filename
const storage = multer.diskStorage({
  destination: path.join(__dirname, "../uploads"), //path to uploads directory
  filename: (req, file, cb) => { 
    cb(
      null,
      path.extname(file.originalname) === ".pdf" // check if file extension is pdf
        ? file.originalname
        : `${file.originalname}.pdf`
    );
  },
});
const upload = multer({ storage }); 

// API endpoint for PDF upload
router.post("/pdfs", upload.single("pdfFile"), async (req, res) => {
  try {
    const { file, body } = req; 
    const { userId } = body;
    const filePath = path.join(__dirname, "../uploads", file.filename);
    const newPdf = new Pdf({
      fileName: file.originalname,
      fileSize: file.size,
      userId: userId,
      filePath: filePath, 
    });
    // save the PDF document to the database
    const savedPdf = await newPdf.save();
    res.json({ message: "PDF uploaded successfully!", pdfId: savedPdf._id }); 
  } catch (error) {
    console.error("Error uploading PDF:", error);
    res.status(500).json({ message: "Error uploading PDF" }); 
  }
});

// endpoint to get PDF filenames by user ID
router.get("/pdfs/:userId", async (req, res) => { 
  try {
    const userId = req.params.userId;
    const pdfs = await Pdf.find({ userId }); 
    const filenames = pdfs.map((pdf) => pdf.fileName); 
    res.json({ filenames }); // send filenames as response
  } catch (error) {
    console.error("Error fetching PDF filenames:", error);
    res.status(500).json({ error: "Internal Server Error" }); 
  }
});

// define a route to fetch the count of pages for a PDF file
router.get("/pdfs/pages/:filename", async (req, res) => { 
  const { filename } = req.params;
  const filePath = path.join(__dirname, "..", "uploads", filename); // construct file path
  try {
    const pdfBuffer = fs.readFileSync(filePath); // read PDF file
    const pdfDoc = await PDFDocument.load(pdfBuffer); // load PDF document
    const pageCount = pdfDoc.getPageCount(); // get page count
    res.json({ pageCount });
  } catch (error) {
    console.error("Error reading PDF file:", error); 
    res.status(500).json({ error: "Failed to read PDF file" }); 
  }
});

// handle POST request for downloading selected pages of a PDF
router.post('/pdfs/download', async (req, res) => {
  const { filename, pages } = req.body; 
  const filePath = `C:/Users/gowsh/Desktop/PDF READER WEB APP/PDF-web-app/Back-End/uploads/${filename}`; // construct file path
  try {
    const pdfDoc = await PDFDocument.load(fs.readFileSync(filePath)); // load PDF document
    const newPdf = await PDFDocument.create(); // create new PDF document
    for (const pageNumber of pages) {
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNumber - 1]); // copy selected pages
      newPdf.addPage(copiedPage); 
    }
    const pdfBytes = await newPdf.save(); 
    const downloadPath = `${os.homedir()}/Downloads/${filename}_selected_pages.pdf`; // set download path
    fs.writeFileSync(downloadPath, pdfBytes); 
    res.setHeader('Content-Type', 'application/pdf'); 
    res.download(downloadPath, `${filename}_selected_pages.pdf`, () => {
      fs.unlinkSync(downloadPath); // delete downloaded file
    });
  } catch (error) {
    console.error('Error generating selected pages PDF:', error);
    res.status(500).json({ error: 'Failed to generate selected pages PDF' }); 
  }
});

module.exports = router; 
