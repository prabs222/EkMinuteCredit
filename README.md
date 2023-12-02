# EkMinuteCredit

### This repository is created during the completion of internship assignment of Alemeno!

Video Link: https://drive.google.com/drive/folders/1kbZgCNqJuRePAj_Qec4d_ElzUKac_E2T?usp=sharing

Postman Workflow: https://www.postman.com/prabs222/workspace/ekminutecredit

## Routes:

### 1. Customer Registe Route:
POST => localhost:3000/register
request.body:
{ "first_name" , "last_name", "age", "monthly_income", "phone_number"}

### 2. EMI Payment Route:
POST => localhost:3000/make-payment/15/1
rquest.body:
{"amount_paid"}

### 3. Create Loan Route:
POST => localhost:3000/create-loan/
request.body:
{"customer_id", "loan_amount", "interest_rate", "tenure}

### 4. View Loan Details:
GET => localhost:3000/view-loan/1

### 5. View All Loans Statement:
GET => localhost:3000/view-all-statement/15

### 6. Check Eligibility Route:
POST => localhost:3000/check-eligibility


