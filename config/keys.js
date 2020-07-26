if (process.env === 'production') {
  module.exports = {
    MONGOURI: process.env.MONGOURI,
    TRANSPORTER: process.env.TRANSPORTER,
  };
} else {
  module.exports = {
    MONGOURI: process.env.MONGOURI,
    TRANSPORTER: process.env.TRANSPORTER,
  };
}
