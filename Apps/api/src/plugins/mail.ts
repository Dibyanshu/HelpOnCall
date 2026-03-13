import fp from "fastify-plugin";
import nodemailer, { type Transporter } from "nodemailer";
import type { FastifyInstance } from "fastify";
import { env } from "../config/env.js";

type SendMailInput = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
};

type MailService = {
  enabled: boolean;
  send(input: SendMailInput): Promise<void>;
  verify(): Promise<boolean>;
};

async function mailPlugin(fastify: FastifyInstance) {
  let transporter: Transporter | null = null;

  if (env.MAIL_ENABLED) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
      },
      connectionTimeout: env.SMTP_CONNECTION_TIMEOUT_MS,
      greetingTimeout: env.SMTP_GREETING_TIMEOUT_MS
    });

    try {
      await transporter.verify();
      fastify.log.info("SMTP transporter initialized successfully");
    } catch (error) {
      fastify.log.error({ error }, "SMTP verification failed");
      throw error;
    }
  }

  const mailService: MailService = {
    enabled: env.MAIL_ENABLED,
    async verify() {
      if (!transporter) {
        return false;
      }

      await transporter.verify();
      return true;
    },
    async send(input) {
      if (!transporter) {
        fastify.log.info({ subject: input.subject, to: input.to }, "Email skipped because MAIL_ENABLED=false");
        return;
      }

      await transporter.sendMail({
        from: env.MAIL_FROM,
        to: input.to,
        subject: input.subject,
        text: input.text,
        html: input.html,
        replyTo: env.MAIL_REPLY_TO
      });
    }
  };

  fastify.decorate("mail", mailService);
}

export default fp(mailPlugin);