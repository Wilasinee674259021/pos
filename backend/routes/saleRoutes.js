import express from "express";
import { Op } from "sequelize";

import sequelize from "../config/database.js";
import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import Member from "../models/Member.js";

const router = express.Router();

// ======================================
// DASHBOARD
// ======================================

router.get("/dashboard", async (req, res) => {
  try {
    // ======================================
    // วันที่ประเทศไทย
    // ======================================

    const now = new Date();

    const thailandDate = new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Asia/Bangkok",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    ).format(now);

    // 00:00:00 ประเทศไทย
    const startOfDay = new Date(
      thailandDate + "T00:00:00+07:00"
    );

    // วันถัดไป 00:00:00
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    // ======================================
    // ดึงยอดขายวันนี้จากฐานข้อมูล
    // ======================================

    const salesToday = await Sale.findAll({
      where: {
        createdAt: {
          [Op.gte]: startOfDay,
          [Op.lt]: endOfDay,
        },
      },

      order: [
        ["createdAt", "DESC"],
      ],
    });

    // ======================================
    // ยอดขายรวมวันนี้
    // ======================================

    const totalSales = salesToday.reduce(
      (sum, sale) => {
        return (
          sum +
          Number(sale.totalAmount || 0)
        );
      },
      0
    );

    // ======================================
    // จำนวนบิลวันนี้
    // ======================================

    const billCount = salesToday.length;

    // ======================================
    // บิลล่าสุด 5 ใบ
    // ======================================

    const recentBills = salesToday
      .slice(0, 5)
      .map((sale) => ({
        id: sale.id,

        totalAmount: Number(
          sale.totalAmount || 0
        ),

        paymentMethod:
          sale.paymentMethod || "",

        receivedAmount: Number(
          sale.receivedAmount || 0
        ),

        changeAmount: Number(
          sale.changeAmount || 0
        ),

        earnedPoints: Number(
          sale.earnedPoints || 0
        ),

        memberId:
          sale.memberId || null,

        createdAt:
          sale.createdAt,
      }));

    // ======================================
    // สินค้าใกล้หมด
    // Stock <= 10
    // ======================================

    const lowStockProducts =
      await Product.count({
        where: {
          stock: {
            [Op.lte]: 10,
          },
        },
      });

    // ======================================
    // RESPONSE
    // ======================================

    res.json({
      success: true,

      data: {
        totalSales,

        billCount,

        lowStockProducts,

        recentBills,
      },
    });
  } catch (error) {
    console.error(
      "DASHBOARD ERROR:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        "ไม่สามารถโหลดข้อมูล Dashboard ได้",

      error: error.message,
    });
  }
});

// ======================================
// GET SALES
// ======================================

router.get("/", async (req, res) => {
  try {
    const sales = await Sale.findAll({
      order: [
        ["createdAt", "DESC"],
      ],
    });

    res.json({
      success: true,

      data: sales,
    });
  } catch (error) {
    console.error(
      "GET SALES ERROR:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        "ไม่สามารถโหลดประวัติการขายได้",

      error: error.message,
    });
  }
});

// ======================================
// CREATE SALE
// ======================================

router.post("/", async (req, res) => {
  const transaction =
    await sequelize.transaction();

  try {
    const {
      memberId,
      items,
      paymentMethod,
      receivedAmount,
      usePoints,
    } = req.body;

    // ======================================
    // CHECK ITEMS
    // ======================================

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "ไม่มีสินค้าในรายการขาย",
      });
    }

    // ======================================
    // PAYMENT METHOD
    // ======================================

    const allowedPaymentMethods = [
      "cash",
      "qr",
      "card",
    ];

    if (
      !allowedPaymentMethods.includes(
        paymentMethod
      )
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "วิธีชำระเงินไม่ถูกต้อง",
      });
    }

    // ======================================
    // MEMBER
    // ======================================

    let member = null;

    if (memberId) {
      member =
        await Member.findByPk(
          memberId,
          {
            transaction,
          }
        );

      if (!member) {
        await transaction.rollback();

        return res.status(404).json({
          success: false,
          message: "ไม่พบสมาชิก",
        });
      }
    }

    // ======================================
    // CALCULATE TOTAL
    // ======================================

    let totalAmount = 0;

    const saleItems = [];

    for (const item of items) {
      const product =
        await Product.findByPk(
          item.productId,
          {
            transaction,
          }
        );

      if (!product) {
        await transaction.rollback();

        return res.status(404).json({
          success: false,

          message:
            `ไม่พบสินค้า ${item.productId}`,
        });
      }

      const quantity =
        Number(item.quantity);

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message:
            "จำนวนสินค้าไม่ถูกต้อง",
        });
      }

      // ======================================
      // CHECK STOCK
      // ======================================

      if (
        Number(product.stock) <
        quantity
      ) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,

          message:
            `สินค้า ${product.name} มี Stock ไม่เพียงพอ`,

          stock: product.stock,
        });
      }

      const price =
        Number(product.price);

      const itemTotal =
        price * quantity;

      totalAmount += itemTotal;

      saleItems.push({
        product,
        quantity,
        price,
        itemTotal,
      });
    }

    // ======================================
    // USE POINTS
    // 1 Point = 1 Baht
    // ======================================

    let requestedPoints =
      Number(usePoints || 0);

    if (
      !Number.isFinite(
        requestedPoints
      )
    ) {
      requestedPoints = 0;
    }

    requestedPoints =
      Math.floor(
        requestedPoints
      );

    if (requestedPoints < 0) {
      requestedPoints = 0;
    }

    if (
      requestedPoints > 0 &&
      !member
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,

        message:
          "กรุณาเลือกสมาชิกก่อนใช้ Points",
      });
    }

    const memberCurrentPoints =
      Number(
        member?.points || 0
      );

    if (
      member &&
      requestedPoints >
        memberCurrentPoints
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,

        message:
          "Points ของสมาชิกไม่เพียงพอ",

        availablePoints:
          memberCurrentPoints,

        requestedPoints,
      });
    }

    // ======================================
    // POINTS DISCOUNT
    // ======================================

    const usedPoints =
      Math.min(
        requestedPoints,
        totalAmount
      );

    const pointsDiscount =
      usedPoints;

    // ======================================
    // NET TOTAL
    // ======================================

    const netTotal =
      Math.max(
        totalAmount -
          pointsDiscount,
        0
      );

    // ======================================
    // PAYMENT AMOUNT
    // ======================================

    const received =
      Number(
        receivedAmount ||
          netTotal
      );

    if (
      paymentMethod === "cash"
    ) {
      if (
        received < netTotal
      ) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,

          message:
            "จำนวนเงินที่รับมาไม่เพียงพอ",

          totalAmount,

          pointsDiscount,

          netTotal,

          receivedAmount:
            received,
        });
      }
    }

    const changeAmount =
      paymentMethod === "cash"
        ? received - netTotal
        : 0;

    // ======================================
    // EARN POINTS
    // ทุก 100 บาท = 10 Points
    // ======================================

    const earnedPoints =
      member
        ? Math.floor(
            netTotal / 100
          ) * 10
        : 0;

    // ======================================
    // CREATE SALE ID
    // ======================================

    const count =
      await Sale.count({
        transaction,
      });

    const saleId =
      "S" +
      String(
        count + 1
      ).padStart(5, "0");

    // ======================================
    // CREATE SALE
    // ======================================

    const sale =
      await Sale.create(
        {
          id: saleId,

          memberId:
            member
              ? member.id
              : null,

          // ยอดก่อนหัก Points
          totalAmount,

          paymentMethod,

          receivedAmount:
            received,

          changeAmount,

          earnedPoints,
        },
        {
          transaction,
        }
      );

    // ======================================
    // UPDATE STOCK
    // ======================================

    for (const item of saleItems) {
      await item.product.update(
        {
          stock:
            Number(
              item.product.stock
            ) -
            item.quantity,
        },
        {
          transaction,
        }
      );
    }

    // ======================================
    // UPDATE MEMBER POINTS
    // ======================================

    if (member) {
      const newPoints =
        memberCurrentPoints -
        usedPoints +
        earnedPoints;

      await member.update(
        {
          points: newPoints,
        },
        {
          transaction,
        }
      );
    }

    // ======================================
    // COMMIT
    // ======================================

    await transaction.commit();

    // ======================================
    // RESPONSE
    // ======================================

    res.status(201).json({
      success: true,

      message:
        "ชำระเงินเรียบร้อย",

      data: {
        saleId: sale.id,

        memberId:
          sale.memberId,

        totalAmount,

        usedPoints,

        pointsDiscount,

        netTotal,

        paymentMethod,

        receivedAmount:
          received,

        changeAmount,

        earnedPoints,

        remainingPoints:
          member
            ? memberCurrentPoints -
              usedPoints +
              earnedPoints
            : 0,

        items:
          saleItems.map(
            (item) => ({
              productId:
                item.product.id,

              name:
                item.product.name,

              quantity:
                item.quantity,

              price:
                item.price,

              total:
                item.itemTotal,
            })
          ),
      },
    });
  } catch (error) {
    try {
      await transaction.rollback();
    } catch {}

    console.error(
      "CREATE SALE ERROR:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        "ไม่สามารถทำรายการขายได้",

      error: error.message,
    });
  }
});

export default router;