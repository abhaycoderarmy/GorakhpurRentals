import nodemailer from "nodemailer";

const sendOTP = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Gorakhpur Rentals" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Your OTP for Gorakhpur Rentals",
      html: `
        <h2>Welcome to Gorakhpur Rentals</h2>
        <p>Use the following OTP to verify your email address:</p>
        <h1>${otp}</h1>
        <p>This OTP is valid for 10 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("OTP email sent to", email);
  } catch (error) {
    console.error("Error sending OTP:", error.message);
    throw error;
  }
};

export default sendOTP;
