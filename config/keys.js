if (process.env === 'production') {
  module.exports = {
    MONGOURI: process.env.MONGOURI,
    TRANSPORTERDEV: process.env.TRANSPORTERDEV,
  };
} else {
  module.exports = {
    MONGOURI: process.env.MONGOURI,
    TRANSPORTERDEV: process.env.TRANSPORTERDEV,
  };
}
