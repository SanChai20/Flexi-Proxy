import { redis } from "@/lib/redis";
import { PayloadRequest, withAuth } from "@/lib/with-auth";
import { NextResponse } from "next/server";
import { Resend, CreateEmailResponse } from "resend";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  submitTime: string;
}

const resend = new Resend(process.env.AUTH_RESEND_KEY);
const USER_CONTACT_PREFIX = "user:contact";
const escapeHtml = (unsafe: string) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
const sanitizeString = (str: string) => {
  // Remove any HTML tags and escape special characters
  return escapeHtml(str.trim());
};

const createEmailTemplate = (data: ContactFormData) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Contact Form Submit - ${escapeHtml(data.subject)}</title>
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
                <div class="value">${escapeHtml(data.email)}</div>
            </div>
            
            <div class="field">
                <div class="label">👤 Name:</div>
                <div class="value">${escapeHtml(data.name)}</div>
            </div>
            
            <div class="field">
                <div class="label">📝 Subject:</div>
                <div class="value">${escapeHtml(data.subject)}</div>
            </div>
            
            <div class="field">
                <div class="label">💬 Message Content:</div>
                <div class="value message-value">${escapeHtml(
                  data.message
                )}</div>
            </div>
            
            <div class="field">
                <div class="label">⏰ Submission Time:</div>
                <div class="value">${new Date(data.submitTime).toLocaleString(
                  "zh-CN",
                  {
                    timeZone: "Asia/Shanghai",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  }
                )}</div>
            </div>
        </div>
        
        <div class="footer">
            <p>This email was automatically sent by API Base Router contact form system</p>
            <p>To reply, please respond directly to the user's email: ${escapeHtml(
              data.email
            )}</p>
        </div>
    </div>
</body>
</html>
`;

async function protectedPOST(req: PayloadRequest) {
  if (
    !req.payload ||
    typeof req.payload["uid"] !== "string" ||
    typeof req.payload["un"] !== "string" ||
    typeof req.payload["ue"] !== "string"
  ) {
    return NextResponse.json({ error: "Missing field" }, { status: 400 });
  }

  const userId = req.payload["uid"];
  const ipSubmittedExpiryInSeconds: number = await redis.ttl(
    [USER_CONTACT_PREFIX, userId].join(":")
  );
  if (ipSubmittedExpiryInSeconds > 0) {
    return NextResponse.json(
      {
        message:
          "Only one message is allowed per day. Please try again tomorrow.",
      },
      { status: 429 }
    ); // Using 429 Too Many Requests status code
  }
  const reqBody = await req.json();
  const subject = sanitizeString(reqBody["subject"] as string);
  const message = sanitizeString(reqBody["message"] as string);
  const userName = sanitizeString(req.payload["un"]);
  const userEmail = sanitizeString(req.payload["ue"]);

  // Validate email if provided
  if (userEmail && !validateEmail(userEmail)) {
    return NextResponse.json(
      { message: "Invalid email format" },
      { status: 400 }
    );
  }

  // Check required fields
  if (!subject || !message) {
    return NextResponse.json(
      { message: "All fields are required" },
      { status: 400 }
    );
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
      from: process.env.AUTH_RESEND_FROM as string,
      to: [process.env.ADMIN_EMAIL as string],
      subject: `🔔 New Contact Form Submit: ${subject}`,
      html: createEmailTemplate(contactData),
      replyTo: userEmail,
    });
    if (sendResponse.error === null) {
      await redis.set([USER_CONTACT_PREFIX, userId].join(":"), "", {
        ex: 86400,
      }); // Store for 24 hours
      return NextResponse.json(
        { message: "Contact form submitted successfully" },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error storing contact form data:", error);
  }
  return NextResponse.json(
    { message: "Failed to submit contact form, please try again later" },
    { status: 500 }
  );
}

export const POST = withAuth(protectedPOST);
