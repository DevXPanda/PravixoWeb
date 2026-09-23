import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
    index: true,
  },

  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
    index: true,
  },

  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campaign",
    default: null,
  },

  pitch: {
    type: String,
    required: true,
  },

  appliedTier: {
    minFollowers: { type: Number, default: 0 },
    reward: { type: String, default: "" },
    cashAmount: { type: Number, default: 0 },
    perks: { type: String, default: "" },
  },

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },

  creatorNotificationSeen: {
    type: Boolean,
    default: false,
  },

  // Task 3: Collaboration and Payment Negotiation
  collaborationStatus: {
    type: String,
    enum: ["NEGOTIATING", "AMOUNT_AGREED"],
    default: "NEGOTIATING",
  },

  creatorAmount: {
    type: Number,
    default: 0,
  },

  pravixoFee: {
    type: Number,
    default: 0,
  },

  brandTotal: {
    type: Number,
    default: 0,
  },

  proposedAmount: {
    type: Number,
    default: 0,
  },

  proposedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    default: null,
  },

  agreedAt: {
    type: Number,
    default: null,
  },

  // Task 4: Payment State
  paymentStatus: {
    type: String,
    enum: ["PENDING", "PAYMENT_INITIATED", "PAID", "FAILED"],
    default: "PENDING",
  },

  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
    default: null,
  },

  paidAt: {
    type: Number,
    default: null,
  },

  // Task 5: Deliverables Tracking
  deliverablesTracking: [
    {
      type: {
        type: String,
        enum: ["REEL", "POST", "STORY", "VIDEO"],
        required: true,
      },
      requiredQuantity: {
        type: Number,
        required: true,
        default: 0,
      },
      completedQuantity: {
        type: Number,
        default: 0,
      },
      status: {
        type: String,
        enum: [
          "PENDING",
          "IN_PROGRESS",
          "SUBMITTED",
          "APPROVED",
          "REJECTED",
          "COMPLETED",
        ],
        default: "PENDING",
      },
      createdAt: {
        type: Number,
        default: Date.now,
      },
      updatedAt: {
        type: Number,
        default: Date.now,
      },
    },
  ],

  // Task 9 & Task 10: Deliverables Completion & 72-Hour Review Period
  allDeliverablesCompleted: {
    type: Boolean,
    default: false,
    index: true,
  },

  workCompletedAt: {
    type: Number,
    default: null,
  },

  approvalCompletedAt: {
    type: Number,
    default: null,
  },

  paymentReleaseEligibleAt: {
    type: Number,
    default: null,
    index: true,
  },

  paymentReleaseStatus: {
    type: String,
    enum: [
      "NOT_APPLICABLE",
      "WAITING_72_HOURS",
      "ELIGIBLE_FOR_RELEASE",
      "RELEASED",
    ],
    default: "NOT_APPLICABLE",
    index: true,
  },

  adminNotifiedOfEligibility: {
    type: Boolean,
    default: false,
  },

  // Barter / Product Seeding & Shipment Tracking
  barterDetails: {
    isBarter: {
      type: Boolean,
      default: false,
    },
    productName: {
      type: String,
      default: "",
    },
    productValue: {
      type: Number,
      default: 0,
    },
    productDescription: {
      type: String,
      default: "",
    },
    shippingStatus: {
      type: String,
      enum: ["NOT_SHIPPED", "DISPATCHED", "IN_TRANSIT", "DELIVERED", "CONFIRMED_BY_CREATOR"],
      default: "NOT_SHIPPED",
    },
    courierPartner: {
      type: String,
      default: "",
    },
    trackingNumber: {
      type: String,
      default: "",
    },
    trackingUrl: {
      type: String,
      default: "",
    },
    shippedAt: {
      type: Number,
      default: null,
    },
    deliveredAt: {
      type: Number,
      default: null,
    },
    creatorConfirmedAt: {
      type: Number,
      default: null,
    },
    creatorShippingAddress: {
      fullName: { type: String, default: "" },
      phone: { type: String, default: "" },
      addressLine1: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
    },
  },

  // Task 11: Creator Payout Release
  payoutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payout",
    default: null,
  },

  payoutReleasedAt: {
    type: Number,
    default: null,
  },

  createdAt: {
    type: Number,
    default: Date.now,
  },

  updatedAt: {
    type: Number,
    default: Date.now,
  },
});

connectionSchema.index({ creatorId: 1, brandId: 1 });
connectionSchema.index({ creatorId: 1, campaignId: 1 });
connectionSchema.index({ brandId: 1, campaignId: 1 });

const Connection = mongoose.model("Connection", connectionSchema);

export default Connection;