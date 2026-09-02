import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const PurchaseItem = sequelize.define(
  "PurchaseItem",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // เลขที่ใบสั่งซื้อ
    purchaseOrderId: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // รหัสสินค้า
    productId: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // ชื่อสินค้า ณ ตอนสั่งซื้อ
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // จำนวนที่สั่ง
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    // ราคาต้นทุนต่อชิ้น
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    // ราคารวมของรายการ
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "purchase_items",
    timestamps: true,
  }
);

export default PurchaseItem;