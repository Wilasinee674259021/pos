import express from "express";
import Member from "../models/Member.js";

const router = express.Router();

// ======================================
// GET ALL MEMBERS
// ======================================

router.get("/", async (req, res) => {
  try {
    const members = await Member.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: members,
    });
  } catch (error) {
    console.error("GET MEMBERS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "ไม่สามารถโหลดข้อมูลสมาชิกได้",
      error: error.message,
    });
  }
});

// ======================================
// GET MEMBER BY PHONE
// ======================================

router.get("/phone/:phone", async (req, res) => {
  try {
    const { phone } = req.params;

    const member = await Member.findOne({
      where: {
        phone: phone,
      },
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบสมาชิกจากเบอร์โทรนี้",
      });
    }

    res.json({
      success: true,
      data: member,
    });
  } catch (error) {
    console.error("SEARCH MEMBER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "ไม่สามารถค้นหาสมาชิกได้",
      error: error.message,
    });
  }
});

// ======================================
// CREATE MEMBER
// ======================================

router.post("/", async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกชื่อและเบอร์โทรศัพท์",
      });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "เบอร์โทรศัพท์ต้องมี 10 หลัก",
      });
    }

    const existingMember = await Member.findOne({
      where: {
        phone: phone,
      },
    });

    if (existingMember) {
      return res.status(409).json({
        success: false,
        message: "เบอร์โทรศัพท์นี้เป็นสมาชิกอยู่แล้ว",
      });
    }

    const count = await Member.count();

    const memberId = "M" + String(count + 1).padStart(3, "0");

    const newMember = await Member.create({
      id: memberId,
      name: name.trim(),
      phone: phone.trim(),
      points: 0,
    });

    res.status(201).json({
      success: true,
      message: "สมัครสมาชิกเรียบร้อย",
      data: newMember,
    });
  } catch (error) {
    console.error("CREATE MEMBER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "ไม่สามารถสมัครสมาชิกได้",
      error: error.message,
    });
  }
});

// ======================================
// UPDATE MEMBER
// ======================================

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone } = req.body;

    const member = await Member.findByPk(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบสมาชิก",
      });
    }

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกชื่อและเบอร์โทรศัพท์",
      });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "เบอร์โทรศัพท์ต้องมี 10 หลัก",
      });
    }

    const duplicate = await Member.findOne({
      where: {
        phone: phone,
      },
    });

    if (duplicate && duplicate.id !== id) {
      return res.status(409).json({
        success: false,
        message: "เบอร์โทรศัพท์นี้เป็นสมาชิกอยู่แล้ว",
      });
    }

    await member.update({
      name: name.trim(),
      phone: phone.trim(),
    });

    res.json({
      success: true,
      message: "แก้ไขข้อมูลสมาชิกเรียบร้อย",
      data: member,
    });
  } catch (error) {
    console.error("UPDATE MEMBER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "ไม่สามารถแก้ไขสมาชิกได้",
      error: error.message,
    });
  }
});

// ======================================
// DELETE MEMBER
// ======================================

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const member = await Member.findByPk(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบสมาชิก",
      });
    }

    await member.destroy();

    res.json({
      success: true,
      message: "ลบสมาชิกเรียบร้อย",
    });
  } catch (error) {
    console.error("DELETE MEMBER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "ไม่สามารถลบสมาชิกได้",
      error: error.message,
    });
  }
});

// ======================================
// ADD POINTS
// ======================================
// ทุก 100 บาท = 10 Points
// ======================================

router.post("/:id/points", async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const purchaseAmount = Number(amount);

    if (!purchaseAmount || purchaseAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "ยอดซื้อไม่ถูกต้อง",
      });
    }

    const member = await Member.findByPk(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบสมาชิก",
      });
    }

    // ทุก 100 บาท = 10 Points
    const earnedPoints = Math.floor(purchaseAmount / 100) * 10;

    const currentPoints = Number(member.points || 0);

    const newTotalPoints = currentPoints + earnedPoints;

    await member.update({
      points: newTotalPoints,
    });

    res.json({
      success: true,
      message: "เพิ่มคะแนนเรียบร้อย",
      data: {
        memberId: member.id,
        amount: purchaseAmount,
        earnedPoints: earnedPoints,
        totalPoints: newTotalPoints,
      },
    });
  } catch (error) {
    console.error("ADD POINTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "ไม่สามารถเพิ่มคะแนนได้",
      error: error.message,
    });
  }
});

// ======================================
// USE / REDEEM POINTS
// ======================================

router.post("/:id/redeem-points", async (req, res) => {
  try {
    const { id } = req.params;
    const { points } = req.body;

    const redeemPoints = Number(points);

    if (!redeemPoints || redeemPoints <= 0) {
      return res.status(400).json({
        success: false,
        message: "จำนวนคะแนนไม่ถูกต้อง",
      });
    }

    const member = await Member.findByPk(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบสมาชิก",
      });
    }

    const currentPoints = Number(member.points || 0);

    if (redeemPoints > currentPoints) {
      return res.status(400).json({
        success: false,
        message: "คะแนนไม่เพียงพอ",
        data: {
          currentPoints,
          requestedPoints: redeemPoints,
        },
      });
    }

    const remainingPoints = currentPoints - redeemPoints;

    await member.update({
      points: remainingPoints,
    });

    res.json({
      success: true,
      message: "ใช้คะแนนเรียบร้อย",
      data: {
        memberId: member.id,
        usedPoints: redeemPoints,
        remainingPoints: remainingPoints,
      },
    });
  } catch (error) {
    console.error("REDEEM POINTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "ไม่สามารถใช้คะแนนได้",
      error: error.message,
    });
  }
});

// ======================================
// EXPORT ROUTER
// ======================================

export default router;
