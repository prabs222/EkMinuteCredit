const express = require('express');
const { Loan, Payment } = require('../models');

const router = express.Router();

router.get('/:customer_id/:loan_id', async (req, res) => {
  try {
    const customerId = parseInt(req.params.customer_id);
    const loanId = parseInt(req.params.loan_id);
    console.log("********************************");

    if (isNaN(customerId) || isNaN(loanId)) {
      return res.status(400).json({ error: 'Invalid input. Please provide valid numeric values.' });
    }

    // Retrieve loan details along with associated payments
    const loan = await Loan.findByPk(loanId, {
      include: [{ model: Payment, attributes: ['amount_paid', 'payment_date'] }],
    });

    if (!loan || loan.customer_id !== customerId) {
      return res.status(404).json({ error: 'Loan not found for the customer' });
    }

    // Calculate amount repaid and repayments left
    let totalAmountPaid = loan.Payments.reduce((total, payment) => total + parseFloat(payment.amount_paid || 0), 0);
    const repaymentsLeft = loan.tenure - loan.totalEmisPaid;
    if(totalAmountPaid === 0){
         totalAmountPaid = (loan.monthly_repayment * loan.tenure) - (loan.monthly_repayment * repaymentsLeft);
      }

    // Response body
    const loanItem = {
      customer_id: customerId,
      loan_id: loanId,
      principal: loan.loan_amount,
      interest_rate: loan.interest_rate,
      amount_paid: totalAmountPaid,
      monthly_instalment: loan.monthly_repayment,
      repayments_left: repaymentsLeft,
    };

    res.status(200).json(loanItem);
  } catch (error) {
    console.error('Error while fetching loan statement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
