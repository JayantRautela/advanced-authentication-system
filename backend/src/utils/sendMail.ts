import transporter from "../config/nodemailer.config";

interface MailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

export const sendEmail = async ({ to, subject, text, html }: MailOptions): Promise<void> => {
    const mailOptions = {
        from: process.env.SMTP_USER,
        to,
        subject,
        text,
        html,
    };

    await transporter.sendMail(mailOptions);
};