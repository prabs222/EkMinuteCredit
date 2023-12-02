'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Loan extends Model {
    static associate(models) {
      Loan.belongsTo(models.Customer, { foreignKey: 'customer_id' });
      Loan.hasMany(models.Payment, { foreignKey: 'loan_id' }); 
    }
  }

  Loan.init({
    loan_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    loan_amount: DataTypes.DECIMAL(10, 2),
    tenure: DataTypes.INTEGER,
    interest_rate: DataTypes.DECIMAL(5, 2),
    monthly_repayment: DataTypes.DECIMAL(10, 2),
    emis_paid_on_time: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
    totalEmisPaid: {            // additional field created to calculate the remainingEmisPaid
      type: DataTypes.INTEGER,  // which helps to calculate the newMonthlyInstalment
      allowNull: true,
      defaultValue: 0, 
    },
  
  }, {
    sequelize,
    modelName: 'Loan',
  });

  return Loan;
};
