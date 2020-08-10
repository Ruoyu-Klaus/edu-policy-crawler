// DB
const mongoose = require('mongoose');
const { MONGOURI } = require('./config/keys');
const connectDB = require('./config/db');
const syncDB = require('./crawler/util/syncDB');

// Crawler
const siteQueue = require('./crawler/queue');
const crawlerSpawn = require('./crawler/util/crawlerSpawn');
const getProxy = require('./crawler/src/feedProxy');

// Scheduler
const cron = require('node-cron');

const start = async () => {
  try {
    await connectDB(MONGOURI);
    await syncDB();
    console.log('Categories and Types in the database has updated...');
    // crawlerSpawn(siteQueue[0]);
  } catch (error) {
    mongoose.connection.close();
    console.error(error);
    process.exit(1);
  }
};

// Start Directly
// getProxy();
start();
// Run code at every 6:00am 12:00pm 18:00am 0:00am
// cron.schedule(
//   '0 6,12,18,0 * * *',
//   () => {
//     getProxy();
//     start();
//   },
//   { scheduled: true, timezone: 'Asia/Shanghai' }
// );

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
