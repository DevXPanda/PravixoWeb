import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

import Profile from "../models/Profile.js";

async function updateAvatars() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error("No MONGODB_URI found in env");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");

    const profiles = await Profile.find({
      $or: [
        { avatarUrl: { $regex: /dicebear\.com.*avataaars/i } },
        { avatarUrl: "" },
        { avatarUrl: null },
      ],
    });

    console.log(`Found ${profiles.length} profiles with default or avataaars avatars.`);

    let updatedCount = 0;
    for (const p of profiles) {
      const seed = encodeURIComponent((p.fullName || "User").trim());
      const cleanGender = (p.gender || "").toLowerCase().trim();
      let newAvatar = "";

      if (p.role === "brand") {
        newAvatar = `https://api.dicebear.com/9.x/identicon/svg?seed=${seed}`;
      } else if (cleanGender === "female") {
        newAvatar = `https://api.dicebear.com/9.x/lorelei/svg?seed=${seed}&mouth=happy01,happy02,happy03,happy04,happy05,happy06,happy07,happy08,happy09,happy10,happy11,happy12,happy13,happy14,happy15,happy16,happy17,happy18&eyes=happy,smiling,round,variant01,variant02,variant03,variant04,variant05,variant06,variant07,variant08,variant09,variant10`;
      } else {
        newAvatar = `https://api.dicebear.com/9.x/micah/svg?seed=${seed}&mouth=smile,laughing,pucker,smirk&hair=fonze,mrClean,mrT,dannyPhantom,full,pixie,turban&facialHairProbability=10`;
      }

      await Profile.updateOne({ _id: p._id }, { $set: { avatarUrl: newAvatar } });
      updatedCount++;
      console.log(` - Updated [${p.role} / ${p.gender || "male"}] ${p.fullName} -> ${newAvatar.substring(0, 55)}...`);
    }

    console.log(`\nSuccessfully updated ${updatedCount} profiles to friendly Micah/Lorelei avatars.`);

    await mongoose.disconnect();
    console.log("Done.");
  } catch (err) {
    console.error("Avatar update error:", err);
  }
}

updateAvatars();
