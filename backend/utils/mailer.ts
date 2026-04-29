import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);
// Use your verified domain email (e.g., support@yourdomain.com)
const fromEmail = process.env.EMAIL_USER || 'onboarding@resend.dev';

export const sendTrackingEmail = async (customerEmail: string, customerName: string, trackingNumber: string) => {
    try {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        const { data, error } = await resend.emails.send({
            from: `"LogisticLenz Support" <${fromEmail}>`,
            to: customerEmail,
            subject: `Your Shipment has been Registered - Tracking ID: ${trackingNumber}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eef2f6; border-radius: 10px;">
                    <h2 style="color: #667eea;">Hello ${customerName},</h2>
                    <p>Your shipment has been successfully registered with <strong>LogisticLenz</strong>.</p>
                    <p>Your tracking number is: <strong style="font-size: 18px; color: #764ba2;">${trackingNumber}</strong></p>
                    <p>You can track your package's progress in real-time on our website using the link below:</p>
                    <a href="${frontendUrl}/track/${trackingNumber}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; color: #ffffff; background-color: #667eea; text-decoration: none; border-radius: 6px; font-weight: bold; border: 1px solid #667eea;">Track Shipment &rarr;</a>
                    <p>Thank you for choosing us for your logistics needs!</p>
                    <hr style="border: none; border-top: 1px solid #eef2f6; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #888;">Best Regards,<br/><strong>LogisticLenz Team</strong></p>
                </div>
            `
        });

        if (error) {
            console.error('Resend error:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};

export const sendDynamicEmail = async (customerEmail: string, customerName: string, subject: string, htmlContent: string) => {
    try {
        const { data, error } = await resend.emails.send({
            from: `"LogisticLenz Support" <${fromEmail}>`,
            to: customerEmail,
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eef2f6; border-radius: 10px;">
                    <h2 style="color: #667eea;">Hello ${customerName},</h2>
                    ${htmlContent}
                    <hr style="border: none; border-top: 1px solid #eef2f6; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #888;">Best Regards,<br/><strong>LogisticLenz Team</strong></p>
                </div>
            `
        });

        if (error) {
            console.error('Resend error:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error sending dynamic email:', error);
        return { success: false, error: error.message };
    }
};
