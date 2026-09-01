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
// =========================
// IMPORT ROUTES
// =========================

import memberRoutes from "./routes/memberRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
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
// ROUTES
// =========================

app.use("/api/members", memberRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sales", saleRoutes);
// =========================
// TEST SERVER
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
    await sequelize.sync();

    console.log("Database tables synchronized");
    console.log("================================");
  } catch (error) {
    console.error("================================");
    console.error("DATABASE ERROR");
    console.error(error.message || error);
    console.error("================================");
    console.warn(
      "Backend will continue running without a connected PostgreSQL database."
    );
  }

  app.listen(PORT, () => {
    console.log("Convenience POS Backend");
    console.log(`Server: http://localhost:${PORT}`);
    console.log("================================");
  });
};

startServer();
