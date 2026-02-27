// models/AnalyticsTrends.js
import mongoose from "mongoose";

const AnalyticsTrendsSchema = new mongoose.Schema({
  Date: Date,
  TotalEmployees: Number,
  AvgAttritionRisk: Number,
  AvgEngagement: Number,
  HighRiskCount: Number,
  MediumRiskCount: Number,
  LowRiskCount: Number,
  AvgBurnoutScore: Number,
  AvgPromotionReadiness: Number,
  TurnoverRate: Number,
  AbsenteeismRate: Number,
  TopTurnoverFactors: [{ factor: String, weight: Number }],
  DeptWiseMetrics: Object,
},
  { collection: "Analytics_Trends" });

export default mongoose.model("Analytics_Trends", AnalyticsTrendsSchema);