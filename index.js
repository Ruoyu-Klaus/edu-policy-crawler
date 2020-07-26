const mongoose = require('mongoose');
const connectDB = require('./config/db');
const syncDB = require('./crawler/util/syncDB');
const siteQueue = require('./crawler/queue');
const startCrawler = require('./crawler/util/startCrawler');
const getProxy = require('./crawler/src/feedProxy');

const cron = require('node-cron');

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
// Start Directly
start();

// Run code every 3 hours
// cron.schedule('* */3 * * *', () => {
//   getProxy();
//   start();
// });

// Run code every 6 hours
// cron.schedule('* */6 * * *', () => {
//   getProxy();
//   start();
// });

// Run code at every 6:00am 12:00pm 18:00am 0:00am
// cron.schedule(
//   '* 6,12,18,0 * * *',
//   () => {
//     getProxy();
//     start();
//   },
//   { scheduled: true, timezone: 'Asia/Shanghai' }
// );
