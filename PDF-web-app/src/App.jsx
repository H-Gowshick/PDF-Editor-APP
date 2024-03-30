import "./App.css";
import SignUpPage from "./Pages/SignUp_Page";
import LogInPage from "./Pages/LogIn_Page";
import PdfPage from "./Pages/Pdf_Page";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SignUpPage />} />
          <Route path="/login" element={<LogInPage />} />
          <Route path="/Pdf" element={<PdfPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
