import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Promotion = sequelize.define(
  "Promotion",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // เงื่อนไข เช่น ซื้อครบ 100 บาท หรือซื้อ 2 ชิ้น
    condition: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    // ส่วนลด หรือราคาพิเศษ
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "เปิดใช้งาน",
    },
  },
  {
    tableName: "promotions",
    timestamps: true,
  }
);

export default Promotion;