import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { AuthTokenPayload, Role } from "../types/auth.js";
import { hasPermission } from "../types/auth.js";
import { env } from "../config/env.js";

async function authPlugin(fastify: FastifyInstance) {
  await fastify.register(jwt, {
    secret: env.JWT_SECRET
  });

  fastify.decorate(
    "authenticate",
    async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      try {
        const payload = await request.jwtVerify<AuthTokenPayload>();
        request.authUser = payload;
      } catch {
        return reply.code(401).send({ message: "Unauthorized" });
      }
    }
  );

  fastify.decorate(
    "authorize",
    function authorize(requiredRoles: Role[], requiredPermission?: string) {
      return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
        const user = request.authUser;

        if (!user) {
          reply.code(401).send({ message: "Unauthorized" });
          return;
        }

        if (!requiredRoles.includes(user.role)) {
          reply.code(403).send({ message: "Forbidden" });
          return;
        }

        if (requiredPermission && !hasPermission(user.role, requiredPermission)) {
          return reply.code(403).send({ message: "Missing permission" });
        }
      };
    }
  );
}

export default fp(authPlugin);
