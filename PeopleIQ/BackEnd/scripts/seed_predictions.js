/**
 * seed_predictions.js
 * -------------------
 * Reads predictions_output.json and seeds MongoDB collections:
 *   - AI_Predictions (per-employee predictions)
 *   - Analytics_Trends (aggregate summary)
 *
 * Usage:
 *   node scripts/seed_predictions.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

import AIPredictions from "../models/AIPredictions.js";
import AnalyticsTrends from "../models/AnalyticsTrends.js";

const DATA_PATH = path.join(__dirname, "..", "data", "predictions_output.json");

async function seed() {
    console.log("=".repeat(60));
    console.log("Seeding ML predictions into MongoDB");
    console.log("=".repeat(60));

    // Connect
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error("ERROR: MONGO_URI not set in .env");
        process.exit(1);
    }

    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(uri);
    console.log("Connected.");

    // Read JSON
    if (!fs.existsSync(DATA_PATH)) {
        console.error(`ERROR: ${DATA_PATH} not found. Run generate_predictions.py first.`);
        process.exit(1);
    }

    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    const data = JSON.parse(raw);
    const { summary, predictions } = data;

    console.log(`Loaded ${predictions.length} predictions from JSON`);

    // ---------- Seed AI_Predictions ----------
    console.log("Upserting AI_Predictions...");
    let upserted = 0;

    // Process in batches of 500
    const BATCH_SIZE = 500;
    for (let i = 0; i < predictions.length; i += BATCH_SIZE) {
        const batch = predictions.slice(i, i + BATCH_SIZE);
        const ops = batch.map((p) => ({
            updateOne: {
                filter: { EmployeeID: p.EmployeeID },
                update: { $set: p },
                upsert: true,
            },
        }));
        const result = await AIPredictions.bulkWrite(ops);
        upserted += result.upsertedCount + result.modifiedCount;
        process.stdout.write(`  Progress: ${Math.min(i + BATCH_SIZE, predictions.length)}/${predictions.length}\r`);
    }
    console.log(`\n  Upserted/updated: ${upserted} records`);

    // ---------- Seed Analytics_Trends ----------
    console.log("Upserting Analytics_Trends...");
    const trendDoc = {
        Date: new Date(),
        TotalEmployees: summary.totalEmployees,
        AvgAttritionRisk: summary.avgAttritionRisk,
        AvgEngagement: summary.avgEngagement,
        HighRiskCount: summary.highRiskCount,
        MediumRiskCount: summary.mediumRiskCount,
        LowRiskCount: summary.lowRiskCount,
        AvgBurnoutScore: summary.avgBurnoutScore,
        AvgPromotionReadiness: summary.avgPromotionReadiness,
        TurnoverRate: summary.turnoverRate,
        AbsenteeismRate: summary.absenteeismRate,
        TopTurnoverFactors: summary.topTurnoverFactors,
        DeptWiseMetrics: summary.departmentMetrics,
    };

    await AnalyticsTrends.findOneAndUpdate(
        {},  // update the single latest doc
        { $set: trendDoc },
        { upsert: true, new: true }
    );
    console.log("  Analytics trends saved.");

    console.log("\n[OK] Seeding complete!");
    await mongoose.disconnect();
}

seed().catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
});
