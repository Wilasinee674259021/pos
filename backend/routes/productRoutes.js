import express from "express";
import Product from "../models/Product.js";
import { Op } from "sequelize";

const router = express.Router();

// ======================================
// DEFAULT PRODUCTS
// ======================================

const defaultProducts = [
  {
    id: "P001",
    name: "น้ำดื่ม",
    barcode: "885000000001",
    price: 10,
    cost: 5,
    stock: 88,
    category: "เครื่องดื่ม",
    status: "active",
  },
  {
    id: "P002",
    name: "โค้ก 325ml",
    barcode: "885000000002",
    price: 15,
    cost: 9,
    stock: 42,
    category: "เครื่องดื่ม",
    status: "active",
  },
  {
    id: "P003",
    name: "นมสด 250ml",
    barcode: "885000000003",
    price: 13,
    cost: 8,
    stock: 38,
    category: "เครื่องดื่ม",
    status: "active",
  },
  {
    id: "P004",
    name: "มันฝรั่งทอด 50g",
    barcode: "885000000004",
    price: 20,
    cost: 12,
    stock: 34,
    category: "ขนม",
    status: "active",
  },
  {
    id: "P005",
    name: "ขนมปังไส้ครีม",
    barcode: "885000000006",
    price: 12,
    cost: 7,
    stock: 24,
    category: "ขนม",
    status: "active",
  },
  {
    id: "P006",
    name: "กาแฟกระป๋อง 180ml",
    barcode: "885000000007",
    price: 18,
    cost: 11,
    stock: 37,
    category: "เครื่องดื่ม",
    status: "active",
  },
  {
    id: "P007",
    name: "น้ำส้ม 100%",
    barcode: "885000000008",
    price: 25,
    cost: 15,
    stock: 18,
    category: "เครื่องดื่ม",
    status: "active",
  },
  {
    id: "P008",
    name: "ช็อกโกแลตนม 45g",
    barcode: "885000000009",
    price: 30,
    cost: 18,
    stock: 16,
    category: "ขนม",
    status: "active",
  },
  {
    id: "P009",
    name: "กระดาษทิชชู่ 6 ม้วน",
    barcode: "885000000010",
    price: 59,
    cost: 35,
    stock: 9,
    category: "ของใช้",
    status: "active",
  },
  {
    id: "P010",
    name: "สบู่ก้อน 100g",
    barcode: "885000000011",
    price: 35,
    cost: 20,
    stock: 6,
    category: "ของใช้",
    status: "active",
  },
  {
    id: "P011",
    name: "อาหารแมวเด็ก",
    barcode: "885000000876",
    price: 120,
    cost: 80,
    stock: 95,
    category: "สัตว์เลี้ยง",
    status: "active",
  },
];

// ======================================
// SEED / SYNC DEFAULT PRODUCTS
// ======================================

router.post("/seed", async (req, res) => {
  try {
    const results = [];

    for (const item of defaultProducts) {
      const existingProduct = await Product.findByPk(item.id);

      if (existingProduct) {
        await existingProduct.update({
          name: item.name,
          barcode: item.barcode,
          price: item.price,

          // สำคัญ: อัปเดตต้นทุนด้วย
          cost: item.cost,

          stock: item.stock,
          category: item.category,
          status: item.status,
        });

        results.push({
          id: item.id,
          action: "updated",
          cost: item.cost,
        });
      } else {
        await Product.create(item);

        results.push({
          id: item.id,
          action: "created",
          cost: item.cost,
        });
      }
    }

    const products = await Product.findAll({
      order: [["id", "ASC"]],
    });

    res.json({
      success: true,
      message: "ตั้งค่าสินค้าหลักและราคาทุนเรียบร้อย",
      results,
      data: products,
    });
  } catch (error) {
    console.error("SEED PRODUCTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "ตั้งค่าสินค้าไม่สำเร็จ",
      error: error.message,
    });
  }
});

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
    const {
      name,
      barcode,
      price,
      cost,
      stock,
      category,
    } = req.body;

    if (!name || !barcode || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกชื่อสินค้า Barcode และราคา",
      });
    }

    const productPrice = Number(price);
    const productCost = Number(cost ?? 0);
    const productStock = Number(stock ?? 0);

    if (
      Number.isNaN(productPrice) ||
      productPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "ราคาสินค้าต้องไม่ติดลบ",
      });
    }

    if (
      Number.isNaN(productCost) ||
      productCost < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "ราคาทุนต้องไม่ติดลบ",
      });
    }

    if (
      Number.isNaN(productStock) ||
      productStock < 0 ||
      !Number.isInteger(productStock)
    ) {
      return res.status(400).json({
        success: false,
        message: "จำนวน Stock ไม่ถูกต้อง",
      });
    }

    if (productCost > productPrice) {
      return res.status(400).json({
        success: false,
        message: "ราคาทุนไม่ควรมากกว่าราคาขาย",
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

    const productId =
      "P" +
      String(count + 1).padStart(3, "0");

    const product = await Product.create({
      id: productId,
      name: name.trim(),
      barcode: barcode.trim(),
      price: productPrice,
      cost: productCost,
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

    const {
      name,
      barcode,
      price,
      cost,
      stock,
      category,
      status,
    } = req.body;

    const newPrice =
      price !== undefined
        ? Number(price)
        : Number(product.price);

    const newCost =
      cost !== undefined
        ? Number(cost)
        : Number(product.cost || 0);

    const newStock =
      stock !== undefined
        ? Number(stock)
        : Number(product.stock);

    if (
      Number.isNaN(newPrice) ||
      newPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "ราคาสินค้าต้องไม่ติดลบ",
      });
    }

    if (
      Number.isNaN(newCost) ||
      newCost < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "ราคาทุนต้องไม่ติดลบ",
      });
    }

    if (
      Number.isNaN(newStock) ||
      newStock < 0 ||
      !Number.isInteger(newStock)
    ) {
      return res.status(400).json({
        success: false,
        message: "จำนวน Stock ไม่ถูกต้อง",
      });
    }

    if (newCost > newPrice) {
      return res.status(400).json({
        success: false,
        message: "ราคาทุนไม่ควรมากกว่าราคาขาย",
      });
    }

    if (
      barcode &&
      barcode !== product.barcode
    ) {
      const duplicate = await Product.findOne({
        where: {
          barcode: barcode.trim(),
        },
      });

      if (
        duplicate &&
        duplicate.id !== product.id
      ) {
        return res.status(409).json({
          success: false,
          message: "Barcode นี้มีอยู่แล้ว",
        });
      }
    }

    await product.update({
      name:
        name !== undefined
          ? name.trim()
          : product.name,

      barcode:
        barcode !== undefined
          ? barcode.trim()
          : product.barcode,

      price: newPrice,
      cost: newCost,
      stock: newStock,

      category:
        category !== undefined
          ? category.trim()
          : product.category,

      status:
        status !== undefined
          ? status
          : product.status,
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