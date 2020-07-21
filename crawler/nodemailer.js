'use strict';
const config = require('config');
const password = config.get('SMPTQQ');
// import nodemailer (after npm install nodemailer)
const nodemailer = require('nodemailer');

const sendMail = async mail => {
  // create a nodemailer transporter using smtp
  let transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    port: 587,
    // secure: true,
    auth: {
      user: '1178570317@qq.com',
      pass: password,
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  });

  // send mail using transporter
  let info = await transporter.sendMail(mail);

  console.log(`Emial response: ${info.response}`);
};

module.exports = sendMail;
