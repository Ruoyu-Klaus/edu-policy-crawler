const mongoose = require('mongoose');
const connectDB = require('./config/db');
const syncDB = require('./crawler/util/syncDB');
const siteQueue = require('./crawler/queue');
const startCrawler = require('./crawler/util/startCrawler');
const getProxy = require('./crawler/src/feedProxy');

var cron = require('node-cron');
const sendMail = require('./nodemailer');

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

cron.schedule('*/5 * * * * *', () => {
  // sendMail({
  //   to: 'klaus1201810802@gmail.com',
  //   from: '1178570317@qq.com',
  //   subject: `${category}:${type}`,
  //   text: `${title}`,
  //   html: `<strong>${link}</strong>`,
  // }).catch(console.error);
  console.log(2);
});
