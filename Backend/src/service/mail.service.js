import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    family: 4, // ⭐ Force IPv4
    auth: {
        user: process.env.GOOGLE_USER,
        pass: process.env.GOOGLE_APP_PASSWORD, // ⭐ Use app password, not regular password
    },
});

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
        return info;
    } catch (error) {
        console.error("❌ Email error:", error);
        throw error;
    }
}