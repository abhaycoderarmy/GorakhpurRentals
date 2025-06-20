import nodemailer from "nodemailer";

export const sendOrderMail = async (to, order) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const itemsHtml = order.items
    .map(
      (item) => `<li>${item.name} - ₹${item.price} x ${item.qty}</li>`
    )
    .join("");

  const mailOptions = {
    from: `"Gorakhpur Rentals" <${process.env.SMTP_USER}>`,
    to,
    subject: "Your Gorakhpur Rentals Order Confirmation",
    html: `
      <h2>Thank you for your order!</h2>
      <p>Order ID: ${order._id}</p>
      <ul>${itemsHtml}</ul>
      <p><strong>Total:</strong> ₹${order.total}</p>
      <p>We’ll contact you soon regarding delivery or pickup.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
