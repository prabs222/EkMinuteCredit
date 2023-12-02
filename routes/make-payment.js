const express = require('express');
const { Loan, Customer, Payment } = require('../models');
const router = express.Router();

router.post('/:customer_id/:loan_id', async (req, res) => {
  try {
    const customerId = parseInt(req.params.customer_id);
    const loanId = parseInt(req.params.loan_id);
    const { amount_paid } = req.body;

    if (isNaN(customerId) || isNaN(loanId) || isNaN(amount_paid)) {
      return res.status(400).json({ error: 'Invalid input. Please provide valid numeric values.' });
    }

    // Retrieve loan details along with associated customer details
    const loan = await Loan.findByPk(loanId, {
      include: [{ model: Customer, attributes: ['customer_id'] }],
    });

    if (!loan || loan.Customer.customer_id !== customerId) {
      return res.status(404).json({ error: 'Loan not found for the customer' });
    }


    // Record the payment in the database
    const payment = await Payment.create({
        loan_id: loanId,
        amount_paid: amount_paid,
        payment_date: new Date(),
        transaction_id: null,  
    });
    
    // Calculate new EMI amount based on the payment made
    if(amount_paid !== loan.monthly_repayment){
        const newEMIAmount = calculateNewEMIAmount(loan.monthly_repayment, amount_paid, loan.tenure ,loan.totalEmisPaid);
        loan.monthly_repayment = newEMIAmount;
    }
    loan.totalEmisPaid += 1;  // Increment the totalEmisPaid count
    loan.save();

    res.status(200).json({ message: 'Payment successful' });
  } catch (error) {
    console.error('Error while processing payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Function to calculate new EMI amount for the entire loan tenure
function calculateNewEMIAmount(oldEMIAmount, amountPaid, tenure, totalEmisPaid) {
    const remainingInstallments = tenure - totalEmisPaid;
    const remainingLoanAmount = oldEMIAmount * remainingInstallments - amountPaid;
    const newEMIAmount = remainingLoanAmount / (remainingInstallments-1);
  
    return Math.max(0, newEMIAmount); // Ensure new EMI amount is non-negative
  }
  
module.exports = router;
