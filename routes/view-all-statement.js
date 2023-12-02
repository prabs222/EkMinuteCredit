const express = require('express');
const { Customer, Loan, Payment } = require('../models');

const router = express.Router();

router.get('/:customer_id', async (req, res) => {
  try {
    const customerId = parseInt(req.params.customer_id);

    if (isNaN(customerId)) {
      return res.status(400).json({ error: 'Invalid input. Please provide a valid numeric customer_id.' });
    }

    // Retrieve customer details along with associated loans and payments
    const customer = await Customer.findByPk(customerId, {
      include: [
        {
          model: Loan,
          attributes: ['loan_id', 'loan_amount', 'tenure', 'interest_rate', 'monthly_repayment', 'totalEmisPaid'],
          include: [{ model: Payment, attributes: ['amount_paid', 'payment_date'] }],
        },
      ],
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Prepare response body
    const loanItems = customer.Loans.map((loan) => {
      let totalAmountPaid = loan.Payments.reduce((total, payment) => total + parseFloat(payment.amount_paid || 0), 0);
      const repaymentsLeft = loan.tenure - loan.totalEmisPaid;
      if(totalAmountPaid === 0){
        totalAmountPaid = (loan.monthly_repayment * loan.tenure) - (loan.monthly_repayment * repaymentsLeft);
      }


      return {
        customer_id: customerId,
        loan_id: loan.loan_id,
        principal: loan.loan_amount,
        interest_rate: loan.interest_rate,
        amount_paid: totalAmountPaid,
        monthly_instalment: loan.monthly_repayment,
        repayments_left: repaymentsLeft,
        tenure: loan.tenure,
      };
    });

    res.status(200).json(loanItems);
  } catch (error) {
    console.error('Error while fetching customer statements:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
