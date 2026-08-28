import express from "express";
import Product from "../models/Product.js";
import { Op } from "sequelize";

const router = express.Router();

// ======================================
// GET ALL PRODUCTS
// ======================================

router.get("/", async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "ไม่สามารถโหลดสินค้าได้",
      error: error.message,
    });
  }
});

// ======================================
// GET PRODUCT BY ID
// ======================================

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบสินค้า",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "ไม่สามารถโหลดสินค้าได้",
      error: error.message,
    });
  }
});

// ======================================
// SEARCH BY BARCODE
// ======================================

router.get("/barcode/:barcode", async (req, res) => {
  try {
    const product = await Product.findOne({
      where: {
        barcode: req.params.barcode,
        status: "active",
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบสินค้านี้",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("BARCODE SEARCH ERROR:", error);

    res.status(500).json({
      success: false,
      message: "ค้นหาสินค้าไม่สำเร็จ",
      error: error.message,
    });
  }
});

// ======================================
// SEARCH BY NAME
// ======================================

router.get("/search/:name", async (req, res) => {
  try {
    const name = req.params.name;

    const products = await Product.findAll({
      where: {
        name: {
          [Op.iLike]: `%${name}%`,
        },
        status: "active",
      },
    });

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("PRODUCT SEARCH ERROR:", error);

    res.status(500).json({
      success: false,
      message: "ค้นหาสินค้าไม่สำเร็จ",
      error: error.message,
    });
  }
});

// ======================================
// CREATE PRODUCT
// ======================================

router.post("/", async (req, res) => {
  try {
    const { name, barcode, price, stock, category } = req.body;

    if (!name || !barcode || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกชื่อสินค้า Barcode และราคา",
      });
    }

    const productPrice = Number(price);
    const productStock = Number(stock || 0);

    if (productPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "ราคาสินค้าต้องไม่ติดลบ",
      });
    }

    if (productStock < 0 || !Number.isInteger(productStock)) {
      return res.status(400).json({
        success: false,
        message: "จำนวน Stock ไม่ถูกต้อง",
      });
    }

    const existingProduct = await Product.findOne({
      where: {
        barcode: barcode.trim(),
      },
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "Barcode นี้มีอยู่แล้ว",
      });
    }

    const count = await Product.count();

    const productId = "P" + String(count + 1).padStart(3, "0");

    const product = await Product.create({
      id: productId,
      name: name.trim(),
      barcode: barcode.trim(),
      price: productPrice,
      stock: productStock,
      category: category?.trim() || null,
      status: "active",
    });

    res.status(201).json({
      success: true,
      message: "เพิ่มสินค้าเรียบร้อย",
      data: product,
    });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "เพิ่มสินค้าไม่สำเร็จ",
      error: error.message,
    });
  }
});

// ======================================
// UPDATE PRODUCT
// ======================================

router.put("/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบสินค้า",
      });
    }

    const { name, barcode, price, stock, category, status } = req.body;

    if (price !== undefined && Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "ราคาสินค้าต้องไม่ติดลบ",
      });
    }

    if (stock !== undefined) {
      const newStock = Number(stock);

      if (newStock < 0 || !Number.isInteger(newStock)) {
        return res.status(400).json({
          success: false,
          message: "จำนวน Stock ไม่ถูกต้อง",
        });
      }
    }

    if (barcode && barcode !== product.barcode) {
      const duplicate = await Product.findOne({
        where: {
          barcode: barcode.trim(),
        },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Barcode นี้มีอยู่แล้ว",
        });
      }
    }

    await product.update({
      name: name !== undefined ? name.trim() : product.name,

      barcode: barcode !== undefined ? barcode.trim() : product.barcode,

      price: price !== undefined ? Number(price) : product.price,

      stock: stock !== undefined ? Number(stock) : product.stock,

      category: category !== undefined ? category.trim() : product.category,

      status: status !== undefined ? status : product.status,
    });

    res.json({
      success: true,
      message: "แก้ไขสินค้าเรียบร้อย",
      data: product,
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "แก้ไขสินค้าไม่สำเร็จ",
      error: error.message,
    });
  }
});

// ======================================
// DELETE PRODUCT
// ======================================

router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบสินค้า",
      });
    }

    await product.destroy();

    res.json({
      success: true,
      message: "ลบสินค้าเรียบร้อย",
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "ลบสินค้าไม่สำเร็จ",
      error: error.message,
    });
  }
});

export default router;
