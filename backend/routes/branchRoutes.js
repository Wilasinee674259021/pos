import express from "express";
import Branch from "../models/Branch.js";

const router = express.Router();

// GET - ดูสาขาทั้งหมด
router.get("/", async (req, res) => {
  try {
    const branches = await Branch.findAll({
      order: [["id", "ASC"]],
    });

    res.json({
      success: true,
      data: branches,
    });
  } catch (error) {
    console.error("GET BRANCHES ERROR:", error);

    res.status(500).json({
      success: false,
      message: "โหลดข้อมูลสาขาไม่สำเร็จ",
    });
  }
});

// POST - เพิ่มสาขา
router.post("/", async (req, res) => {
  try {
    const {
      code,
      name,
      address,
      phone,
    } = req.body;

    if (
      !code ||
      !name ||
      !address ||
      !phone
    ) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกข้อมูลให้ครบ",
      });
    }

    const existingBranch =
      await Branch.findOne({
        where: { code },
      });

    if (existingBranch) {
      return res.status(400).json({
        success: false,
        message: "รหัสสาขานี้มีอยู่แล้ว",
      });
    }

    const branch = await Branch.create({
      code: code.trim(),
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim(),
      status: "เปิดใช้งาน",
    });

    res.status(201).json({
      success: true,
      message: "เพิ่มสาขาเรียบร้อย",
      data: branch,
    });
  } catch (error) {
    console.error("CREATE BRANCH ERROR:", error);

    res.status(500).json({
      success: false,
      message: "เพิ่มสาขาไม่สำเร็จ",
    });
  }
});

// PUT - แก้ไขสาขา
router.put("/:id", async (req, res) => {
  try {
    const branch = await Branch.findByPk(
      req.params.id
    );

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบสาขา",
      });
    }

    const {
      code,
      name,
      address,
      phone,
    } = req.body;

    if (
      !code ||
      !name ||
      !address ||
      !phone
    ) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกข้อมูลให้ครบ",
      });
    }

    const duplicate =
      await Branch.findOne({
        where: { code },
      });

    if (
      duplicate &&
      duplicate.id !== branch.id
    ) {
      return res.status(400).json({
        success: false,
        message: "รหัสสาขานี้มีอยู่แล้ว",
      });
    }

    await branch.update({
      code: code.trim(),
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim(),
    });

    res.json({
      success: true,
      message: "แก้ไขข้อมูลสาขาเรียบร้อย",
      data: branch,
    });
  } catch (error) {
    console.error("UPDATE BRANCH ERROR:", error);

    res.status(500).json({
      success: false,
      message: "แก้ไขสาขาไม่สำเร็จ",
    });
  }
});

// PATCH - เปิด/ปิดสาขา
router.patch("/:id/status", async (req, res) => {
  try {
    const branch = await Branch.findByPk(
      req.params.id
    );

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบสาขา",
      });
    }

    const newStatus =
      branch.status === "เปิดใช้งาน"
        ? "ปิดใช้งาน"
        : "เปิดใช้งาน";

    await branch.update({
      status: newStatus,
    });

    res.json({
      success: true,
      message: "เปลี่ยนสถานะเรียบร้อย",
      data: branch,
    });
  } catch (error) {
    console.error(
      "UPDATE BRANCH STATUS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "เปลี่ยนสถานะไม่สำเร็จ",
    });
  }
});

// DELETE - ลบสาขา
router.delete("/:id", async (req, res) => {
  try {
    const count =
      await Branch.count();

    if (count <= 1) {
      return res.status(400).json({
        success: false,
        message: "ต้องมีอย่างน้อย 1 สาขา",
      });
    }

    const branch =
      await Branch.findByPk(
        req.params.id
      );

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบสาขา",
      });
    }

    await branch.destroy();

    res.json({
      success: true,
      message: "ลบสาขาเรียบร้อย",
    });
  } catch (error) {
    console.error("DELETE BRANCH ERROR:", error);

    res.status(500).json({
      success: false,
      message: "ลบสาขาไม่สำเร็จ",
    });
  }
});

export default router;