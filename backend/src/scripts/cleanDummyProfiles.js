import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    const filter = {
      $or: [
        { email: { $regex: "@pravixo\\.test|@test\\.com", $options: "i" } },
        { isSuspended: true },
        { fullName: { $regex: "task20|impostor|suspended|test brand|alice referrer|bob creator|charlie creator", $options: "i" } },
      ],
    };

    const count = await mongoose.connection.collection("profiles").countDocuments(filter);
    console.log(`Found ${count} dummy/suspended test profiles to remove.`);

    const res = await mongoose.connection.collection("profiles").deleteMany(filter);
    console.log(`Successfully removed ${res.deletedCount} dummy profiles.`);

    const remaining = await mongoose.connection.collection("profiles").find({}).project({ fullName: 1, email: 1, role: 1 }).toArray();
    console.log("Remaining Genuine Profiles:", remaining);

    process.exit(0);
  } catch (err) {
    console.error("Cleanup error:", err);
    process.exit(1);
  }
}

run();
