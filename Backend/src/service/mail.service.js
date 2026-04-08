import axios from "axios";

export async function sendEmail({ to, subject, html }) {
    try {
        await axios.post("https://api.brevo.com/v3/smtp/email", {
            to: [{ email: to }],
            sender: { name: "Neurox", email: process.env.BREVO_SENDER_EMAIL },
            subject,
            htmlContent: html,
        }, {
            headers: {
                "api-key": process.env.BREVO_API_KEY,
            },
        });
        console.log("✅ Email sent");
    } catch (error) {
        console.error("❌ Email error:", error);
        throw error;
    }
}