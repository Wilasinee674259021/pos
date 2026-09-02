import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Expense = sequelize.define(
  "Expense",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // หมวดหมู่ค่าใช้จ่าย
    // เช่น ค่าเช่า, ค่าไฟ, ค่าน้ำ, ค่าขนส่ง, เงินเดือน, อื่นๆ
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // รายละเอียดค่าใช้จ่าย
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // จำนวนเงิน
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    // วิธีชำระเงิน
    // cash / qr / card / transfer
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // หมายเหตุเพิ่มเติม
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "expenses",
    timestamps: true,
  }
);

export default Expense;