const express = require('express');
const { Customer, Loan } = require('../models');
const axios = require('axios');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { customer_id, loan_amount, interest_rate, tenure } = req.body;

    // Make a request to check eligibility
    const eligibilityResponse = await axios.post('http://localhost:3000/check-eligibility', {
      customer_id,
      loan_amount,
      interest_rate,
      tenure,
    });

    // Check if the loan is approved
    if (!eligibilityResponse.data.approval) {
      return res.status(200).json({
        loan_id: null,
        customer_id,
        loan_approved: false,
        message: 'Loan not approved. ' + eligibilityResponse.data.message,
        monthly_installment: 0,
      });
    }
        
    // Calculate end date based on tenure in months
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + tenure);
    

    // Loan is approved, create a new loan entry with corrected interest rate
    const newLoan = await Loan.create({
      customer_id,
      loan_amount,
      interest_rate: eligibilityResponse.data.corrected_interest_rate,
      tenure,
      monthly_repayment: eligibilityResponse.data.monthly_instalment,
      end_date: endDate,
      emis_paid_on_time: 0,
      start_date: new Date(),
    });

    res.status(201).json({
      loan_id: newLoan.loan_id,
      customer_id,
      loan_approved: true,
      message: 'Loan approved successfully',
      monthly_installment: eligibilityResponse.data.monthly_instalment,
    });
  } catch (error) {
    console.error('Error during loan creation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
