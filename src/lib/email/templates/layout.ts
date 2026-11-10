/**
 * Shared email layout + building blocks for RIFT DISTRICT transactional emails.
 *
 * Visual identity mirrors the app (src/app/globals.css):
 *   base #1a2730 · surface #424048 · mist #b0cee2 · orange accent #e95d2c.
 *
 * Email clients are notoriously inconsistent, so everything uses table layout
 * and inline styles. Per-flow templates compose the `block*` helpers and pass
 * the result to `wrapEmail()`.
 */

export const EMAIL_COLORS = {
  base: "#1a2730",
  surface: "#1f2e38",
  card: "#243441",
  mist: "#b0cee2",
  orange: "#e95d2c",
  white: "#ffffff",
  muted: "#7e93a3",
  border: "#34495a",
} as const;

/** Escape user-supplied values before interpolating into HTML. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** A standard body paragraph. */
export function blockParagraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:${EMAIL_COLORS.mist};">${text}</p>`;
}

/** A prominent monospace code / reference block (OTP, IDs, tracking numbers). */
export function blockCode(value: string): string {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">
    <tr>
      <td align="center" style="padding:18px 12px;background:${EMAIL_COLORS.card};border:1px solid ${EMAIL_COLORS.border};border-radius:10px;">
        <span style="font-family:'Courier New',monospace;font-size:30px;font-weight:700;letter-spacing:6px;color:${EMAIL_COLORS.white};">${value}</span>
      </td>
    </tr>
  </table>`;
}

/** A labelled reference line, e.g. "Reference ID: ORD-123". */
export function blockReference(label: string, value: string): string {
  return `
  <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${EMAIL_COLORS.mist};">
    <span style="display:block;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${EMAIL_COLORS.muted};margin-bottom:4px;">${label}</span>
    <span style="font-family:'Courier New',monospace;font-size:18px;font-weight:700;color:${EMAIL_COLORS.white};">${value}</span>
  </p>`;
}

/** A status pill, e.g. "Clearance Approved" / "Clearance Denied". */
export function blockStatus(label: string, tone: "approved" | "denied" | "neutral" = "neutral"): string {
  const color =
    tone === "approved" ? "#5fd38a" : tone === "denied" ? "#e05b4a" : EMAIL_COLORS.orange;
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 8px;">
    <tr>
      <td align="left">
        <span style="display:inline-block;padding:8px 16px;border:1px solid ${color};border-radius:999px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${color};">
          ${label}
        </span>
      </td>
    </tr>
  </table>`;
}

/**
 * Wrap composed body HTML in the full branded email document.
 * `bodyHtml` should be a sequence of block* helper outputs.
 */
export function wrapEmail(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark" />
</head>
<body style="margin:0;padding:0;background:${EMAIL_COLORS.base};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${EMAIL_COLORS.base};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:${EMAIL_COLORS.surface};border:1px solid ${EMAIL_COLORS.border};border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px 20px;border-bottom:1px solid ${EMAIL_COLORS.border};">
              <span style="font-size:18px;font-weight:800;letter-spacing:3px;color:${EMAIL_COLORS.white};">RIFT DISTRICT</span>
              <span style="font-size:18px;font-weight:800;color:${EMAIL_COLORS.orange};">&reg;</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;border-top:1px solid ${EMAIL_COLORS.border};">
              <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:2px;color:${EMAIL_COLORS.white};">RIFT DISTRICT&reg;</p>
              <p style="margin:4px 0 0;font-size:12px;letter-spacing:1px;color:${EMAIL_COLORS.muted};">Built Different.</p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-size:11px;color:${EMAIL_COLORS.muted};">This is an automated message — please do not reply.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Standard plain-text signature appended to every text body. */
export const TEXT_SIGNATURE = "\n\nRIFT DISTRICT®\nBuilt Different.";
