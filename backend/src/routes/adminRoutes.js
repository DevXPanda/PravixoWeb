import express from "express";
import { adminProtect } from "../middleware/auth.js";
import {
  getStats,
  listAllConversations,
  listMessages,
  deleteProfile,
  deleteConversation,
  updateProfileRole,
  updateVerificationStatus,
  getPendingCreators,
  getPendingBrands,
  getCreatorVerificationHistory,
  getBrandVerificationHistory,
  suspendProfile,
  unsuspendProfile,
  listAllTasks,
  listAllPayments,
  listCollaborationPaymentReleases,
  getCollaborationPaymentReleaseDetails,
  releaseCreatorPayout,
  resolveDispute,
  getRevenueStats,
  getWebhookLogs,
  listAllProfiles,
  listAllSubscriptions,
  approveSubscription,
  rejectSubscription,
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
  togglePackage,
  reorderPackages,
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  toggleOffer,
  getPopupSettings,
  updatePopupSettings,
  getSubscriptionAnalytics,
  getClientReviews,
  createClientReview,
  updateClientReview,
  deleteClientReview,
  getBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  getProTips,
  createProTip,
  updateProTip,
  deleteProTip,
  updateAdminCredentials,
  bulkDeleteMessages,
  getAdminActivityFeed,
  restoreProfile,
  sendAdminMessage,
  listAdminCampaigns,
  verifyCampaign,
  openAdminConversation,
  listWithdrawals,
  processWithdrawal,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(adminProtect);

// Campaign verification queues & moderation
router.get("/campaigns", listAdminCampaigns);
router.patch("/campaigns/:id/verify", verifyCampaign);

// Aggregate stats & overview
router.get("/stats", getStats);
router.get("/revenue-stats", getRevenueStats);

// Admin Credentials
router.put("/credentials", updateAdminCredentials);

// Subscriptions & Packages
router.get("/subscriptions", listAllSubscriptions);
router.patch("/subscriptions/:id/approve", approveSubscription);
router.patch("/subscriptions/:id/reject", rejectSubscription);
router.get("/subscription-analytics", getSubscriptionAnalytics);

router.get("/packages", getPackages);
router.post("/packages", createPackage);
router.put("/packages/:id", updatePackage);
router.delete("/packages/:id", deletePackage);
router.post("/packages/:id/toggle", togglePackage);
router.post("/packages/reorder", reorderPackages);

router.get("/offers", getOffers);
router.post("/offers", createOffer);
router.put("/offers/:id", updateOffer);
router.delete("/offers/:id", deleteOffer);
router.post("/offers/:id/toggle", toggleOffer);

router.get("/popup-settings", getPopupSettings);
router.post("/popup-settings", updatePopupSettings);

// Content Management
router.get("/content/client-reviews", getClientReviews);
router.post("/content/client-reviews", createClientReview);
router.put("/content/client-reviews/:id", updateClientReview);
router.delete("/content/client-reviews/:id", deleteClientReview);

router.get("/content/blogs", getBlogs);
router.post("/content/blogs", createBlog);
router.put("/content/blogs/:id", updateBlog);
router.delete("/content/blogs/:id", deleteBlog);

router.get("/content/protips", getProTips);
router.post("/content/protips", createProTip);
router.put("/content/protips/:id", updateProTip);
router.delete("/content/protips/:id", deleteProTip);

// Users (Profiles)
router.get("/profiles", listAllProfiles);

// Conversations & Messages moderation / participation
router.get("/conversations", listAllConversations);
router.post("/conversations/open", openAdminConversation);
router.get("/conversations/:id/messages", listMessages);
router.delete("/conversations/:id", deleteConversation);
router.post("/messages/bulk-delete", bulkDeleteMessages);

// User & Profile management
router.delete("/profiles/:id", deleteProfile);
router.post("/profiles/:id/restore", restoreProfile);
router.post("/profiles/:id/message", sendAdminMessage);
router.patch("/profiles/:id/role", updateProfileRole);
router.patch("/profiles/:id/verification", updateVerificationStatus);
router.post("/profiles/:id/suspend", suspendProfile);
router.post("/profiles/:id/unsuspend", unsuspendProfile);

// KYC Verification queues
router.get("/verification/creators/pending", getPendingCreators);
router.get("/verification/brands/pending", getPendingBrands);
router.get("/verification/creators/history", getCreatorVerificationHistory);
router.get("/verification/brands/history", getBrandVerificationHistory);

// Campaign tasks monitoring
router.get("/tasks", listAllTasks);

// Payments & Escrow arbitration
router.get("/payments", listAllPayments);
router.get("/payments/collaborations", listCollaborationPaymentReleases);
router.get("/payments/collaborations/:id", getCollaborationPaymentReleaseDetails);
router.post("/payments/collaborations/:id/release", releaseCreatorPayout);
router.post("/payments/:id/resolve-dispute", resolveDispute);

// Creator Withdrawal Requests (Task 14)
router.get("/withdrawals", listWithdrawals);
router.post("/withdrawals/:id/process", processWithdrawal);

// Webhook audit logs
router.get("/webhooks/logs", getWebhookLogs);

// Admin activity feed (for notification bell)
router.get("/activity", getAdminActivityFeed);

// Admin festival / sweet message broadcast
import { sendBroadcast } from "../controllers/broadcastController.js";
router.post("/broadcast", sendBroadcast);

// =====================================================
// REFERRAL SYSTEM MANAGEMENT
// =====================================================
import {
  adminListReferrals,
  adminGetReferralStats,
  adminGetReferralSettings,
  adminUpdateReferralSettings,
  adminManuallyQualifyReferral,
  adminRejectReferral,
} from "../controllers/adminReferralController.js";

import {
  revokeReferralRelationship,
  listAdminReferralRelationships,
  getAdminRelationshipTransactions,
} from "../controllers/referralController.js";

router.get("/referrals", adminListReferrals);
router.get("/referrals/relationships", listAdminReferralRelationships);
router.get("/referrals/relationships/:id/transactions", getAdminRelationshipTransactions);
router.post("/referrals/:id/revoke", revokeReferralRelationship);
router.get("/referrals/stats", adminGetReferralStats);
router.get("/referrals/settings", adminGetReferralSettings);
router.put("/referrals/settings", adminUpdateReferralSettings);
router.post("/referrals/:id/qualify", adminManuallyQualifyReferral);
router.post("/referrals/:id/reject", adminRejectReferral);

export default router;
