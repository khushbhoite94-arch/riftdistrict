import {
  wrapEmail,
  blockParagraph,
  blockCode,
  escapeHtml,
  TEXT_SIGNATURE,
} from "./layout";

export interface BuiltEmail {
  subject: string;
  html: string;
  text: string;
}

/** Template #1 — Account Verification. */
export function verificationTemplate(userName: string, otp: string): BuiltEmail {
  const name = escapeHtml(userName);
  const html = wrapEmail(
    blockParagraph(`Hey ${name},`) +
      blockParagraph("Welcome to the District.") +
      blockParagraph("Use the code below to verify your account:") +
      blockCode(otp) +
      blockParagraph("This code will expire in 10 minutes.") +
      blockParagraph(
        "If you didn't request this verification, simply ignore this email."
      ) +
      blockParagraph("See you on the other side.")
  );
  const text = `Hey ${userName},

Welcome to the District.

Use the code below to verify your account:

${otp}

This code will expire in 10 minutes.

If you didn't request this verification, simply ignore this email.

See you on the other side.${TEXT_SIGNATURE}`;
  return { subject: "Verify Your RIFT DISTRICT Account", html, text };
}

/** Password Reset. */
export function passwordResetTemplate(userName: string, otp: string): BuiltEmail {
  const name = escapeHtml(userName);
  const html = wrapEmail(
    blockParagraph(`Hey ${name},`) +
      blockParagraph("We received a request to reset your password.") +
      blockParagraph("Use the code below:") +
      blockCode(otp) +
      blockParagraph("This code will expire in 10 minutes.") +
      blockParagraph(
        "If you didn't request a password reset, you can safely ignore this email."
      )
  );
  const text = `Hey ${userName},

We received a request to reset your password.

Use the code below:

${otp}

This code will expire in 10 minutes.

If you didn't request a password reset, you can safely ignore this email.${TEXT_SIGNATURE}`;
  return { subject: "Password Reset Verification", html, text };
}
