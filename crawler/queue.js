const targetSites = require('./src/targetSites.json');
var proxyPools = require('../crawler/src/proxyPools.json');
const fs = require('fs');

const dealResponse = require('./handler');
const createQueue = require('./util/createQueue');
const insertDB = require('./util/insertDB');
const startCrawler = require('./util/startCrawler');

const siteMap = new Map();
for (const i of targetSites) {
  siteMap.set(i['uri'], i);
}

const siteQueue = new createQueue(siteMap, (error, res, done) => {
  const { category, type, site, uri, pattern } = res.options;
  // Handle error after failed all attemptive requesting
  // The code below will trigger after the current cralwer finished all tasks
  if (error) {
    if (!Boolean(proxyPools.length)) {
      console.error(error);
      done();
    } else {
      // if encouter errors rescrape this site by using proxy
      let thisSite = element => element.uri === uri;
      let thisSiteIndex = siteQueue.findIndex(thisSite) * 1;
      let newSiteQueue = siteQueue.slice(thisSiteIndex, thisSiteIndex + 1);
      startCrawler(newSiteQueue, proxyPools[0]);
      proxyPools.shift();
      fs.writeFile(`${__dirname}/src/proxyPools.json`, JSON.stringify(proxyPools), err => {
        if (err) throw err;
      });
    }
  } else {
    var $ = res.$;
    dealResponse($, category, type, site, pattern, uri)
      .then(data => {
        return insertDB(data);
      })
      .then(result => {
        console.log(`Successfully scraped ${(category, type)} from ${site}`);
        // @ callback must call done(), otherwise the crawler will stop
        done();
      })
      .catch(reason => {
        console.warn(reason);
        // if encouter errors, run a new cralwer start from the next site
        let thisSite = element => element.uri === uri;
        let newSiteQueue = siteQueue.slice(siteQueue.findIndex(thisSite) * 1 + 1);
        startCrawler(newSiteQueue);
      });
  }
}).create();

module.exports = siteQueue;
