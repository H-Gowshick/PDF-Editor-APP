const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  // Get token from request headers or cookies
  const token = req.headers.authorization?.split(" ")[1] || req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Token is missing" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.SECURITY_KEY || "fallback_value");
    req.userId = decoded.id; // Attach user ID to request object for further use
    next(); 
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = verifyToken;
