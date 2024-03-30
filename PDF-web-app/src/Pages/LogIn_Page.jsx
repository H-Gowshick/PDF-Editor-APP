import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";

const LoginForm = () => {
  const navigate = useNavigate(); // Hook for navigation
  const [email, setEmail] = useState(""); // State for email input
  const [password, setPassword] = useState(""); // State for password input
  const [error, setError] = useState(""); // State for error messages
  const [cookies, setCookie] = useCookies(["token"]); // Hook for managing cookies

  // Function to send login request to the server
  const login = async (email, password) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/user/login",
        { email, password }
      );
      return response.data; // Return response data from the server
    } catch (error) {
      throw error; // Throw error if request fails
    }
  };

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    if (!email || !password) {
      setError("Please fill in all fields."); // Set error if email or password is empty
      return;
    }

    try {
      // Response data from the login request
      const { token, userId } = await login(email, password);
      console.log("User logged in successfully");

      // Store the token and user ID in the browser's cookie storage
      setCookie("token", token, { path: "/" });

      // Store the user ID in local storage
      localStorage.setItem("userId", userId);

      // Navigate to PDF page upon successful login
      navigate("/pdf"); // Redirect to PDF page
    } catch (err) {
      console.error("Error logging in:", err);
      setError("Invalid email or password. Please try again."); // Set error message
    }
  };

  return (
    <>
      <h2 className="fw-bold fs-1 mb-5">PDF WEB APP</h2>

      {/* Login form */}
      <Form onSubmit={handleSubmit} className="border rounded p-4 ">
        <h4 className="text-center fw-bold mb-4 fs-2">LOGIN</h4>
        {error && <Alert variant="danger">{error}</Alert>} {/* Display error message */}
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
        {/* Submit button */}
        <Button variant="primary" type="submit" className="mt-4">
          Login
        </Button>
        {/* Link to the sign-up page */}
        <p className="mt-3">
          Not registered yet?{" "}
          <Link to="/" className="text-decoration-none">
            Sign up here
          </Link>
        </p>
      </Form>
    </>
  );
};

export default LoginForm;
