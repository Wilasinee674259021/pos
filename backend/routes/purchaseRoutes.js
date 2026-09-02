import express from "express";
import sequelize from "../config/database.js";

import PurchaseOrder from "../models/PurchaseOrder.js";
import PurchaseItem from "../models/PurchaseItem.js";
import Product from "../models/Product.js";
import StockMovement from "../models/StockMovement.js";

const router = express.Router();

// ======================================
// GET PURCHASE ORDERS
// ======================================

router.get("/", async (req, res) => {
  try {
    const orders = await PurchaseOrder.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("GET PURCHASE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "ไม่สามารถโหลดประวัติการสั่งซื้อได้",
      error: error.message,
    });
  }
});

// ======================================
// GET PURCHASE ORDER ITEMS
// ======================================

router.get("/:id", async (req, res) => {
  try {
    const order = await PurchaseOrder.findByPk(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบใบสั่งซื้อ",
      });
    }

    const items = await PurchaseItem.findAll({
      where: {
        purchaseOrderId: order.id,
      },
      order: [["id", "ASC"]],
    });

    res.json({
      success: true,
      data: {
        order,
        items,
      },
    });
  } catch (error) {
    console.error("GET PURCHASE DETAIL ERROR:", error);

    res.status(500).json({
      success: false,
      message: "ไม่สามารถโหลดรายละเอียดใบสั่งซื้อได้",
      error: error.message,
    });
  }
});

// ======================================
// CREATE PURCHASE ORDER
// ======================================

router.post("/", async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      supplierName,
      items,
      paymentMethod,
      note,
    } = req.body;

    // ======================================
    // CHECK SUPPLIER
    // ======================================

    if (
      !supplierName ||
      String(supplierName).trim() === ""
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "กรุณาระบุชื่อผู้ขาย",
      });
    }

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
        message: "ไม่มีสินค้าในรายการสั่งซื้อ",
      });
    }

    // ======================================
    // CREATE PURCHASE ID
    // ======================================

    const count = await PurchaseOrder.count({
      transaction,
    });

    const purchaseId =
      "PO" +
      String(count + 1).padStart(5, "0");

    // ======================================
    // CALCULATE TOTAL
    // ======================================

    let totalAmount = 0;

    const purchaseItems = [];

    for (const item of items) {
      const product = await Product.findByPk(
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

      const quantity = Number(item.quantity);
      const cost = Number(item.cost);

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message:
            `จำนวนสินค้า ${product.name} ไม่ถูกต้อง`,
        });
      }

      if (
        !Number.isFinite(cost) ||
        cost < 0
      ) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message:
            `ต้นทุนสินค้า ${product.name} ไม่ถูกต้อง`,
        });
      }

      const subtotal =
        quantity * cost;

      totalAmount += subtotal;

      purchaseItems.push({
        product,
        quantity,
        cost,
        subtotal,
      });
    }

    // ======================================
    // CREATE PURCHASE ORDER
    // ======================================

    const order =
      await PurchaseOrder.create(
        {
          id: purchaseId,

          supplierName:
            String(supplierName).trim(),

          totalAmount,

          status: "received",

          paymentMethod:
            paymentMethod || null,

          note:
            note || null,

          receivedAt:
            new Date(),
        },
        {
          transaction,
        }
      );

    // ======================================
    // CREATE PURCHASE ITEMS
    // ======================================

    for (const item of purchaseItems) {
      await PurchaseItem.create(
        {
          purchaseOrderId:
            order.id,

          productId:
            item.product.id,

          productName:
            item.product.name,

          quantity:
            item.quantity,

          cost:
            item.cost,

          subtotal:
            item.subtotal,
        },
        {
          transaction,
        }
      );
    }

    // ======================================
    // UPDATE STOCK + COST
    // ======================================

    for (const item of purchaseItems) {
      const oldStock =
        Number(item.product.stock || 0);

      const newStock =
        oldStock + item.quantity;

      await item.product.update(
        {
          stock: newStock,

          // อัปเดตต้นทุนล่าสุด
          cost: item.cost,
        },
        {
          transaction,
        }
      );

      // ======================================
      // STOCK MOVEMENT
      // ======================================

      await StockMovement.create(
        {
          productId:
            item.product.id,

          movementType:
            "in",

          reason:
            "purchase",

          quantity:
            item.quantity,

          referenceId:
            order.id,

          note:
            `รับสินค้า ${item.product.name} จาก ${supplierName}`,
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
        "รับสินค้าเข้าสต็อกเรียบร้อย",

      data: {
        purchaseOrderId:
          order.id,

        supplierName:
          order.supplierName,

        totalAmount:
          Number(order.totalAmount),

        status:
          order.status,

        receivedAt:
          order.receivedAt,

        items:
          purchaseItems.map(
            (item) => ({
              productId:
                item.product.id,

              productName:
                item.product.name,

              quantity:
                item.quantity,

              cost:
                item.cost,

              subtotal:
                item.subtotal,

              stockAfter:
                Number(
                  item.product.stock
                ) +
                item.quantity,
            })
          ),
      },
    });
  } catch (error) {
    try {
      await transaction.rollback();
    } catch {}

    console.error(
      "CREATE PURCHASE ERROR:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        "ไม่สามารถรับสินค้าเข้าสต็อกได้",

      error:
        error.message,
    });
  }
});

export default router;