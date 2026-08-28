import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Sale = sequelize.define(
  "Sale",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },

    memberId: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    receivedAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    changeAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    earnedPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "sales",
    timestamps: true,
  },
);

export default Sale;
