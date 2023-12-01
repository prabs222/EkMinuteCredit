'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    static associate(models) {
      Customer.hasMany(models.Loan, { foreignKey: 'customer_id' });
    }
  }

  Customer.init({
    customer_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    age: DataTypes.INTEGER,
    phone_number: {
      type: DataTypes.STRING,
      unique: true,
    },
    monthly_income: DataTypes.DECIMAL(10, 2),
    approved_limit: DataTypes.DECIMAL(10, 2),
    current_debt: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
  }, {
    sequelize,
    modelName: 'Customer',
  });

  return Customer;
};
