const functions = require("firebase-functions");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { onDocumentCreated } = require("firebase-functions/firestore");
const cors = require("cors")({ origin: true });
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const { defineSecret } = require("firebase-functions/params");

// ✅ Define Secrets from Firebase Secret Manager
const awsAccessKey = defineSecret("AWS_ACCESS_KEY_ID");
const awsSecretKey = defineSecret("AWS_SECRET_ACCESS_KEY");
const awsRegion = defineSecret("AWS_REGION");



// ✅ Configuration Set Name (matches your AWS SES config set)
const SES_CONFIGURATION_SET = "TheAgamas";

// ✅ Initialize Firebase
initializeApp();
const db = getFirestore();

// ✅ SES Client Factory — called inside each function so secrets are available
function createSesClient() {
  return new SESClient({
    region: awsRegion.value(),
    credentials: {
      accessKeyId: awsAccessKey.value(),
      secretAccessKey: awsSecretKey.value(),
    },
  });
}

// ✅ Unified sendEmail helper with config set + tracking tags
async function sendEmail({ from, to, subject, html, emailType }) {
  const toAddresses = Array.isArray(to)
    ? to
    : to.split(",").map((e) => e.trim());

  const client = createSesClient();

  const command = new SendEmailCommand({
    Source: from,
    Destination: {
      ToAddresses: toAddresses,
    },
    Message: {
      Subject: { Data: subject },
      Body: { Html: { Data: html } },
    },
    // ✅ Ties every send to your CloudWatch config set
    ConfigurationSetName: SES_CONFIGURATION_SET,
    // ✅ Tags let you filter by email type in CloudWatch
    Tags: [
      { Name: "project_name", Value: "TheAgamas" },
      { Name: "email_type", Value: emailType || "general" },
    ],
  });

  return client.send(command);
}

// ✅ OTP Generator
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ─────────────────────────────────────────────
// ✅ SEND OTP FUNCTION
// email_type tag: otp
// ─────────────────────────────────────────────
exports.sendOtp = functions.https.onRequest(
  { secrets: [awsAccessKey, awsSecretKey, awsRegion] },
  (req, res) => {
    cors(req, res, async () => {
      try {
        const { email } = req.body;
        if (!email)
          return res
            .status(400)
            .json({ success: false, message: "Email is required" });

        const otp = generateOTP();
        const expiresAt = Timestamp.fromDate(
          new Date(Date.now() + 15 * 60 * 1000)
        ); // 15 min TTL

        await db.collection("otps").doc(email).set({ otp, expiresAt });

        const emailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verification Code</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;padding:36px 16px 48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:540px;width:100%;">
          
          <!-- Brand Header -->
          <tr>
            <td style="padding:0 4px 20px 4px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left" style="vertical-align:middle;">
                    <a href="https://theagamas.com" style="text-decoration:none;display:inline-block;">
                      <table cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="vertical-align:middle;">
                            <img
                              src="https://theagamas.com/favicon.webp"
                              alt="The Agamas Logo"
                              width="40"
                              height="40"
                              style="display:block;width:40px;height:40px;border-radius:10px;object-fit:contain;border:0;outline:none;"
                            />
                          </td>
                          <td style="padding-left:12px;vertical-align:middle;">
                            <span style="font-size:24px;line-height:28px;color:#1e1e1e;font-family:Georgia,'Times New Roman',serif;font-weight:normal;letter-spacing:0;">
                              The <span style="color:#cd5c3d;">Agamas</span>
                            </span>
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <a href="https://theagamas.com" style="display:inline-block;padding:6px 14px;border:1px solid #e2e8f0;border-radius:9999px;font-size:12px;font-weight:600;color:#64748b;text-decoration:none;background:#ffffff;">
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
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:24px;border:1px solid #e2e8f0;box-shadow:0 4px 20px -2px rgba(0,0,0,0.03);overflow:hidden;">
                <tr>
                  <td style="padding:40px 36px 36px 36px;">
                    <p style="margin:0 0 16px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#94a3b8;">
                      SECURITY VERIFICATION
                    </p>
                    <h1 style="margin:0 0 24px 0;font-size:30px;line-height:1.25;font-weight:700;color:#0f172a;letter-spacing:-0.5px;">
                      Your verification code.
                    </h1>
                    <p style="margin:0 0 14px 0;font-size:15px;color:#475569;line-height:1.6;">
                      Use the 6-digit one-time code below to verify your email address:
                    </p>
                    <div style="margin:28px 0;padding:18px 24px;background-color:#f8fafc;border:1px dashed #cbd5e1;border-radius:16px;text-align:center;">
                      <span style="font-size:34px;font-weight:700;letter-spacing:8px;color:#0f172a;font-family:monospace;">
                        ${otp}
                      </span>
                    </div>
                    <p style="margin:0 0 8px 0;font-size:13px;color:#64748b;line-height:1.5;">
                      This code will expire in <strong>15 minutes</strong>.
                    </p>
                    <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;">
                      If you did not request this verification code, you can safely ignore this email.
                    </p>
                    <div style="margin-top:32px;padding-top:20px;border-top:1px solid #f1f5f9;">
                      <p style="margin:0;font-size:13px;color:#64748b;">
                        Warm regards, <strong style="color:#0f172a;">The Agamas Team</strong>
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0 0 14px 0;font-size:12px;color:#94a3b8;font-weight:500;">Stay connected</p>
              <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 20px auto;">
                <tr>
                  <td style="padding:0 12px;vertical-align:middle;">
                    <a href="https://www.instagram.com/sunyatee/" target="_blank" title="Instagram" style="text-decoration:none;display:inline-block;">
                      <img src="https://img.icons8.com/material-outlined/48/94a3b8/instagram-new.png" alt="Instagram" width="20" height="20" style="display:block;width:20px;height:20px;border:0;outline:none;" />
                    </a>
                  </td>
                  <td style="padding:0 12px;vertical-align:middle;">
                    <a href="https://www.facebook.com/dxnsunya" target="_blank" title="Facebook" style="text-decoration:none;display:inline-block;">
                      <img src="https://img.icons8.com/material-outlined/48/94a3b8/facebook-f.png" alt="Facebook" width="20" height="20" style="display:block;width:20px;height:20px;border:0;outline:none;" />
                    </a>
                  </td>
                  <td style="padding:0 12px;vertical-align:middle;">
                    <a href="https://www.linkedin.com/company/sunyatee/posts/?feedView=all" target="_blank" title="LinkedIn" style="text-decoration:none;display:inline-block;">
                      <img src="https://img.icons8.com/material-outlined/48/94a3b8/linkedin--v1.png" alt="LinkedIn" width="20" height="20" style="display:block;width:20px;height:20px;border:0;outline:none;" />
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:12px;color:#94a3b8;">&copy; ${new Date().getFullYear()} The Agamas. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

        await sendEmail({
          from: "The Agamas <no-reply@theagamas.com>",
          to: email,
          subject: "Your OTP Verification Code",
          emailType: "otp",
          html: emailHtml,
        });

        return res.status(200).json({ success: true, message: "OTP sent" });
      } catch (err) {
        console.error("❌ sendOtp error:", err);
        return res.status(500).json({ success: false, message: err.message });
      }
    });
  }
);

// ─────────────────────────────────────────────
// ✅ VERIFY OTP FUNCTION (no email — no secrets needed)
// ─────────────────────────────────────────────
exports.verifyOtp = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp)
        return res
          .status(400)
          .json({ success: false, message: "Email and OTP are required" });

      const docRef = db.collection("otps").doc(email);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res
          .status(400)
          .json({ success: false, message: "No OTP sent to this email" });
      }

      const data = doc.data();
      const now = Timestamp.now();

      if (now.toMillis() > data.expiresAt.toMillis()) {
        await docRef.delete();
        return res
          .status(400)
          .json({ success: false, message: "OTP expired" });
      }

      if (otp != data.otp) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid OTP" });
      }

      // ✅ OTP is valid — delete and return success
      await docRef.delete();
      return res.status(200).json({ success: true, message: "OTP verified" });
    } catch (err) {
      console.error("❌ verifyOtp error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  });
});

// ─────────────────────────────────────────────
// ✅ APPROVE USER FUNCTION
// email_type tag: verified
// ─────────────────────────────────────────────
exports.approveUser = functions.https.onRequest(
  { secrets: [awsAccessKey, awsSecretKey, awsRegion] },
  (req, res) => {
    cors(req, res, async () => {
      const { uid, email } = req.query;

      if (!uid) {
        return res.status(400).send("Missing user ID");
      }

      try {
        const userDoc = await db.collection("users").doc(uid).get();
        const userData = userDoc.data();

        if (!userData?.isAdmin) {
          await db.collection("users").doc(uid).update({
            isAdmin: true,
          });

          await verifiedEmail(email);
        }

        return res.send(`
      <h2>User Approved</h2>
      <p>User with ID <code>${uid}</code> has been granted admin access ✅</p>
    `);
      } catch (err) {
        console.error("❌ Error approving user:", err);
        return res.status(500).send("Failed to approve user");
      }
    });
  }
);

// ─────────────────────────────────────────────
// ✅ SEND ACTIVITY EMAIL (Firestore trigger)
// email_type tag: admin_approval
// ─────────────────────────────────────────────
exports.sendActivityEmail = functions.https.onRequest(
  { secrets: [awsAccessKey, awsSecretKey, awsRegion] },
  (req, res) => {
    cors(req, res, async () => {
      try {
        const { email, uid } = req.body;

        if (!email || !uid) {
          console.error("❌ Missing email or UID");
          return res.status(400).json({ success: false, message: "Missing email or UID" });
        }

        const mailHtml = `
  <div style="font-family:Arial;max-width:600px;margin:auto;border:1px solid #eee;padding:20px;border-radius:6px">
    <h2>Admin Approval Requested</h2>
    <p>User <strong>${email}</strong> is requesting admin access.</p>

    <a href="https://approveuser-p76bkcj24q-uc.a.run.app?uid=${uid}&email=${email}"
       style="display:inline-block;margin-top:20px;padding:12px 24px;background-color:#2ecc71;color:#fff;
              text-decoration:none;border-radius:6px;font-weight:bold;">
      ✅ Approve Admin Access
    </a>

    <hr />
    <p style="font-size:12px;color:#999;">This is an automated email from Agama.</p>
  </div>
`;

        const doc = await db.collection("users").doc("superAdmins").get();
        const superAdminMails = doc.data().emails.join(", ");

        if (!superAdminMails) {
          console.error("❌ No super admin emails found");
          return res.status(500).json({ success: false, message: "No super admin emails found" });
        }

        await sendEmail({
          from: "Agama Notifications <no-reply@theagamas.com>",
          to: superAdminMails,
          subject: "Activity Notification",
          emailType: "admin_approval",
          html: mailHtml,
        });

        console.log(`✅ Activity email sent to ${superAdminMails}`);
        return res.status(200).json({ success: true, message: "Activity email sent" });
      } catch (error) {
        console.error("❌ Failed to send activity email:", error);
        return res.status(500).json({ success: false, message: error.message });
      }
    });
  }
);



// ─────────────────────────────────────────────
// ✅ VERIFIED EMAIL HELPER
// email_type tag: verified
// ─────────────────────────────────────────────
async function verifiedEmail(email) {
  if (!email) {
    console.error("❌ verifiedEmail: no email provided");
    return;
  }

  const mailHtml = `
    <div style="font-family:Arial;max-width:600px;margin:auto;border:1px solid #eee;padding:20px;border-radius:6px">
      <h2>✅ Email Verified</h2>
      <p>Your email <strong>${email}</strong> has been successfully verified.</p>
      <hr />
      <p style="font-size:12px;color:#999;">This is an automated email from Agama.</p>
    </div>
  `;

  try {
    await sendEmail({
      from: "Agama Notifications <no-reply@theagamas.com>",
      to: email,
      subject: "Email Verification Confirmed",
      emailType: "verified",
      html: mailHtml,
    });
    console.log(`✅ Verified email sent to ${email}`);
  } catch (error) {
    console.error("❌ Failed to send verified email:", error);
  }
}

// ─────────────────────────────────────────────
// ✅ EMAIL VERIFICATION (External File)
// ─────────────────────────────────────────────
exports.sendVerificationEmailFn = require("./emailVerification").sendVerificationEmailFn;
exports.sendPasswordResetEmailFn = require("./emailVerification").sendPasswordResetEmailFn;
