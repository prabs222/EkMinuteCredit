'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Payments', {
      payment_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      loan_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Loans',
          key: 'loan_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      amount_paid: {
        type: Sequelize.DECIMAL(10, 2),
      },
      payment_date: {
        type: Sequelize.DATE,
      },
      transaction_id: {
        type: Sequelize.STRING,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Payments');
  }
};
