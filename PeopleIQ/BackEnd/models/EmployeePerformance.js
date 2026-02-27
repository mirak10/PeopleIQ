// models/EmployeePerformance.js
import mongoose from "mongoose";

const EmployeePerformanceSchema = new mongoose.Schema({
  EmployeeID: { type: String, required: true },
  PerformanceRating: Number,
  LastOverallScore: Number,
  Salary: Number,
  MonthlyIncome: Number,
  TenureYears: Number,
  YearsSinceLastPromotion: Number,
  TrainingCount: Number,
  PercentSalaryHike: Number,
  StockOptionLevel: Number,
},
  { collection: "Employees_Performance" }
);

export default mongoose.model("Employees_Performance", EmployeePerformanceSchema);