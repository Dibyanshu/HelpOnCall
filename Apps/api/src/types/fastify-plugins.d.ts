import "fastify";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { Role } from "./auth.js";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authorize: (
      requiredRoles: Role[],
      requiredPermission?: string
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
