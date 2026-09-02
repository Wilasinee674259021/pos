import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const PurchaseOrder = sequelize.define(
  "PurchaseOrder",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },

    // ชื่อผู้ขาย / ร้านที่สั่งสินค้า
    supplierName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // ยอดรวมของการสั่งซื้อ
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    // สถานะใบสั่งซื้อ
    // pending = รอรับสินค้า
    // received = รับสินค้าแล้ว
    // cancelled = ยกเลิก
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
    },

    // วิธีชำระเงิน
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // หมายเหตุ
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // วันที่รับสินค้า
    receivedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "purchase_orders",
    timestamps: true,
  }
);

export default PurchaseOrder;