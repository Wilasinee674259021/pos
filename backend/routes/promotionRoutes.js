import express from "express";
import Promotion from "../models/Promotion.js";

const router = express.Router();

// ======================================
// GET ALL PROMOTIONS
// ======================================

router.get("/", async (req, res) => {
  try {
    const promotions = await Promotion.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: promotions,
    });
  } catch (error) {
    console.error("GET PROMOTIONS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "ไม่สามารถโหลดโปรโมชั่นได้",
      error: error.message,
    });
  }
});

// ======================================
// GET PROMOTION BY ID
// ======================================

router.get("/:id", async (req, res) => {
  try {
    const promotion = await Promotion.findByPk(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบโปรโมชั่น",
      });
    }

    res.json({
      success: true,
      data: promotion,
    });
  } catch (error) {
    console.error("GET PROMOTION ERROR:", error);

    res.status(500).json({
      success: false,
      message: "ไม่สามารถโหลดโปรโมชั่นได้",
      error: error.message,
    });
  }
});

// ======================================
// CREATE PROMOTION
// ======================================

router.post("/", async (req, res) => {
  try {
    const {
      name,
      type,
      condition,
      discount,
      startDate,
      endDate,
    } = req.body;

    if (
      !name ||
      !type ||
      condition === undefined ||
      discount === undefined ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกข้อมูลโปรโมชั่นให้ครบ",
      });
    }

    const promotionCondition = Number(condition);
    const promotionDiscount = Number(discount);

    if (
      Number.isNaN(promotionCondition) ||
      promotionCondition < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "เงื่อนไขโปรโมชั่นไม่ถูกต้อง",
      });
    }

    if (
      Number.isNaN(promotionDiscount) ||
      promotionDiscount < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "ส่วนลด / ราคาพิเศษไม่ถูกต้อง",
      });
    }

    if (startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: "วันที่เริ่มต้องไม่มากกว่าวันที่สิ้นสุด",
      });
    }

    const promotion = await Promotion.create({
      name: name.trim(),
      type: type.trim(),
      condition: promotionCondition,
      discount: promotionDiscount,
      startDate,
      endDate,
      status: "เปิดใช้งาน",
    });

    res.status(201).json({
      success: true,
      message: "เพิ่มโปรโมชั่นเรียบร้อย",
      data: promotion,
    });
  } catch (error) {
    console.error("CREATE PROMOTION ERROR:", error);

    res.status(500).json({
      success: false,
      message: "เพิ่มโปรโมชั่นไม่สำเร็จ",
      error: error.message,
    });
  }
});

// ======================================
// UPDATE PROMOTION
// ======================================

router.put("/:id", async (req, res) => {
  try {
    const promotion = await Promotion.findByPk(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบโปรโมชั่น",
      });
    }

    const {
      name,
      type,
      condition,
      discount,
      startDate,
      endDate,
      status,
    } = req.body;

    const newCondition =
      condition !== undefined
        ? Number(condition)
        : Number(promotion.condition);

    const newDiscount =
      discount !== undefined
        ? Number(discount)
        : Number(promotion.discount);

    const newStartDate =
      startDate !== undefined
        ? startDate
        : promotion.startDate;

    const newEndDate =
      endDate !== undefined
        ? endDate
        : promotion.endDate;

    if (Number.isNaN(newCondition) || newCondition < 0) {
      return res.status(400).json({
        success: false,
        message: "เงื่อนไขโปรโมชั่นไม่ถูกต้อง",
      });
    }

    if (Number.isNaN(newDiscount) || newDiscount < 0) {
      return res.status(400).json({
        success: false,
        message: "ส่วนลด / ราคาพิเศษไม่ถูกต้อง",
      });
    }

    if (newStartDate > newEndDate) {
      return res.status(400).json({
        success: false,
        message: "วันที่เริ่มต้องไม่มากกว่าวันที่สิ้นสุด",
      });
    }

    await promotion.update({
      name:
        name !== undefined
          ? name.trim()
          : promotion.name,

      type:
        type !== undefined
          ? type.trim()
          : promotion.type,

      condition: newCondition,

      discount: newDiscount,

      startDate: newStartDate,

      endDate: newEndDate,

      status:
        status !== undefined
          ? status
          : promotion.status,
    });

    res.json({
      success: true,
      message: "แก้ไขโปรโมชั่นเรียบร้อย",
      data: promotion,
    });
  } catch (error) {
    console.error("UPDATE PROMOTION ERROR:", error);

    res.status(500).json({
      success: false,
      message: "แก้ไขโปรโมชั่นไม่สำเร็จ",
      error: error.message,
    });
  }
});

// ======================================
// DELETE PROMOTION
// ======================================

router.delete("/:id", async (req, res) => {
  try {
    const promotion = await Promotion.findByPk(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบโปรโมชั่น",
      });
    }

    await promotion.destroy();

    res.json({
      success: true,
      message: "ลบโปรโมชั่นเรียบร้อย",
    });
  } catch (error) {
    console.error("DELETE PROMOTION ERROR:", error);

    res.status(500).json({
      success: false,
      message: "ลบโปรโมชั่นไม่สำเร็จ",
      error: error.message,
    });
  }
});

export default router;