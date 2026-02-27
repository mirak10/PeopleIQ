import express from "express";
import EmployeeProfile from "../models/EmployeeProfile.js";
import EmployeeBehavioral from "../models/EmployeeBehavioral.js";
import EmployeePerformance from "../models/EmployeePerformance.js";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

// Role helper
const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Forbidden: Insufficient role" });
  }
  next();
};

const defaultProfile = {
  Gender: "Not specified",
  Age: null,
  MaritalStatus: "Not specified",
  Education: "Not specified",
  JobLevel: 1,
  Status: "Active",
};

/* CREATE EMPLOYEE */
router.post("/", allowRoles("Admin", "HR"), async (req, res) => {
  try {
    const { name, email, department, role } = req.body;
    if (!name || !email)
      return res.status(400).json({ success: false, message: "Name and email required" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ success: false, message: "User already exists" });

    const tempPassword = Math.random().toString(36).slice(-8);

    const user = await User.create({
      name,
      email,
      password: tempPassword,
      role: role || "Employee",
    });

    const EmployeeID = `EMP-${Date.now().toString().slice(-6)}`;

    const profile = await EmployeeProfile.create({
      user: user._id,
      EmployeeID,
      Name: name,
      Email: email,
      Department: department || "General",
      JobRole: role || "Employee",
      ...defaultProfile,
    });

    // create behavioral & performance docs
    await EmployeeBehavioral.create({
      EmployeeID,
      EngagementScore: 0,
      BurnoutRiskScore: 0,
      JobSatisfaction: 3,
      WorkLifeBalance: 3,
      AbsenceDays_Last6M: 0,
      OverTime: false,
      DistanceFromHome: 0,
      BusinessTravel: "Rarely",
    });

    await EmployeePerformance.create({
      EmployeeID,
      PerformanceRating: 0,
      LastOverallScore: 0,
      Salary: 0,
      MonthlyIncome: 0,
      TenureYears: 0,
      YearsSinceLastPromotion: 0,
      TrainingCount: 0,
      PercentSalaryHike: 0,
      StockOptionLevel: 0,
    });

    res.status(201).json({
      success: true,
      data: await profile.populate("user", "name email role"),
      tempPassword,
    });
  } catch (err) {
    console.error("Add employee error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* GET EMPLOYEES (Paginated & Aggregated) */
router.get("/", allowRoles("Admin", "HR", "Manager"), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const skip = (page - 1) * limit;

    const data = await EmployeeProfile.aggregate([
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "employeebehaviorals",
          localField: "EmployeeID",
          foreignField: "EmployeeID",
          as: "behavior"
        }
      },
      {
        $lookup: {
          from: "employeeperformances",
          localField: "EmployeeID",
          foreignField: "EmployeeID",
          as: "performance"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      { $unwind: { path: "$behavior", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$performance", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id: "$_id",
          EmployeeID: 1,
          Name: 1,
          Email: 1,
          Department: 1,
          JobRole: 1,
          Status: 1,
          user: {
            name: "$userInfo.name",
            email: "$userInfo.email",
            role: "$userInfo.role"
          },
          attritionRisk: { $ifNull: ["$behavior.BurnoutRiskScore", 0] },
          engagementScore: { $ifNull: ["$behavior.EngagementScore", 0] },
          performanceRating: { $ifNull: ["$performance.PerformanceRating", 0] },
        }
      }
    ]);

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* UPDATE EMPLOYEE */
router.put("/:id", allowRoles("Admin", "HR"), async (req, res) => {
  try {
    const { name, department, role, status, behavioral, performance } = req.body;

    const employee = await EmployeeProfile.findById(req.params.id);
    if (!employee)
      return res.status(404).json({ success: false, message: "Employee not found" });

    // Update profile
    if (name) employee.Name = name;
    if (department) employee.Department = department;
    if (role) employee.JobRole = role;
    if (status) employee.Status = status;

    await employee.save();

    // Update behavioral
    const behaviorDoc = await EmployeeBehavioral.findOne({ EmployeeID: employee.EmployeeID });
    if (behaviorDoc && behavioral) {
      Object.keys(behavioral).forEach(key => {
        if (behavioral[key] !== undefined) behaviorDoc[key] = behavioral[key];
      });
      await behaviorDoc.save();
    }

    // Update performance
    const performanceDoc = await EmployeePerformance.findOne({ EmployeeID: employee.EmployeeID });
    if (performanceDoc && performance) {
      Object.keys(performance).forEach(key => {
        if (performance[key] !== undefined) performanceDoc[key] = performance[key];
      });
      await performanceDoc.save();
    }

    res.json({ success: true, data: await employee.populate("user", "name email role") });
  } catch (err) {
    console.error("Update employee error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* DELETE */
router.delete("/:id", allowRoles("Admin"), async (req, res) => {
  try {
    const employee = await EmployeeProfile.findById(req.params.id);
    if (!employee)
      return res.status(404).json({ success: false, message: "Employee not found" });

    await EmployeeBehavioral.deleteOne({ EmployeeID: employee.EmployeeID });
    await EmployeePerformance.deleteOne({ EmployeeID: employee.EmployeeID });
    await User.findByIdAndDelete(employee.user);
    await employee.deleteOne();

    res.json({ success: true, message: "Employee deleted" });
  } catch (err) {
    console.error("Delete employee error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;