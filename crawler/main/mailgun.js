const mailgun = require('mailgun-js');
const { MAILGUNKEY } = require('../../config/keys');
const DOMAIN = 'cn.edu-tracker.tech';
const mg = mailgun({
  apiKey: MAILGUNKEY,
  domain: DOMAIN,
});

async function sendEmail(recipients, content) {
  try {
    let recipientsVariables = [...recipients.entries()].reduce((acc, cur) => {
      Object.assign(acc, { [cur[0]]: cur[1] });
      return acc;
    }, {});
    const data = {
      from: '政策追踪器 <noreply@edu-tracker.tech>',
      to: [...recipients.keys()].join(','),
      subject: 'Hey %recipient.name%',
      template: 'edu-policy-mail',
      'recipient-variables': `${JSON.stringify(recipientsVariables)}`,
      'h:X-Mailgun-Variables': JSON.stringify(content),
    };
    let res = await mg.messages().send(data);
    return Promise.resolve(res);
  } catch (error) {
    return Promise.reject(error);
  }
}
/* ------------Test Use-------------*/
// let recipients = new Map();
// recipients.set('klaus1201810802@gmail.com', {
//   name: '王啊',
//   email: 'klaus1201810802@gmail.com',
//   id: 2,
// });
// recipients.set('1178570317@qq.com', {
//   name: '王',
//   email: '1178570317@qq.com',
//   id: 3,
// });

// let content = {
//   title: 'test1',
//   date: '2020-09-02',
//   link: 'www.google.com',
//   category: '高校教育',
//   type: '高校招生',
// };
// sendEmail(recipients, content)
//   .then(res => console.log(res))
//   .catch(error => {
//     console.log(error);
//   });

module.exports = sendEmail;
