const fs = require('fs');
const puppeteer = require('puppeteer');

const getProxy = async () => {
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto('http://free-proxy.cz/en/');
    await page.waitForSelector('#proxy_list>tbody>tr>td');

    var proxyPools = await page.evaluate(() => {
      var proxyNodeList = document.querySelectorAll(`#proxy_list > tbody>tr`);
      var proxyArray = [];
      for (var i = 0; i < proxyNodeList.length; i++) {
        let proxy = proxyNodeList[i].firstChild.innerText.trim();
        proxy !== '' && proxyArray.push('http://' + proxy);
      }
      return proxyArray;
    });
    fs.writeFile('./crawler/src/proxyPools.json', JSON.stringify(proxyPools), err => {
      if (err) throw err;
    });
    await browser.close();
  } catch (error) {
    await browser.close();
  }
};

module.exports = getProxy;
