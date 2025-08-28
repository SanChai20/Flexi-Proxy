import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";
import { Resend, CreateEmailResponse } from 'resend';

interface ContactFormData {
    name: string;
    email: string;
    subject: string;
    message: string;
    submitTime: string;
}
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
})
const resend = new Resend(process.env.AUTH_RESEND_KEY);
const USER_CONTACT_PREFIX = "user:contact";
const createEmailTemplate = (data: ContactFormData) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Contact Form Submit - ${data.subject}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f4f4f4; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .content { background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #555; }
        .value { margin-top: 5px; padding: 10px; background-color: #f9f9f9; border-radius: 4px; }
        .message-value { white-space: pre-wrap; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>🔔 New Contact Form Submit</h2>
            <p>You have received a new message from router.fit website</p>
        </div>
        
        <div class="content">
            <div class="field">
                <div class="label">📧 Sender Email:</div>
                <div class="value">${data.email}</div>
            </div>
            
            <div class="field">
                <div class="label">👤 Name:</div>
                <div class="value">${data.name}</div>
            </div>
            
            <div class="field">
                <div class="label">📝 Subject:</div>
                <div class="value">${data.subject}</div>
            </div>
            
            <div class="field">
                <div class="label">💬 Message Content:</div>
                <div class="value message-value">${data.message}</div>
            </div>
            
            <div class="field">
                <div class="label">⏰ Submission Time:</div>
                <div class="value">${new Date(data.submitTime).toLocaleString('zh-CN', { 
                    timeZone: 'Asia/Shanghai',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                })}</div>
            </div>
        </div>
        
        <div class="footer">
            <p>This email was automatically sent by API Base Router contact form system</p>
            <p>To reply, please respond directly to the user's email: ${data.email}</p>
        </div>
    </div>
</body>
</html>
`;

export async function POST(req: NextRequest) {
    const data = await req.json();
    const userId = data["userId"] as string
    if (!userId) {
        return NextResponse.json({ error: 'Missing user-id header' }, { status: 400 });
    }
    const ipSubmittedExpiryInSeconds: number = await redis.ttl([USER_CONTACT_PREFIX, userId].join(':'));
    if (ipSubmittedExpiryInSeconds > 0) {
        return NextResponse.json({ 
            message: "Only one message is allowed per day. Please try again tomorrow."
        }, { status: 429 }); // Using 429 Too Many Requests status code
    }
    const userName = data["userName"] as string || 'Anonymous'
    const userEmail = data["userEmail"] as string || ''
    const subject = data["subject"] as string
    const message = data["message"] as string
    if (!subject || !message) {
        return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }
    const contactData: ContactFormData = {
        name: userName,
        email: userEmail,
        subject,
        message,
        submitTime: new Date().toISOString(),
    };
    try {
        const sendResponse: CreateEmailResponse = await resend.emails.send({
            from: process.env.AUTH_RESEND_FROM || 'no-reply@router.fit',
            to: [process.env.ADMIN_EMAIL as string, 'dauberiverferryman@gmail.com'],
            subject: `🔔 New Contact Form Submit: ${subject}`,
            html: createEmailTemplate(contactData),
            replyTo: userEmail,
        });
        if (sendResponse.error === null) {
            await redis.set([USER_CONTACT_PREFIX, userId].join(':'), "", { ex: 86400 }); // Store for 24 hours
            return NextResponse.json({ message: "Contact form submitted successfully" }, { status: 200 });
        }
    } catch (error) {
        console.error("Error storing contact form data:", error);
    }
    return NextResponse.json({ message: "Failed to submit contact form, please try again later" }, { status: 500 });
}