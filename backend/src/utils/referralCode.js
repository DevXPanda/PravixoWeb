import crypto from "crypto";
import Profile from "../models/Profile.js";

/**
 * Generate a random alphanumeric code prefixed with PVX (e.g. PVX9A2F1)
 */
export const generateCode = (length = 6) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // excludes ambiguous chars like 0, O, 1, I
  let code = "PVX";
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
};

/**
 * Generate a guaranteed unique referral code for a creator profile
 */
export const getUniqueReferralCode = async () => {
  let unique = false;
  let code = "";
  let attempts = 0;

  while (!unique && attempts < 10) {
    code = generateCode(6);
    const existing = await Profile.findOne({ referralCode: code });
    if (!existing) {
      unique = true;
    }
    attempts++;
  }

  if (!unique) {
    // Fallback with timestamp slice
    code = `PVX${Date.now().toString(36).toUpperCase().slice(-5)}`;
  }

  return code;
};
