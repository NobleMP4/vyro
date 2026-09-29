import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';
import { EnvironmentVariables, NodeEnv } from '../config/env.validation';

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/**
 * Sends transactional emails through SMTP when SMTP_HOST is configured.
 * Without SMTP, messages are written to the logs so password reset stays
 * usable in development — in production this is reported as a warning.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter?: Transporter;

  constructor(private readonly config: ConfigService<EnvironmentVariables, true>) {
    const host = config.get('SMTP_HOST', { infer: true });
    if (host) {
      const user = config.get('SMTP_USER', { infer: true });
      this.transporter = createTransport({
        host,
        port: config.get('SMTP_PORT', { infer: true }) ?? 587,
        secure: config.get('SMTP_SECURE', { infer: true }) ?? false,
        auth: user ? { user, pass: config.get('SMTP_PASSWORD', { infer: true }) } : undefined,
      });
    }
  }

  async send(message: MailMessage): Promise<void> {
    if (!this.transporter) {
      const production = this.config.get('NODE_ENV', { infer: true }) === NodeEnv.Production;
      const log = `Email NOT sent (SMTP_HOST not configured) → ${message.to}: ${message.subject}`;
      if (production) {
        this.logger.warn(log);
      } else {
        this.logger.log(`${log}\n${message.text}`);
      }
      return;
    }
    await this.transporter.sendMail({
      from: this.config.get('MAIL_FROM', { infer: true }),
      ...message,
    });
  }
}
