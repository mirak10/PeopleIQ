import express from "express";
import { getEmployees, addEmployee, addBulk, updateEmployee, deleteEmployee } from "../controllers/employeeController.js";

const router = express.Router();

router.get("/", getEmployees);
router.post("/", addEmployee);
router.post("/bulk", addBulk);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

export default router;