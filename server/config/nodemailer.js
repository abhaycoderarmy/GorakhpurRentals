import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // use App Password if 2FA enabled
  },
});

export const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: `"Gorakhpur Rentals" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'OTP for Gorakhpur Rentals Account Verification',
    html: `<h2>Your OTP is: <strong>${otp}</strong></h2>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send email: ${error.message}`);
  }
};
