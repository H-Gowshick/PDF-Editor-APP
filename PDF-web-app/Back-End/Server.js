const express = require("express"); 
const ConnectionDB = require("./Connection/Connection"); 
const bodyParser = require("body-parser"); 
const UserRoutes = require("./Routes/User_Routes"); 
const cors = require("cors"); 
const cookieParser = require("cookie-parser"); 
const PdfRoutes = require("./Routes/PDF_Routes"); 
const path = require("path"); 

// env configuration
require("dotenv").config(); 

// initialize port
const PORT = process.env.PORT || 5000; 

// declare express as app
const app = express(); 

// Use cors middleware to enable CORS
app.use(
  cors({
    origin: ["http://localhost:3000"], 
    methods: ["GET", "POST", "PUT", "DELETE"], 
    credentials: true,
  })
);

// cookie parser
app.use(cookieParser()); 

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true })); 

// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json()); 

// connect MongoDb
ConnectionDB(); 

// use user routes
app.use("/api/user", UserRoutes); 

app.use("/api", PdfRoutes); // define PDF routes

app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // serve static files from 'uploads' directory

// port listen
app.listen(PORT, (error) => { 
  if (error) {
    console.log(`server connection error in port ${PORT}`); 
  }
  console.log(`server successfully connected in the port ${PORT}`); 
});
