// app.js
const express = require('express');
const { runDataIngestion } = require('./worker');
const registerRouter = require('./routes/register')
const checkEligibilityRoute = require('./routes/check-eligibility');
const app = express();
const port = 3000;

app.get('/trigger-data-ingestion', (req, res) => {
  runDataIngestion();
  res.send('Data ingestion started.');
});

app.use(express.json());

// Use the register route
app.use('/register', registerRouter);
app.use('/check-eligibility', checkEligibilityRoute);



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
