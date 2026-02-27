// models/EmployeeProfile.js
import mongoose from "mongoose";

const EmployeeProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  EmployeeID: { type: String, required: true, unique: true },
  Name: String,
  Email: String,
  Gender: String,
  Age: Number,
  MaritalStatus: String,
  Education: String,
  Department: String,
  JobRole: String,
  JobLevel: Number,
  Status: String,
},
  {timestamps: true , collection: "Employees_Profile" });

const EmployeeProfile = mongoose.model("EmployeeProfile", EmployeeProfileSchema);
export default EmployeeProfile;