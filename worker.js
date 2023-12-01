// worker.js
const { sequelize } = require('./models');
const { ingestData } = require('./data-ingestion');

async function runDataIngestion() {
  try {
    await sequelize.sync(); // Ensure database is synced
    await ingestData(); // Custom function to ingest data
  } catch (error) {
    console.error('Error during data ingestion:', error);
  } finally {
    process.exit(); // Close the worker process
  }
}


module.exports = { runDataIngestion };
