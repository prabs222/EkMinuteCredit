'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.Loan, { foreignKey: 'loan_id' });
    }
  }

  Payment.init({
    payment_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      loan_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      amount_paid: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      payment_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      transaction_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },    
  }, {
    sequelize,
    modelName: 'Payment',
  });

  return Payment;
};
