import mongoose from "mongoose";
import dotenv from "dotenv";
import Profile from "../models/Profile.js";
import ReferralRelationship from "../models/ReferralRelationship.js";
import ReferralSetting from "../models/ReferralSetting.js";
import Wallet from "../models/Wallet.js";
import WalletTransaction from "../models/WalletTransaction.js";
import Payout from "../models/Payout.js";
import Connection from "../models/Connection.js";
import { redeemReferralCode } from "../controllers/referralController.js";
import {
  processProjectPayoutWithReferral,
  reversePayoutAndReferralCommission,
} from "../services/referralService.js";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/lemen";

// Mock Express response helper
const createMockRes = () => {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
  return res;
};

async function runTestSuite() {
  console.log("================================================================");
  console.log("  REFERRAL & PAYOUT REVERSAL AUTOMATED TEST SUITE (7 SCENARIOS)");
  console.log("================================================================");

  let passedTests = 0;
  const totalTests = 7;

  try {
    await mongoose.connect(MONGO_URI);
    console.log(" Connected to MongoDB successfully.\n");

    // Clean up any existing test profiles / data
    const testEmails = [
      "user_a_referrer@test.com",
      "user_b_referred@test.com",
      "user_c_third@test.com",
      "user_suspended@test.com",
    ];
    await Profile.deleteMany({ email: { $in: testEmails } });
    await ReferralRelationship.deleteMany({});
    await Wallet.deleteMany({});
    await WalletTransaction.deleteMany({});
    await Payout.deleteMany({});

    // Ensure referral setting exists with 5% default
    await ReferralSetting.deleteMany({});
    await ReferralSetting.create({
      commission_percent: 5.0,
      referrer_type: "creator",
      referred_type: "creator",
      is_active: true,
      isEnabled: true,
      rewardAmount: 500,
    });

    // Setup Test Users
    // User A (Creator Referrer)
    const userA = await Profile.create({
      userId: `test_user_a_${Date.now()}`,
      fullName: "Alice Referrer",
      email: "user_a_referrer@test.com",
      password: "hashedpassword123",
      role: "creator",
      referral_code: "CR-ALIC1",
      referralCode: "CR-ALIC1",
    });

    // User B (Creator Referred)
    const userB = await Profile.create({
      userId: `test_user_b_${Date.now()}`,
      fullName: "Bob Creator",
      email: "user_b_referred@test.com",
      password: "hashedpassword123",
      role: "creator",
      referral_code: "CR-BOB02",
      referralCode: "CR-BOB02",
    });

    // User C (Third Creator)
    const userC = await Profile.create({
      userId: `test_user_c_${Date.now()}`,
      fullName: "Charlie Creator",
      email: "user_c_third@test.com",
      password: "hashedpassword123",
      role: "creator",
      referral_code: "CR-CHAR3",
      referralCode: "CR-CHAR3",
    });

    // Brand User for payouts
    const testBrand = await Profile.create({
      userId: `test_brand_${Date.now()}`,
      fullName: "Test Brand Acme",
      email: "brand_acme@test.com",
      password: "hashedpassword123",
      role: "brand",
    });

    // Test Connection
    const testConn = await Connection.create({
      creatorId: userB._id,
      brandId: testBrand._id,
      pitch: "Collaboration pitch",
      status: "accepted",
    });

    const createTestPayout = async (creatorId, amount, prefix = "PAY") => {
      return await Payout.create({
        collaborationId: testConn._id,
        brandId: testBrand._id,
        creatorId: creatorId,
        initiatedBy: testBrand._id,
        amount: amount,
        status: "COMPLETED",
        transactionReference: `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      });
    };

    // -------------------------------------------------------------------------
    // TEST 1: Self-referral is blocked at redeem time
    // -------------------------------------------------------------------------
    console.log("TEST 1: Verifying self-referral is blocked at redeem time...");
    {
      const req = {
        user: { _id: userA._id, role: userA.role },
        body: { referral_code: "CR-ALIC1" },
      };
      const res = createMockRes();
      await redeemReferralCode(req, res);

      if (
        res.statusCode === 400 &&
        res.body?.error === "INVALID_REFERRAL" &&
        res.body?.reason === "self_referral"
      ) {
        console.log("  [PASS] Self-referral rejected with 400 INVALID_REFERRAL (self_referral)");
        passedTests++;
      } else {
        console.error("  [FAIL] Expected 400 INVALID_REFERRAL, got:", res.statusCode, res.body);
      }
    }

    // Redeem valid referral: User A refers User B
    {
      const req = {
        user: { _id: userB._id, role: userB.role },
        body: { referral_code: "CR-ALIC1" },
      };
      const res = createMockRes();
      await redeemReferralCode(req, res);
      if (res.statusCode !== 200) {
        throw new Error(`Failed to set up initial referral A -> B: ${JSON.stringify(res.body)}`);
      }
      console.log("  [SETUP] User A successfully referred User B");
    }

    // -------------------------------------------------------------------------
    // TEST 2: Circular referral (A refers B, B tries to refer A) is blocked
    // -------------------------------------------------------------------------
    console.log("\nTEST 2: Verifying circular referral is blocked...");
    {
      const req = {
        user: { _id: userA._id, role: userA.role },
        body: { referral_code: "CR-BOB02" }, // A tries to redeem B's code
      };
      const res = createMockRes();
      await redeemReferralCode(req, res);

      if (
        res.statusCode === 400 &&
        res.body?.error === "INVALID_REFERRAL" &&
        res.body?.reason === "circular_referral"
      ) {
        console.log("  [PASS] Circular referral rejected with 400 INVALID_REFERRAL (circular_referral)");
        passedTests++;
      } else {
        console.error("  [FAIL] Expected 400 INVALID_REFERRAL (circular_referral), got:", res.statusCode, res.body);
      }
    }

    // -------------------------------------------------------------------------
    // TEST 3: User already referred cannot be referred again (duplicate blocked)
    // -------------------------------------------------------------------------
    console.log("\nTEST 3: Verifying duplicate referral is blocked (first referral wins)...");
    {
      // User B is already referred by A, tries to redeem Charlie's code CR-CHAR3
      const req = {
        user: { _id: userB._id, role: userB.role },
        body: { referral_code: "CR-CHAR3" },
      };
      const res = createMockRes();
      await redeemReferralCode(req, res);

      if (res.statusCode === 409 && res.body?.error === "USER_ALREADY_REFERRED") {
        console.log("  [PASS] Duplicate referral rejected with 409 USER_ALREADY_REFERRED");
        passedTests++;
      } else {
        console.error("  [FAIL] Expected 409 USER_ALREADY_REFERRED, got:", res.statusCode, res.body);
      }
    }

    // -------------------------------------------------------------------------
    // TEST 4: Suspended referrer holds commission in "PENDING"
    // -------------------------------------------------------------------------
    console.log("\nTEST 4: Verifying suspended referrer has pending commission held/flagged...");
    {
      // Create a suspended referrer and a creator referred by them
      const suspendedReferrer = await Profile.create({
        userId: `test_user_susp_${Date.now()}`,
        fullName: "Suspended Referrer",
        email: "user_suspended@test.com",
        password: "hashedpassword123",
        role: "creator",
        referral_code: "CR-SUSP1",
        referralCode: "CR-SUSP1",
        isSuspended: true,
        suspensionReason: "Suspicious activity",
        suspendedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // suspended for 7 days
      });

      // User C redeems suspended referrer's code
      const req = {
        user: { _id: userC._id, role: userC.role },
        body: { referral_code: "CR-SUSP1" },
      };
      const res = createMockRes();
      await redeemReferralCode(req, res);

      // Process payout for User C
      const payoutDoc = await createTestPayout(userC._id, 2000, "PAY-SUSP");

      const payoutResult = await processProjectPayoutWithReferral({
        creatorId: userC._id,
        gross_payout_amount: 2000,
        platform_fee: 100,
        payoutId: payoutDoc._id,
        transactionReference: `TX-SUSP-${Date.now()}`,
        description: "Test suspended referrer payout",
      });

      // Check referrer's wallet transaction
      const referrerCommTx = await WalletTransaction.findOne({
        creatorId: suspendedReferrer._id,
        transaction_type: "referral_commission",
      });

      // Check referrer's wallet balance (should NOT be incremented)
      const referrerWallet = await Wallet.findOne({ creatorId: suspendedReferrer._id });
      const availableBalance = referrerWallet ? referrerWallet.availableBalance : 0;

      if (
        referrerCommTx &&
        referrerCommTx.status === "PENDING" &&
        referrerCommTx.amount === 100 && // 5% of 2000
        availableBalance === 0
      ) {
        console.log("  [PASS] Commission held in PENDING status, balance not credited while suspended");
        passedTests++;
      } else {
        console.error("  [FAIL] Commission for suspended referrer was not held in PENDING properly:", {
          txStatus: referrerCommTx?.status,
          txAmount: referrerCommTx?.amount,
          availableBalance,
        });
      }
    }

    // -------------------------------------------------------------------------
    // TEST 5: Refunded/reversed payout reverses linked commission via /internal/payouts/reverse
    // -------------------------------------------------------------------------
    console.log("\nTEST 5: Verifying payout reversal and linked commission reversal...");
    {
      // Create a fresh payout for User B (referred by User A)
      const payoutDoc = await createTestPayout(userB._id, 10000, "PAY-REV");

      const payoutProcessResult = await processProjectPayoutWithReferral({
        creatorId: userB._id,
        gross_payout_amount: 10000,
        platform_fee: 500,
        payoutId: payoutDoc._id,
        transactionReference: `TX-REV-${Date.now()}`,
        description: "Reversible project payout",
      });

      const creatorTxId = payoutProcessResult.creatorResult?.transaction?._id;
      const commissionTxId = payoutProcessResult.referrerResult?.transaction?._id;

      // Verify wallet of Referrer A before reversal
      const referrerWalletBefore = await Wallet.findOne({ creatorId: userA._id });
      const commAmount = payoutProcessResult.referrerResult?.transaction?.amount; // 500

      // Execute reversal via reversePayoutAndReferralCommission
      const reverseResult = await reversePayoutAndReferralCommission({
        payout_id: payoutDoc._id,
      });

      // Verify original payout status is reversed
      const originalPayoutTx = await WalletTransaction.findById(creatorTxId);
      // Verify original commission status is reversed
      const originalCommTx = await WalletTransaction.findById(commissionTxId);
      // Verify offsetting refund_reversal row exists
      const reversalTx = await WalletTransaction.findOne({
        creatorId: userA._id,
        transaction_type: "refund_reversal",
        related_transaction_id: commissionTxId,
      });

      const referrerWalletAfter = await Wallet.findOne({ creatorId: userA._id });

      const isReversalSuccessful =
        reverseResult.success === true &&
        originalPayoutTx.status === "reversed" &&
        originalCommTx.status === "reversed" &&
        reversalTx !== null &&
        reversalTx.amount === -500 &&
        referrerWalletAfter.availableBalance ===
          referrerWalletBefore.availableBalance - commAmount;

      if (isReversalSuccessful) {
        console.log("  [PASS] Payout and linked commission marked reversed, offsetting refund_reversal created with amount = -500");
        passedTests++;
      } else {
        console.error("  [FAIL] Reversal verification failed:", {
          reverseResult,
          payoutStatus: originalPayoutTx?.status,
          commStatus: originalCommTx?.status,
          reversalTxAmount: reversalTx?.amount,
        });
      }
    }

    // -------------------------------------------------------------------------
    // TEST 6: Commission calculation & deduction strictly from creator's share
    // -------------------------------------------------------------------------
    console.log("\nTEST 6: Verifying commission calculation and deduction from creator's share...");
    {
      // Test with various amounts: 5000 with 500 platform fee
      const grossAmount = 5000;
      const platformFee = 500;
      const commissionPercent = 5.0;
      const expectedCommission = 250; // 5% of 5000
      const expectedNetCreator = 5000 - 500 - 250; // 4250

      const payoutDoc = await createTestPayout(userB._id, grossAmount, "PAY-CALC");

      const calcResult = await processProjectPayoutWithReferral({
        creatorId: userB._id,
        gross_payout_amount: grossAmount,
        platform_fee: platformFee,
        payoutId: payoutDoc._id,
        transactionReference: `TX-CALC-${Date.now()}`,
        description: "Math test payout",
      });

      const breakdown = calcResult.breakdown;
      const creatorCredited = calcResult.creatorResult?.transaction?.amount;
      const commCredited = calcResult.referrerResult?.transaction?.amount;

      const isMathAccurate =
        breakdown.gross_payout_amount === grossAmount &&
        breakdown.platform_fee === platformFee &&
        breakdown.commission_amount === expectedCommission &&
        breakdown.creator_net_amount === expectedNetCreator &&
        creatorCredited === expectedNetCreator &&
        commCredited === expectedCommission;

      if (isMathAccurate) {
        console.log(`  [PASS] Calculation correct: Gross=${grossAmount}, Fee=${platformFee}, Comm=${commCredited}, CreatorNet=${creatorCredited} (Platform fee not impacted)`);
        passedTests++;
      } else {
        console.error("  [FAIL] Commission math mismatch:", {
          breakdown,
          creatorCredited,
          commCredited,
          expectedNetCreator,
          expectedCommission,
        });
      }
    }

    // -------------------------------------------------------------------------
    // TEST 7: No cap enforced — referrer accumulates unlimited commission
    // -------------------------------------------------------------------------
    console.log("\nTEST 7: Verifying no cap enforced for repeated payouts over time...");
    {
      const initialWallet = await Wallet.findOne({ creatorId: userA._id });
      const initialBalance = initialWallet ? initialWallet.availableBalance : 0;

      const iterations = 5;
      const payoutPerIter = 20000; // commission = 1000 each
      let totalAccumulatedCommission = 0;

      for (let i = 1; i <= iterations; i++) {
        const pDoc = await createTestPayout(userB._id, payoutPerIter, `PAY-NOCAP-${i}`);

        const res = await processProjectPayoutWithReferral({
          creatorId: userB._id,
          gross_payout_amount: payoutPerIter,
          platform_fee: 1000,
          payoutId: pDoc._id,
          transactionReference: `TX-NOCAP-${Date.now()}-${i}`,
          description: `Payout iteration #${i}`,
        });

        totalAccumulatedCommission += res.breakdown.commission_amount;
      }

      const finalWallet = await Wallet.findOne({ creatorId: userA._id });
      const balanceDelta = finalWallet.availableBalance - initialBalance;

      if (totalAccumulatedCommission === 5000 && balanceDelta === 5000) {
        console.log(`  [PASS] No cap enforced: Referrer accumulated all ${iterations} payouts (${totalAccumulatedCommission} INR) with zero cap restriction`);
        passedTests++;
      } else {
        console.error("  [FAIL] Cap or tracking mismatch:", {
          totalAccumulatedCommission,
          balanceDelta,
        });
      }
    }

    console.log("\n================================================================");
    console.log(`  TEST RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
    console.log("================================================================");

    if (passedTests === totalTests) {
      console.log(" All 7 requirements successfully validated!\n");
    } else {
      console.error(` Only ${passedTests}/${totalTests} tests passed.\n`);
    }
  } catch (error) {
    console.error("Test Suite Execution Error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(passedTests === totalTests ? 0 : 1);
  }
}

runTestSuite();
