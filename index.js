const mongoose = require('mongoose');
const connectDB = require('./config/db');
const syncDB = require('./crawler/util/syncDB');
const siteQueue = require('./crawler/queue');
const startCrawler = require('./crawler/util/startCrawler');
const getProxy = require('./crawler/src/feedProxy');

var cron = require('node-cron');

var start = async () => {
  try {
    await connectDB();
    await syncDB();
    console.log('Categories and Types in the database has updated...');
    startCrawler(siteQueue);
  } catch (error) {
    mongoose.connection.close();
    console.error(error);
    process.exit(1);
  }
};

start();

// cron.schedule('*/5 * * * *', () => {

// });
