// import dotenv from "dotenv";
// import { MailtrapClient } from "mailtrap";

// // Load environment variables
// dotenv.config();

// const TOKEN = process.env.MAILTRAP_API_TOKEN;

// if (!TOKEN) {
//   console.error("❌ Mailtrap API token is missing! Check your .env file.");
//   process.exit(1);
// }

// export const mailtrapClient = new MailtrapClient({
//   token: TOKEN,
//   endpoint: "https://send.api.mailtrap.io",
// });

// export const sender = {
//   email: "hello@demomailtrap.com",
//   name: "Dashrath",
// };

// mailerConfig.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io", // Mailtrap SMTP server host
  port: 2525, // Port for TLS
  secure: false,
  auth: {
    user: process.env.MAILTRAP_USER, // Your Mailtrap username
    pass: process.env.MAILTRAP_PASS, // Your Mailtrap password
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false
  }
});

export default transporter;



