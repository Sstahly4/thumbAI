import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailTemplateProps {
  url: string;
  email: string;
  name?: string;
}

export const sendVerificationEmail = async ({ url, email, name }: EmailTemplateProps) => {
  const { data, error } = await resend.emails.send({
    from: 'ThumbAI <no-reply@thumbai.dev>',
    to: email,
    subject: 'Sign in to ThumbAI',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Sign in to ThumbAI</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              color: #7C3AED;
              font-size: 24px;
              font-weight: bold;
              text-decoration: none;
            }
            .button {
              display: inline-block;
              background-color: #7C3AED;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <a href="https://thumbai.dev" class="logo">ThumbAI</a>
          </div>
          <h1>Welcome to ThumbAI!</h1>
          <p>Hi${name ? ` ${name}` : ''},</p>
          <p>Click the button below to sign in to your ThumbAI account:</p>
          <div style="text-align: center;">
            <a href="${url}" class="button">Sign In</a>
          </div>
          <p>If you didn't request this email, you can safely ignore it.</p>
          <p>This link will expire in 24 hours.</p>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ThumbAI. All rights reserved.</p>
            <p>This email was sent to ${email}</p>
          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }

  return data;
};

export const sendPasswordResetEmail = async ({ url, email, name }: EmailTemplateProps) => {
  const { data, error } = await resend.emails.send({
    from: 'ThumbAI <no-reply@thumbai.dev>',
    to: email,
    subject: 'Reset Your ThumbAI Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              color: #7C3AED;
              font-size: 24px;
              font-weight: bold;
              text-decoration: none;
            }
            .button {
              display: inline-block;
              background-color: #7C3AED;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <a href="https://thumbai.dev" class="logo">ThumbAI</a>
          </div>
          <h1>Reset Your Password</h1>
          <p>Hi${name ? ` ${name}` : ''},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center;">
            <a href="${url}" class="button">Reset Password</a>
          </div>
          <p>If you didn't request this password reset, you can safely ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ThumbAI. All rights reserved.</p>
            <p>This email was sent to ${email}</p>
          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }

  return data;
}; 