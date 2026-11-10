import {
  wrapEmail,
  blockParagraph,
  blockReference,
  escapeHtml,
  EMAIL_COLORS,
  TEXT_SIGNATURE,
} from "./layout";
import type { BuiltEmail } from "./auth";

/** Template #2 — Order Confirmation. */
export function orderConfirmationTemplate(
  userName: string,
  orderId: string
): BuiltEmail {
  const name = escapeHtml(userName);
  const html = wrapEmail(
    blockParagraph(`Hey ${name},`) +
      blockParagraph(
        "This message confirms that your acquisition has been successfully processed."
      ) +
      blockReference("Reference ID", escapeHtml(orderId)) +
      blockParagraph("What happens next stays behind the curtain.") +
      blockParagraph(
        "Your package is being prepared and will be dispatched soon. Once it's in motion, you'll receive tracking details through a secure update."
      ) +
      blockParagraph("Until then, keep this between us.") +
      blockParagraph("No announcements.<br/>No explanations.<br/>No permission needed.") +
      blockParagraph("Welcome to the District.") +
      `<p style="margin:24px 0 0;padding-top:16px;border-top:1px solid ${EMAIL_COLORS.border};font-size:12px;line-height:1.6;color:${EMAIL_COLORS.muted};">CONFIDENTIAL NOTICE:<br/>This transmission was intended for ${name}. If you weren't expecting this message, forget you saw it.</p>`
  );
  const text = `Hey ${userName},

This message confirms that your acquisition has been successfully processed.

Reference ID: ${orderId}

What happens next stays behind the curtain.

Your package is being prepared and will be dispatched soon. Once it's in motion, you'll receive tracking details through a secure update.

Until then, keep this between us.

No announcements.
No explanations.
No permission needed.

Welcome to the District.${TEXT_SIGNATURE}

CONFIDENTIAL NOTICE:
This transmission was intended for ${userName}. If you weren't expecting this message, forget you saw it.`;
  return { subject: "Order Confirmed — RIFT DISTRICT", html, text };
}

/** Order Shipped. */
export function orderShippedTemplate(
  userName: string,
  orderId: string,
  trackingNumber: string
): BuiltEmail {
  const name = escapeHtml(userName);
  const html = wrapEmail(
    blockParagraph(`Hey ${name},`) +
      blockParagraph("Your package has left the District.") +
      blockReference("Reference ID", escapeHtml(orderId)) +
      blockReference("Tracking Number", escapeHtml(trackingNumber)) +
      blockParagraph("The operation is now in motion.") +
      blockParagraph("You'll receive another update once delivery is completed.")
  );
  const text = `Hey ${userName},

Your package has left the District.

Reference ID:
${orderId}

Tracking Number:
${trackingNumber}

The operation is now in motion.

You'll receive another update once delivery is completed.${TEXT_SIGNATURE}`;
  return { subject: "Package In Motion — RIFT DISTRICT", html, text };
}

/** Order Delivered. */
export function orderDeliveredTemplate(
  userName: string,
  orderId: string
): BuiltEmail {
  const name = escapeHtml(userName);
  const html = wrapEmail(
    blockParagraph(`Hey ${name},`) +
      blockParagraph("The package has reached its destination.") +
      blockReference("Reference ID", escapeHtml(orderId)) +
      blockParagraph("We hope the piece finds its place in your rotation.") +
      blockParagraph(
        "Remember:<br/>Replacement requests can only be submitted within 7 days of delivery."
      ) +
      blockParagraph("Welcome to the District.")
  );
  const text = `Hey ${userName},

The package has reached its destination.

Reference ID:
${orderId}

We hope the piece finds its place in your rotation.

Remember:

Replacement requests can only be submitted within 7 days of delivery.

Welcome to the District.${TEXT_SIGNATURE}`;
  return { subject: "Delivery Confirmed — RIFT DISTRICT", html, text };
}
