'use strict';
const nodemailer = require('nodemailer');

class Mailer {
  constructor(config, content) {
    this.sender = config.auth.user;
    this.transport = nodemailer.createTransport(config);
    this.content = content;
  }
  send(toEmail, toName) {
    this.transport.sendMail(
      {
        from: this.sender,
        to: toEmail,
        subject: '您有新的政策',
        html: `<div> 
        <h3>Dear ${toName}:</h3>
        <br>
        <p>a new policy has been founded =><p>
        <span><a href=${this.content.link}>${this.content.title}</a></span>
      </div>`,
      },
      (err, info) => {
        if (err) console.error(err);
        console.log(`Message has delivered...  ID: ${info.messageId}`);
      }
    );
  }
  main(recipients) {
    [...recipients].forEach(([email, name]) => {
      this.send(email, name);
    });
  }
}

module.exports = Mailer;
