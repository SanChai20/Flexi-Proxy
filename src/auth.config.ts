import { Provider } from "next-auth/providers";
import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Resend from "next-auth/providers/resend";
import Google from "next-auth/providers/google";
import WeChat from "next-auth/providers/wechat";
import { Redis } from "@upstash/redis";
import { Theme } from "@auth/core/types";
import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter";
import { redis } from "@/lib/redis";

function html(params: { url: string; host: string; theme: Theme }) {
  const { url, host, theme } = params;
  const escapedHost = host.replace(/\./g, "&#8203;.");
  const brandColor = theme.brandColor || "#3B82F6";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to ${escapedHost}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #374151;
      background-color: #F9FAFB;
      padding: 20px 0;
    }
    
    .container {
      max-width: 600px;
      margin: 30px auto;
      background: #FFFFFF;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }
    
    .header {
      background: ${brandColor};
      padding: 30px 20px;
      text-align: center;
    }
    
    .header h1 {
      color: white;
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 8px;
    }
    
    .header p {
      color: rgba(255, 255, 255, 0.9);
      font-size: 15px;
      margin: 0;
    }
    
    .content {
      padding: 40px 30px;
      text-align: center;
    }
    
    .content h2 {
      font-size: 20px;
      font-weight: 600;
      color: #1F2937;
      margin: 0 0 20px;
    }
    
    .content p {
      font-size: 16px;
      color: #6B7280;
      margin: 0 0 30px;
    }
    
    .button {
      display: inline-block;
      background: ${brandColor};
      color: white;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 500;
      border: none;
      box-shadow: 0 2px 6px rgba(59, 130, 246, 0.2);
      transition: background 0.2s;
    }
    
    .button:hover {
      background: #2563EB;
    }
    
    .security-note {
      background: #EFF6FF;
      border-radius: 6px;
      padding: 20px;
      margin: 30px 0;
      text-align: left;
    }
    
    .security-note h3 {
      font-size: 15px;
      font-weight: 600;
      color: #1E40AF;
      margin: 0 0 10px;
      display: flex;
      align-items: center;
    }
    
    .security-note h3::before {
      content: '🔒';
      margin-right: 8px;
    }
    
    .security-note p {
      font-size: 14px;
      color: #374151;
      margin: 0;
      line-height: 1.5;
    }
    
    .footer {
      background: #F9FAFB;
      padding: 20px 30px;
      text-align: center;
      border-top: 1px solid #E5E7EB;
    }
    
    .footer p {
      font-size: 13px;
      color: #9CA3AF;
      margin: 0;
    }
    
    @media (max-width: 600px) {
      .container {
        margin: 20px 15px;
      }
      
      .content {
        padding: 30px 20px;
      }
      
      .button {
        padding: 12px 24px;
        font-size: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <p>${escapedHost}</p>
    </div>
    
    <div class="content">
      <h2>Welcome back!</h2>
      <p>Click the button below to securely sign in to your account.</p>
      
      <a href="${url}" class="button" target="_blank">
        Sign In
      </a>
    </div>
    
    <div class="footer">
      <p>This email was sent automatically. Please do not reply.</p>
      <p>© ${new Date().getFullYear()} ${host}</p>
    </div>
  </div>
</body>
</html>
`;
}

// Email Text body (fallback for email clients that don't render HTML, e.g. feature phones)
function text({ url, host }: { url: string; host: string }) {
  return `Sign In to ${host}

Welcome back!

To sign in to your account, please click the link below:
${url}

This link will expire in 24 hours.

Security Notice:
If you didn't request this sign-in, you can safely ignore this email. This is an automated message to verify your identity.

---
This email was sent automatically. Please do not reply.
© ${new Date().getFullYear()} ${host}
`;
}

const providers: Provider[] = [
  Resend({
    apiKey: process.env.AUTH_RESEND_KEY,
    from: process.env.AUTH_RESEND_FROM,
    async sendVerificationRequest({
      identifier: to,
      url,
      provider: { from, apiKey },
      theme,
    }) {
      const { host } = new URL(url);
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
      });

      if (!res.ok)
        throw new Error("Resend error: " + JSON.stringify(await res.json()));
    },
  }),
];

if (
  process.env.AUTH_GOOGLE_ID !== undefined &&
  process.env.AUTH_GOOGLE_SECRET !== undefined
) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
}
if (
  process.env.AUTH_GITHUB_ID !== undefined &&
  process.env.AUTH_GITHUB_SECRET !== undefined
) {
  providers.push(
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    })
  );
}
if (
  process.env.AUTH_WECHAT_APP_ID !== undefined &&
  process.env.AUTH_WECHAT_APP_SECRET !== undefined
) {
  providers.push(
    WeChat({
      clientId: process.env.AUTH_WECHAT_APP_ID,
      clientSecret: process.env.AUTH_WECHAT_APP_SECRET,
      platformType: "OfficialAccount",
    })
  );
}

export const providerMap = providers
  .map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider();
      return { id: providerData.id, name: providerData.name };
    } else {
      return { id: provider.id, name: provider.name };
    }
  })
  .filter((provider) => provider.id !== "resend");

export default {
  providers: providers,
  adapter: UpstashRedisAdapter(redis),
  session: {
    maxAge: 86400 * 3, // 设置session的最大有效期（秒为单位）3 day - 24 * 60 * 60 * 3
  },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
} satisfies NextAuthConfig;
