"""
generate_predictions.py
-----------------------
Reads the HR CSV datasets and produces per-employee ML predictions.
Replicates the scoring logic from the Jupyter notebooks without
requiring trained model files.

Usage:
    python scripts/generate_predictions.py

Output:
    data/predictions_output.json
"""

import json
import os
import sys
import numpy as np
import pandas as pd
from datetime import datetime

# ── Paths ───────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(BACKEND_DIR)), "data")
OUTPUT_PATH = os.path.join(BACKEND_DIR, "data", "predictions_output.json")

ML_CSV = os.path.join(DATA_DIR, "employee_ml_dataset_v3.csv")
ATTR_CSV = os.path.join(DATA_DIR, "HR-Employee-Attrition.csv")


def load_data():
    """Load both datasets."""
    print(f"Loading ML dataset from: {ML_CSV}")
    df_ml = pd.read_csv(ML_CSV)
    print(f"  -> {len(df_ml)} rows, {len(df_ml.columns)} columns")

    print(f"Loading Attrition dataset from: {ATTR_CSV}")
    df_attr = pd.read_csv(ATTR_CSV)
    print(f"  -> {len(df_attr)} rows, {len(df_attr.columns)} columns")

    return df_ml, df_attr


# ── Attrition / Flight Risk ─────────────────────────────────────────
def compute_attrition_risk(row, burnout, promo_score):
    """Proxy for flight risk since models are removed."""
    risk = 0.2
    
    if float(row.get("EngagementScore", 3)) < 2:
        risk += 0.3
    if burnout >= 0.7:
        risk += 0.2
    if promo_score < 0.4 and float(row.get("TenureYears", 0)) > 3:
        risk += 0.2
        
    return round(min(1.0, max(0.0, risk)), 3)

def get_attrition_level(score):
    if score >= 0.7: return "High"
    if score >= 0.4: return "Medium"
    return "Low"

def get_top_risk_factors(row):
    factors = []
    if float(row.get("BurnoutRiskScore", 0)) > 0.6: factors.append("High Burnout")
    if float(row.get("EngagementScore", 3)) < 2.5: factors.append("Low Engagement")
    if float(row.get("PayStagnationFlag", 0)) == 1: factors.append("Pay Stagnation")
    if float(row.get("CareerStagnationFlag", 0)) == 1: factors.append("Career Stagnation")
    if not factors: return ["No significant risk factors"]
    return factors


# ── Promotion Readiness ────────────────────────────────────────────
def compute_promotion_score(row):
    """
    Promotion readiness based on performance, tenure, training.
    """
    score = 0.0

    # Performance rating (1-5) – weight 35%
    perf = float(row.get("PerformanceRating", 0))
    score += (perf / 5.0) * 0.35

    # Average overall score – weight 25%
    avg_score = float(row.get("AvgOverallScore", 0))
    score += (avg_score / 5.0) * 0.25

    # Training count – weight 15%
    training = float(row.get("TrainingCount", 0))
    score += min(1.0, training / 6.0) * 0.15

    # Tenure – weight 15% (moderate tenure is ideal)
    tenure = float(row.get("TenureYears", 0))
    tenure_score = min(1.0, tenure / 8.0)
    score += tenure_score * 0.15

    # No career stagnation bonus – weight 10%
    if float(row.get("CareerStagnationFlag", 0)) == 0:
        score += 0.10

    return round(min(1.0, max(0.0, score)), 3)


def get_promotion_readiness(score):
    if score >= 0.7:
        return "Ready"
    if score >= 0.4:
        return "Developing"
    return "Not Ready"


# ── Performance Prediction ─────────────────────────────────────────
def predict_performance(row):
    """Predict next performance rating based on trends."""
    current = float(row.get("PerformanceRating", 3))
    avg = float(row.get("AvgOverallScore", current))
    drop = float(row.get("PerformanceDropFlag", 0))

    predicted = (current * 0.5 + avg * 0.3 + (current - drop) * 0.2)
    return round(min(5.0, max(1.0, predicted)), 1)


# ── Behavioral Risk ────────────────────────────────────────────────
def compute_behavioral_risk(row):
    """Classify behavioral risk from burnout and absence patterns."""
    burnout = float(row.get("BurnoutRiskScore", 0))
    absence = float(row.get("AbsenceDays_Last6M", 0))
    overtime = 1 if row.get("HighAbsenceFlag", 0) else 0

    # Weighted combination
    risk = burnout * 0.5 + min(1.0, absence / 20.0) * 0.3 + overtime * 0.2
    return round(risk, 3)


def get_behavioral_risk_level(score):
    if score >= 0.6:
        return "High"
    if score >= 0.3:
        return "Moderate"
    return "Low"

def get_absence_risk(days):
    if days >= 15: return "High"
    if days >= 8: return "Medium"
    return "Low"


# ── Pay Equity ─────────────────────────────────────────────────────
def compute_pay_equity(df):
    """Compute salary gap relative to department average."""
    dept_avg = df.groupby("Department")["Salary"].transform("mean")
    df["PayEquityGap"] = round((df["Salary"] - dept_avg) / dept_avg, 3)
    return df


# ── Training Impact ────────────────────────────────────────────────
def compute_training_impact(row):
    """Score training's impact on this employee."""
    training_count = float(row.get("TrainingCount", 0))
    no_training = float(row.get("NoTrainingFlag", 0))
    days_since = float(row.get("DaysSinceLastTraining", 0))

    if no_training == 1:
        return 0.0

    recency = max(0, 1 - days_since / 365)
    volume = min(1.0, training_count / 6.0)
    impact = recency * 0.6 + volume * 0.4

    return round(impact, 3)


# ── Recommendations ────────────────────────────────────────────────
def generate_recommendations(row):
    """Generate top HR action recommendations per employee."""
    recs = []

    if float(row.get("BurnoutRiskScore", 0)) >= 0.5:
        recs.append("Assess workload and consider redistribution")

    if float(row.get("EngagementScore", 0)) < 1:
        recs.append("Implement engagement improvement plan")

    if float(row.get("PayStagnationFlag", 0)) == 1:
        recs.append("Review compensation and consider salary adjustment")

    if float(row.get("CareerStagnationFlag", 0)) == 1:
        recs.append("Discuss career development path and growth opportunities")

    if float(row.get("NoTrainingFlag", 0)) == 1:
        recs.append("Enroll in relevant training or upskilling program")

    if float(row.get("PerformanceDropFlag", 0)) == 1:
        recs.append("Set up performance improvement plan with clear milestones")

    if float(row.get("HighAbsenceFlag", 0)) == 1:
        recs.append("Review attendance patterns and discuss work-life balance")

    if float(row.get("PerformanceRating", 3)) >= 4:
        recs.append("Recognize high performance and discuss promotion timeline")

    if not recs:
        recs.append("Continue current engagement strategies")

    return recs[:5]


# ── Alerts ──────────────────────────────────────────────────────────
def generate_alerts(row):
    """Generate alerts for employees needing attention."""
    alerts = []

    if float(row.get("BurnoutRiskScore", 0)) >= 0.7:
        alerts.append("Burnout risk above critical threshold")

    if float(row.get("NoTrainingFlag", 0)) == 1:
        alerts.append("No training completed in 6+ months")

    if float(row.get("PerformanceDropFlag", 0)) == 1:
        alerts.append("Performance has declined from previous period")

    if float(row.get("AbsenceDays_Last6M", 0)) >= 15:
        alerts.append("Excessive absences in last 6 months")

    if float(row.get("PayStagnationFlag", 0)) == 1 and float(row.get("CareerStagnationFlag", 0)) == 1:
        alerts.append("Both pay and career stagnation detected")

    return alerts


# ── Main Pipeline ───────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("HR Analytics - ML Prediction Pipeline")
    print("=" * 60)

    df_ml, df_attr = load_data()

    # Compute pay equity gaps
    df_ml = compute_pay_equity(df_ml)

    predictions = []
    now = datetime.utcnow().isoformat()

    for _, row in df_ml.iterrows():
        # Core predictions

        promo_score = compute_promotion_score(row)
        promo_readiness = get_promotion_readiness(promo_score)

        predicted_perf = predict_performance(row)

        behavioral_risk = compute_behavioral_risk(row)
        behavioral_level = get_behavioral_risk_level(behavioral_risk)
        
        burnout = round(float(row.get("BurnoutRiskScore", 0)), 3)
        absence_days = int(row.get("AbsenceDays_Last6M", 0))
        absence_risk = get_absence_risk(absence_days)
        
        attrition_risk = compute_attrition_risk(row, burnout, promo_score)
        attrition_level = get_attrition_level(attrition_risk)
        risk_factors = get_top_risk_factors(row)

        training_impact = compute_training_impact(row)

        recs = generate_recommendations(row)
        alerts = generate_alerts(row)

        record = {
            "EmployeeID": str(row["EmployeeID"]),
            "Department": str(row.get("Department", "Unknown")),
            "JobTitle": str(row.get("JobTitle", "Unknown")),
            "Gender": str(row.get("Gender", "Unknown")),

            # Attrition
            "AttritionRisk": attrition_risk,
            "AttritionRiskLevel": attrition_level,
            "TopRiskFactors": risk_factors,

            # Promotion
            "PromotionScore": promo_score,
            "PromotionReadiness": promo_readiness,

            # Performance
            "PredictedPerformance": predicted_perf,
            "CurrentPerformance": int(row.get("PerformanceRating", 3)),

            # Behavioral
            "BurnoutScore": round(float(row.get("BurnoutRiskScore", 0)), 3),
            "BehavioralRiskLevel": behavioral_level,

            # Engagement
            "EngagementScore": round(float(row.get("EngagementScore", 0)), 2),

            # Absence
            "AbsenceDays": absence_days,
            "AbsenceRisk": absence_risk,

            # Pay Equity
            "PayEquityGap": float(row.get("PayEquityGap", 0)),
            "Salary": float(row.get("Salary", 0)),

            # Training
            "TrainingImpactScore": training_impact,
            "TrainingCount": int(row.get("TrainingCount", 0)),

            # Recommendations & Alerts
            "Recommendations": recs,
            "Alerts": alerts,

            "PredictionDate": now,
        }
        predictions.append(record)

    # ── Summary statistics ──────────────────────────────────────────
    total = len(predictions)
    avg_engagement = round(np.mean([p["EngagementScore"] for p in predictions]), 2)
    avg_burnout = round(np.mean([p["BurnoutScore"] for p in predictions]), 3)
    avg_promo = round(np.mean([p["PromotionScore"] for p in predictions]), 3)

    # Department-wise metrics
    dept_metrics = {}
    for p in predictions:
        dept = p["Department"]
        if dept not in dept_metrics:
            dept_metrics[dept] = {
                "count": 0, "engagement_sum": 0,
                "burnout_sum": 0,
                "salary_sum": 0, "promo_ready": 0,
            }
        m = dept_metrics[dept]
        m["count"] += 1
        m["engagement_sum"] += p["EngagementScore"]
        m["burnout_sum"] += p["BurnoutScore"]
        m["salary_sum"] += p["Salary"]
        if p["PromotionReadiness"] == "Ready":
            m["promo_ready"] += 1

    dept_summary = {}
    for dept, m in dept_metrics.items():
        c = m["count"]
        dept_summary[dept] = {
            "count": c,
            "avgEngagement": round(m["engagement_sum"] / c, 2),
            "avgBurnout": round(m["burnout_sum"] / c, 3),
            "avgSalary": round(m["salary_sum"] / c, 0),
            "promotionReady": m["promo_ready"],
        }

    summary = {
        "totalEmployees": total,
        "avgEngagement": avg_engagement,
        "avgBurnoutScore": avg_burnout,
        "avgPromotionReadiness": avg_promo,
        "departmentMetrics": dept_summary,
    }

    output = {
        "generatedAt": now,
        "summary": summary,
        "predictions": predictions,
    }

    # ── Write output ────────────────────────────────────────────────
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, default=str)

    print(f"\n[OK] Generated predictions for {total} employees")
    print(f"\nOutput written to: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
