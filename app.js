// app.js
const express = require('express');
const { runDataIngestion } = require('./worker');
const registerRouter = require('./routes/register')
const checkEligibilityRoute = require('./routes/check-eligibility');
const createLoanRoute = require('./routes/create-loan');
const viewLoanRoute = require('./routes/view-loan');
const makePaymentRoute = require('./routes/make-payment');
const viewStatementsRoute = require('./routes/view-statement');
const viewAllStatementsRoute = require('./routes/view-all-statement');

const app = express();
const port = process.env.PORT || 3000;

// Allow any host during development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });
}


// Logging Middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// route for ingesting data
app.get('/trigger-data-ingestion', (req, res) => {
  runDataIngestion();
  res.send('Data ingestion started.');
});

app.use(express.json());

app.use('/register', registerRouter);
app.use('/check-eligibility', checkEligibilityRoute);
app.use('/create-loan', createLoanRoute);
app.use('/view-loan', viewLoanRoute);
app.use('/make-payment', makePaymentRoute);
app.use('/view-statement', viewStatementsRoute);
app.use('/view-all-statement', viewAllStatementsRoute);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});

