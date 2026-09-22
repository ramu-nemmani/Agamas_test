const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { getAuth } = require("firebase-admin/auth");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const { defineSecret } = require("firebase-functions/params");

const awsAccessKey = defineSecret("AWS_ACCESS_KEY_ID");
const awsSecretKey = defineSecret("AWS_SECRET_ACCESS_KEY");
const awsRegion = defineSecret("AWS_REGION");

const APP_URL = "https://theagamas.com";
const AUTH_CONTINUE_URL =
  process.env.FIREBASE_AUTH_CONTINUE_URL ||
  "https://agamatranslationsfordrlim.firebaseapp.com";
const BRAND_PURPLE = "#2d2e7e";
const SUPPORT_EMAIL = "no-reply@theagamas.com";
const LOGO_URL =
  "https://firebasestorage.googleapis.com/v0/b/agamatranslationsfordrlim.firebasestorage.app/o/SifLogo.jpg?alt=media";
const SES_CONFIGURATION_SET = "TheAgamas";

function authCtaButton(url, text) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
      <tr>
        <td align="center">
          <a
            href="${url}"
            style="display:inline-block;background:${BRAND_PURPLE};color:#ffffff;text-decoration:none;padding:13px 30px;border-radius:8px;font-size:14px;font-weight:700;"
          >
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `;
}

function authEmailLayout(content, preheader, title = "Confirm your email") {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    ${preheader}
  </div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0;">
          <!-- Header -->
          <tr>
            <td style="background:${BRAND_PURPLE};padding:32px 28px;text-align:center;">
              <img
                src="${LOGO_URL}"
                alt="The Agamas Logo"
                width="88"
                height="88"
                style="display:block;margin:0 auto 16px;width:88px;height:88px;border-radius:50%;border:0;outline:none;text-decoration:none;"
              />
              <h1 style="margin:0;color:#ffffff;font-size:22px;line-height:1.3;font-weight:700;">
                ${title}
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:30px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 24px;text-align:center;">
              <p style="margin:0;color:#64748b;font-size:13px;">
                © ${year} The Agamas
              </p>
              <p style="margin:6px 0 0;color:#94a3b8;font-size:12px;">
                Need help? <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND_PURPLE};text-decoration:none;">${SUPPORT_EMAIL}</a>
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

function emailVerificationHtml({ name, verificationUrl }) {
  const firstName = name.split(" ")[0] || name;

  return authEmailLayout(
    `
    <p style="margin:0 0 16px;font-size:15px;color:#111827;line-height:1.6;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;">
      Hi ${firstName},
    </p>
    <p style="margin:0 0 4px;font-size:15px;color:#64748b;line-height:1.6;">
      One quick step to finish creating your account.
    </p>
    <p style="margin:0;font-size:15px;color:#64748b;line-height:1.6;">
      Click the button below to confirm this email address belongs to you.
    </p>
    ${authCtaButton(verificationUrl, "Confirm email address")}
    <p style="margin:32px 0 0;font-size:13px;color:#94a3b8;line-height:1.6;text-align:center;">
      This link expires in 24 hours.<br/>
      If you didn&apos;t create a The Agamas account,
      you can ignore this message.
    </p>
    <div style="margin-top:28px;padding-top:24px;border-top:1px solid #e5e7eb;">
      <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;text-align:center;">
        Button not working? Copy this link:
      </p>
      <p style="margin:0;font-size:12px;color:${BRAND_PURPLE};word-break:break-all;text-align:center;line-height:1.5;">
        <a href="${verificationUrl}" style="color:${BRAND_PURPLE};text-decoration:underline;">
          ${verificationUrl}
        </a>
      </p>
    </div>
    `,
    `Confirm your The Agamas account — tap the link to finish signing up.`,
    `Confirm your email`,
  );
}

function emailVerificationText({ name, verificationUrl }) {
  const firstName = name.split(" ")[0] || name;

  return `The Agamas — Confirm your email

Hi ${firstName},

Thanks for signing up. Confirm your email address by opening this link:

${verificationUrl}

This link expires in 24 hours.

If you didn't create a The Agamas account, you can ignore this email.

—
The Agamas
${APP_URL}

Questions? ${SUPPORT_EMAIL}
`;
}

// Internal helper for AWS SES
async function sendEmail({ to, subject, html, text }) {
  const sesClient = new SESClient({
    region: awsRegion.value(),
    credentials: {
      accessKeyId: awsAccessKey.value(),
      secretAccessKey: awsSecretKey.value(),
    },
  });

  const command = new SendEmailCommand({
    Source: `The Agamas <${SUPPORT_EMAIL}>`,
    Destination: { ToAddresses: [to] },
    ConfigurationSetName: SES_CONFIGURATION_SET,
    Tags: [
      { Name: "project_name", Value: "TheAgamas" },
      { Name: "email_type", Value: "email_verification" },
    ],
    Message: {
      Subject: { Data: subject, Charset: "UTF-8" },
      Body: {
        Html: { Data: html, Charset: "UTF-8" },
        Text: { Data: text, Charset: "UTF-8" },
      },
    },
  });

  return sesClient.send(command);
}

function isSesConfigured() {
  try {
    return !!(awsAccessKey.value() && awsSecretKey.value() && awsRegion.value());
  } catch (err) {
    // If the secrets aren't bound or available yet, assume false
    return false;
  }
}

function buildActionCodeSettings() {
  return {
    url: AUTH_CONTINUE_URL,
    handleCodeInApp: true,
  };
}

/**
 * Sends a branded verification email via AWS SES using a Firebase Admin-generated link.
 * Falls back to returning method: 'none' when SES is not configured.
 */
exports.sendVerificationEmailFn = onCall(
  { secrets: [awsAccessKey, awsSecretKey, awsRegion] },
  async (request) => {
    try {
      if (!request.auth) {
        throw new HttpsError('unauthenticated', 'You must be signed in');
      }

      const uid = request.auth.uid;
      const userRecord = await getAuth().getUser(uid);

      if (!userRecord.email) {
        throw new HttpsError('failed-precondition', 'Account has no email address');
      }

      if (userRecord.emailVerified) {
        return { sent: false, alreadyVerified: true, method: 'none' };
      }

      if (!isSesConfigured()) {
        console.warn("SES Secrets missing - falling back to client-side email");
        return { sent: false, alreadyVerified: false, method: 'none' };
      }

      const verificationUrl = await getAuth().generateEmailVerificationLink(
        userRecord.email,
        buildActionCodeSettings(),
      );

      const displayName = userRecord.displayName || userRecord.email.split('@')[0] || 'there';

      await sendEmail({
        to: userRecord.email,
        subject: 'Confirm your The Agamas account',
        html: emailVerificationHtml({ name: displayName, verificationUrl }),
        text: emailVerificationText({ name: displayName, verificationUrl }),
      });

      console.log(`✅ Verification email sent to ${userRecord.email} via SES`);
      return { sent: true, alreadyVerified: false, method: 'ses' };

    } catch (error) {
      console.error("❌ sendVerificationEmailFn Error:", error);
      return {
        sent: false,
        error: error.message || "Unknown error",
        stack: error.stack || "No stack trace available"
      };
    }
  }
);

/**
 * Sends a branded password reset email via AWS SES using a Firebase Admin-generated link.
 * Falls back to returning method: 'none' when SES is not configured.
 */
exports.sendPasswordResetEmailFn = onCall(
  { secrets: [awsAccessKey, awsSecretKey, awsRegion] },
  async (request) => {
    try {
      const email = request.data.email;
      if (!email) {
        throw new HttpsError('invalid-argument', 'Email is required');
      }

      let userRecord;
      try {
        userRecord = await getAuth().getUserByEmail(email);
      } catch (e) {
        // We shouldn't reveal if a user exists or not for security reasons,
        // but for this implementation we can just return success to avoid error messages
        console.warn(`Attempted reset for non-existent email: ${email}`);
        return { sent: true, method: 'none' };
      }

      if (!isSesConfigured()) {
        console.warn("SES Secrets missing - falling back to client-side password reset email");
        return { sent: false, method: 'none' };
      }

      const resetUrl = await getAuth().generatePasswordResetLink(
        userRecord.email,
        buildActionCodeSettings(),
      );

      const displayName = userRecord.displayName || userRecord.email.split('@')[0] || 'there';

      const htmlContent = authEmailLayout(
        `
        <p style="margin:0 0 16px;font-size:15px;color:#111827;line-height:1.6;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;">
          Hi ${displayName},
        </p>
        <p style="margin:0 0 4px;font-size:15px;color:#64748b;line-height:1.6;">
          Someone requested a password reset for your The Agamas account.
        </p>
        <p style="margin:0;font-size:15px;color:#64748b;line-height:1.6;">
          Click the button below to set a new password.
        </p>
        ${authCtaButton(resetUrl, "Reset password")}
        <p style="margin:32px 0 0;font-size:13px;color:#94a3b8;line-height:1.6;text-align:center;">
          If you didn&apos;t request this, you can safely ignore this email.<br/>
          Your password will not change until you create a new one.
        </p>
        <div style="margin-top:28px;padding-top:24px;border-top:1px solid #e5e7eb;">
          <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;text-align:center;">
            Button not working? Copy this link:
          </p>
          <p style="margin:0;font-size:12px;color:${BRAND_PURPLE};word-break:break-all;text-align:center;line-height:1.5;">
            <a href="${resetUrl}" style="color:${BRAND_PURPLE};text-decoration:underline;">
              ${resetUrl}
            </a>
          </p>
        </div>
        `,
        `Reset your password for The Agamas`,
        `Reset your password`
      );

      const textContent = `The Agamas — Reset your password

Hi ${displayName},

Someone requested a password reset for your account. Reset your password by opening this link:

${resetUrl}

If you didn't request this, you can ignore this email.

—
The Agamas
${APP_URL}

Questions? ${SUPPORT_EMAIL}
`;

      await sendEmail({
        to: userRecord.email,
        subject: 'Reset your password for The Agamas',
        html: htmlContent,
        text: textContent,
      });

      console.log(`✅ Password reset email sent to ${userRecord.email} via SES`);
      return { sent: true, method: 'ses' };

    } catch (error) {
      console.error("❌ sendPasswordResetEmailFn Error:", error);
      return {
        sent: false,
        error: error.message || "Unknown error",
        stack: error.stack || "No stack trace available"
      };
    }
  }
);