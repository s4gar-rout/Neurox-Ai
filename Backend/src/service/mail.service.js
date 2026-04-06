import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type:"oauth2",
        user: process.env.GOOGLE_USER,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        clientId: process.env.GOOGLE_CLIENT_ID
    }
});

transporter.verify()
.then(()=>{
    console.log('Email transporter is ready');
})
.catch((err)=>{
    console.error('Error setting up email transporter:', err);
})


export async function sendEmail({ to, subject, text, html }) {
    const mailOptions = {
        from: process.env.GOOGLE_USER,
        to,
        subject,
        text,
        html
    };

 const details =await transporter.sendMail(mailOptions);
 console.log('Email Sent:',details);
 
}