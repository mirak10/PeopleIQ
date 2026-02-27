// models/EmployeeBehavioral.js
import mongoose from "mongoose";

const EmployeeBehavioralSchema = new mongoose.Schema({
  EmployeeID: { type: String, required: true },
  EngagementScore: Number,
  BurnoutRiskScore: Number,
  JobSatisfaction: Number,
  WorkLifeBalance: Number,
  AbsenceDays_Last6M: Number,
  OverTime: Boolean,
  DistanceFromHome: Number,
  BusinessTravel: String,
},
  { collection: "Employees_Behavioral" }
);

export default mongoose.model("Employees_Behavioral", EmployeeBehavioralSchema);