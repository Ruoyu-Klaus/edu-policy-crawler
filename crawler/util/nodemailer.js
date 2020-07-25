'use strict';
const nodemailer = require('nodemailer');

class Mailer {
  constructor({ sender, password, recipients, content, host, port = 587 }) {
    this.sender = sender;
    this.content = content;
    this.transport = nodemailer.createTransport({
      host,
      port,
      auth: {
        user: sender,
        pass: password,
      },
    });
    this.recipients = recipients;
  }
  send(email, name) {
    this.transport.sendMail(
      {
        from: this.sender,
        to: email,
        subject: '您有新的政策',
        html: `<div> 
        <h3>Dear ${name}:</h3>
        <br>
        <p>a new policy has been founded =><p>
        <span><a href=${this.content.link}>${this.content.title}</a></span>
      </div>`,
      },
      (err, info) => {
        if (err) console.error(err);
      }
    );
  }
  main() {
    [...this.recipients].forEach(([email, name]) => {
      this.send(email, name);
    });
  }
}

module.exports = Mailer;
