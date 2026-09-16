import dotenv from "dotenv";
import dns from "dns";

dotenv.config();
dns.setDefaultResultOrder("ipv4first");

import app from "./app.js";
import connectDB from "./config/db.js";

import { startSocialSyncJob } from "./jobs/socialSyncJob.js";
import { startPaymentReleaseJob } from "./jobs/paymentReleaseJob.js";
import { initChatCleanupJob } from "./jobs/chatCleanup.js";
import { initPayoutEventListener } from "./services/payoutEventService.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);

      // Start cron jobs AFTER database connection
      startSocialSyncJob();
      startPaymentReleaseJob();
      initChatCleanupJob();
      initPayoutEventListener();
    });
  } catch (error) {
    console.error(
      "Server startup failed:",
      error.message
    );

    process.exit(1);
  }
};

startServer();