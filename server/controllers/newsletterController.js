import User from "../models/user.model.js";
import Newsletter from "../models/newsletter.model.js";
import nodemailer from "nodemailer";

export const sendNewsletter = async (req, res) => {
  const { subject, body } = req.body;

  try {
    const users = await User.find();
    const emails = users.map((u) => u.email);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Gorakhpur Rentals" <${process.env.EMAIL_USER}>`,
      to: emails,
      subject,
      html: `<div style="font-family:sans-serif;"><h2>${subject}</h2><p>${body}</p></div>`,
    });

    await Newsletter.create({ subject, body });
    res.json({ message: "Newsletter sent successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};