// data-ingestion.js
const { Customer, Loan } = require('./models');
const ExcelJS = require('exceljs');

async function ingestData() {
  try {
    // Read customer data from Excel
    const customerWorkbook = new ExcelJS.Workbook();
    await customerWorkbook.xlsx.readFile('./excelFiles/customer_data.xlsx');
    const customerSheet = customerWorkbook.getWorksheet('Sheet1');
    const customerData = customerSheet.getSheetValues();

    // Read loan data from Excel
    const loanWorkbook = new ExcelJS.Workbook();
    await loanWorkbook.xlsx.readFile('./excelFiles/loan_data.xlsx');
    const loanSheet = loanWorkbook.getWorksheet('Sheet1');
    const loanData = loanSheet.getSheetValues();

    if (!customerData.length || !loanData.length) {
      throw new Error('No data found in one or more sheets. Aborting data ingestion.');
    }

    // Ingest customer data
    const customerIdMap = new Map();
    for (let i = 1; i < customerData.length; i++) {
      const row = customerData[i];

      try {
        if (row && row.length === 8) {
          // Check for duplicate customer_id
          const existingCustomer = await Customer.findOne({ where: { customer_id: row[1] } });

          if (existingCustomer) {
            console.warn(`Skipping duplicate customer_id ${row[1]} at index ${i}.`);
          } else {

            const customer = await Customer.create({
              first_name: row[2],
              last_name: row[3],
              age: row[4],
              phone_number: row[5],
              monthly_income: row[6],
              approved_limit: row[7],
              current_debt: 0,
            });
            const cobj = Customer.build({ customer_id: row[1] });
            

            // Store the created customer record in a map for quick retrieval
            customerIdMap.set(row[1], customer);
          }
        } else {
          console.warn(`Skipping invalid row in customer data at index ${i}:`, row);
        }
      } catch (error) {
        console.error(`Error processing row in customer data at index ${i}:`, error);
      }
    }

    // Ingest loan data and link to customers
    for (let i = 2; i < loanData.length; i++) {
      const row = loanData[i];

      try {
        if (row && row.length === 10) {
          const customerId = row[1];
          const customer = customerIdMap.get(customerId);

          if (customer) {
            // Check for duplicate loan_id as the "loan_data.xlsx" contains duplice entry for loan_id in
            const existingLoan = await Loan.findOne({ where: { loan_id: row[2] } });
            if (existingLoan) {
              console.warn(`Skipping duplicate loan_id ${row[2]} at index ${i}.`);
            } else {
              const totalEmisPaid = await calculateTotalEmisPaid(row[8], row[9], row[4]);
              await Loan.create({
                customer_id: customerId,
                loan_id: row[2],
                loan_amount: row[3],
                tenure: row[4],
                interest_rate: row[5],
                monthly_repayment: row[6],
                emis_paid_on_time: row[7],
                start_date: row[8],
                end_date: row[9],
                totalEmisPaid: totalEmisPaid
              });

              // Update current_debt for the customer
              const updatedCustomer = await Customer.findByPk(customerId, {
                include: [{ model: Loan, attributes: ['loan_amount'] }],
              });

              if (updatedCustomer) {
                const currentDebt = updatedCustomer.Loans.reduce((totalDebt, loan) => totalDebt + parseFloat(loan.loan_amount || 0), 0);
                await updatedCustomer.update({ current_debt: currentDebt });
              }
            }
          } else {
            console.warn(`Customer with ID ${customerId} not found for loan at index ${i}. Skipping...`);
          }
        } else {
          console.warn(`Skipping invalid row in loan data at index ${i}:`, row);
        }
      } catch (error) {
        console.error(`Error processing row in loan data at index ${i}:`, error);
      }
    }

    console.log('Data ingestion completed.');
  } catch (error) {
    console.error('Error during data ingestion:', error);
  }
}
async function calculateTotalEmisPaid(startDate, endDate, tenure) {
  const currentDate = new Date();
  const emisPerMonth = 1; // Assuming one EMI per month

  // If the loan's end_date is in the future, calculate totalEmisPaid based on the current date
  if (new Date(endDate) >= currentDate) {
    const monthsPassed = Math.max(0, (currentDate - new Date(startDate)) / (30 * 24 * 60 * 60 * 1000));
    return Math.floor(monthsPassed / emisPerMonth);
  }

  // If the loan has ended, return the total tenure
  return tenure;
}


module.exports = { ingestData };