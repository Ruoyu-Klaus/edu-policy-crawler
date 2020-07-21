const url = require('url');
var moment = require('moment');

// Receive Cherrio loaded HTML as $, category, type , site ,uri, pattern(li,link,titie,date)
module.exports = ($, category, type, site, pattern, uri) => {
  return new Promise((resolve, reject) => {
    const policies = $(pattern.li);
    const data = new Map();
    if (policies.length > 0) {
      policies.each((i, policy) => {
        //check whether needs getting attribute's
        let regexForAttr = new RegExp(/\[(\w+)\]/);
        // check whether needs getting current element's attribute's
        let regexForCurAttr = new RegExp(/^\[(\w+)\]$/);
        let date = pattern.date;
        // Extract Date based on pattern provided
        if (regexForCurAttr.test(date)) {
          date = $(policy)
            .attr(date.match(regexForCurAttr)[1])
            .replace(/[\s\-]/g, '');
        } else if (regexForAttr.test(date)) {
          date = $(policy)
            .find(date)
            .attr(date.match(regexForAttr)[1])
            .replace(/[\s\-]/g, '');
        } else {
          date = $(policy)
            .find(date)
            .text()
            .replace(/[\s\-]/g, '');
        }
        // only take in the last 30days policies
        date = moment(date);
        let interval = moment().subtract(30, 'days');

        if (moment.max(interval, date) === date) {
          date = date.format('YYYY-MM-DD');
          var title = pattern.title;
          var rel_url = pattern.link;
          // Extract Title based on pattern provided
          if (regexForCurAttr.test(title)) {
            title = $(policy).attr(title.match(regexForCurAttr)[1]);
          } else if (regexForAttr.test(title)) {
            title = $(policy).find(title).attr(title.match(regexForAttr)[1]);
          } else {
            title = $(policy).find(title).text();
          }
          // Extract the url based on pattern provided
          if (regexForCurAttr.test(rel_url)) {
            rel_url = $(policy).attr(rel_url.match(regexForCurAttr)[1]);
          } else if (regexForAttr.test(rel_url)) {
            rel_url = $(policy)
              .find(rel_url)
              .attr(rel_url.match(regexForAttr)[1]);
          } else {
            rel_url = $(policy).find(rel_url).text();
          }
          let link = url.resolve(uri, rel_url);

          data.set(title, { category, site, type, date, title, uri, link });
        }
      });
      resolve(data);
    } else {
      reject(`404 Not Found: Filed at ${(site, category, type, uri)}`);
    }
  });
};
