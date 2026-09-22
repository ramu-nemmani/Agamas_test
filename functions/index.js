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

        await sendEmail({
          from: "OTP Verification for Agamas <no-reply@theagamas.com>",
          to: email,
          subject: "Your OTP Code",
          emailType: "otp",
          html: `
  <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #fafafa;">
    <h2 style="color: #2c3e50;">Email Verification Code</h2>
    <p>Hello,</p>
    <p>Use the OTP below to verify your email address:</p>
    <div style="font-size: 24px; font-weight: bold; background-color: #f0f0f0; padding: 10px 20px; width: fit-content; margin: 20px auto; border-radius: 6px; color: #333;">
      ${otp}
    </div>
    <p>This code will expire in <strong>15 minutes</strong>.</p>
    <p style="color: #888;">If you didn't request this code, you can ignore this email.</p>
    <hr style="margin: 30px 0;">
    <p style="font-size: 12px; color: #aaa;">&copy; ${new Date().getFullYear()} Agama Translations. All rights reserved.</p>
  </div>
`,
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
