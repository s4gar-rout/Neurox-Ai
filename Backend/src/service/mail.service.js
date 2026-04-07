import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: process.env.GOOGLE_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    },
});

// ✅ transporter check (optional but helpful)
transporter.verify()
    .then(() => console.log("✅ Gmail transporter ready"))
    .catch((err) => console.error("❌ Gmail transporter error:", err));

export async function sendEmail({ to, subject, html }) {
    try {
        const info = await transporter.sendMail({
            from: `"Neurox" <${process.env.GOOGLE_USER}>`,
            to,
            subject,
            html,
        });

        console.log("✅ Email sent:", info.messageId);
    } catch (error) {
        console.error("❌ Email error:", error);
    }
}