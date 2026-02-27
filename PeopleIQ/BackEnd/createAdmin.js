import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const admin = new User({
  name: "Admin User",
  email: "admin@hranalysis.com",
  password: "password123", // will be hashed automatically
  role: "Admin"
});

await admin.save();

console.log("Admin created!");
process.exit();