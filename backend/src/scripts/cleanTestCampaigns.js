import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

import Campaign from "../models/Campaign.js";
import CampaignTask from "../models/CampaignTask.js";
import Connection from "../models/Connection.js";
import Favorite from "../models/Favorite.js";

async function cleanup() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error("No MONGODB_URI found in env");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");

    const testPattern = /Task 20|Task 21|test|dummy|^Test Campaign/i;

    const testCampaigns = await Campaign.find({
      $or: [
        { title: { $regex: testPattern } },
        { description: { $regex: testPattern } },
        { category: { $regex: /^test$/i } },
      ],
    });

    console.log(`Found ${testCampaigns.length} test campaigns:`);
    testCampaigns.forEach((c) => console.log(` - [${c.status}] ${c.title}`));

    const testIds = testCampaigns.map((c) => c._id);

    if (testIds.length > 0) {
      await CampaignTask.deleteMany({ campaignId: { $in: testIds } });
      await Connection.deleteMany({ campaignId: { $in: testIds } });
      await Favorite.deleteMany({ targetId: { $in: testIds } });
      const delRes = await Campaign.deleteMany({ _id: { $in: testIds } });
      console.log(`\nSuccessfully deleted ${delRes.deletedCount} test campaigns from database.`);
    } else {
      console.log("\nNo test campaigns found in database.");
    }

    await mongoose.disconnect();
    console.log("Done.");
  } catch (err) {
    console.error("Cleanup error:", err);
  }
}

cleanup();
