import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = Number(process.env.SMTP_PORT || "587");
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

if (!smtpUser || !smtpPass) {
  // In dev we just log; real deployment should configure env vars.
  console.warn(
    "[WeeklyTroll] SMTP_USER/SMTP_PASS are not set. Emails will not be sent.",
  );
}

const transporter =
  smtpUser && smtpPass
    ? nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: false,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      })
    : null;

export async function sendNewsletterEmail(options: {
  subject: string;
  html: string;
  to: string[];
}): Promise<void> {
  if (!transporter || !smtpUser) {
    console.log(
      "[WeeklyTroll] Email sending skipped (transporter not configured).",
    );
    return;
  }

  if (options.to.length === 0) {
    return;
  }

  await transporter.sendMail({
    from: smtpUser,
    to: options.to.join(","),
    subject: options.subject,
    html: options.html,
  });
}

