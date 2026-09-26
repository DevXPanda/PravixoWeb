import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "admin_broadcast",
        "new_message",
        "task_assigned",
        "task_completed",
        "revision_requested",
        "task_approved",
        "payment_successful",
        "holding_started",
        "payment_secured",
        "payment_released",
        "new_payment",
        "payment_holding",
        "dispute_raised",
        "new_offer",
        "offer_expiring",
        "subscription_activated",
        "subscription_expired",
        "account_suspended",
        "account_deleted",
        "account_restored",
        "admin_message",
        "verification_rejected",
        "verification_approved",
        "verification_requested",
        "campaign_pending_verification",
        "campaign_approved",
        "campaign_rejected",
        "new_campaign_available",
        "campaign_request_received",
        "campaign_request_approved",
        "campaign_request_rejected",
        "campaign_amount_proposed",
        "campaign_amount_agreed",
        "deliverable_submitted",
        "deliverable_approved",
        "deliverable_rejected",
        "deliverable_resubmitted",
        "all_deliverables_approved",
        "payment_release_eligible",
        "agreement_signed_brand",
        "agreement_signed_creator",
        "agreement_fully_signed",
        "agreement_pdf_sent",
        "withdrawal_requested",
        "withdrawal_completed",
        "withdrawal_failed",
        "addon_booking",
        "addon_booking_confirmed",
        "addon_booking_cancelled",
        "addon_service_submitted",
        "addon_service_approved",
        "addon_service_rejected",
        "subscription_upgrade_requested",
        "subscription_upgrade_approved",
        "subscription_upgrade_rejected",
        "referral_registered",
        "referral_qualified",
        "referral_reward_credited",
      ],
      required: true,
    },

    text: {
      type: String,
      required: true,
    },

    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CampaignTask",
    },

    targetUrl: {
      type: String,
      default: "",
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    read: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Number,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipientId: 1, read: 1 });

const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

export default Notification;