export const rolePermissions = {
  admin: ["*"],

  hr: [
    "Name",
    "Department",
    "JobRole",
    "JobLevel",
    "Education",
    "Salary",
    "MonthlyIncome",
    "StockOptionLevel",
    "Status"
  ],

  manager: [
    "PerformanceRating",
    "LastOverallScore",
    "TrainingCount",
    "PercentSalaryHike",
    "YearsSinceLastPromotion"
  ],

  employee: [
    "Name",
    "MaritalStatus",
    "DistanceFromHome",
    "WorkLifeBalance"
  ]
};