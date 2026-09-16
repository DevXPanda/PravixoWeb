import express from "express";
import { reversePayoutAndReferralCommission } from "../services/referralService.js";

const router = express.Router();

/**
 * POST /internal/payouts/reverse
 * Body: { "payout_id": "uuid" }
 * Logic:
 * 1. Find the original payout's wallet_transactions row.
 * 2. Find any linked referral_commission transaction via related_transaction_id.
 * 3. If found, create an offsetting wallet_transactions row on the referrer's wallet:
 *    transaction_type = "refund_reversal", amount = -[original commission amount],
 *    related_transaction_id = the original referral_commission transaction's id.
 * 4. Mark both the original payout transaction and the original referral_commission transaction as status = "reversed".
 */
router.post("/payouts/reverse", async (req, res) => {
  try {
    const { payout_id } = req.body;
    if (!payout_id) {
      return res.status(400).json({
        success: false,
        error: "PAYOUT_ID_REQUIRED",
        message: "payout_id is required in request body",
      });
    }

    const result = await reversePayoutAndReferralCommission({ payout_id });
    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: "PAYOUT_TRANSACTION_NOT_FOUND",
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payout and any linked referral commission successfully reversed",
      ...result,
    });
  } catch (error) {
    console.error("Error reversing payout and referral commission:", error);
    return res.status(500).json({
      success: false,
      error: "REVERSAL_FAILED",
      message: error.message,
    });
  }
});

export default router;
