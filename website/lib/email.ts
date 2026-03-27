import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("[email] Failed to send email to", to, err);
    throw new Error("Failed to send email. Please try again later.");
  }
}

export function verificationEmailHtml({
  url,
  heading,
  body,
  buttonLabel,
}: {
  url: string;
  heading: string;
  body: string;
  buttonLabel: string;
}): string {
  const logoUrl = `https://raw.githubusercontent.com/CedarvilleCyber/Jericho/main/website/public/logo256.png`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${heading}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:ui-sans-serif,system-ui,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;">

          <!-- Header -->
          <tr>
            <td align="center" style="background-color:#003a63;border-radius:12px 12px 0 0;padding:32px 40px;">
              <img src="${logoUrl}" alt="Jericho" width="64" height="64"
                style="display:block;margin:0 auto 16px;" />
              <span style="color:#fdb813;font-size:22px;font-weight:700;letter-spacing:0.05em;">
                JERICHO
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:40px;border-radius:0 0 12px 12px;">
              <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#111827;">
                ${heading}
              </h1>
              <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#4b5563;">
                ${body}
              </p>

              <!-- Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                <tr>
                  <td style="border-radius:8px;background-color:#003a63;">
                    <a href="${url}"
                      style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#fdb813;text-decoration:none;border-radius:8px;">
                      ${buttonLabel}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback URL -->
              <p style="margin:0 0 8px;font-size:12px;color:#9ca3af;">
                If the button doesn&apos;t work, copy and paste this link into your browser:
              </p>
              <p style="margin:0;font-size:12px;word-break:break-all;">
                <a href="${url}" style="color:#003a63;">${url}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:24px 40px 0;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                If you didn&apos;t request this, you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
