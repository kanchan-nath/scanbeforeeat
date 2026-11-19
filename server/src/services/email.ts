import nodemailer from "nodemailer";

interface SendOtpResult {
  success: boolean;
  messageId?: string;
  error?: string;
  isMock?: boolean;
}

export function getTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

export async function sendOtpEmail(toEmail: string, otpCode: string): Promise<SendOtpResult> {
  const transporter = getTransporter();

  if (!transporter) {
    console.warn(`[OTP Mailer] SMTP credentials not found in env. Generated OTP for ${toEmail}: ${otpCode}`);
    return {
      success: true,
      isMock: true,
    };
  }

  const from = process.env.SMTP_FROM || `"ScanBeforeEat" <${process.env.SMTP_USER}>`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Your ScanBeforeEat Verification Code</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="500px" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                <!-- Header -->
                <tr>
                  <td style="background-color: #047857; padding: 24px 32px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">
                      ScanBeforeEat
                    </h1>
                    <p style="color: #a7f3d0; margin: 4px 0 0 0; font-size: 12px; font-weight: 500;">
                      Food Toxicology & Safety Diagnostic Intelligence
                    </p>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 32px;">
                    <h2 style="color: #0f172a; margin: 0 0 12px 0; font-size: 18px; font-weight: 700;">
                      Verify Your Email Address
                    </h2>
                    <p style="color: #475569; font-size: 14px; line-height: 1.5; margin: 0 0 24px 0;">
                      Use the 6-digit one-time password (OTP) below to authenticate your ScanBeforeEat account. This code expires in <strong>10 minutes</strong>.
                    </p>
                    <!-- OTP Box -->
                    <div style="background-color: #ecfdf5; border: 1.5px dashed #059669; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                      <span style="font-family: 'SF Mono', Monaco, Consolas, monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #065f46; display: inline-block;">
                        ${otpCode}
                      </span>
                    </div>
                    <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0;">
                      If you did not request this authentication code, please disregard this email or check your account security. Never share this code with anyone.
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f1f5f9; padding: 16px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #94a3b8; font-size: 11px; margin: 0;">
                      &copy; ${new Date().getFullYear()} ScanBeforeEat. Zero-data monetization food diagnostic platform.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from,
      to: toEmail,
      subject: `${otpCode} is your ScanBeforeEat verification code`,
      text: `Your ScanBeforeEat verification code is: ${otpCode}. It expires in 10 minutes.`,
      html: htmlContent,
    });
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.error("[OTP Mailer Error]", err);
    return {
      success: false,
      error: err.message || "Failed to send email",
    };
  }
}
