import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// User model inline (same as auth.js uses)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "Employee" },
});
const User = mongoose.model("User", userSchema);

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const existing = await User.findOne({ email: "admin@hranalysis.com" });
  if (existing) {
    console.log("Admin already exists, deleting and recreating...");
    await User.deleteOne({ email: "admin@hranalysis.com" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash("Admin123!", salt);

  const admin = await User.create({
    name: "Admin User",
    email: "admin@hranalysis.com",
    password: hashed,
    role: "Admin",
  });

  console.log("Admin created:", admin.email, "/ role:", admin.role);
  console.log("\nLogin with:");
  console.log("  Email:    admin@hranalysis.com");
  console.log("  Password: Admin123!");

  await mongoose.disconnect();
}

createAdmin().catch(err => { console.error(err); process.exit(1); });
