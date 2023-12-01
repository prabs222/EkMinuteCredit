'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Customers', {
      customer_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      age: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      phone_number: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      monthly_salary: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      approved_limit: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      current_debt: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Customers');
  },
};
