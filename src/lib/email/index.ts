/**
 * Public entry point for the RIFT DISTRICT email system.
 *
 * Senders return Promise<boolean> (best-effort, never throw). At event triggers
 * that must not wait on or be affected by delivery (orders, replacements), call
 * them via `sendEmailFireAndForget` or simply don't await and `.catch()`.
 */

import { sendEmail, sendEmailFireAndForget } from "./sendEmail";
import {
  verificationTemplate,
  passwordResetTemplate,
} from "./templates/auth";
import {
  orderConfirmationTemplate,
  orderShippedTemplate,
  orderDeliveredTemplate,
} from "./templates/orders";
import {
  replacementReceivedTemplate,
  replacementApprovedTemplate,
  replacementRejectedTemplate,
} from "./templates/replacements";

export { sendEmail, sendEmailFireAndForget } from "./sendEmail";
export type { SendEmailArgs } from "./sendEmail";

/** Common recipient shape used by per-flow senders. */
export interface EmailRecipient {
  /** The recipient's display name, used as {userName} in templates. */
  name: string;
  /** The recipient's email address. */
  email: string;
}

// --- Auth ------------------------------------------------------------

/** Task 1 — signup verification OTP. Awaited by the register/resend routes. */
export function sendVerificationEmail(to: EmailRecipient, otp: string): Promise<boolean> {
  return sendEmail({ to: to.email, ...verificationTemplate(to.name, otp) });
}

/** Task 2 — password reset OTP. */
export function sendPasswordResetEmail(to: EmailRecipient, otp: string): Promise<boolean> {
  return sendEmail({ to: to.email, ...passwordResetTemplate(to.name, otp) });
}

// --- Orders ----------------------------------------------------------

/** Task 3 — order confirmation. Fire-and-forget at order creation. */
export function sendOrderConfirmationEmail(to: EmailRecipient, orderId: string): void {
  sendEmailFireAndForget({ to: to.email, ...orderConfirmationTemplate(to.name, orderId) });
}

/** Task 4 — order shipped. Fire-and-forget at admin status change. */
export function sendOrderShippedEmail(
  to: EmailRecipient,
  orderId: string,
  trackingNumber: string
): void {
  sendEmailFireAndForget({
    to: to.email,
    ...orderShippedTemplate(to.name, orderId, trackingNumber),
  });
}

/** Task 5 — order delivered. Fire-and-forget at admin status change. */
export function sendOrderDeliveredEmail(to: EmailRecipient, orderId: string): void {
  sendEmailFireAndForget({ to: to.email, ...orderDeliveredTemplate(to.name, orderId) });
}

// --- Replacements ----------------------------------------------------

/** Task 6 — replacement request received. Fire-and-forget at creation. */
export function sendReplacementReceivedEmail(to: EmailRecipient, caseId: string): void {
  sendEmailFireAndForget({ to: to.email, ...replacementReceivedTemplate(to.name, caseId) });
}

/** Task 7 — replacement approved. Fire-and-forget at admin approve. */
export function sendReplacementApprovedEmail(to: EmailRecipient, caseId: string): void {
  sendEmailFireAndForget({ to: to.email, ...replacementApprovedTemplate(to.name, caseId) });
}

/** Task 8 — replacement rejected. Fire-and-forget at admin reject. */
export function sendReplacementRejectedEmail(to: EmailRecipient, caseId: string): void {
  sendEmailFireAndForget({ to: to.email, ...replacementRejectedTemplate(to.name, caseId) });
}
