import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const StockMovement = sequelize.define(
  "StockMovement",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // รหัสสินค้า
    productId: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // ประเภทการเคลื่อนไหว
    // in = สินค้าเข้า
    // out = สินค้าออก
    movementType: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // สาเหตุ เช่น sale, purchase, adjustment
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // จำนวนสินค้า
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    // เลขอ้างอิง เช่น เลขบิลขาย / เลขใบสั่งซื้อ
    referenceId: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // หมายเหตุ
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "stock_movements",
    timestamps: true,
  }
);

export default StockMovement;