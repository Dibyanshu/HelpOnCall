import type { RenderedEmail } from "../../types/email-template.js";
import { STATUS_STYLE, buildEmailWrapper, buildInfoCard, buildInfoGrid, buildStatusBadge, buildSuccessIconBadge } from "./email-layout.js";
import { escapeHtml } from "./template-renderer.js";

export function buildRfqConfirmationEmail(input: { fullName: string; email: string }): RenderedEmail {
  const subject = "HelpOnCall quotation request received";

  const text = [
    `Hi ${input.fullName},`,
    "",
    "Request Received!",
    "",
    "Your quotation request has been logged in our premium care system.",
    `A detailed confirmation and next steps have been sent to ${input.email}.`,
    "A care coordinator will be in touch within the next 2 hours.",
    "",
    "HelpOnCall Team"
  ].join("\n");

  const html = buildEmailWrapper(`
    ${buildSuccessIconBadge()}
    <h2 style="font-size:36px;line-height:1.2;color:#0f172a;margin:0 0 16px;font-weight:800;">Request Received!</h2>
    <div style="max-width:560px;margin:0 auto 16px;">
      <p style="font-size:20px;line-height:1.6;color:#475569;margin:0 0 20px;font-weight:500;">Your quotation request has been logged in our premium care system.</p>
      ${buildInfoCard(`<p style="margin:0;color:#374151;font-size:16px;line-height:1.7;">A detailed confirmation and next steps have been sent to <span style="color:#0f766e;font-weight:700;">${escapeHtml(input.email)}</span>. A care coordinator will be in touch within the next 2 hours.</p>`)}
    </div>
  `);

  return { subject, text, html };
}

export function buildRegistrationEmail(name: string): RenderedEmail {
  const subject = "HelpOnCall registration received";

  const text = [
    `Hi ${name},`,
    "",
    "Your registration has been received successfully.",
    "An administrator will review and activate your account soon.",
    "",
    "Thanks,",
    "HelpOnCall Team"
  ].join("\n");

  const html = buildEmailWrapper(`
    ${buildSuccessIconBadge("✉")}
    <h2 style="font-size:32px;line-height:1.2;color:#0f172a;margin:0 0 16px;font-weight:800;">Registration Received!</h2>
    <div style="max-width:560px;margin:0 auto;">
      ${buildInfoCard(`<p style="margin:0;color:#374151;font-size:16px;line-height:1.7;">Hi <strong>${escapeHtml(name)}</strong>, your registration has been received. An administrator will review and activate your account soon.</p>`)}
    </div>
  `);

  return { subject, text, html };
}

export function buildVerificationCodeEmail(input: { moduleLabel: string; code: string }): RenderedEmail {
  const subject = `HelpOnCall ${input.moduleLabel} email verification code`;

  const text = [
    `Your HelpOnCall verification code is: ${input.code}`,
    "",
    "This code expires in 15 minutes.",
    "If you did not request this, you can ignore this email."
  ].join("\n");

  const html = buildEmailWrapper(`
    <h2 style="font-size:32px;line-height:1.2;color:#0f172a;margin:0 0 8px;font-weight:800;">Verification Code</h2>
    <p style="color:#475569;margin:0 0 24px;">HelpOnCall ${escapeHtml(input.moduleLabel)} Email Verification</p>
    <div style="max-width:400px;margin:0 auto;">
      ${buildInfoCard(`
        <p style="margin:0 0 8px;font-size:13px;color:#64748b;">Your verification code:</p>
        <p style="margin:8px 0 16px;font-size:40px;font-weight:800;letter-spacing:8px;color:#0f766e;">${escapeHtml(input.code)}</p>
        <p style="margin:0;font-size:13px;color:#94a3b8;">This code expires in 15 minutes. If you did not request this, you can ignore this email.</p>
      `)}
    </div>
  `);

  return { subject, text, html };
}

export function buildAdminSubmissionNotificationEmail(input: {
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
  empId: string;
}): RenderedEmail {
  const subject = `New employment application: ${input.fullName}`;

  const text = [
    "A new employment application has been submitted.",
    "",
    `Candidate: ${input.fullName}`,
    `Email: ${input.emailAddress}`,
    `Phone: ${input.phoneNumber}`,
    `Emp ID: ${input.empId}`,
    "",
    "Please review it from the admin employment dashboard."
  ].join("\n");

  const html = buildEmailWrapper(`
    <h2 style="font-size:28px;line-height:1.2;color:#0f172a;margin:0 0 24px;font-weight:800;">New Employment Application</h2>
    ${buildInfoGrid([
      { label: "Candidate", value: escapeHtml(input.fullName) },
      { label: "Email", value: escapeHtml(input.emailAddress) },
      { label: "Phone", value: escapeHtml(input.phoneNumber) },
      { label: "Reference ID", value: escapeHtml(input.empId) }
    ])}
    <p style="margin:24px 0 0;color:#475569;font-size:14px;">Please review it from the admin employment dashboard.</p>
  `);

  return { subject, text, html };
}

export function buildApplicantSubmissionConfirmationEmail(input: {
  fullName: string;
  emailAddress: string;
}): RenderedEmail {
  const subject = "HelpOnCall employment application received";

  const text = [
    `Hi ${input.fullName},`,
    "",
    "Application Sent!",
    "",
    "Your profile has entered our orbit. Our recruitment team will review your application and reach out shortly.",
    `A confirmation has been sent to ${input.emailAddress}.`,
    "",
    "HelpOnCall Team"
  ].join("\n");

  const html = buildEmailWrapper(`
    ${buildSuccessIconBadge()}
    <h2 style="font-size:32px;line-height:1.2;color:#0f172a;margin:0 0 16px;font-weight:800;">Application Sent!</h2>
    <div style="max-width:560px;margin:0 auto;">
      <p style="font-size:18px;line-height:1.6;color:#475569;margin:0;">Hi <strong>${escapeHtml(input.fullName)}</strong>, your profile has entered our orbit. Our recruitment team will review your application and reach out shortly.</p>
    </div>
  `);

  return { subject, text, html };
}

export function buildApplicantStatusTemplateData(status: "approve" | "reject"): Record<string, string> {
  const style = status === "approve" ? STATUS_STYLE.approved : STATUS_STYLE.rejected;
  return {
    statusSubject: style.subject,
    statusHeading: style.heading,
    statusLine: style.statusLine,
    statusBadgeColor: style.badgeColor,
    statusTextColor: style.textColor,
    statusBadgeLabel: style.badgeLabel
  };
}

export function buildApplicantStatusEmail(input: {
  fullName: string;
  empId: string;
  status: "approve" | "reject";
}): RenderedEmail {
  const isApproved = input.status === "approve";
  const style = isApproved ? STATUS_STYLE.approved : STATUS_STYLE.rejected;
  const subject = isApproved
    ? "HelpOnCall employment application approved"
    : "HelpOnCall employment application update";

  const text = [
    `Hi ${input.fullName},`,
    "",
    style.statusLine,
    `Reference ID: ${input.empId}`,
    "",
    "Thank you for your interest in HelpOnCall.",
    "HelpOnCall Team"
  ].join("\n");

  const html = buildEmailWrapper(`
    ${buildStatusBadge(isApproved)}
    <h2 style="font-size:32px;line-height:1.2;color:#0f172a;margin:0 0 16px;font-weight:800;">Application ${style.heading}</h2>
    <div style="max-width:560px;margin:0 auto;">
      ${buildInfoCard(`
        <p style="margin:0 0 16px;color:#374151;font-size:16px;line-height:1.7;">Hi <strong>${escapeHtml(input.fullName)}</strong>, ${escapeHtml(style.statusLine)}</p>
        ${buildInfoGrid([{ label: "Reference ID", value: escapeHtml(input.empId) }])}
      `)}
      <p style="margin:16px 0 0;color:#64748b;font-size:14px;">Thank you for your interest in HelpOnCall.</p>
    </div>
  `);

  return { subject, text, html };
}

const RFQ_STATUS_MESSAGES = {
  approved: {
    statusLine: "Your quotation request has been approved. A care coordinator will be in touch with you shortly."
  },
  rejected: {
    statusLine: "We reviewed your quotation request and are unable to proceed at this time."
  }
} as const;

export function buildRfqAdminNotificationEmail(input: {
  fullName: string;
  email: string;
  phone: string;
  rfqId: string;
}): RenderedEmail {
  const subject = `New RFQ submitted: ${input.fullName}`;

  const text = [
    "A new quotation request has been submitted.",
    "",
    `Name: ${input.fullName}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone}`,
    `RFQ ID: ${input.rfqId}`,
    "",
    "Please review it from the admin quotations dashboard."
  ].join("\n");

  const html = buildEmailWrapper(`
    <h2 style="font-size:28px;line-height:1.2;color:#0f172a;margin:0 0 24px;font-weight:800;">New Quotation Request</h2>
    ${buildInfoGrid([
      { label: "Name", value: escapeHtml(input.fullName) },
      { label: "Email", value: escapeHtml(input.email) },
      { label: "Phone", value: escapeHtml(input.phone) },
      { label: "Reference ID", value: escapeHtml(input.rfqId) }
    ])}
    <p style="margin:24px 0 0;color:#475569;font-size:14px;">Please review it from the admin quotations dashboard.</p>
  `);

  return { subject, text, html };
}

export function buildRfqStatusTemplateData(status: "approve" | "reject"): Record<string, string> {
  const style = status === "approve" ? STATUS_STYLE.approved : STATUS_STYLE.rejected;
  const message = status === "approve" ? RFQ_STATUS_MESSAGES.approved : RFQ_STATUS_MESSAGES.rejected;

  return {
    statusSubject: style.subject,
    statusHeading: style.heading,
    statusLine: message.statusLine,
    statusBadgeColor: style.badgeColor,
    statusTextColor: style.textColor,
    statusBadgeLabel: style.badgeLabel
  };
}

export function buildRfqStatusEmail(input: {
  fullName: string;
  rfqId: string;
  status: "approve" | "reject";
}): RenderedEmail {
  const isApproved = input.status === "approve";
  const style = isApproved ? STATUS_STYLE.approved : STATUS_STYLE.rejected;
  const statusLine = isApproved ? RFQ_STATUS_MESSAGES.approved.statusLine : RFQ_STATUS_MESSAGES.rejected.statusLine;
  const subject = isApproved
    ? "HelpOnCall quotation request approved"
    : "HelpOnCall quotation request update";

  const text = [
    `Hi ${input.fullName},`,
    "",
    statusLine,
    `Reference ID: ${input.rfqId}`,
    "",
    "Thank you for choosing HelpOnCall.",
    "HelpOnCall Team"
  ].join("\n");

  const html = buildEmailWrapper(`
    ${buildStatusBadge(isApproved)}
    <h2 style="font-size:32px;line-height:1.2;color:#0f172a;margin:0 0 16px;font-weight:800;">Request ${style.heading}</h2>
    <div style="max-width:560px;margin:0 auto;">
      ${buildInfoCard(`
        <p style="margin:0 0 16px;color:#374151;font-size:16px;line-height:1.7;">Hi <strong>${escapeHtml(input.fullName)}</strong>, ${escapeHtml(statusLine)}</p>
        ${buildInfoGrid([{ label: "Reference ID", value: escapeHtml(input.rfqId) }])}
      `)}
      <p style="margin:16px 0 0;color:#64748b;font-size:14px;">Thank you for choosing HelpOnCall.</p>
    </div>
  `);

  return { subject, text, html };
}

export function buildNewStaffAccountEmail(input: {
  fullName: string;
  personalEmail: string;
  staffEmail: string;
  password: string;
}): RenderedEmail {
  const subject = "Your HelpOnCall staff account is ready";

  const text = [
    `Hi ${input.fullName},`,
    "",
    "Your HelpOnCall staff account has been created successfully.",
    "You can now log in using the credentials below:",
    "",
    `Staff Email: ${input.staffEmail}`,
    `Password: ${input.password}`,
    "",
    "Please change your password after first login.",
    "",
    "Regards,",
    "HelpOnCall Team"
  ].join("\n");

  const html = buildEmailWrapper(`
    ${buildSuccessIconBadge("★")}
    <h2 style="font-size:32px;line-height:1.2;color:#0f172a;margin:0 0 16px;font-weight:800;">Staff Account Ready!</h2>
    <div style="max-width:560px;margin:0 auto;">
      <p style="font-size:18px;line-height:1.6;color:#475569;margin:0 0 24px;">Hi <strong>${escapeHtml(input.fullName)}</strong>, your HelpOnCall staff account has been created.</p>
      ${buildInfoGrid([
        { label: "Staff Email", value: escapeHtml(input.staffEmail) },
        { label: "Password", value: escapeHtml(input.password) }
      ])}
      <div style="margin-top:16px;">
        ${buildInfoCard(`<p style="margin:0;color:#64748b;font-size:14px;">Please change your password after your first login.</p>`)}
      </div>
    </div>
  `);

  return { subject, text, html };
}
