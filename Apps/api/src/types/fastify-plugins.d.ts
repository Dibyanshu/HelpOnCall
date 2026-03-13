import "fastify";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { Role } from "./auth.js";

declare module "fastify" {
  interface MailSendInput {
    to: string | string[];
    subject: string;
    text: string;
    html?: string;
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authorize: (
      requiredRoles: Role[],
      requiredPermission?: string
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    mail: {
      enabled: boolean;
      verify: () => Promise<boolean>;
      send: (input: MailSendInput) => Promise<void>;
    };
  }
}
