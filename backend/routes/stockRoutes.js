import express from "express";
import sequelize from "../config/database.js";
import Product from "../models/Product.js";
import StockMovement from "../models/StockMovement.js";

const router = express.Router();

/* =========================================================
   GET /api/stock
   ดึงรายการสินค้า
========================================================= */

router.get("/", async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [["id", "ASC"]],
    });

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("GET STOCK ERROR:", error);

    res.status(500).json({
      success: false,
      message: "ไม่สามารถดึงข้อมูลสต๊อกได้",
      error: error.message,
    });
  }
});

/* =========================================================
   GET /api/stock/movements
   ดูประวัติการเคลื่อนไหวสต๊อก
========================================================= */

router.get("/movements", async (req, res) => {
  try {
    const movements = await StockMovement.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: movements,
    });
  } catch (error) {
    console.error("GET STOCK MOVEMENTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "ไม่สามารถดึงประวัติสต๊อกได้",
      error: error.message,
    });
  }
});

/* =========================================================
   POST /api/stock/in
   รับสินค้าเข้า
========================================================= */

router.post("/in", async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { productId, quantity, note } = req.body;

    const amount = Number(quantity);

    if (!productId) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "กรุณาระบุรหัสสินค้า",
      });
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "จำนวนสินค้าต้องเป็นจำนวนเต็มมากกว่า 0",
      });
    }

    const product = await Product.findByPk(productId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!product) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "ไม่พบสินค้านี้ในระบบ",
      });
    }

    const oldStock = Number(product.stock);
    const newStock = oldStock + amount;

    await product.update(
      {
        stock: newStock,
      },
      {
        transaction,
      }
    );

    await StockMovement.create(
      {
        productId: product.id,
        movementType: "in",
        reason: "purchase",
        quantity: amount,
        referenceId: null,
        note: note || null,
      },
      {
        transaction,
      }
    );

    await transaction.commit();

    res.json({
      success: true,
      message: "รับสินค้าเข้าสต๊อกเรียบร้อย",
      data: {
        productId: product.id,
        oldStock,
        quantity: amount,
        newStock,
      },
    });
  } catch (error) {
    await transaction.rollback();

    console.error("STOCK IN ERROR:", error);

    res.status(500).json({
      success: false,
      message: "ไม่สามารถรับสินค้าเข้าสต๊อกได้",
      error: error.message,
    });
  }
});

/* =========================================================
   POST /api/stock/out
   ตัดสินค้าออก
========================================================= */

router.post("/out", async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { productId, quantity, note } = req.body;

    const amount = Number(quantity);

    if (!productId) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "กรุณาระบุรหัสสินค้า",
      });
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "จำนวนสินค้าต้องเป็นจำนวนเต็มมากกว่า 0",
      });
    }

    const product = await Product.findByPk(productId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!product) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "ไม่พบสินค้านี้ในระบบ",
      });
    }

    const oldStock = Number(product.stock);

    if (amount > oldStock) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: `สินค้าในสต๊อกไม่เพียงพอ เหลือ ${oldStock} ชิ้น`,
      });
    }

    const newStock = oldStock - amount;

    await product.update(
      {
        stock: newStock,
      },
      {
        transaction,
      }
    );

    await StockMovement.create(
      {
        productId: product.id,
        movementType: "out",
        reason: "adjustment",
        quantity: amount,
        referenceId: null,
        note: note || null,
      },
      {
        transaction,
      }
    );

    await transaction.commit();

    res.json({
      success: true,
      message: "ตัดสินค้าออกจากสต๊อกเรียบร้อย",
      data: {
        productId: product.id,
        oldStock,
        quantity: amount,
        newStock,
      },
    });
  } catch (error) {
    await transaction.rollback();

    console.error("STOCK OUT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "ไม่สามารถตัดสินค้าออกจากสต๊อกได้",
      error: error.message,
    });
  }
});

export default router;