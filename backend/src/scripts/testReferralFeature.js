import mongoose from "mongoose";
import dotenv from "dotenv";
import Profile from "../models/Profile.js";
import Referral from "../models/Referral.js";
import ReferralReward from "../models/ReferralReward.js";
import ReferralSetting from "../models/ReferralSetting.js";
import Wallet from "../models/Wallet.js";
import WalletTransaction from "../models/WalletTransaction.js";
import Notification from "../models/Notification.js";
import { getUniqueReferralCode } from "../utils/referralCode.js";
import { recordReferralOnSignup, processReferralQualification } from "../services/referralService.js";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/lemen";

async function runTests() {
  console.log("==================================================");
  console.log("   PREVIXO REFER & EARN FEATURE TEST SUITE        ");
  console.log("==================================================");

  try {
    await mongoose.connect(MONGO_URI);
    console.log(" Connected to MongoDB successfully.");

    // Clean test artifacts
    await Profile.deleteMany({ email: { $in: ["test_creator_a@previxo.test", "test_creator_b@previxo.test", "test_creator_c@previxo.test"] } });
    
    // 1. Setup Test Campaign Setting
    let settings = await ReferralSetting.findOne();
    if (!settings) {
      settings = await ReferralSetting.create({
        isEnabled: true,
        rewardAmount: 500,
        currency: "INR",
        qualificationTrigger: "profile_verified",
      });
    } else {
      settings.isEnabled = true;
      settings.rewardAmount = 500;
      settings.qualificationTrigger = "profile_verified";
      await settings.save();
    }
    console.log(`[PASS] 1. Referral campaign configured with ₹${settings.rewardAmount} reward.`);

    // 2. Create Creator A (Referrer)
    const codeA = await getUniqueReferralCode();
    const creatorA = await Profile.create({
      userId: "user_test_creator_a",
      fullName: "Creator Alice",
      email: "test_creator_a@previxo.test",
      password: "hashedpassword123",
      role: "creator",
      referralCode: codeA,
      verificationStatus: "verified",
    });
    console.log(`[PASS] 2. Creator A created with unique referral code: ${creatorA.referralCode}`);

    // 3. Test Self-Referral Prevention
    const selfRef = await recordReferralOnSignup({
      referralCode: codeA,
      newCreatorProfile: creatorA,
    });
    if (!selfRef.success && selfRef.reason.includes("Self-referral")) {
      console.log("[PASS] 3. Anti-Abuse: Self-referral successfully rejected.");
    } else {
      throw new Error(`Self-referral check failed: ${JSON.stringify(selfRef)}`);
    }

    // 4. Create Creator B and record referral
    const codeB = await getUniqueReferralCode();
    const creatorB = await Profile.create({
      userId: "user_test_creator_b",
      fullName: "Creator Bob",
      email: "test_creator_b@previxo.test",
      password: "hashedpassword123",
      role: "creator",
      referralCode: codeB,
      verificationStatus: "pending",
    });

    const refResult = await recordReferralOnSignup({
      referralCode: codeA,
      newCreatorProfile: creatorB,
    });
    if (!refResult.success) {
      throw new Error(`Failed to record referral: ${refResult.reason}`);
    }
    console.log(`[PASS] 4. Creator B registered with Creator A's referral code. Referral status: ${refResult.referral.status}`);

    // Verify Notification for Creator A
    const notif = await Notification.findOne({ recipientId: creatorA._id, type: "referral_registered" });
    if (notif) {
      console.log(`[PASS] 5. Notification delivered to Creator A: "${notif.text}"`);
    }

    // 5. Test Duplicate Referral Prevention
    const dupRef = await recordReferralOnSignup({
      referralCode: codeA,
      newCreatorProfile: creatorB,
    });
    if (!dupRef.success && dupRef.reason.includes("already been referred")) {
      console.log("[PASS] 6. Anti-Abuse: Duplicate referral on same creator successfully blocked.");
    } else {
      throw new Error(`Duplicate referral check failed: ${JSON.stringify(dupRef)}`);
    }

    // 6. Test Qualification Condition (profile_verified)
    // First, verify wallet before qualification
    const initialWallet = await Wallet.findOne({ creatorId: creatorA._id });
    const initialBalance = initialWallet ? initialWallet.availableBalance : 0;

    // Trigger qualification
    const qualifyResult = await processReferralQualification({
      referredCreatorId: creatorB._id,
      triggerType: "profile_verified",
    });

    if (!qualifyResult.success) {
      throw new Error(`Qualification failed: ${qualifyResult.message}`);
    }
    console.log(`[PASS] 7. Referral qualified upon creator profile verification. Reward amount: ₹${qualifyResult.reward.rewardAmount}`);

    // Verify Wallet Balance after qualification
    const updatedWallet = await Wallet.findOne({ creatorId: creatorA._id });
    if (updatedWallet.availableBalance !== initialBalance + 500) {
      throw new Error(`Wallet balance mismatch. Expected ${initialBalance + 500}, got ${updatedWallet.availableBalance}`);
    }
    console.log(`[PASS] 8. Creator A's wallet credited: New Balance = ₹${updatedWallet.availableBalance}`);

    // 7. Test Idempotency (Duplicate Qualification Call)
    const idempotentResult = await processReferralQualification({
      referredCreatorId: creatorB._id,
      triggerType: "profile_verified",
    });
    const walletAfterDuplicate = await Wallet.findOne({ creatorId: creatorA._id });
    if (walletAfterDuplicate.availableBalance !== initialBalance + 500) {
      throw new Error(`Idempotency violated! Wallet was credited twice. Balance: ${walletAfterDuplicate.availableBalance}`);
    }
    console.log("[PASS] 9. Idempotency Verified: Duplicate qualification did not double-credit wallet.");

    // Clean up test records
    await ReferralReward.deleteMany({ referrerCreatorId: creatorA._id });
    await Referral.deleteMany({ referrerCreatorId: creatorA._id });
    await WalletTransaction.deleteMany({ creatorId: creatorA._id });
    await Wallet.deleteMany({ creatorId: creatorA._id });
    await Notification.deleteMany({ recipientId: creatorA._id });
    await Profile.deleteMany({ _id: { $in: [creatorA._id, creatorB._id] } });

    console.log("==================================================");
    console.log("  ALL REFERRAL SYSTEM TESTS PASSED SUCCESSFULLY!  ");
    console.log("==================================================");
    process.exit(0);
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

runTests();
