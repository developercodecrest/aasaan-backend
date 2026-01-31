import mongoose from "mongoose";
import User from "../schemas/User";
import { UserRole, UserStatus } from "../types/user";
import dotenv from "dotenv";

// Load environment variables
if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: ".env" });
} else {
  dotenv.config({ path: ".env.local" });
}

const createSadminUser = async () => {
  try {
    // Connect to MongoDB
    // Priority: CLI arg (--uri or -u) -> REAL_MONGO_URI -> MONGO_URI
    const argv = process.argv.slice(2);
    const uriArgIndex = argv.findIndex((a) => a === "--uri" || a === "-u");
    let mongoUri = "";
    if (uriArgIndex >= 0 && argv[uriArgIndex + 1]) {
      mongoUri = argv[uriArgIndex + 1];
    } else {
      mongoUri = process.env.REAL_MONGO_URI || process.env.MONGO_URI || "";
    }

    if (!mongoUri) {
      console.error(
        "❌ No MongoDB URI provided. Provide a production DB URI via the REAL_MONGO_URI env var or pass --uri '<MONGO_URI>' on the command line."
      );
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    await mongoose.connect(mongoUri, { dbName: undefined });
    console.log("✅ Connected to MongoDB");

    // Check if user already exists
    const existingUser = await User.findOne({ phone: "7007498505" });
    if (existingUser) {
      console.log("⚠️  User with phone 7007498505 already exists");
      console.log("\n📋 User Details:");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`ID:           ${existingUser._id}`);
      console.log(`User UID:     ${existingUser.userUId}`);
      console.log(`Username:     ${existingUser.username}`);
      console.log(`Full Name:    ${existingUser.fullname}`);
      console.log(`Email:        ${existingUser.email}`);
      console.log(`Phone:        ${existingUser.phone}`);
      console.log(`Role:         ${existingUser.userRole}`);
      console.log(`Status:       ${existingUser.status}`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      await mongoose.disconnect();
      return;
    }

    // Create new SADMIN user using insertMany to avoid mongoose-sequence plugin issues
    const users = await User.insertMany([{
      username: "developer_admin",
      userRole: UserRole.SADMIN,
      email: "developercodecrest@gmail.com",
      fullname: "Developer",
      phone: "7007498505",
      status: UserStatus.APPROVED,
      address: "Test Address, Mumbai, Maharashtra",
      gender: "Male",
      createdBy: UserRole.SADMIN,
      lastLogin: null,
    }], { ordered: false });

    const sadminUser = users[0];

    console.log("✅ SADMIN user created successfully!");
    console.log("\n📋 User Details:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`ID:           ${sadminUser._id}`);
    console.log(`User UID:     ${sadminUser.userUId}`);
    console.log(`Username:     ${sadminUser.username}`);
    console.log(`Full Name:    ${sadminUser.fullname}`);
    console.log(`Email:        ${sadminUser.email}`);
    console.log(`Phone:        ${sadminUser.phone}`);
    console.log(`Role:         ${sadminUser.userRole}`);
    console.log(`Status:       ${sadminUser.status}`);
    console.log(`Address:      ${sadminUser.address || "N/A"}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n🔑 Login Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Phone:        7007498505");
    console.log("Email:        developercodecrest@gmail.com");
    console.log("OTP (test):   123456");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error creating SADMIN user:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run the script
createSadminUser();
