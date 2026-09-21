import jwt from "jsonwebtoken";
import Profile from "../models/Profile.js";

export const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.query?.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Authentication token is missing.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_jwt_secret");

    const profile = await Profile.findById(decoded.profileId).select("-password");

    if (!profile) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. User profile not found.",
      });
    }

    // Check if account is currently suspended
    if (profile.isSuspended && profile.suspendedUntil && new Date(profile.suspendedUntil) > new Date()) {
      return res.status(403).json({
        success: false,
        message: "Your account is temporarily suspended.",
        suspensionReason: profile.suspensionReason,
        suspendedUntil: profile.suspendedUntil,
      });
    }

    req.user = {
      _id: profile._id,
      profileId: profile._id,
      userId: profile.userId,
      email: profile.email,
      role: profile.role,
      fullName: profile.fullName,
    };
    req.profile = profile;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      message: "Not authorized. Invalid or expired token.",
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_jwt_secret");
      const profile = await Profile.findById(decoded.profileId).select("-password");
      if (profile) {
        req.user = {
          _id: profile._id,
          profileId: profile._id,
          userId: profile.userId,
          email: profile.email,
          role: profile.role,
          fullName: profile.fullName,
        };
        req.profile = profile;
      }
    }
  } catch (err) {
    // Ignore invalid tokens for optional auth
  }
  next();
};

export const adminProtect = async (req, res, next) => {
  // First run the regular protect middleware
  protect(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: "Not authorized as an admin",
      });
    }
  });
};
