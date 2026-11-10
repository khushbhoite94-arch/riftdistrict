import { getTransporter, getFromAddress } from "./transporter";

export interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
  /** Plain-text fallback for clients that don't render HTML. */
  text: string;
}

const MAX_ATTEMPTS = 2; // initial attempt + 1 retry

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Send a transactional email.
 *
 * Retry-safe and resilient by design: this NEVER throws. Transactional emails
 * are a side effect of core flows (orders, replacements, auth) and must never
 * be able to break them. Callers can treat the boolean as best-effort.
 *
 * @returns true if the message was accepted by the SMTP server, false otherwise.
 */
export async function sendEmail({ to, subject, html, text }: SendEmailArgs): Promise<boolean> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const transporter = getTransporter();
      const info = await transporter.sendMail({
        from: getFromAddress(),
        to,
        subject,
        text,
        html,
      });
      console.log(`[email] sent "${subject}" to ${to} (id: ${info.messageId})`);
      return true;
    } catch (err) {
      const isLast = attempt === MAX_ATTEMPTS;
      console.error(
        `[email] attempt ${attempt}/${MAX_ATTEMPTS} failed for "${subject}" to ${to}:`,
        err instanceof Error ? err.message : err
      );
      if (isLast) return false;
      await delay(500 * attempt);
    }
  }
  return false;
}

/**
 * Fire-and-forget wrapper: schedules the send without awaiting it, swallowing
 * any rejection. Use at trigger points where the response must not wait on (or
 * be affected by) email delivery.
 */
export function sendEmailFireAndForget(args: SendEmailArgs): void {
  void sendEmail(args).catch((err) => {
    console.error(`[email] unexpected fire-and-forget failure for "${args.subject}":`, err);
  });
}
