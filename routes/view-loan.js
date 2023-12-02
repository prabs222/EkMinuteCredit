const express = require('express');
const { Loan, Customer } = require('../models');

const router = express.Router();

router.get('/:loan_id', async (req, res) => {
  try {
    const loanId = parseInt(req.params.loan_id);

    if (isNaN(loanId)) {
      return res.status(400).json({ error: 'Invalid loan ID' });
    }

    // Retrieve loan details along with associated customer details
    const loan = await Loan.findByPk(loanId, {
      include: [{ model: Customer, attributes: ['customer_id', 'first_name', 'last_name', 'phone_number', 'age'] }],
    });

    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    // Extract relevant details for response
    const loanDetails = {
      loan_id: loan.loan_id,
      customer: {
        id: loan.Customer.customer_id,
        first_name: loan.Customer.first_name,
        last_name: loan.Customer.last_name,
        phone_number: loan.Customer.phone_number,
        age: loan.Customer.age,
      },
      loan_amount: loan.loan_amount,
      interest_rate: loan.interest_rate,
      monthly_instalment: loan.monthly_repayment,
      tenure: loan.tenure,
      totalEmisPaid: loan.totalEmisPaid,
    };

    res.status(200).json(loanDetails);
  } catch (error) {
    console.error('Error while fetching loan details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
