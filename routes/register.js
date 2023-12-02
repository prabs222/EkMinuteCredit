const express = require('express');
const { Customer } = require('../models');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    req.body.phone_number = req.body.phone_number.toString();
    const { first_name, last_name, age, monthly_income, phone_number } = req.body;

    // Check if a customer with the same phone number already exists
    const existingCustomer = await Customer.findOne({ where: { phone_number } });

    if (existingCustomer) {
      // Customer with the same phone number already exists
      return res.status(400).json({ error: 'Customer with the same phone number already exists' });
    }

    const approved_limit = Math.round(36 * monthly_income);

    const newCustomer = await Customer.create({
      first_name,
      last_name,
      age,
      monthly_income,
      approved_limit,
      phone_number,
    });

    res.status(201).json({
      customer_id: newCustomer.customer_id,
      name: `${newCustomer.first_name} ${newCustomer.last_name}`,
      age: newCustomer.age,
      monthly_income: newCustomer.monthly_income,
      approved_limit: newCustomer.approved_limit,
      phone_number: newCustomer.phone_number,
    });
  } catch (error) {
    console.error('Error during customer registration:', error);

    if (error.name === 'SequelizeValidationError') {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

module.exports = router;
