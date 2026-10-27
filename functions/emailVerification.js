const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const { defineSecret } = require("firebase-functions/params");

const awsAccessKey = defineSecret("AWS_ACCESS_KEY_ID");
const awsSecretKey = defineSecret("AWS_SECRET_ACCESS_KEY");
const awsRegion = defineSecret("AWS_REGION");

const APP_URL = "https://theagamas.com";
const AUTH_CONTINUE_URL =
  process.env.FIREBASE_AUTH_CONTINUE_URL ||
  "https://theagamas.com";
const BRAND_TERRACOTTA = "#cd5c3d";
const BRAND_TERRACOTTA_DARK = "#b84f33";
const BRAND_DARK = "#001e2d";
const TEXT_DARK = "#001e2d";
const TEXT_MUTED = "#5D554D";
const BG_PAGE = "#f8fafc";
const CARD_BG = "#ffffff";
const SUPPORT_EMAIL = "no-reply@theagamas.com";
const LOGO_URL = "https://theagamas.com/assets/favicon-DETFG3_X.jpg";
const SES_CONFIGURATION_SET = "TheAgamas";

function authCtaButton(url, text) {
  return `
    <table cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 24px 0;">
      <tr>
        <td align="center" style="background-color:#000000;border-radius:9999px;">
          <a
            href="${url}"
            style="display:inline-block;background-color:#000000;color:#ffffff;text-decoration:none;padding:13px 30px;border-radius:9999px;font-size:14px;font-weight:400;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif;letter-spacing:0.2px;line-height:1;"
          >
            <table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;vertical-align:middle;">
              <tr>
                <td style="color:#ffffff;font-size:14px;font-weight:400;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif;padding:0;vertical-align:middle;line-height:1;">
                  ${text}
                </td>
                <td style="padding:0 0 0 8px;vertical-align:middle;line-height:1;color:#ffffff;font-size:15px;font-weight:400;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif;">
                  &rarr;
                </td>
              </tr>
            </table>
          </a>
        </td>
      </tr>
    </table>
  `;
}

function authEmailLayout(content, preheader, eyebrow = "A NOTE FROM OUR TEAM", heading = "") {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${heading || "The Agamas"}</title>
</head>
<body style="margin:0;padding:0;background-color:${BG_PAGE};font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;color:${TEXT_DARK};">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;">
    ${preheader}
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BG_PAGE};padding:36px 16px 48px 16px;width:100% !important;">
    <tr>
      <td align="center">
        <!-- Main Wrapper -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:540px;width:100%;">
          
          <!-- Top Brand Header -->
          <tr>
            <td style="padding:0 4px 20px 4px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left" style="vertical-align:middle;">
                    <a href="${APP_URL}" style="text-decoration:none;display:inline-block;">
                      <table cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="vertical-align:middle;">
                            <img
                              src="${LOGO_URL}"
                              alt="The Agamas Logo"
                              width="40"
                              height="40"
                              style="display:block;width:40px;height:40px;border-radius:10px;object-fit:contain;border:0;outline:none;"
                            />
                          </td>
                          <td style="padding-left:12px;vertical-align:middle;">
                            <span style="font-size:24px;line-height:28px;color:#000000;font-family:Georgia,'Times New Roman',serif;font-weight:normal;letter-spacing:0;">
                              The Agamas
                            </span>
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <a href="${APP_URL}" style="display:inline-block;padding:6px 14px;border:1px solid #e2e8f0;border-radius:9999px;font-size:12px;font-weight:400;color:#000000;text-decoration:none;background:#ffffff;">
                      Website &#8599;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main White Card -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${CARD_BG};border-radius:24px;border:1px solid #e2e8f0;box-shadow:0 4px 20px -2px rgba(0,0,0,0.03);overflow:hidden;">
                <tr>
                  <td style="padding:40px 36px 36px 36px;">
                    
                    <!-- Eyebrow -->
                    <p style="margin:0 0 16px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#94a3b8;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
                      ${eyebrow}
                    </p>

                    <!-- Big Headline -->
                    ${heading ? `
                    <h1 style="margin:0 0 24px 0;font-size:30px;line-height:1.25;font-weight:700;color:#001e2d;letter-spacing:-0.5px;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;">
                      ${heading}
                    </h1>
                    ` : ""}

                    <!-- Body Content -->
                    <div style="font-size:15px;line-height:1.65;color:#475569;">
                      ${content}
                    </div>

                    <!-- Sign-off -->
                    <div style="margin-top:32px;padding-top:20px;border-top:1px solid #f1f5f9;">
                      <p style="margin:0;font-size:13px;color:#64748b;">
                        Warm regards, <strong style="color:#001e2d;">The Agamas Team</strong>
                      </p>
                    </div>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Stay Connected & Footer Section -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0 0 14px 0;font-size:12px;color:#94a3b8;font-weight:500;">
                Stay connected
              </p>
              
              <!-- Social Media Icons (matching website footer: Instagram, Facebook, LinkedIn) -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 20px auto;">
                <tr>
                  <!-- Instagram -->
                  <td style="padding:0 12px;vertical-align:middle;">
                    <a href="https://www.instagram.com/sunyatee/" target="_blank" title="Instagram" style="text-decoration:none;display:inline-block;">
                      <img src="https://img.icons8.com/material-outlined/48/94a3b8/instagram-new.png" alt="Instagram" width="20" height="20" style="display:block;width:20px;height:20px;border:0;outline:none;" />
                    </a>
                  </td>
                  <!-- Facebook -->
                  <td style="padding:0 12px;vertical-align:middle;">
                    <a href="https://www.facebook.com/dxnsunya" target="_blank" title="Facebook" style="text-decoration:none;display:inline-block;">
                      <img src="https://img.icons8.com/material-outlined/48/94a3b8/facebook-f.png" alt="Facebook" width="20" height="20" style="display:block;width:20px;height:20px;border:0;outline:none;" />
                    </a>
                  </td>
                  <!-- LinkedIn -->
                  <td style="padding:0 12px;vertical-align:middle;">
                    <a href="https://www.linkedin.com/company/sunyatee/posts/?feedView=all" target="_blank" title="LinkedIn" style="text-decoration:none;display:inline-block;">
                      <img src="https://img.icons8.com/material-outlined/48/94a3b8/linkedin--v1.png" alt="LinkedIn" width="20" height="20" style="display:block;width:20px;height:20px;border:0;outline:none;" />
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Copyright & Links -->
              <p style="margin:0 0 6px 0;font-size:12px;color:#94a3b8;">
                &copy; ${year} The Agamas. All rights reserved.
              </p>
              <p style="margin:0;font-size:11px;color:#94a3b8;">
                Questions? <a href="mailto:${SUPPORT_EMAIL}" style="color:#64748b;text-decoration:none;">${SUPPORT_EMAIL}</a>
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
    <p style="margin:0 0 14px 0;font-size:15px;color:#334155;line-height:1.6;">
      Hello ${firstName},
    </p>
    <p style="margin:0 0 14px 0;font-size:15px;color:#475569;line-height:1.6;">
      Welcome to The Agamas! We are delighted to have you join us on this journey of exploring sacred translations and ancient wisdom.
    </p>
    <p style="margin:0;font-size:15px;color:#475569;line-height:1.6;">
      Please confirm your email address by clicking the button below so you can access your reading progress, bookmarks, and chapters.
    </p>

    ${authCtaButton(verificationUrl, "Verify email address")}

    <p style="margin:20px 0 0 0;font-size:12px;color:#94a3b8;line-height:1.5;">
      This verification link will expire in 24 hours. If you did not create a The Agamas account, you can safely ignore this email.
    </p>
    `,
    `Confirm your email address for The Agamas`,
    `A NOTE FROM OUR TEAM`,
    `Verify your email address.`
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

function buildActionCodeSettings(continueUrl) {
  return {
    url: continueUrl || AUTH_CONTINUE_URL,
    handleCodeInApp: false,
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

      const continueUrl = request.data?.continueUrl;
      let verificationUrl;
      try {
        verificationUrl = await getAuth().generateEmailVerificationLink(
          userRecord.email,
          buildActionCodeSettings(continueUrl),
        );
      } catch (linkErr) {
        if (linkErr.code === 'auth/unauthorized-continue-uri') {
          console.warn("continueUrl domain not allowlisted, generating verification link with default settings");
          verificationUrl = await getAuth().generateEmailVerificationLink(userRecord.email);
        } else {
          throw linkErr;
        }
      }

      // Retrieve the user's actual registered name from Firestore if displayName is not in Auth
      let displayName = userRecord.displayName;
      if (!displayName) {
        try {
          const userDoc = await getFirestore().collection("users").doc(uid).get();
          if (userDoc.exists && userDoc.data().name) {
            displayName = userDoc.data().name;
          }
        } catch (dbErr) {
          console.warn("Could not fetch user name from Firestore:", dbErr);
        }
      }
      displayName = displayName || "there";

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

      const continueUrl = request.data?.continueUrl;
      let resetUrl;
      try {
        resetUrl = await getAuth().generatePasswordResetLink(
          userRecord.email,
          buildActionCodeSettings(continueUrl),
        );
      } catch (linkErr) {
        if (linkErr.code === 'auth/unauthorized-continue-uri') {
          console.warn("continueUrl domain not allowlisted, generating reset link with default settings");
          resetUrl = await getAuth().generatePasswordResetLink(userRecord.email);
        } else {
          throw linkErr;
        }
      }

      // Retrieve the user's actual registered name from Firestore if displayName is not in Auth
      let displayName = userRecord.displayName;
      if (!displayName) {
        try {
          const userDoc = await getFirestore().collection("users").doc(userRecord.uid).get();
          if (userDoc.exists && userDoc.data().name) {
            displayName = userDoc.data().name;
          }
        } catch (dbErr) {
          console.warn("Could not fetch user name from Firestore:", dbErr);
        }
      }
      displayName = displayName || "there";

      const htmlContent = authEmailLayout(
        `
        <p style="margin:0 0 14px 0;font-size:15px;color:#334155;line-height:1.6;">
          Hello ${displayName},
        </p>
        <p style="margin:0 0 14px 0;font-size:15px;color:#475569;line-height:1.6;">
          We received a request to reset the password for your The Agamas account.
        </p>
        <p style="margin:0;font-size:15px;color:#475569;line-height:1.6;">
          Click the button below to choose a new password. If you did not make this request, your account remains secure and you can disregard this email.
        </p>

        ${authCtaButton(resetUrl, "Reset password")}

        <p style="margin:20px 0 0 0;font-size:12px;color:#94a3b8;line-height:1.5;">
          Your password will not change until you access the link above and create a new one.
        </p>
        `,
        `Reset your password for The Agamas`,
        `PASSWORD RESET REQUEST`,
        `Reset your password.`
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