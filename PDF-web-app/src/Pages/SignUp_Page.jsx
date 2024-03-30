import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";

const SignUpForm = () => {
  // State variables for form fields, error messages, and success message
  const [email, setEmail] = useState("");//state for email input
  const [password, setPassword] = useState("");//state for password input
  const [confirmPassword, setConfirmPassword] = useState("");//state for confirm password input
  const [error, setError] = useState(""); // Error message state
  const [successMessage, setSuccessMessage] = useState(""); // Success message state

  // Function to send sign-up request to the server
  const signUp = async (email, password) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/user/signup",
        { email, password }
      );
      console.log("User signed up successfully:", response.data);
      setSuccessMessage("Sign up successful! You can now login."); // Set success message
    } catch (err) {
      console.error("Error signing up:", err);
      setError("Failed to sign up. Please try again later."); // Set error message
    }
  };

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    // Client-side validations
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields."); // Set error message if any field is empty
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match."); // Set error message if passwords don't match
      return;
    }

    signUp(email, password); // Call signUp function to send sign-up request
  };

  return (
    <>
      <h2 className="fw-bold fs-1 mb-5">PDF WEB APP</h2>

      {/* Sign-up form */}
      <Form onSubmit={handleSubmit} className="border rounded p-4 ">
        <h4 className="text-center fw-bold mb-4 fs-2">SIGN UP</h4>
        {/* Display success message if sign-up was successful */}
        {successMessage && (
          <Alert
            variant="success"
            onClose={() => setSuccessMessage("")}
            dismissible
          >
            {successMessage}
          </Alert>
        )}
        {/* Display error message if there's any error */}
        {error && <Alert variant="danger">{error}</Alert>}
        {/* Email input field */}
        <Form.Group controlId="formBasicEmail">
          <Form.Label className="fw-bold">Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        {/* Password input field */}
        <Form.Group controlId="formBasicPassword" className="mt-3">
          <Form.Label className="fw-bold">Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        {/* Confirm password input field */}
        <Form.Group controlId="formBasicConfirmPassword" className="mt-3">
          <Form.Label className="fw-bold">Confirm Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Form.Group>
        {/* Submit button */}
        <Button variant="primary" type="submit" className="mt-4">
          Sign Up
        </Button>
        {/* Link to the login page */}
        <p className="mt-3">
          Already registered?{" "}
          <Link to="/login" className="text-decoration-none">
            Login here
          </Link>
        </p>
      </Form>
    </>
  );
};

export default SignUpForm;
