// routes/check-eligibility.js
const express = require('express');
const { Customer, Loan } = require('../models');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { customer_id, loan_amount, interest_rate, tenure } = req.body;

    // Parse to integers
    const customerId = parseInt(customer_id);
    const parsedLoanAmount = parseFloat(loan_amount);
    const parsedInterestRate = parseFloat(interest_rate);
    const parsedTenure = parseInt(tenure);

    // Validate inputs
    if (isNaN(customerId) || isNaN(parsedLoanAmount) || isNaN(parsedInterestRate) || isNaN(parsedTenure)) {
      return res.status(400).json({ error: 'Invalid input. Please provide valid numeric values.' });
    }

    // Retrieve customer's information from the database
    const customer = await Customer.findByPk(customerId, {
      include: [{ model: Loan, attributes: ['loan_amount', 'emis_paid_on_time', 'start_date', 'end_date'] }],
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Calculate credit score
    const creditScore = calculateCreditScore(customer);

    // Determine loan approval and interest rate
    const { approval, corrected_interest_rate, monthly_instalment } = determineLoanApprovalAndRate(
      creditScore,
      customer,
      parsedLoanAmount,
      parsedInterestRate,
      parsedTenure
    );

    // Response body
    const responseBody = {
      customer_id: customerId,
      creditScore: creditScore,
      approval,
      interest_rate: parsedInterestRate,
      corrected_interest_rate,
      tenure: parsedTenure,
      monthly_instalment,
    };

    res.status(200).json(responseBody);
  } catch (error) {
    console.error('Error during loan eligibility check:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Function to calculate credit score
function calculateCreditScore(customer) {
  const emisPaidOnTimePercentage = calculateEmisPaidOnTimePercentage(customer);
  const numberOfLoansTaken = calculateNumberOfLoansTaken(customer);
  const loanActivityInCurrentYear = calculateLoanActivityInCurrentYear(customer);
  const loanApprovedVolume = calculateLoanApprovedVolume(customer);
  const sumOfCurrentLoansVsApprovedLimit = calculateSumOfCurrentLoansVsApprovedLimit(customer);

    console.log("**********************************************************************");
    console.log(emisPaidOnTimePercentage);
    console.log(numberOfLoansTaken);
    console.log(loanActivityInCurrentYear);
    console.log(loanApprovedVolume);
    console.log(sumOfCurrentLoansVsApprovedLimit);
  // Sum up the scores for each component
  const totalScore = emisPaidOnTimePercentage + numberOfLoansTaken + loanActivityInCurrentYear + loanApprovedVolume + sumOfCurrentLoansVsApprovedLimit;

  // Round the total score to a whole number
  return Math.round(totalScore);
}

// Function to determine loan approval and interest rate
function determineLoanApprovalAndRate(creditScore, customer, loanAmount, interestRate, tenure) {
  let approval = false;
  let correctedInterestRate = interestRate;
  let monthlyInstalment = 0;

  if (creditScore > 50) {
    approval = true;
  } else if (50 > creditScore && creditScore > 30) {
    correctedInterestRate = Math.max(interestRate, 12);
    approval = true;
  } else if (30 > creditScore && creditScore > 10) {
    correctedInterestRate = Math.max(interestRate, 16);
    approval = true;
  }

  if (!approval) {
    return { approval, corrected_interest_rate: 0, monthly_instalment: 0 };
  }

  // Calculate monthly instalment
  monthlyInstalment = calculateMonthlyInstalment(loanAmount, correctedInterestRate, tenure);

  return { approval, corrected_interest_rate: correctedInterestRate, monthly_instalment: monthlyInstalment };
}

// Function to calculate EMIs Paid on Time Percentage
function calculateEmisPaidOnTimePercentage(customer) {
  if (!customer.Loans || customer.Loans.length === 0) {
    return 100; // Assuming 100% if no past loans
  }

  const totalLoans = customer.Loans.length;
  const emisPaidOnTimeCount = customer.Loans.filter((loan) => loan.emis_paid_on_time).length;

  return (emisPaidOnTimeCount / totalLoans) * 100;
}

// Function to calculate Number of Loans Taken
function calculateNumberOfLoansTaken(customer) {
  return customer.Loans ? customer.Loans.length : 0;
}

// Function to calculate Loan Activity in the Current Year
function calculateLoanActivityInCurrentYear(customer) {
  const currentYear = new Date().getFullYear();

  if (!customer.Loans || customer.Loans.length === 0) {
    return 0; // No loans in the current year
  }

  const loansInCurrentYear = customer.Loans.filter((loan) => new Date(loan.end_date) >= new Date());

  return loansInCurrentYear.length;
}

// Function to calculate Loan Approved Volume
function calculateLoanApprovedVolume(customer) {
  if (!customer.Loans || customer.Loans.length === 0) {
    return 0; // No past loans
  }

  return customer.Loans.reduce((totalVolume, loan) => totalVolume + loan.loan_amount, 0);
}

// Function to calculate Sum of Current Loans vs Approved Limit
function calculateSumOfCurrentLoansVsApprovedLimit(customer) {
  if (!customer.Loans || customer.Loans.length === 0) {
    return 0; // No current loans
  }

  const sumOfCurrentLoans = customer.Loans.reduce((totalAmount, loan) => totalAmount + loan.loan_amount, 0);

  return sumOfCurrentLoans > customer.approved_limit ? 0 : 1;
}

// Function to calculate Monthly Instalment
function calculateMonthlyInstalment(loanAmount, interestRate, tenure) {
  const monthlyInterestRate = interestRate / 100 / 12;
  const numberOfPayments = tenure * 12;

  const monthlyInstalment =
    (loanAmount * monthlyInterestRate) /
    (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments));

  return monthlyInstalment;
}

module.exports = router;
