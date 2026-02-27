// scripts/add_indexes.js — Add MongoDB indexes for fast queries
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function addIndexes() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected. Adding indexes...");

  const db = mongoose.connection.db;
  const col = db.collection("AI_Predictions");

  await col.createIndex({ EmployeeID: 1 }, { unique: true });
  await col.createIndex({ AttritionRiskLevel: 1 });
  await col.createIndex({ Department: 1 });
  await col.createIndex({ AbsenceRisk: 1 });
  await col.createIndex({ PromotionReadiness: 1 });
  await col.createIndex({ Department: 1, AttritionRiskLevel: 1 });

  console.log("Indexes created on AI_Predictions.");
  await mongoose.disconnect();
}

addIndexes().catch(err => { console.error(err); process.exit(1); });
