import { Resend } from 'resend';

export interface EmailSendParams {
  to: string;
  subject: string;
  html: string;
}

export interface EmailSendResult {
  success: boolean;
  id?: string;
  error?: string;
}

export interface EmailProvider {
  sendEmail(params: EmailSendParams): Promise<EmailSendResult>;
}

export class ResendProvider implements EmailProvider {
  private resend?: Resend;
  private fromEmail: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.fromEmail = process.env.RESEND_FROM_EMAIL || 'Locksmith Platform <onboarding@resend.dev>';

    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      console.warn('Resend API Key not found. ResendProvider will operate in mock/log mode.');
    }
  }

  async sendEmail(params: EmailSendParams): Promise<EmailSendResult> {
    const { to, subject, html } = params;
    console.log(`[Email Send] To: ${to} | Subject: ${subject}`);

    if (!this.resend) {
      return {
        success: true,
        id: `mock-email-${Date.now()}`,
      };
    }

    try {
      const response = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
      });

      if (response.error) {
        throw response.error;
      }

      return {
        success: true,
        id: response.data?.id,
      };
    } catch (err: any) {
      console.error('Failed to send Email via Resend:', err);
      return {
        success: false,
        error: err.message || 'Unknown Resend error',
      };
    }
  }
}

export const emailProvider: EmailProvider = new ResendProvider();
