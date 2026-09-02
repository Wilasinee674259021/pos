import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import sequelize from "./config/database.js";

// ======================================
// MODELS
// ======================================

import "./models/Product.js";
import "./models/Member.js";
import "./models/Sale.js";
import "./models/SaleItem.js";
import "./models/StockMovement.js";
import "./models/Expense.js";
import "./models/PurchaseOrder.js";
import "./models/PurchaseItem.js";

// ======================================
// ROUTES
// ======================================

import salesRoutes from "./routes/salesRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config();

const app = express();

// ======================================
// MIDDLEWARE
// ======================================

app.use(cors());
app.use(express.json());

// ======================================
// ROOT
// ======================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Convenience POS Backend ทำงานแล้ว 🚀",
  });
});

// ======================================
// API ROUTES
// ======================================

app.use("/api/products", productRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ======================================
// DATABASE + SERVER
// ======================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // เชื่อมต่อ PostgreSQL
    await sequelize.authenticate();

    console.log("✅ Database connected");

    // สร้าง / อัปเดตตารางตาม Models
    await sequelize.sync({ alter: true });

    console.log("✅ Database tables synchronized");

    // เปิด Server
    app.listen(PORT, () => {
      console.log(
        `🚀 Backend running at http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "❌ Server startup error:",
      error
    );
  }
};

startServer();