const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors({
    origin: true
}));

app.post('/api/sendEmail', async (req, res) => {
  const { type, title, category, blogPostUrl, subscribers } = req.body;

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  try {
    if (type === 'newBlog') {
      const mailOptions = {
        from: `ATV and Buggy <${process.env.MAIL_USER}>`,
        bcc: subscribers.join(', '), // Use BCC to hide other recipients
        subject: `New Blog Post: ${title}`,
        text: `Hello,\n\nWe have just published a new blog post titled "${title}" in the ${category} category. Check it out now at ${blogPostUrl}!`,
        html: `
          <p>Hello,</p>
          <p>We have just published a new blog post titled <strong>${title}</strong> in the <strong>${category}</strong> category. Check it out now!</p>
          <p><a href="${blogPostUrl}">Read it now!</a></p>
        `,
      };

      await transporter.sendMail(mailOptions);
      return res.status(200).json({ status: 'success', message: 'Notification emails sent successfully!' });
    } else {
      return res.status(400).json({ message: 'Invalid email type' });
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to send email' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
