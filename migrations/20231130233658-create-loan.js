'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Loans', {
      loan_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Customers',
          key: 'customer_id',
        },
      },
      loan_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      tenure: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      interest_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      monthly_repayment: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      emis_paid_on_time: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false,
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
    await queryInterface.dropTable('Loans');
  },
};
