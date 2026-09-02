import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import sequelize from "./config/database.js";

// =========================
// IMPORT MODELS
// =========================

import "./models/Member.js";
import "./models/Product.js";
import "./models/Sale.js";
import "./models/SaleItem.js";
import "./models/StockMovement.js";
import "./models/Expense.js";
import "./models/PurchaseOrder.js";
import "./models/PurchaseItem.js";

// =========================
// IMPORT ROUTES
// =========================

import memberRoutes from "./routes/memberRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

// =========================
// LOAD ENV
// =========================

dotenv.config();

// =========================
// CREATE APP
// =========================

const app = express();

// =========================
// MIDDLEWARE
// =========================

app.use(cors());
app.use(express.json());

// =========================
// ROOT
// =========================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Convenience POS Backend ทำงานแล้ว",
  });
});

// =========================
// TEST API
// =========================

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API เชื่อมต่อสำเร็จ",
  });
});

// =========================
// TEST DATABASE
// =========================

app.get("/api/db-test", async (req, res) => {
  try {
    await sequelize.authenticate();

    res.json({
      success: true,
      message: "เชื่อมต่อ PostgreSQL สำเร็จ",
    });
  } catch (error) {
    console.error("Database Error:", error);

    res.status(500).json({
      success: false,
      message: "เชื่อมต่อ PostgreSQL ไม่สำเร็จ",
      error: error.message,
    });
  }
});

// =========================
// API ROUTES
// =========================

app.use("/api/members", memberRoutes);

app.use("/api/products", productRoutes);

app.use("/api/sales", saleRoutes);

app.use("/api/expenses", expenseRoutes);

app.use("/api/purchases", purchaseRoutes);

app.use("/api/dashboard", dashboardRoutes);

// =========================
// START SERVER
// =========================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // เชื่อมต่อ PostgreSQL
    await sequelize.authenticate();

    console.log("================================");
    console.log("PostgreSQL Connected");
    console.log("================================");

    // สร้าง/อัปเดตตารางจาก Models
    await sequelize.sync({
      alter: true,
    });

    console.log("Database tables synchronized");
    console.log("================================");

    app.listen(PORT, () => {
      console.log("Convenience POS Backend");
      console.log(`Server: http://localhost:${PORT}`);
      console.log("================================");
    });
  } catch (error) {
    console.error("================================");
    console.error("DATABASE ERROR");
    console.error(error.message || error);
    console.error("================================");
  }
};

startServer();