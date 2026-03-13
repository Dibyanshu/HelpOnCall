import type { FastifyPluginAsync } from "fastify";

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/health", async () => {
    return { status: "ok" };
  });

  fastify.get("/health/mail", async (request, reply) => {
    if (!fastify.mail.enabled) {
      return reply.code(503).send({
        status: "mail_disabled"
      });
    }

    const startedAt = Date.now();

    try {
      await fastify.mail.verify();

      return {
        status: "ok",
        smtp: "reachable",
        latencyMs: Date.now() - startedAt
      };
    } catch (error) {
      request.log.error({ error }, "SMTP health check failed");

      return reply.code(503).send({
        status: "error",
        smtp: "unreachable",
        latencyMs: Date.now() - startedAt
      });
    }
  });
};

export default healthRoutes;
