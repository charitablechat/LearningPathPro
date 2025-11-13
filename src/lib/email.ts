export interface EmailProvider {
  sendEmail(params: EmailParams): Promise<boolean>;
}

export interface EmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

class ResendProvider implements EmailProvider {
  private apiKey: string;
  private fromEmail: string;

  constructor(apiKey: string, fromEmail: string = 'noreply@clearcoursestudio.com') {
    this.apiKey = apiKey;
    this.fromEmail = fromEmail;
  }

  async sendEmail(params: EmailParams): Promise<boolean> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: params.from || this.fromEmail,
          to: params.to,
          subject: params.subject,
          html: params.html,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send email via Resend:', error);
      return false;
    }
  }
}

class SendGridProvider implements EmailProvider {
  private apiKey: string;
  private fromEmail: string;

  constructor(apiKey: string, fromEmail: string = 'noreply@clearcoursestudio.com') {
    this.apiKey = apiKey;
    this.fromEmail = fromEmail;
  }

  async sendEmail(params: EmailParams): Promise<boolean> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: params.to }] }],
          from: { email: params.from || this.fromEmail },
          subject: params.subject,
          content: [{ type: 'text/html', value: params.html }],
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send email via SendGrid:', error);
      return false;
    }
  }
}

class ConsoleProvider implements EmailProvider {
  async sendEmail(params: EmailParams): Promise<boolean> {
    console.log('=== EMAIL (Console Provider) ===');
    console.log('To:', params.to);
    console.log('Subject:', params.subject);
    console.log('HTML:', params.html);
    console.log('================================');
    return true;
  }
}

export function createEmailProvider(): EmailProvider {
  const provider = import.meta.env.VITE_EMAIL_PROVIDER || 'console';
  const apiKey = import.meta.env.VITE_EMAIL_API_KEY || '';
  const fromEmail = import.meta.env.VITE_EMAIL_FROM || 'noreply@clearcoursestudio.com';

  switch (provider.toLowerCase()) {
    case 'resend':
      return new ResendProvider(apiKey, fromEmail);
    case 'sendgrid':
      return new SendGridProvider(apiKey, fromEmail);
    case 'console':
    default:
      return new ConsoleProvider();
  }
}

export const emailService = createEmailProvider();

const emailFooter = `
  <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px;">
    <p style="margin: 0 0 10px 0;"><strong>Clear Course Studio</strong></p>
    <p style="margin: 0 0 10px 0;">Modern Learning Management Platform</p>
    <p style="margin: 0 0 10px 0;">
      <a href="https://clearcoursestudio.com/terms" style="color: #3B82F6; text-decoration: none; margin: 0 8px;">Terms</a> |
      <a href="https://clearcoursestudio.com/privacy" style="color: #3B82F6; text-decoration: none; margin: 0 8px;">Privacy</a> |
      <a href="https://clearcoursestudio.com/contact" style="color: #3B82F6; text-decoration: none; margin: 0 8px;">Contact</a>
    </p>
    <p style="margin: 0 0 10px 0;">Email: support@clearcoursestudio.com</p>
    <p style="margin: 0 0 10px 0;">You received this email because you have an account with Clear Course Studio.</p>
    <p style="margin: 0;">© 2025 Clear Course Studio. All rights reserved.</p>
  </div>
`;

const marketingFooter = `
  <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px;">
    <p style="margin: 0 0 10px 0;"><strong>Clear Course Studio</strong></p>
    <p style="margin: 0 0 10px 0;">Modern Learning Management Platform</p>
    <p style="margin: 0 0 10px 0;">
      <a href="https://clearcoursestudio.com/terms" style="color: #3B82F6; text-decoration: none; margin: 0 8px;">Terms</a> |
      <a href="https://clearcoursestudio.com/privacy" style="color: #3B82F6; text-decoration: none; margin: 0 8px;">Privacy</a> |
      <a href="https://clearcoursestudio.com/contact" style="color: #3B82F6; text-decoration: none; margin: 0 8px;">Contact</a>
    </p>
    <p style="margin: 0 0 10px 0;">Email: support@clearcoursestudio.com</p>
    <p style="margin: 0 0 10px 0;">
      You received this email because you opted in to receive updates from Clear Course Studio.
      <a href="https://clearcoursestudio.com/profile/settings" style="color: #3B82F6; text-decoration: none;">Manage preferences</a>
    </p>
    <p style="margin: 0;">© 2025 Clear Course Studio. All rights reserved.</p>
  </div>
`;

export const emailTemplates = {
  welcome: (organizationName: string, ownerName: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Clear Course Studio!</h1>
        </div>
        <div class="content">
          <p>Hi ${ownerName},</p>
          <p>Congratulations on creating <strong>${organizationName}</strong>! Your learning platform is now live and ready to go.</p>
          <p>Here's what you can do next:</p>
          <ul>
            <li>Customize your branding with colors and logos</li>
            <li>Create your first course</li>
            <li>Invite instructors and learners</li>
            <li>Explore advanced features</li>
          </ul>
          <p>Your 14-day free trial has started. No credit card required!</p>
          <a href="https://clearcoursestudio.com/dashboard" class="button">Go to Dashboard</a>
          ${emailFooter}
        </div>
      </div>
    </body>
    </html>
  `,

  invitation: (organizationName: string, inviterName: string, role: string, inviteLink: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>You're Invited!</h1>
        </div>
        <div class="content">
          <p><strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> on Clear Course Studio as a <strong>${role}</strong>.</p>
          <p>Clear Course Studio is a modern learning management platform where you can create, manage, and take courses.</p>
          <a href="${inviteLink}" class="button">Accept Invitation</a>
          <p style="margin-top: 20px; color: #64748b; font-size: 14px;">This invitation expires in 7 days.</p>
          ${emailFooter}
        </div>
      </div>
    </body>
    </html>
  `,

  trialEnding: (organizationName: string, daysLeft: number) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Trial is Ending Soon</h1>
        </div>
        <div class="content">
          <p>Hi there,</p>
          <p>Your free trial for <strong>${organizationName}</strong> expires in <strong>${daysLeft} days</strong>.</p>
          <p>To continue using Clear Course Studio without interruption, please select a subscription plan that fits your needs.</p>
          <a href="https://clearcoursestudio.com/pricing" class="button">View Plans</a>
          ${marketingFooter}
        </div>
      </div>
    </body>
    </html>
  `,

  subscriptionActivated: (organizationName: string, planName: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Subscription Activated!</h1>
        </div>
        <div class="content">
          <p>Great news!</p>
          <p>Your <strong>${planName}</strong> subscription for <strong>${organizationName}</strong> is now active.</p>
          <p>You now have full access to all the features included in your plan. Thank you for choosing Clear Course Studio!</p>
          <a href="https://clearcoursestudio.com/dashboard" class="button">Go to Dashboard</a>
          ${emailFooter}
        </div>
      </div>
    </body>
    </html>
  `,

  paymentFailed: (organizationName: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Failed</h1>
        </div>
        <div class="content">
          <p>We were unable to process your payment for <strong>${organizationName}</strong>.</p>
          <p>Please update your payment method to avoid service interruption.</p>
          <a href="https://clearcoursestudio.com/settings/subscription" class="button">Update Payment Method</a>
          ${emailFooter}
        </div>
      </div>
    </body>
    </html>
  `,
};
