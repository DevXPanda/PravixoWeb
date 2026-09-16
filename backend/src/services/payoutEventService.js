import { appEvents } from "../utils/eventEmitter.js";
import { sendPushToUser } from "../utils/webPush.js";

// Keep connected SSE / stream clients in memory mapped by creatorId/userId
const clientsByUserId = new Map();

/**
 * Register an active SSE response connection for real-time frontend events
 */
export const registerSSEClient = (userId, res) => {
  const userIdStr = userId.toString();
  if (!clientsByUserId.has(userIdStr)) {
    clientsByUserId.set(userIdStr, new Set());
  }
  clientsByUserId.get(userIdStr).add(res);

  res.on("close", () => {
    const userClients = clientsByUserId.get(userIdStr);
    if (userClients) {
      userClients.delete(res);
      if (userClients.size === 0) {
        clientsByUserId.delete(userIdStr);
      }
    }
  });
};

/**
 * Broadcast event to all active real-time connections for a given user
 */
export const emitEventToUser = (userId, eventName, payload) => {
  const userIdStr = userId.toString();
  const userClients = clientsByUserId.get(userIdStr);
  if (userClients && userClients.size > 0) {
    const dataStr = `event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const clientRes of userClients) {
      try {
        clientRes.write(dataStr);
      } catch (err) {
        console.warn(`Error writing event to client ${userIdStr}:`, err.message);
      }
    }
  }
};

/**
 * Initialize event listener for internal "payout.processed"
 * Format according to exact requested payload shape:
 * {
 *   "event": "payout.processed",
 *   "creator_id": "uuid",
 *   "project_id": "uuid",
 *   "breakdown": {
 *     "gross_amount": 10000.00,
 *     "platform_fee": 500.00,
 *     "referral_commission": 500.00,
 *     "referrer_name": "Acme Brand",
 *     "net_credited": 9000.00
 *   },
 *   "currency": "INR",
 *   "timestamp": "ISO8601"
 * }
 */
export const initPayoutEventListener = () => {
  appEvents.on("payout.processed", async (data) => {
    try {
      const {
        creator_id,
        project_id,
        collaboration_id,
        gross_payout_amount,
        platform_fee = 0,
        commission_amount = 0,
        referrer_name = null,
        creator_net_amount,
        has_active_referral,
        currency = "INR",
      } = data;

      const breakdown = {
        gross_amount: Number(gross_payout_amount.toFixed(2)),
        platform_fee: Number(platform_fee.toFixed(2)),
        net_credited: Number(creator_net_amount.toFixed(2)),
      };

      // If referral commission applies, include referral_commission and referrer_name.
      // Otherwise, omit or leave as null according to specification.
      if (has_active_referral && commission_amount > 0) {
        breakdown.referral_commission = Number(commission_amount.toFixed(2));
        breakdown.referrer_name = referrer_name || "Referrer";
      }

      const exactPayload = {
        event: "payout.processed",
        creator_id: creator_id.toString(),
        project_id: (project_id || collaboration_id || "").toString(),
        breakdown,
        currency,
        timestamp: new Date().toISOString(),
      };

      // 1. Send via real-time SSE stream to connected creator frontend client
      emitEventToUser(creator_id, "payout.processed", exactPayload);

      // 2. Also dispatch via Web Push Notification service so frontend service worker can pick it up
      sendPushToUser(creator_id, {
        title: "Payment Processed 💰",
        body: `₹${breakdown.net_credited.toLocaleString("en-IN")} credited to your wallet.`,
        data: exactPayload,
      }).catch((pushErr) => {
        console.warn("Web push dispatch warning:", pushErr.message);
      });
    } catch (err) {
      console.error("Error processing payout.processed event broadcast:", err);
    }
  });
};
