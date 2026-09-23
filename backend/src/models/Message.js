import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },

    read: {
      type: Boolean,
      default: false,
    },

    deletedByAdmin: {
      type: Boolean,
      default: false,
    },

    deletedForCreator: {
      type: Boolean,
      default: false,
    },

    deletedForBrand: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    unsent: {
      type: Boolean,
      default: false,
    },
    messageType: {
      type: String,
      enum: ["text", "media", "voice_note", "timestamp_feedback", "deliverable_submission", "agreement_document", "system"],
      default: "text",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// =========================
// INDEXES
// =========================

messageSchema.index({ conversationId: 1 });

// Automatically delete document 7 days (604800 seconds) after 'deletedAt' is set.
// If deletedAt is null, it won't be deleted.
messageSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 604800 });

// =========================
// MODEL
// =========================

const Message = mongoose.model("Message", messageSchema);

export default Message;