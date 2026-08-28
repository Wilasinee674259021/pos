import express from "express";
import { Op } from "sequelize";

import sequelize from "../config/database.js";
import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import Member from "../models/Member.js";

const router = express.Router();

// ======================================
// GET SALES
// ======================================

router.get("/", async (req, res) => {
  try {
    const sales = await Sale.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: sales,
    });
  } catch (error) {
    console.error("GET SALES ERROR:", error);

    res.status(500).json({
      success: false,
      message: "ไม่สามารถโหลดประวัติการขายได้",
      error: error.message,
    });
  }
});

// ======================================
// CREATE SALE
// ======================================

router.post("/", async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { memberId, items, paymentMethod, receivedAmount } = req.body;

    // ----------------------------------
    // CHECK ITEMS
    // ----------------------------------

    if (!Array.isArray(items) || items.length === 0) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "ไม่มีสินค้าในรายการขาย",
      });
    }

    // ----------------------------------
    // PAYMENT
    // ----------------------------------

    const allowedPaymentMethods = ["cash", "qr", "card"];

    if (!allowedPaymentMethods.includes(paymentMethod)) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "วิธีชำระเงินไม่ถูกต้อง",
      });
    }

    // ----------------------------------
    // MEMBER
    // ----------------------------------

    let member = null;

    if (memberId) {
      member = await Member.findByPk(memberId, { transaction });

      if (!member) {
        await transaction.rollback();

        return res.status(404).json({
          success: false,
          message: "ไม่พบสมาชิก",
        });
      }
    }

    // ----------------------------------
    // CALCULATE TOTAL
    // ----------------------------------

    let totalAmount = 0;
    const saleItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction });

      if (!product) {
        await transaction.rollback();

        return res.status(404).json({
          success: false,
          message: `ไม่พบสินค้า ${item.productId}`,
        });
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message: "จำนวนสินค้าไม่ถูกต้อง",
        });
      }

      // --------------------------------
      // CHECK STOCK
      // --------------------------------

      if (Number(product.stock) < quantity) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message: `สินค้า ${product.name} มี Stock ไม่เพียงพอ`,
          stock: product.stock,
        });
      }

      const price = Number(product.price);

      const itemTotal = price * quantity;

      totalAmount += itemTotal;

      saleItems.push({
        product,
        quantity,
        price,
        itemTotal,
      });
    }

    // ----------------------------------
    // PAYMENT AMOUNT
    // ----------------------------------

    const received = Number(receivedAmount || totalAmount);

    if (paymentMethod === "cash") {
      if (received < totalAmount) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message: "จำนวนเงินที่รับมาไม่เพียงพอ",
          totalAmount,
          receivedAmount: received,
        });
      }
    }

    const changeAmount = paymentMethod === "cash" ? received - totalAmount : 0;

    // ----------------------------------
    // POINTS
    // ----------------------------------

    // ทุก 100 บาท = 10 Points
    const earnedPoints = member ? Math.floor(totalAmount / 100) * 10 : 0;

    // ----------------------------------
    // CREATE SALE ID
    // ----------------------------------

    const count = await Sale.count({
      transaction,
    });

    const saleId = "S" + String(count + 1).padStart(5, "0");

    // ----------------------------------
    // CREATE SALE
    // ----------------------------------

    const sale = await Sale.create(
      {
        id: saleId,
        memberId: member ? member.id : null,
        totalAmount,
        paymentMethod,
        receivedAmount: received,
        changeAmount,
        earnedPoints,
      },
      { transaction },
    );

    // ----------------------------------
    // UPDATE STOCK
    // ----------------------------------

    for (const item of saleItems) {
      await item.product.update(
        {
          stock: Number(item.product.stock) - item.quantity,
        },
        { transaction },
      );
    }

    // ----------------------------------
    // ADD MEMBER POINTS
    // ----------------------------------

    if (member && earnedPoints > 0) {
      await member.update(
        {
          points: Number(member.points || 0) + earnedPoints,
        },
        { transaction },
      );
    }

    // ----------------------------------
    // COMMIT
    // ----------------------------------

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: "ชำระเงินเรียบร้อย",
      data: {
        saleId: sale.id,
        memberId: sale.memberId,
        totalAmount,
        paymentMethod,
        receivedAmount: received,
        changeAmount,
        earnedPoints,
        items: saleItems.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
          total: item.itemTotal,
        })),
      },
    });
  } catch (error) {
    try {
      await transaction.rollback();
    } catch {}

    console.error("CREATE SALE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "ไม่สามารถทำรายการขายได้",
      error: error.message,
    });
  }
});

export default router;
