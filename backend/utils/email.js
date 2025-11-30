const nodemailer = require('nodemailer');

async function createTransporter() {
  // For a test environment, use Ethereal
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
  return { transporter, testAccount };
}

async function sendVerificationEmail(to, link, tempPassword) {
  const { transporter, testAccount } = await createTransporter();
  const body = tempPassword ? `Your temporary password is: ${tempPassword}\nClick to verify: ${link}` : `Click to verify: ${link}`;
  const html = tempPassword ? `<p>Your temporary password is: <code>${tempPassword}</code></p><p>Click to verify: <a href='${link}'>${link}</a></p>` : `<p>Click to verify: <a href='${link}'>${link}</a></p>`;
  const info = await transporter.sendMail({
    from: 'no-reply@hospitalms.example.com',
    to,
    subject: 'Verify your hospital registration',
    text: body,
    html
  });
  return { info, previewUrl: nodemailer.getTestMessageUrl(info), testAccount };
}

module.exports = { sendVerificationEmail };
