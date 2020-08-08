const Crawler = require('crawler');
const userAgents = require('../src/userAgents');
const mongoose = require('mongoose');

module.exports = (siteQueue, proxy = null) => {
  let crawler = new Crawler({
    rateLimit: 2000,
    maxConnections: 1,
    rotateUA: true,
    userAgent: [...userAgents],
    retries: 3,
    retryTimeout: 2000,
  });
  crawler.queue(siteQueue);
  crawler.on('schedule', function (options) {
    options.proxy = proxy;
  });
  crawler.on('drain', function () {
    setTimeout(() => {
      mongoose.connection.close();
      console.log('------------End---------------');
    });
  });
};
