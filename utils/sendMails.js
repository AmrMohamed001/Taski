const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
module.exports = class Email {
  constructor(user) {
    this.to = user.email;
    this.from = process.env.EMAIL;
    this.firstName = user.name.split(' ')[0];
  }
  transporter() {
    //if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'amrmoha960@gmail.com',
        pass: 'hbju etmz eqru croc',
      },
    });
    // }
    /* return nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 587,
      auth: {
        user: 'c8ff02b4d64202',
        pass: '9167c099f5914f',
      },
    }); */
  }
  async send(templete, subject, code) {
    // 1) Render html based on pug templete
    const options = {
      firstName: this.firstName,
      subject,
    };
    if (code) options.code = code;

    const html = pug.renderFile(
      `${__dirname}/../views/emails/${templete}.pug`,
      options
    );
    const mailOptions = {
      to: this.to,
      from: this.from,
      subject,
      html,
      text: htmlToText.htmlToText(html),
    };
    await this.transporter().sendMail(
      mailOptions /* , (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message %s sent: %s', info.messageId, info.response);
    } */
    );
  }
  async sendWelcome() {
    await this.send('welcome', 'welcome to taskii 🙌🙌');
  }
  async sendResetPassword(code) {
    await this.send('passwordReset', 'Forget your password ? !', code);
  }
};
/*
var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "c8ff02b4d64202",
    pass: "9167c099f5914f"
  }
});
*/
