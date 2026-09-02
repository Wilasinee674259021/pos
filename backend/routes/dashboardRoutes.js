import express from "express";
import { Op } from "sequelize";

import Sale from "../models/Sale.js";
import SaleItem from "../models/SaleItem.js";
import Expense from "../models/Expense.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import StockMovement from "../models/StockMovement.js";
import Product from "../models/Product.js";

const router = express.Router();

// ======================================
// DASHBOARD REPORT
// ======================================

router.get("/", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // ======================================
    // DATE RANGE
    // ======================================

    let start;
    let end;

    if (startDate && endDate) {
      start = new Date(
        startDate + "T00:00:00+07:00"
      );

      end = new Date(
        endDate + "T23:59:59.999+07:00"
      );
    } else {
      const now = new Date();

      const thailandDate =
        new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Bangkok",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(now);

      start = new Date(
        thailandDate + "T00:00:00+07:00"
      );

      end = new Date(
        thailandDate + "T23:59:59.999+07:00"
      );
    }

    const dateWhere = {
      createdAt: {
        [Op.between]: [start, end],
      },
    };

    // ======================================
    // SALES
    // ======================================

    const sales = await Sale.findAll({
      where: dateWhere,
      order: [["createdAt", "DESC"]],
    });

    // ======================================
    // FUNCTION: EFFECTIVE NET TOTAL
    // ======================================

    const getSaleNetTotal = (sale) => {
      const totalAmount = Number(
        sale.totalAmount || 0
      );

      const discountAmount = Number(
        sale.discountAmount || 0
      );

      const storedNetTotal = Number(
        sale.netTotal || 0
      );

      // ถ้า netTotal > 0 ให้ใช้ netTotal
      // ถ้า netTotal = 0 ให้คำนวณจาก totalAmount - discount
      if (storedNetTotal > 0) {
        return storedNetTotal;
      }

      return Math.max(
        totalAmount - discountAmount,
        0
      );
    };

    // ======================================
    // TOTAL SALES
    // ======================================

    const totalSales = sales.reduce(
      (sum, sale) => {
        return (
          sum +
          getSaleNetTotal(sale)
        );
      },
      0
    );

    const billCount = sales.length;

    // ======================================
    // SALE COST
    // ======================================

    const saleIds = sales.map(
      (sale) => sale.id
    );

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

      totalCost = saleItems.reduce(
        (sum, item) => {
          return (
            sum +
            Number(
              item.totalCost || 0
            )
          );
        },
        0
      );
    }

    // ======================================
    // EXPENSES
    // ======================================

    const expenses =
      await Expense.findAll({
        where: dateWhere,
      });

    const totalExpense =
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

    // ======================================
    // PURCHASES
    // ======================================

    const purchases =
      await PurchaseOrder.findAll({
        where: dateWhere,
      });

    const purchaseTotal =
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

    // ======================================
    // STOCK MOVEMENT
    // ======================================

    const stockMovements =
      await StockMovement.findAll({
        where: dateWhere,
      });

    const stockIn =
      stockMovements
        .filter(
          (movement) =>
            movement.movementType ===
            "in"
        )
        .reduce(
          (sum, movement) => {
            return (
              sum +
              Number(
                movement.quantity || 0
              )
            );
          },
          0
        );

    const stockOut =
      stockMovements
        .filter(
          (movement) =>
            movement.movementType ===
            "out"
        )
        .reduce(
          (sum, movement) => {
            return (
              sum +
              Number(
                movement.quantity || 0
              )
            );
          },
          0
        );

    // ======================================
    // PROFIT
    // ======================================

    const grossProfit =
      totalSales - totalCost;

    const netProfit =
      grossProfit - totalExpense;

    // ======================================
    // LOW STOCK
    // ======================================

    const lowStockProducts =
      await Product.findAll({
        where: {
          stock: {
            [Op.lte]: 10,
          },
        },
        order: [["stock", "ASC"]],
      });

    // ======================================
    // PAYMENT SUMMARY
    // ======================================

    const cashSales =
      sales
        .filter(
          (sale) =>
            sale.paymentMethod ===
            "cash"
        )
        .reduce(
          (sum, sale) => {
            return (
              sum +
              getSaleNetTotal(sale)
            );
          },
          0
        );

    const qrSales =
      sales
        .filter(
          (sale) =>
            sale.paymentMethod ===
            "qr"
        )
        .reduce(
          (sum, sale) => {
            return (
              sum +
              getSaleNetTotal(sale)
            );
          },
          0
        );

    const cardSales =
      sales
        .filter(
          (sale) =>
            sale.paymentMethod ===
            "card"
        )
        .reduce(
          (sum, sale) => {
            return (
              sum +
              getSaleNetTotal(sale)
            );
          },
          0
        );

    // ======================================
    // RECENT SALES
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

          const netTotal =
            getSaleNetTotal(sale);

          return {
            id: sale.id,

            totalAmount,

            discountAmount,

            netTotal,

            paymentMethod:
              sale.paymentMethod ||
              "",

            receivedAmount:
              Number(
                sale.receivedAmount ||
                  0
              ),

            changeAmount:
              Number(
                sale.changeAmount ||
                  0
              ),

            earnedPoints:
              Number(
                sale.earnedPoints ||
                  0
              ),

            usedPoints:
              Number(
                sale.usedPoints ||
                  0
              ),

            memberId:
              sale.memberId ||
              null,

            createdAt:
              sale.createdAt,
          };
        });

    // ======================================
    // RESPONSE
    // ======================================

    res.json({
      success: true,

      filter: {
        startDate,
        endDate,
        start,
        end,
      },

      data: {
        totalSales,
        billCount,

        totalCost,

        totalExpense,

        grossProfit,

        netProfit,

        purchaseTotal,

        stockIn,

        stockOut,

        lowStockCount:
          lowStockProducts.length,

        lowStockProducts,

        paymentSummary: {
          cash: cashSales,
          qr: qrSales,
          card: cardSales,
        },

        recentBills,

        expenseCount:
          expenses.length,

        purchaseCount:
          purchases.length,
      },
    });
  } catch (error) {
    console.error(
      "DASHBOARD REPORT ERROR:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        "ไม่สามารถโหลดข้อมูล Dashboard ได้",

      error:
        error.message,
    });
  }
});

// ======================================
// EXPORT
// ======================================

export default router;