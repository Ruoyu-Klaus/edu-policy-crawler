const targetSites = require('./src/targetSites.json');
var proxyPools = require('./src/proxyPools.json');

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
  //handle error after failed requesting
  if (error) {
    if (proxyPools.length !== 0) {
      // if encouter errors rescrape this site and those after it by using proxy
      let thisSite = element => element.uri === uri;
      let newSiteQueue = siteQueue.slice(siteQueue.findIndex(thisSite) * 1);
      startCrawler(newSiteQueue, proxyPools[0]);
      proxyPools.shift();
      fs.writeFile('./util/proxyPools', JSON.stringify(proxyPools), err => {
        if (err) throw err;
      });
    } else {
      console.error(error);
    }
  } else {
    var $ = res.$;
    dealResponse($, category, type, site, pattern, uri)
      .then(data => {
        return insertDB(data);
      })
      .then(result => {
        console.log(result);
        console.log(`Successfully scraped ${(category, type)} from ${site}`);
        done();
      })
      .catch(reason => {
        console.warn(reason);

        // if encouter errors move on next site
        let thisSite = element => element.uri === uri;
        let newSiteQueue = siteQueue.slice(siteQueue.findIndex(thisSite) * 1 + 1);
        startCrawler(newSiteQueue);
      });
  }
}).create();

module.exports = siteQueue;
