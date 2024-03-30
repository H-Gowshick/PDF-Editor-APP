import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button, Table, Form } from "react-bootstrap";
import PdfForm from "./PdfForm";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

function Pdf_Page() {
  axios.defaults.withCredentials = true; //axios to send credentials with requests
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [pdfFiles, setPdfFiles] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [pdfPageCounts, setPdfPageCounts] = useState({});
  const [selectedPages, setSelectedPages] = useState({});
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId"); // get userId from localStorage
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/,
      "$1"
    ); // extract token from cookies

    if (!token) {
      navigate("/login"); // redirect to login if token is not present
      return;
    }
    verifyToken(token) // verify token
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
    if (userId) {
      fetchUserEmail(userId); // fetch user email
      fetchPdfFiles(userId); // fetch PDF files
    }
  }, [navigate]);

  // function to verify token
  const verifyToken = async (token) => {
    try {
      await axios.get("http://localhost:5000/api/user/verifyToken", {
        // send GET request to verify token
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        navigate("/login"); // redirect to login on token verification failure
      } else {
        console.error("Error verifying token:", error);
      }
      setLoading(false);
    }
  };

  // function to fetch user email
  const fetchUserEmail = async (userId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/user/email/${userId}`
      ); // send GET request to fetch user email
      setUserEmail(getEmailWithoutSpecialChars(res.data.email.toUpperCase())); // set userEmail state
    } catch (error) {
      console.error("Error fetching user email:", error);
    }
  };

  // function to get email without special characters
  const getEmailWithoutSpecialChars = (email) => {
    const index = email.search(/[^a-zA-Z0-9._-]/);
    if (index !== -1) {
      return email.substring(0, index);
    }
    return email;
  };

  // function to fetch PDF files
  const fetchPdfFiles = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/pdfs/${userId}`); // send GET request to fetch PDF files
      if (res.data.filenames.length === 0) {
        setShowTable(false);
      } else {
        setShowTable(true);
        setPdfFiles(res.data.filenames);
        // fetch page counts for each PDF file
        const pageCounts = {};
        for (const filename of res.data.filenames) {
          const count = await fetchPageCount(filename); // fetch page count for each PDF file
          pageCounts[filename] = count;
        }
        setPdfPageCounts(pageCounts);
      }
    } catch (error) {
      console.error("Error fetching PDF filenames:", error);
    }
  };

  // function to fetch page count for a PDF file
  const fetchPageCount = async (filename) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/pdfs/pages/${filename}`
      ); // send GET request to fetch page count
      return res.data.pageCount;
    } catch (error) {
      console.error(`Error fetching page count for ${filename}:`, error);
      return 0;
    }
  };

  const handleCloseForm = () => {
    // function to close upload form
    setShowUploadForm(false);
  };

  const handleOpenForm = () => {
    // function to open upload form
    setShowUploadForm(true);
  };

  const handleOpenPDF = (filename) => {
    // function to open selected PDF
    setSelectedPdf(filename);
  };

  const handleClosePDF = () => {
    // function to close selected PDF
    setSelectedPdf(null);
  };

  const handleCheckboxChange = (pageNumber, isChecked) => {
    // function to handle checkbox change
    setSelectedPages((prevState) => ({
      ...prevState,
      [pageNumber]: isChecked,
    }));
  };

  // function to handle download of selected pages
  const handleDownloadSelectedPages = async () => {
    const selectedPagesArray = Object.entries(selectedPages) // convert selectedPages object to array
      .filter(([isChecked]) => isChecked) // filter checked pages
      .map(([pageNumber]) => parseInt(pageNumber));
    if (selectedPagesArray.length === 0) {
      // check if no pages selected
      alert("Please select at least one page to download.");
      return;
    }
    try {
      const res = await axios.post(
        // send POST request to download selected pages
        "http://localhost:5000/api/pdfs/download",
        {
          filename: selectedPdf,
          pages: selectedPagesArray,
        },
        {
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([res.data])); // create object URL for blob
      const link = document.createElement("a");
      link.href = url; // set href attribute
      link.setAttribute("download", `${selectedPdf}_selected_pages.pdf`); // set download attribute
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error downloading selected pages:", error);
    }
  };

  // function to handle logout
  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("userId");
    navigate("/login");
  };

  if (loading) return <div>Loading...</div>; // show loading indicator

  return (
    <>
      <h3>WELCOME {userEmail}!</h3>
      <Button onClick={handleOpenForm} className="bg-dark border-none mt-4">
        Upload PDF
      </Button>
      <Button
        onClick={handleLogout}
        className="bg-danger border-none mt-4 ms-2 ms-5"
      >
        Logout
      </Button>

      {/* show upload form if showUploadForm is true */}
      {showUploadForm && (
        <PdfForm
          userEmail={userEmail}
          onClose={handleCloseForm}
          fetchPdfFiles={fetchPdfFiles}
        />
      )}

      {/* show table if showTable is true */}
      {showTable && (
        <Table striped bordered hover className="mt-5">
          <thead>
            <tr>
              <th>#</th>
              <th>PDF File</th>
              <th>Page Count</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pdfFiles.map(
              (
                filename,
                index // map through pdfFiles array
              ) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{filename}</td>
                  <td>{pdfPageCounts[filename]}</td>
                  <td>
                    <Button
                      onClick={() => handleOpenPDF(filename)}
                      className="bg-dark border-none"
                    >
                      Open PDF
                    </Button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </Table>
      )}
      {/*show selected PDF if selectedPdf is not null */}
      {selectedPdf && (
        <div className="mt-5">
          <h4>Edit PDF: {selectedPdf}</h4>
          <h5 className="">Select pages to create a new file</h5>
          <Button
            onClick={handleClosePDF}
            className="bg-dark border-none mt-3 mb-5"
          >
            Close PDF
          </Button>{" "}
          {/* close PDF button */}
          {pdfPageCounts[selectedPdf] > 1 && ( // show page selection if page count is greater than 1
            <div
              className="mt-2"
              style={{ display: "flex", flexDirection: "column" }}
            >
              {Array.from(
                // generate checkboxes for each page
                { length: pdfPageCounts[selectedPdf] },
                (_, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <Form.Check
                        type="checkbox"
                        id={`page-${index + 1}`}
                        label={`Page ${index + 1}`}
                        checked={selectedPages[index + 1] || false}
                        onChange={(e) =>
                          handleCheckboxChange(index + 1, e.target.checked)
                        }
                      />
                    </div>
                    <div>
                      {index + 1} / {pdfPageCounts[selectedPdf]}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
          <Button
            onClick={handleDownloadSelectedPages}
            className="bg-dark border-none mb-5 mt-3"
            disabled={Object.values(selectedPages).every(
              (isChecked) => !isChecked
            )}
          >
            Download Selected Pages
          </Button>{" "}
          {/* download selected pages button */}
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
            <Viewer fileUrl={`http://localhost:5000/uploads/${selectedPdf}`} />
          </Worker>
        </div>
      )}
    </>
  );
}
export default Pdf_Page;
