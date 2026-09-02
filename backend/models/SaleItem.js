import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const SaleItem = sequelize.define(
  "SaleItem",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // เลขที่บิลขาย
    saleId: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // รหัสสินค้า
    productId: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // ชื่อสินค้า ณ ตอนที่ขาย
    // เก็บไว้เพื่อไม่ให้ประวัติเปลี่ยนตามชื่อสินค้าในปัจจุบัน
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // จำนวนที่ขาย
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    // ราคาขายต่อชิ้น ณ ตอนที่ขาย
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    // ราคาต้นทุนต่อชิ้น ณ ตอนที่ขาย
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    // ราคาขายรวมของรายการ
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    // ต้นทุนรวมของรายการ
    totalCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "sale_items",
    timestamps: true,
  }
);

export default SaleItem;