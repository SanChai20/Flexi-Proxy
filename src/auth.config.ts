
import { Provider } from "next-auth/providers";
import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Resend from "next-auth/providers/resend";
import Google from "next-auth/providers/google";
import WeChat from "next-auth/providers/wechat";
import { Redis } from "@upstash/redis";
import { Theme } from "@auth/core/types";
import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter";

function html(params: { url: string; host: string; theme: Theme }) {
    const { url, host, theme } = params
    const escapedHost = host.replace(/\./g, "&#8203;.")
    const brandColor = theme.brandColor || "#4F46E5"
    const color = {
        background: "#F8FAFC",
        text: "#1E293B",
        secondaryText: "#64748B",
        mainBackground: "#FFFFFF",
        buttonBackground: `linear-gradient(135deg, ${brandColor} 0%, #7C3AED 100%)`,
        buttonBorder: brandColor,
        buttonText: "#FFFFFF",
        cardShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        accent: "#F1F5F9"
    }
 
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to ${escapedHost}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: ${color.text};
      background: ${color.background};
    }
    
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: ${color.mainBackground};
      border-radius: 16px;
      box-shadow: ${color.cardShadow};
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      text-align: center;
      position: relative;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="1" fill="white" opacity="0.1"/><circle cx="10" cy="90" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
      opacity: 0.6;
    }
    
    .logo {
      width: 64px;
      height: 64px;
      background: white;
      border-radius: 16px;
      margin: 0 auto 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      position: relative;
      z-index: 1;
    }
    
    .logo::before {
      content: '🔐';
      font-size: 28px;
    }
    
    .header-title {
      color: white;
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
      position: relative;
      z-index: 1;
    }
    
    .header-subtitle {
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      font-weight: 400;
      position: relative;
      z-index: 1;
    }
    
    .content {
      padding: 50px 40px;
      text-align: center;
    }
    
    .welcome-text {
      font-size: 20px;
      font-weight: 600;
      color: ${color.text};
      margin-bottom: 12px;
    }
    
    .description {
      font-size: 16px;
      color: ${color.secondaryText};
      margin-bottom: 40px;
      line-height: 1.6;
    }
    
    .button-container {
      margin: 40px 0;
    }
    
    .signin-button {
      display: inline-block;
      background: ${color.buttonBackground};
      color: ${color.buttonText};
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      border: none;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .signin-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }
    
    .signin-button:hover::before {
      left: 100%;
    }
    
    .security-note {
      background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
      border: 1px solid #F59E0B;
      border-radius: 16px;
      padding: 24px;
      margin: 40px 0;
      position: relative;
      overflow: hidden;
    }
    
    .security-note::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: linear-gradient(to bottom, #F59E0B, #D97706);
    }
    
    .security-note-header {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
    }
    
    .security-note .icon {
      font-size: 24px;
      margin-right: 8px;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    }
    
    .security-note .title {
      font-size: 16px;
      font-weight: 700;
      color: #92400E;
      margin: 0;
    }
    
    .security-note .text {
      font-size: 14px;
      color: #A16207;
      line-height: 1.6;
      text-align: center;
      margin: 0;
    }
    
    .security-features {
      display: flex;
      justify-content: space-around;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid rgba(245, 158, 11, 0.2);
    }
    
    .security-feature {
      text-align: center;
      flex: 1;
    }
    
    .security-feature-icon {
      font-size: 18px;
      margin-bottom: 4px;
      display: block;
    }
    
    .security-feature-text {
      font-size: 11px;
      color: #A16207;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .footer {
      background: ${color.accent};
      padding: 25px 40px;
      text-align: center;
      border-top: 1px solid #E2E8F0;
    }
    
    .footer-text {
      font-size: 14px;
      color: ${color.secondaryText};
      margin-bottom: 8px;
    }
    
    .footer-link {
      font-size: 12px;
      color: ${brandColor};
      text-decoration: none;
    }
    
    @media (max-width: 640px) {
      .container {
        margin: 20px auto;
        border-radius: 12px;
      }
      
      .header {
        padding: 30px 20px;
      }
      
      .content {
        padding: 40px 20px;
      }
      
      .header-title {
        font-size: 24px;
      }
      
      .welcome-text {
        font-size: 18px;
      }
      
      .signin-button {
        padding: 14px 30px;
        font-size: 15px;
      }
      
      .security-features {
        flex-direction: column;
        gap: 12px;
      }
      
      .security-feature {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      
      .security-feature-icon {
        margin-bottom: 0;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo"></div>
      <h1 class="header-title">Secure Sign In</h1>
      <p class="header-subtitle">Verify your identity to continue</p>
    </div>
    
    <div class="content">
      <h2 class="welcome-text">Welcome back to <strong>${escapedHost}</strong></h2>
      <p class="description">
        Click the button below to complete your secure sign-in. This link will expire in 24 hours.
      </p>
      
      <div class="button-container">
        <a href="${url}" class="signin-button" target="_blank">
          Sign In Securely →
        </a>
      </div>
      
      <div class="security-note">
        <div class="security-note-header">
          <span class="icon">🛡️</span>
          <h3 class="title">Security Notice</h3>
        </div>
        <p class="text">
          This is an automated security verification. If you didn't request this sign-in, you can safely ignore this email.
        </p>
        <div class="security-features">
          <div class="security-feature">
            <span class="security-feature-icon">⏰</span>
            <span class="security-feature-text">24h Expiry</span>
          </div>
          <div class="security-feature">
            <span class="security-feature-icon">🔒</span>
            <span class="security-feature-text">Encrypted</span>
          </div>
          <div class="security-feature">
            <span class="security-feature-icon">✅</span>
            <span class="security-feature-text">Verified</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p class="footer-text">This email was sent automatically. Please do not reply.</p>
      <p class="footer-text">© ${new Date().getFullYear()} ${host}</p>
    </div>
  </div>
</body>
</html>
`
}
 
// Email Text body (fallback for email clients that don't render HTML, e.g. feature phones)
function text({ url, host }: { url: string; host: string }) {
    return `🔐 Secure Sign-In Verification

Welcome back to ${host}!

To ensure your account security, please click the following link to complete your sign-in verification:

${url}

🛡️ Security Notice:
• This verification link will automatically expire in 24 hours
• If you didn't request this sign-in, you can safely ignore this email
• Please confirm this is your own sign-in request

---
This email was sent automatically. Please do not reply.

© ${new Date().getFullYear()} ${host}
`
}

const providers: Provider[] = [
    Resend({
        apiKey: process.env.AUTH_RESEND_KEY,
        from: process.env.AUTH_RESEND_FROM,
        async sendVerificationRequest({
            identifier: to,
            url,
            provider: { from, apiKey },
            theme
        }) {
            const { host } = new URL(url)
            const res = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    from,
                    to,
                    subject: `Sign in to ${host}`,
                    html: html({ url, host, theme }),
                    text: text({ url, host }),
                }),
            })

            if (!res.ok)
                throw new Error("Resend error: " + JSON.stringify(await res.json()))
        },
    }), 
    Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    GitHub({
        clientId: process.env.AUTH_GITHUB_ID,
        clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    WeChat({
        clientId: process.env.AUTH_WECHAT_APP_ID,
        clientSecret: process.env.AUTH_WECHAT_APP_SECRET,
        platformType: "OfficialAccount",
    })
];

export const providerMap = providers
.map((provider) => {
    if (typeof provider === "function") {
        const providerData = provider()
        return { id: providerData.id, name: providerData.name }
    } else {
        return { id: provider.id, name: provider.name }
    }
})
.filter((provider) => provider.id !== "resend");

export default { 
    providers: providers,
    adapter: UpstashRedisAdapter(new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })),
    session: {
        maxAge: 86400 * 3, // 设置session的最大有效期（秒为单位）3 day - 24 * 60 * 60 * 3
    },
    callbacks: {
        session({session, user}) {
            session.user.id = user.id;
            return session;
        }
    } 
} satisfies NextAuthConfig