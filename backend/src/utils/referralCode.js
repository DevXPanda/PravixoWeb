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

/**
 * Generate a guaranteed unique referral code matching format:
 * 2-letter prefix (BR for brand, CR for creator) + "-" + 5 random alphanumeric chars (e.g. BR-K9X2Q, CR-7M4P9)
 */
export const generateTypedReferralCode = async (role = "creator") => {
  const prefix = role === "brand" ? "BR" : "CR";
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // alphanumeric without ambiguous chars
  let unique = false;
  let code = "";
  let attempts = 0;

  while (!unique && attempts < 15) {
    let randomPart = "";
    const bytes = crypto.randomBytes(5);
    for (let i = 0; i < 5; i++) {
      randomPart += chars[bytes[i] % chars.length];
    }
    code = `${prefix}-${randomPart}`;

    const existing = await Profile.findOne({
      $or: [{ referral_code: code }, { referralCode: code }],
    });
    if (!existing) {
      unique = true;
    }
    attempts++;
  }

  if (!unique) {
    const fallback = crypto.randomBytes(3).toString("hex").toUpperCase().slice(0, 5);
    code = `${prefix}-${fallback}`;
  }

  return code;
};
