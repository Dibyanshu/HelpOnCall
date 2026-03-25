import "fastify";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { AuthTokenPayload, Role } from "./auth.js";

declare module "fastify" {
  export interface MailSendInput {
    to: string | string[];
    subject: string;
    text: string;
    html?: string;
  }

  export interface FastifyRequest {
    authUser?: AuthTokenPayload;
  }

  export interface FastifyInstance {
    authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    authorize(
      requiredRoles: Role[],
      requiredPermission?: string
    ): (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    mail: {
      enabled: boolean;
      verify: () => Promise<boolean>;
      send: (input: MailSendInput) => Promise<void>;
    };
  }
}
