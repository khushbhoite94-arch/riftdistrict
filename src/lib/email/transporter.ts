import nodemailer, { type Transporter } from "nodemailer";

/**
 * Gmail SMTP transporter (Nodemailer).
 *
 * Credentials come from env vars — never hardcode them:
 *   GMAIL_EMAIL          the sending Gmail address
 *   GMAIL_APP_PASSWORD   a Gmail "App Password" (NOT the account password)
 *
 * A single transporter is reused across hot-reloads / serverless invocations,
 * mirroring the pooled-singleton pattern used for the SQL connection.
 */

export const FROM_NAME = "RIFT DISTRICT";

function buildTransporter(): Transporter {
  const user = process.env.GMAIL_EMAIL;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error(
      "Email is not configured: set GMAIL_EMAIL and GMAIL_APP_PASSWORD env vars."
    );
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

const globalForMail = globalThis as unknown as {
  __mailTransporter?: Transporter;
};

export function getTransporter(): Transporter {
  if (!globalForMail.__mailTransporter) {
    globalForMail.__mailTransporter = buildTransporter();
  }
  return globalForMail.__mailTransporter;
}

/** The address emails are sent from, formatted with a friendly name. */
export function getFromAddress(): string {
  const user = process.env.GMAIL_EMAIL;
  if (!user) {
    throw new Error("Email is not configured: set GMAIL_EMAIL env var.");
  }
  return `"${FROM_NAME}" <${user}>`;
}
