const mongoose = require('mongoose');
const connectDB = require('./config/db');
const syncDB = require('./crawler/util/syncDB');
const siteQueue = require('./crawler/queue');
const startCrawler = require('./crawler/util/startCrawler');
const getProxy = require('./crawler/src/feedProxy');

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

// Regularly execute Crawler
function interval(callback, delay = 14400000) {
  return new Promise(resolve => {
    var id = setInterval(() => {
      callback(id, resolve);
    }, delay);
  });
}
interval(async (id, resolve) => {
  getProxy();
  start();
});
