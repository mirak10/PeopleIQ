// routes/predictions.js — Optimized with MongoDB aggregation pipelines
import express from "express";
import AIPredictions from "../models/AIPredictions.js";
import AnalyticsTrends from "../models/AnalyticsTrends.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

const allowRoles = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: "Forbidden" });
    }
    next();
};

/* ── GET /api/predictions/summary ────────────────────────────── */
router.get("/summary", allowRoles("Admin", "HR"), async (req, res) => {
    try {
        // Fast path: read pre-computed trends doc
        const trends = await AnalyticsTrends.findOne().sort({ Date: -1 }).lean();
        if (trends) return res.json({ success: true, data: trends });

        // Fallback: aggregate from predictions
        const [agg] = await AIPredictions.aggregate([{
            $group: {
                _id: null,
                totalEmployees: { $sum: 1 },
                highRiskCount: { $sum: { $cond: [{ $eq: ["$AttritionRiskLevel", "High"] }, 1, 0] } },
                mediumRiskCount: { $sum: { $cond: [{ $eq: ["$AttritionRiskLevel", "Medium"] }, 1, 0] } },
                lowRiskCount: { $sum: { $cond: [{ $eq: ["$AttritionRiskLevel", "Low"] }, 1, 0] } },
                avgAttritionRisk: { $avg: "$AttritionRisk" },
                avgEngagement: { $avg: "$EngagementScore" },
                avgBurnoutScore: { $avg: "$BurnoutScore" },
            }
        }]);
        if (!agg) return res.json({ success: true, data: null });
        agg.turnoverRate = +(agg.highRiskCount / agg.totalEmployees * 100).toFixed(1);
        res.json({ success: true, data: agg });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/* ── GET /api/predictions/alerts ─────────────────────────────── */
router.get("/alerts", allowRoles("Admin", "HR"), async (req, res) => {
    try {
        const withAlerts = await AIPredictions.find(
            { Alerts: { $exists: true, $not: { $size: 0 } } },
            { EmployeeID: 1, Department: 1, JobTitle: 1, Alerts: 1, AttritionRiskLevel: 1 }
        ).limit(100).lean();
        res.json({ success: true, data: withAlerts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/* ── GET /api/predictions/turnover ───────────────────────────── */
router.get("/turnover", allowRoles("Admin", "HR"), async (req, res) => {
    try {
        // Run all aggregations in parallel
        const [distAgg, deptAgg, factorsAgg, highRisk] = await Promise.all([
            // 1. Risk distribution counts
            AIPredictions.aggregate([
                { $group: { _id: "$AttritionRiskLevel", count: { $sum: 1 } } }
            ]),
            // 2. Department breakdown
            AIPredictions.aggregate([
                {
                    $group: {
                        _id: "$Department",
                        count: { $sum: 1 },
                        riskSum: { $sum: "$AttritionRisk" },
                        highRisk: { $sum: { $cond: [{ $eq: ["$AttritionRiskLevel", "High"] }, 1, 0] } },
                    }
                },
                {
                    $project: {
                        name: "$_id", count: 1,
                        avgRisk: { $round: [{ $divide: ["$riskSum", "$count"] }, 3] },
                        highRiskCount: "$highRisk",
                    }
                },
            ]),
            // 3. Top risk factors (unwind + count)
            AIPredictions.aggregate([
                { $unwind: "$TopRiskFactors" },
                { $match: { TopRiskFactors: { $ne: "No significant risk factors" } } },
                { $group: { _id: "$TopRiskFactors", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 8 },
                { $project: { factor: "$_id", count: 1, _id: 0 } },
            ]),
            // 4. High risk employees (top 50)
            AIPredictions.find(
                { AttritionRiskLevel: "High" },
                { EmployeeID: 1, Department: 1, JobTitle: 1, AttritionRisk: 1, AttritionRiskLevel: 1, TopRiskFactors: 1 }
            ).sort({ AttritionRisk: -1 }).limit(50).lean(),
        ]);

        const distribution = { High: 0, Medium: 0, Low: 0 };
        distAgg.forEach(d => { distribution[d._id] = d.count; });
        const totalEmployees = Object.values(distribution).reduce((a, b) => a + b, 0);

        res.json({
            success: true,
            data: {
                distribution,
                departments: deptAgg,
                topFactors: factorsAgg,
                highRiskEmployees: highRisk,
                totalEmployees,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/* ── GET /api/predictions/performance ────────────────────────── */
router.get("/performance", allowRoles("Admin", "HR", "Manager"), async (req, res) => {
    try {
        const [ratingAgg, promoAgg, deptAgg, topPerformers] = await Promise.all([
            AIPredictions.aggregate([
                { $group: { _id: { $round: ["$CurrentPerformance", 0] }, count: { $sum: 1 } } },
                { $sort: { _id: 1 } },
            ]),
            AIPredictions.aggregate([
                { $group: { _id: "$PromotionReadiness", count: { $sum: 1 } } },
            ]),
            AIPredictions.aggregate([
                { $group: { _id: "$Department", sum: { $sum: "$CurrentPerformance" }, count: { $sum: 1 } } },
                { $project: { name: "$_id", avgPerformance: { $round: [{ $divide: ["$sum", "$count"] }, 2] }, count: 1 } },
                { $sort: { avgPerformance: -1 } },
            ]),
            AIPredictions.find({}, {
                EmployeeID: 1, Department: 1, CurrentPerformance: 1, PredictedPerformance: 1, PromotionReadiness: 1,
            }).sort({ CurrentPerformance: -1 }).limit(10).lean(),
        ]);

        const ratingDistribution = {};
        ratingAgg.forEach(r => { ratingDistribution[r._id] = r.count; });

        const promotionBreakdown = {};
        promoAgg.forEach(p => { promotionBreakdown[p._id] = p.count; });

        res.json({
            success: true,
            data: { ratingDistribution, topPerformers, promotionBreakdown, departments: deptAgg },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/* ── GET /api/predictions/absenteeism ────────────────────────── */
router.get("/absenteeism", allowRoles("Admin", "HR", "Manager"), async (req, res) => {
    try {
        const [distAgg, deptAgg, highAbsence] = await Promise.all([
            AIPredictions.aggregate([
                { $group: { _id: "$AbsenceRisk", count: { $sum: 1 } } },
            ]),
            AIPredictions.aggregate([
                {
                    $group: {
                        _id: "$Department",
                        count: { $sum: 1 },
                        absSum: { $sum: "$AbsenceDays" },
                        highCount: { $sum: { $cond: [{ $eq: ["$AbsenceRisk", "High"] }, 1, 0] } },
                    }
                },
                {
                    $project: {
                        name: "$_id", count: 1,
                        avgAbsenceDays: { $round: [{ $divide: ["$absSum", "$count"] }, 1] },
                        highRiskCount: "$highCount",
                    }
                },
            ]),
            AIPredictions.find(
                { AbsenceRisk: "High" },
                { EmployeeID: 1, Department: 1, JobTitle: 1, AbsenceDays: 1, BurnoutScore: 1, AbsenceRisk: 1 }
            ).sort({ AbsenceDays: -1 }).limit(30).lean(),
        ]);

        const distribution = { High: 0, Medium: 0, Low: 0 };
        distAgg.forEach(d => { distribution[d._id] = d.count; });

        res.json({
            success: true,
            data: { distribution, departments: deptAgg, highAbsenceEmployees: highAbsence },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/* ── GET /api/predictions/recommendations ────────────────────── */
router.get("/recommendations", allowRoles("Admin", "HR"), async (req, res) => {
    try {
        const [payEquityAgg, trainingAgg, actionable] = await Promise.all([
            // Pay equity by dept + gender
            AIPredictions.aggregate([
                {
                    $group: {
                        _id: { dept: "$Department", gender: "$Gender" },
                        salarySum: { $sum: "$Salary" },
                        gapSum: { $sum: "$PayEquityGap" },
                        count: { $sum: 1 },
                    }
                },
                {
                    $project: {
                        department: "$_id.dept", gender: "$_id.gender",
                        avgSalary: { $round: [{ $divide: ["$salarySum", "$count"] }, 0] },
                        avgGap: { $round: [{ $divide: ["$gapSum", "$count"] }, 3] },
                        count: 1, _id: 0,
                    }
                },
            ]),
            // Training impact by dept
            AIPredictions.aggregate([
                {
                    $group: {
                        _id: "$Department",
                        trainedCount: { $sum: { $cond: [{ $gt: ["$TrainingCount", 0] }, 1, 0] } },
                        untrainedCount: { $sum: { $cond: [{ $eq: ["$TrainingCount", 0] }, 1, 0] } },
                        impactSum: { $sum: { $cond: [{ $gt: ["$TrainingCount", 0] }, "$TrainingImpactScore", 0] } },
                        engTrainedSum: { $sum: { $cond: [{ $gt: ["$TrainingCount", 0] }, "$EngagementScore", 0] } },
                        engUntrainedSum: { $sum: { $cond: [{ $eq: ["$TrainingCount", 0] }, "$EngagementScore", 0] } },
                    }
                },
                {
                    $project: {
                        department: "$_id",
                        trainedCount: 1, untrainedCount: 1,
                        avgImpact: { $cond: [{ $gt: ["$trainedCount", 0] }, { $round: [{ $divide: ["$impactSum", "$trainedCount"] }, 3] }, 0] },
                        avgEngTrained: { $cond: [{ $gt: ["$trainedCount", 0] }, { $round: [{ $divide: ["$engTrainedSum", "$trainedCount"] }, 2] }, 0] },
                        avgEngUntrained: { $cond: [{ $gt: ["$untrainedCount", 0] }, { $round: [{ $divide: ["$engUntrainedSum", "$untrainedCount"] }, 2] }, 0] },
                        _id: 0,
                    }
                },
            ]),
            // High/medium risk with recommendations
            AIPredictions.find(
                { AttritionRiskLevel: { $in: ["High", "Medium"] } },
                { EmployeeID: 1, Department: 1, JobTitle: 1, AttritionRiskLevel: 1, Recommendations: 1 }
            ).sort({ AttritionRisk: -1 }).limit(50).lean(),
        ]);

        res.json({
            success: true,
            data: { payEquity: payEquityAgg, training: trainingAgg, actionableEmployees: actionable },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/* ── GET /api/predictions/department/:dept ────────────────────── */
router.get("/department/:dept", allowRoles("Admin", "HR", "Manager"), async (req, res) => {
    try {
        const predictions = await AIPredictions.find({ Department: req.params.dept }).limit(500).lean();
        res.json({ success: true, data: predictions });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/* ── GET /api/predictions/:empId ─────────────────────────────── */
router.get("/:empId", allowRoles("Admin", "HR", "Manager", "Employee"), async (req, res) => {
    try {
        const prediction = await AIPredictions.findOne({ EmployeeID: req.params.empId }).lean();
        if (!prediction) return res.status(404).json({ success: false, message: "Prediction not found" });
        res.json({ success: true, data: prediction });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/* ── GET /api/predictions ────────────────────────────────────── */
router.get("/", allowRoles("Admin", "HR"), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 50, 100);
        const skip = (page - 1) * limit;
        const filter = {};

        if (req.query.risk) filter.AttritionRiskLevel = req.query.risk;
        if (req.query.department) filter.Department = req.query.department;

        const [predictions, total] = await Promise.all([
            AIPredictions.find(filter).skip(skip).limit(limit).lean(),
            AIPredictions.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: predictions,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
