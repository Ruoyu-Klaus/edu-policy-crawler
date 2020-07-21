// @parmas: a key-values(category,uri) pair map & a callback function for handling results
// @output: return an array of queue for crawler.js
class createQueue {
  constructor(map, handleResults) {
    this.map = map;
    this.queue = new Set();
    this.handleResults = handleResults;
  }
  create() {
    for (let [uri, { site, category, type, pattern }] of this.map.entries()) {
      this.queue.add(this.config(site, uri, category, type, pattern));
    }
    return Array.from(this.queue);
  }

  config(site, uri, category, type, pattern) {
    return {
      site: site,
      uri: uri,
      category: category,
      type: type,
      pattern: pattern,
      callback: this.callback(),
    };
  }
  callback() {
    return this.handleResults;
  }
}

module.exports = createQueue;
