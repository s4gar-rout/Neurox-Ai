import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

transporter.verify()
    .then(() => {
        console.log("✅ Email transporter is ready");
    })
    .catch((err) => {
        console.error("❌ Email transporter error:", err);
    });

export async function sendEmail({ to, subject, html }) {
    try {
        const info = await transporter.sendMail({
            from: `"Neurox" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });

        console.log("📩 Email sent:", info.messageId);
    } catch (error) {
        console.error("❌ Email send failed:", error);
    }
}