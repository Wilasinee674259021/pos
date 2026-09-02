import express from "express";
import { Op } from "sequelize";
import Expense from "../models/Expense.js";

const router = express.Router();

// ======================================
// GET ALL EXPENSES
// ======================================

router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: expenses,
    });
  } catch (error) {
    console.error("GET EXPENSE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "ไม่สามารถโหลดรายการค่าใช้จ่ายได้",
      error: error.message,
    });
  }
});

// ======================================
// GET EXPENSES BY DATE RANGE
// ======================================

router.get("/report", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};

    if (startDate && endDate) {
      const start = new Date(`${startDate}T00:00:00+07:00`);
      const end = new Date(`${endDate}T23:59:59.999+07:00`);

      where.createdAt = {
        [Op.between]: [start, end],
      };
    }

    const expenses = await Expense.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    const totalExpense = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount || 0),
      0
    );

    res.json({
      success: true,
      data: expenses,
      totalExpense,
    });
  } catch (error) {
    console.error("GET EXPENSE REPORT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "ไม่สามารถโหลดรายงานค่าใช้จ่ายได้",
      error: error.message,
    });
  }
});

// ======================================
// CREATE EXPENSE
// ======================================

router.post("/", async (req, res) => {
  try {
    const {
      category,
      description,
      amount,
      paymentMethod,
      note,
    } = req.body;

    // ตรวจสอบหมวดหมู่
    if (!category || String(category).trim() === "") {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุหมวดหมู่ค่าใช้จ่าย",
      });
    }

    // ตรวจสอบรายละเอียด
    if (
      !description ||
      String(description).trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุรายละเอียดค่าใช้จ่าย",
      });
    }

    // ตรวจสอบจำนวนเงิน
    const expenseAmount = Number(amount);

    if (
      !Number.isFinite(expenseAmount) ||
      expenseAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "จำนวนเงินไม่ถูกต้อง",
      });
    }

    const expense = await Expense.create({
      category: String(category).trim(),
      description: String(description).trim(),
      amount: expenseAmount,
      paymentMethod: paymentMethod || null,
      note: note || null,
    });

    res.status(201).json({
      success: true,
      message: "บันทึกค่าใช้จ่ายเรียบร้อย",
      data: expense,
    });
  } catch (error) {
    console.error("CREATE EXPENSE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "ไม่สามารถบันทึกค่าใช้จ่ายได้",
      error: error.message,
    });
  }
});

// ======================================
// DELETE EXPENSE
// ======================================

router.delete("/:id", async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบรายการค่าใช้จ่าย",
      });
    }

    await expense.destroy();

    res.json({
      success: true,
      message: "ลบรายการค่าใช้จ่ายเรียบร้อย",
    });
  } catch (error) {
    console.error("DELETE EXPENSE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "ไม่สามารถลบรายการค่าใช้จ่ายได้",
      error: error.message,
    });
  }
});

export default router;