import Employee from "../models/EmployeeProfile.js";
import Behavioral from "../models/EmployeeBehavioral.js";
import Performance from "../models/EmployeePerformance.js";
import { rolePermissions } from "../utils/fieldPermissions.js";

/* ================== GET ================== */
export const getEmployees = async (req, res) => {
  try {
    const profiles = await Employee.find().lean();

    // pull behavioral data to compute risk
    const behavioral = await Behavioral.find().lean();
    const behaviorMap = {};
    behavioral.forEach(b => {
      behaviorMap[b.EmployeeID] = b;
    });

    const formatted = profiles.map(emp => {
      const behavior = behaviorMap[emp.EmployeeID];

      const attritionRisk = behavior
        ? Number(behavior.BurnoutRiskScore || 0)
        : 0;

      return {
        id: emp._id,
        name: emp.Name,
        email: emp.Email,
        department: emp.Department,
        role: emp.JobRole,
        status: emp.Status,
        attritionRisk
      };
    });

    res.json({ success: true, data: formatted });

  } catch (err) {
    console.error("GET EMPLOYEES ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================== ADD ================== */
export const addEmployee = async (req, res) => {
  try {
    const { name, email, department, role } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // create readable employee ID (same format your DB uses)
    const employeeCode = `E${Date.now().toString().slice(-5)}`;

    const employee = await Employee.create({
      EmployeeID: employeeCode,
      Name: name,
      Email: email,
      Department: department || "General",
      JobRole: role || "Employee",
      Status: "Active"
    });

    // insert related docs using SAME EmployeeID field your schemas use
    await Behavioral.create({
      EmployeeID: employeeCode,
      EngagementScore: 0,
      BurnoutRiskScore: 0,
      JobSatisfaction: 3,
      WorkLifeBalance: 3,
      AbsenceDays_Last6M: 0,
      OverTime: false,
      DistanceFromHome: 0,
      BusinessTravel: "Rarely"
    });

    await Performance.create({
      EmployeeID: employeeCode,
      PerformanceRating: 0,
      LastOverallScore: 0,
      Salary: 0,
      MonthlyIncome: 0,
      TenureYears: 0,
      YearsSinceLastPromotion: 0,
      TrainingCount: 0,
      PercentSalaryHike: 0,
      StockOptionLevel: 0
    });

    res.status(201).json({ success: true, data: employee });

  } catch (err) {
    console.error("ADD EMPLOYEE ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================== UPDATE ================== */
export const updateEmployee = async (req, res) => {
  try {
    const role = req.user.role.toLowerCase();
    const allowed = rolePermissions[role] || [];

    const updates = req.body;

    // helper: check if field allowed
    const isAllowed = (field) =>
      allowed.includes("*") || allowed.includes(field);

    // split updates by schema
    const profileUpdates = {};
    const behavioralUpdates = {};
    const performanceUpdates = {};

    Object.keys(updates).forEach((key) => {
      if (!isAllowed(key)) return;

      if (Employee.schema.paths[key]) profileUpdates[key] = updates[key];
      if (Behavioral.schema.paths[key]) behavioralUpdates[key] = updates[key];
      if (Performance.schema.paths[key]) performanceUpdates[key] = updates[key];
    });

    const employee = await Employee.findById(req.params.id);
    if (!employee)
      return res.status(404).json({ success: false, message: "Employee not found" });

    if (Object.keys(profileUpdates).length)
      await Employee.findByIdAndUpdate(req.params.id, profileUpdates);

    if (Object.keys(behavioralUpdates).length)
      await Behavioral.findOneAndUpdate(
        { EmployeeID: employee.EmployeeID },
        behavioralUpdates
      );

    if (Object.keys(performanceUpdates).length)
      await Performance.findOneAndUpdate(
        { EmployeeID: employee.EmployeeID },
        performanceUpdates
      );

    res.json({ success: true, message: "Employee updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================== DELETE ================== */
export const deleteEmployee = async (req, res) => {
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    res.json({ success: true, data: deleted });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};