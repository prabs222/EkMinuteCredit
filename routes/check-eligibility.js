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
        const creditScore = calculateFinalCreditScore(customer);


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

function calculateFinalCreditScore(customer) {
    const paymentHistoryScore = calculatePaymentHistoryScore(customer);
    const amountsOwedScore = calculateAmountsOwedScore(customer);
    const creditHistoryLengthScore = calculateCreditHistoryLengthScore(customer);
    const loanActivityInCurrentYear = calculateLoanActivityInCurrentYear(customer);
    // Sum up the scores for each component

    console.log(paymentHistoryScore);
    console.log(amountsOwedScore);
    console.log(creditHistoryLengthScore);
    console.log(loanActivityInCurrentYear);

    const totalScore = paymentHistoryScore + amountsOwedScore + creditHistoryLengthScore - (5*loanActivityInCurrentYear);
  
    // Round the total score to a whole number
    return Math.round(totalScore);
  }
    
function calculatePaymentHistoryScore(customer) {
    if (!customer.Loans || customer.Loans.length === 0) {
        return 35; // Assuming 100% if no past loans
    }

    const totalLoans = customer.Loans.length;
    const onTimePaymentsCount = customer.Loans.filter((loan) => loan.emis_paid_on_time).length;
    const onTimePaymentPercentage = (onTimePaymentsCount / totalLoans) * 100;

    if (onTimePaymentPercentage >= 95) {
        return 35;
    } else if (onTimePaymentPercentage >= 90) {
        return 30;
    } else if (onTimePaymentPercentage >= 85) {
        return 25;
    } else if (onTimePaymentPercentage >= 80) {
        return 20;
    } else {
        return 0;
    }
}
function calculateAmountsOwedScore(customer) {
    if (!customer.Loans || customer.Loans.length === 0) {
        return 30; // Assuming 0% credit utilization if no loans
    }

    const creditUtilizationRatio = calculateCreditUtilizationRatio(customer);

    if (creditUtilizationRatio <= 20) {
        return 30;
    } else if (creditUtilizationRatio <= 40) {
        return 25;
    } else if (creditUtilizationRatio <= 60) {
        return 20;
    } else if (creditUtilizationRatio <= 80) {
        return 15;
    } else if (creditUtilizationRatio <= 100) {
        return 10;
    } else {
        return 0;
    }
}

function calculateCreditUtilizationRatio(customer) {
    const totalCreditLimit = calculateTotalCreditLimit(customer);
    const totalLoanAmount = calculateTotalLoanAmount(customer);

    return (totalLoanAmount / totalCreditLimit) * 100;
}

function calculateTotalCreditLimit(customer) {
    return customer.approved_limit;
}

function calculateTotalLoanAmount(customer) {
    if (!customer.Loans || customer.Loans.length === 0) {
        return 0; // No past loans
    }

    return customer.Loans.reduce((totalAmount, loan) => totalAmount + loan.loan_amount, 0);
}

function calculateCreditHistoryLengthScore(customer) {
    const creditHistoryLength = calculateCreditHistoryLength(customer);

    if (creditHistoryLength > 10) {
        return 15;
    } else if (creditHistoryLength >= 7) {
        return 12;
    } else if (creditHistoryLength >= 4) {
        return 9;
    } else if (creditHistoryLength >= 1) {
        return 6;
    } else {
        return 3;
    }
}

function calculateCreditHistoryLength(customer) {
    const currentYear = new Date().getFullYear();
    const firstCreditObtainedYear = new Date(customer.createdAt).getFullYear();

    return currentYear - firstCreditObtainedYear;
}

// Function to determine loan approval and interest rate
function determineLoanApprovalAndRate(creditScore, customer, loanAmount, interestRate, tenure) {
    let approval = false;
    let correctedInterestRate = interestRate;
    let monthlyInstalment = 0;
    console.log("heyy",creditScore);

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




// Function to calculate Loan Activity in the Current Year
function calculateLoanActivityInCurrentYear(customer) {
    const currentYear = new Date().getFullYear();

    if (!customer.Loans || customer.Loans.length === 0) {
        return 0; // No loans in the current year
    }

    const loansInCurrentYear = customer.Loans.filter((loan) => new Date(loan.end_date) >= new Date());

    return loansInCurrentYear.length;
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
