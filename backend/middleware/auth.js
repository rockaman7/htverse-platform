const User = require("../models/User");
const { verifyToken } = require("../utils/jwt");

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    // Allow OPTIONS preflight requests without auth
    if (req.method === "OPTIONS") {
      return next();
    }

    let token;

    // Get token from header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Get user from token
    req.user = await User.findById(decoded.userId);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "No user found with this token",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};
