import twilio from 'twilio';

export interface SMSSendParams {
  to: string;
  body: string;
}

export interface SMSSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface SMSProvider {
  sendSMS(params: SMSSendParams): Promise<SMSSendResult>;
}

export class TwilioProvider implements SMSProvider {
  private client?: twilio.Twilio;
  private fromNumber: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_FROM_NUMBER || '+1234567890';

    if (accountSid && authToken) {
      this.client = twilio(accountSid, authToken);
    } else {
      console.warn('Twilio credentials not found. TwilioProvider will operate in mock/log mode.');
    }
  }

  async sendSMS(params: SMSSendParams): Promise<SMSSendResult> {
    const { to, body } = params;
    console.log(`[SMS Send] To: ${to} | Body: ${body}`);

    if (!this.client) {
      return {
        success: true,
        messageId: `mock-sms-${Date.now()}`,
      };
    }

    try {
      const message = await this.client.messages.create({
        body,
        from: this.fromNumber,
        to,
      });
      return {
        success: true,
        messageId: message.sid,
      };
    } catch (err: any) {
      console.error('Failed to send SMS via Twilio:', err);
      return {
        success: false,
        error: err.message || 'Unknown Twilio error',
      };
    }
  }
}

// Default exported provider instance
export const smsProvider: SMSProvider = new TwilioProvider();
