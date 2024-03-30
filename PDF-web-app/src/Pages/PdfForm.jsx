// PdfForm.js
import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import axios from "axios";

const PdfForm = ({ userEmail, onSuccess, onClose ,fetchPdfFiles}) => {
  const [pdfFileName, setPdfFileName] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setPdfFile(file);
    const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
    setPdfFileName(fileNameWithoutExtension);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!pdfFile || !pdfFile.type.includes("pdf")) {
      setErrorMessage("Please upload a PDF type file.");
      return;
    }

    const userId = localStorage.getItem("userId");

    // New code for storing the PDF
    const formData = new FormData();
    formData.append("pdfFile", pdfFile);
    formData.append("userId", userId); // Send userId along with PDF data

    try {
      const response = await axios.post(
        "http://localhost:5000/api/pdfs",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("PDF upload successful:", response.data);
      // Handle successful upload (e.g., display a message)
      setSuccessMessage("PDF uploaded successfully!");
      fetchPdfFiles(userId);
      setPdfFile(null);
      setErrorMessage("");
 
    } catch (error) {
      console.error("Error uploading PDF:", error);
      // Handle upload errors (e.g., display an error message)
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="mt-5 p-4 shadow">
      {successMessage && (
        <Alert variant="success" className="mt-3">
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert variant="danger" className="mt-3">
          {errorMessage}
        </Alert>
      )}
      <Form.Group controlId="pdfFileName">
        <Form.Label className="fw-bold">PDF File Name:</Form.Label>
        <Form.Control
          type="text"
          value={pdfFileName}
          onChange={(e) => setPdfFileName(e.target.value)}
          readOnly
        />
      </Form.Group>
      <Form.Group controlId="pdfFile" className="mt-4">
        <Form.Label className="fw-bold">Choose PDF File:</Form.Label>
        <Form.Control
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
        />
      </Form.Group>
      <div className="d-flex justify-content-evenly  mt-4">
        <Button variant="primary" type="submit">
          Upload
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </Form>
  );
};

export default PdfForm;
