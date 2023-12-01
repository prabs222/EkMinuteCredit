'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('Customers', 'monthly_salary', 'monthly_income');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('Customers', 'monthly_income', 'monthly_salary');
  }
};
