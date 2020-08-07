const targetSites = require('./src/targetSites.json');
var proxyPools = require('../crawler/src/proxyPools.json');
const fs = require('fs');

const createQueue = require('./util/createQueue');
const parser = require('./parser.js');
const insertDB = require('./main/insertDB');
const crawlerSpawn = require('./util/crawlerSpawn');

const siteMap = new Map();
targetSites.forEach(site => siteMap.set(site['uri'], site));

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
      crawlerSpawn(newSiteQueue, proxyPools[0]);
      proxyPools.shift();
      fs.writeFile(`${__dirname}/src/proxyPools.json`, JSON.stringify(proxyPools), err => {
        if (err) throw err;
      });
    }
  } else {
    var $ = res.$;
    parser($, category, type, site, pattern, uri)
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
        crawlerSpawn(newSiteQueue);
      });
  }
}).create();

module.exports = siteQueue;
