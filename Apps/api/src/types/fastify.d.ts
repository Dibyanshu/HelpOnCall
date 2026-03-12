import "fastify";
import type { AuthTokenPayload } from "./auth.js";

declare module "fastify" {
  interface FastifyRequest {
    authUser?: AuthTokenPayload;
  }
}
