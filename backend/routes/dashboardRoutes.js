import express from "express";
import { Op } from "sequelize";

import Sale from "../models/Sale.js";
import SaleItem from "../models/SaleItem.js";
import Product from "../models/Product.js";
import Expense from "../models/Expense.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import StockMovement from "../models/StockMovement.js";

const router = express.Router();

// ======================================
// THAILAND DATE HELPERS
// ======================================

function getThailandToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function createThailandStartDate(dateString) {
  return new Date(`${dateString}T00:00:00+07:00`);
}

function createThailandEndDate(dateString) {
  const date = new Date(`${dateString}T00:00:00+07:00`);

  date.setDate(date.getDate() + 1);

  return date;
}

// ======================================
// DASHBOARD
// ======================================

router.get("/", async (req, res) => {
  try {
    // ======================================
    // DATE FILTER
    // ======================================

    const today = getThailandToday();

    const startDate =
      req.query.startDate || today;

    const endDate =
      req.query.endDate || today;

    const startOfPeriod =
      createThailandStartDate(startDate);

    const endOfPeriod =
      createThailandEndDate(endDate);

    console.log(
      "DASHBOARD DATE:",
      startDate,
      "TO",
      endDate
    );

    // ======================================
    // SALES
    // ======================================

    const sales = await Sale.findAll({
      where: {
        createdAt: {
          [Op.gte]: startOfPeriod,
          [Op.lt]: endOfPeriod,
        },
      },
      order: [["createdAt", "DESC"]],
    });

    // ======================================
    // TOTAL SALES
    // ======================================

    const totalSales = sales.reduce(
      (sum, sale) => {
        const totalAmount =
          Number(sale.totalAmount || 0);

        const discountAmount =
          Number(sale.discountAmount || 0);

        const storedNetTotal =
          Number(sale.netTotal || 0);

        const netTotal =
          storedNetTotal > 0
            ? storedNetTotal
            : Math.max(
                totalAmount - discountAmount,
                0
              );

        return sum + netTotal;
      },
      0
    );

    const billCount = sales.length;

    // ======================================
    // SALE IDS
    // ======================================

    const saleIds = sales.map(
      (sale) => sale.id
    );

    // ======================================
    // TOTAL COST
    // ======================================

    let totalCost = 0;

    if (saleIds.length > 0) {
      const saleItems =
        await SaleItem.findAll({
          where: {
            saleId: {
              [Op.in]: saleIds,
            },
          },
        });

      // --------------------------------------
      // PRODUCT IDS
      // --------------------------------------

      const productIds = [
        ...new Set(
          saleItems
            .map(
              (item) => item.productId
            )
            .filter(Boolean)
        ),
      ];

      // --------------------------------------
      // PRODUCTS
      // --------------------------------------

      const products =
        productIds.length > 0
          ? await Product.findAll({
              where: {
                id: {
                  [Op.in]: productIds,
                },
              },
            })
          : [];

      const productMap = new Map();

      for (const product of products) {
        productMap.set(
          product.id,
          product
        );
      }

      // --------------------------------------
      // CALCULATE COST
      // --------------------------------------

      totalCost = saleItems.reduce(
        (sum, item) => {
          const quantity =
            Number(item.quantity || 0);

          // ต้นทุนที่บันทึกไว้ตอนขาย
          const storedTotalCost =
            Number(
              item.totalCost || 0
            );

          if (storedTotalCost > 0) {
            return (
              sum + storedTotalCost
            );
          }

          // ถ้า SaleItem ไม่มีต้นทุน
          // ให้ใช้ต้นทุนจาก Product
          const product =
            productMap.get(
              item.productId
            );

          const productCost =
            Number(
              product?.cost || 0
            );

          return (
            sum +
            productCost * quantity
          );
        },
        0
      );
    }

    // ======================================
    // EXPENSE
    // ======================================

    let totalExpense = 0;
    let expenseCount = 0;

    try {
      const expenses =
        await Expense.findAll({
          where: {
            createdAt: {
              [Op.gte]: startOfPeriod,
              [Op.lt]: endOfPeriod,
            },
          },
        });

      expenseCount = expenses.length;

      totalExpense =
        expenses.reduce(
          (sum, expense) => {
            return (
              sum +
              Number(
                expense.amount || 0
              )
            );
          },
          0
        );

      console.log(
        "EXPENSE:",
        expenseCount,
        totalExpense
      );
    } catch (error) {
      console.log(
        "EXPENSE LOAD ERROR:",
        error.message
      );

      totalExpense = 0;
      expenseCount = 0;
    }

    // ======================================
    // PURCHASE ORDERS
    // ======================================

    let purchaseTotal = 0;
    let purchaseCount = 0;

    try {
      const purchases =
        await PurchaseOrder.findAll({
          where: {
            createdAt: {
              [Op.gte]: startOfPeriod,
              [Op.lt]: endOfPeriod,
            },
            status: "received",
          },
        });

      purchaseCount = purchases.length;

      purchaseTotal =
        purchases.reduce(
          (sum, purchase) => {
            return (
              sum +
              Number(
                purchase.totalAmount || 0
              )
            );
          },
          0
        );

      console.log(
        "PURCHASE:",
        purchaseCount,
        purchaseTotal
      );
    } catch (error) {
      console.log(
        "PURCHASE LOAD ERROR:",
        error.message
      );

      purchaseTotal = 0;
      purchaseCount = 0;
    }

    // ======================================
    // STOCK MOVEMENT
    // ======================================

    let stockIn = 0;
    let stockOut = 0;

    try {
      const movements =
        await StockMovement.findAll({
          where: {
            createdAt: {
              [Op.gte]: startOfPeriod,
              [Op.lt]: endOfPeriod,
            },
          },
        });

      for (const movement of movements) {
        const quantity =
          Number(
            movement.quantity || 0
          );

        if (
          movement.movementType === "in"
        ) {
          stockIn += quantity;
        }

        if (
          movement.movementType === "out"
        ) {
          stockOut += quantity;
        }
      }

      console.log(
        "STOCK:",
        stockIn,
        stockOut
      );
    } catch (error) {
      console.log(
        "STOCK MOVEMENT LOAD ERROR:",
        error.message
      );
    }

    // ======================================
    // LOW STOCK PRODUCTS
    // ======================================

    let lowStockProducts = [];

    try {
      lowStockProducts =
        await Product.findAll({
          where: {
            stock: {
              [Op.lte]: 10,
            },
          },
          order: [
            ["stock", "ASC"],
          ],
        });
    } catch (error) {
      console.log(
        "LOW STOCK ERROR:",
        error.message
      );

      lowStockProducts = [];
    }

    const lowStockCount =
      lowStockProducts.length;

    // ======================================
    // PROFIT
    // ======================================

    const grossProfit =
      totalSales - totalCost;

    const netProfit =
      grossProfit - totalExpense;

    // ======================================
    // PAYMENT SUMMARY
    // ======================================

    let cashTotal = 0;
    let qrTotal = 0;
    let cardTotal = 0;

    for (const sale of sales) {
      const amount =
        Number(
          sale.netTotal || 0
        ) ||
        Math.max(
          Number(
            sale.totalAmount || 0
          ) -
            Number(
              sale.discountAmount || 0
            ),
          0
        );

      if (
        sale.paymentMethod === "cash"
      ) {
        cashTotal += amount;
      }

      if (
        sale.paymentMethod === "qr"
      ) {
        qrTotal += amount;
      }

      if (
        sale.paymentMethod === "card"
      ) {
        cardTotal += amount;
      }
    }

    // ======================================
    // RECENT BILLS
    // ======================================

    const recentBills =
      sales
        .slice(0, 10)
        .map((sale) => {
          const totalAmount =
            Number(
              sale.totalAmount || 0
            );

          const discountAmount =
            Number(
              sale.discountAmount || 0
            );

          const storedNetTotal =
            Number(
              sale.netTotal || 0
            );

          const netTotal =
            storedNetTotal > 0
              ? storedNetTotal
              : Math.max(
                  totalAmount -
                    discountAmount,
                  0
                );

          return {
            id: sale.id,

            totalAmount,

            discountAmount,

            netTotal,

            paymentMethod:
              sale.paymentMethod || "",

            receivedAmount:
              Number(
                sale.receivedAmount || 0
              ),

            changeAmount:
              Number(
                sale.changeAmount || 0
              ),

            earnedPoints:
              Number(
                sale.earnedPoints || 0
              ),

            usedPoints:
              Number(
                sale.usedPoints || 0
              ),

            memberId:
              sale.memberId || null,

            createdAt:
              sale.createdAt,
          };
        });

    // ======================================
    // RESPONSE
    // ======================================

    res.json({
      success: true,

      data: {
        // ----------------------------------
        // SALES
        // ----------------------------------

        totalSales,
        billCount,

        // ----------------------------------
        // COST / PROFIT
        // ----------------------------------

        totalCost,
        grossProfit,
        netProfit,

        // รองรับชื่อเดิม
        profit: grossProfit,

        // ----------------------------------
        // EXPENSE
        // ----------------------------------

        totalExpense,
        expenseCount,

        // ----------------------------------
        // PURCHASE
        // ----------------------------------

        purchaseTotal,
        purchaseCount,

        // ----------------------------------
        // STOCK
        // ----------------------------------

        stockIn,
        stockOut,

        // ----------------------------------
        // LOW STOCK
        // ----------------------------------

        lowStockCount,

        // สำคัญ:
        // ต้องเป็น Array เพราะ Dashboard.jsx ใช้ .map()
        lowStockProducts,

        // ----------------------------------
        // PAYMENT
        // ----------------------------------

        paymentSummary: {
          cash: cashTotal,
          qr: qrTotal,
          card: cardTotal,
        },

        // ----------------------------------
        // RECENT BILLS
        // ----------------------------------

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
// EXPORT
// ======================================

export default router;