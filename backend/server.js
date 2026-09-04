
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import sequelize from "./config/database.js";

// =========================
// MODELS
// =========================

import "./models/Product.js";
import "./models/Sale.js";
import "./models/SaleItem.js";
import "./models/StockMovement.js";
import "./models/Member.js";
import "./models/Promotion.js";
import "./models/Branch.js";

// =========================
// ROUTES
// =========================

import productRoutes from "./routes/productRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import promotionRoutes from "./routes/promotionRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import branchRoutes from "./routes/branchRoutes.js";

// =========================
// CONFIG
// =========================

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// =========================
// MIDDLEWARE
// =========================

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// =========================
// HOME
// =========================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Convenience POS Backend ทำงานแล้ว",
  });
});

// =========================
// API ROUTES
// =========================

app.use(
  "/api/products",
  productRoutes
);

app.use(
  "/api/sales",
  saleRoutes
);

app.use(
  "/api/members",
  memberRoutes
);

app.use(
  "/api/promotions",
  promotionRoutes
);

app.use(
  "/api/stock",
  stockRoutes
);

app.use(
  "/api/branches",
  branchRoutes
);

// =========================
// 404
// =========================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "ไม่พบ API นี้",
    path: req.originalUrl,
  });
});

// =========================
// START SERVER
// =========================

const startServer = async () => {
  try {
    await sequelize.authenticate();

    console.log("PostgreSQL Connected");

    await sequelize.sync();

    console.log(
      "Database tables synchronized"
    );

    app.listen(PORT, () => {
      console.log(
        "Convenience POS Backend"
      );

      console.log(
        `Server: http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Database connection failed:"
    );

    console.error(error);
  }
};

startServer();

