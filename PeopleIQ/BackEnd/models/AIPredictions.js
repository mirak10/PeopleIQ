// models/AIPredictions.js
import mongoose from "mongoose";

const AIPredictionsSchema = new mongoose.Schema({
  EmployeeID: { type: String, required: true, unique: true },
  Department: String,
  JobTitle: String,
  Gender: String,

  // (Attrition Risk removed)

  // Promotion
  PromotionScore: Number,
  PromotionReadiness: String,

  // Performance
  PredictedPerformance: Number,
  CurrentPerformance: Number,

  // Behavioral
  BurnoutScore: Number,
  BehavioralRiskLevel: String,

  // Engagement
  EngagementScore: Number,

  // Absence
  AbsenceDays: Number,

  // Pay Equity
  PayEquityGap: Number,
  Salary: Number,

  // Training
  TrainingImpactScore: Number,
  TrainingCount: Number,

  // Recommendations & Alerts
  Recommendations: [String],
  Alerts: [String],

  PredictionDate: Date,
},
  { collection: "AI_Predictions" });

export default mongoose.model("AI_Predictions", AIPredictionsSchema);