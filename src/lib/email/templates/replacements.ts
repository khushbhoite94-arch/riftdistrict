import {
  wrapEmail,
  blockParagraph,
  blockReference,
  blockStatus,
  escapeHtml,
  TEXT_SIGNATURE,
} from "./layout";
import type { BuiltEmail } from "./auth";

/** Replacement Request Received. */
export function replacementReceivedTemplate(
  userName: string,
  caseId: string
): BuiltEmail {
  const name = escapeHtml(userName);
  const html = wrapEmail(
    blockParagraph(`Hey ${name},`) +
      blockParagraph("Your request has been received.") +
      blockReference("Case ID", escapeHtml(caseId)) +
      blockParagraph("Our team is currently reviewing the information provided.") +
      blockParagraph(
        "You'll receive another transmission once a decision has been reached."
      ) +
      blockParagraph("Until then, hold your position.")
  );
  const text = `Hey ${userName},

Your request has been received.

Case ID:
${caseId}

Our team is currently reviewing the information provided.

You'll receive another transmission once a decision has been reached.

Until then, hold your position.${TEXT_SIGNATURE}`;
  return { subject: "Case Received — RIFT DISTRICT", html, text };
}

/** Template #3 — Replacement Approved. */
export function replacementApprovedTemplate(
  userName: string,
  caseId: string
): BuiltEmail {
  const name = escapeHtml(userName);
  const id = escapeHtml(caseId);
  const html = wrapEmail(
    blockParagraph(`Hey ${name},`) +
      blockParagraph("The review is complete.") +
      blockParagraph(
        `After examining the details submitted under Case ID ${id}, your replacement request has been approved.`
      ) +
      blockParagraph(
        "A replacement piece is now being prepared and will be dispatched soon."
      ) +
      blockParagraph(
        "Once the package is in motion, you'll receive a separate transmission containing tracking details."
      ) +
      blockParagraph("The matter has been cleared.") +
      blockParagraph("Thank you for your patience.") +
      blockParagraph("See you on the other side.") +
      blockStatus("Clearance Approved", "approved")
  );
  const text = `Hey ${userName},

The review is complete.

After examining the details submitted under Case ID ${caseId}, your replacement request has been approved.

A replacement piece is now being prepared and will be dispatched soon.

Once the package is in motion, you'll receive a separate transmission containing tracking details.

The matter has been cleared.

Thank you for your patience.

See you on the other side.${TEXT_SIGNATURE}

STATUS

Clearance Approved`;
  return { subject: "Case Approved — RIFT DISTRICT", html, text };
}

/** Template #4 — Replacement Rejected. */
export function replacementRejectedTemplate(
  userName: string,
  caseId: string
): BuiltEmail {
  const name = escapeHtml(userName);
  const id = escapeHtml(caseId);
  const html = wrapEmail(
    blockParagraph(`Hey ${name},`) +
      blockParagraph("The file has been reviewed.") +
      blockParagraph(
        `After examining the evidence submitted under Case ID ${id}, we're unable to authorize a replacement for this request.`
      ) +
      blockParagraph("The case has now been closed.") +
      blockParagraph(
        "If additional evidence becomes available, you may reopen the matter by contacting our team and referencing your case number."
      ) +
      blockParagraph("Not every file reaches clearance.") +
      blockParagraph("Thank you for being part of the District.") +
      blockStatus("Clearance Denied", "denied")
  );
  const text = `Hey ${userName},

The file has been reviewed.

After examining the evidence submitted under Case ID ${caseId}, we're unable to authorize a replacement for this request.

The case has now been closed.

If additional evidence becomes available, you may reopen the matter by contacting our team and referencing your case number.

Not every file reaches clearance.

Thank you for being part of the District.${TEXT_SIGNATURE}

STATUS

Clearance Denied`;
  return { subject: "Case Closed — RIFT DISTRICT", html, text };
}
