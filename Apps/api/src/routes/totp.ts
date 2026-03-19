import { eq, lt } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { env } from "../config/env.js";
import { buildAuditCreateFields, buildAuditUpdateFields } from "../db/audit.js";
import { db } from "../db/index.js";
import { totpChallenges } from "../db/schema.js";
import { buildOtpAuthUri, generateTotpSecret, verifyTotpCode } from "../utils/totp.js";

const createChallengeSchema = z.object({
  purpose: z.string().trim().min(3).max(64).regex(/^[a-z0-9._-]+$/),
  subject: z.string().trim().min(1).max(120).optional()
});

const verifyChallengeSchema = z.object({
  challengeId: z.string().uuid(),
  code: z.string().trim().min(4).max(12)
});

const SYSTEM_ACCOUNT_NAME = "public";

const totpRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/totp/challenges", async (request, reply) => {
    const bodyParse = createChallengeSchema.safeParse(request.body);

    if (!bodyParse.success) {
      return reply.code(400).send({
        message: "Invalid request body",
        errors: bodyParse.error.flatten()
      });
    }

    const now = new Date();

    // Keep the table small and avoid stale secrets living indefinitely.
    await db
      .delete(totpChallenges)
      .where(lt(totpChallenges.expiresAt, now));

    const secretBase32 = generateTotpSecret();
    const expiresAt = new Date(now.getTime() + env.TOTP_CHALLENGE_TTL_SECONDS * 1000);
    const accountName = bodyParse.data.subject ?? SYSTEM_ACCOUNT_NAME;

    const inserted = await db
      .insert(totpChallenges)
      .values({
        purpose: bodyParse.data.purpose,
        subject: bodyParse.data.subject,
        secretBase32,
        algorithm: "SHA1",
        digits: env.TOTP_DIGITS,
        periodSeconds: env.TOTP_PERIOD_SECONDS,
        expiresAt,
        ...buildAuditCreateFields("public_totp_challenge")
      })
      .returning({
        challengeId: totpChallenges.challengeId,
        digits: totpChallenges.digits,
        periodSeconds: totpChallenges.periodSeconds,
        expiresAt: totpChallenges.expiresAt
      });

    const challenge = inserted[0];
    const otpAuthUrl = buildOtpAuthUri({
      secretBase32,
      issuer: env.TOTP_ISSUER,
      accountName,
      periodSeconds: challenge.periodSeconds,
      digits: challenge.digits,
      algorithm: "SHA1"
    });

    return reply.code(201).send({
      message: "TOTP challenge created",
      challenge: {
        challengeId: challenge.challengeId,
        secretBase32,
        issuer: env.TOTP_ISSUER,
        periodSeconds: challenge.periodSeconds,
        digits: challenge.digits,
        expiresAt: challenge.expiresAt,
        otpAuthUrl
      }
    });
  });

  fastify.post("/totp/challenges/verify", async (request, reply) => {
    const bodyParse = verifyChallengeSchema.safeParse(request.body);

    if (!bodyParse.success) {
      return reply.code(400).send({
        message: "Invalid request body",
        errors: bodyParse.error.flatten()
      });
    }

    const existing = await db
      .select({
        id: totpChallenges.id,
        challengeId: totpChallenges.challengeId,
        secretBase32: totpChallenges.secretBase32,
        algorithm: totpChallenges.algorithm,
        digits: totpChallenges.digits,
        periodSeconds: totpChallenges.periodSeconds,
        verifiedAt: totpChallenges.verifiedAt,
        expiresAt: totpChallenges.expiresAt,
        consumedAt: totpChallenges.consumedAt
      })
      .from(totpChallenges)
      .where(eq(totpChallenges.challengeId, bodyParse.data.challengeId))
      .limit(1);

    const challenge = existing[0];

    if (!challenge) {
      return reply.code(404).send({ message: "TOTP challenge not found" });
    }

    if (challenge.consumedAt) {
      return reply.code(400).send({ message: "TOTP challenge is already used" });
    }

    if (challenge.expiresAt.getTime() < Date.now()) {
      return reply.code(400).send({ message: "TOTP challenge has expired" });
    }

    if (!challenge.verifiedAt) {
      const isValid = verifyTotpCode({
        secretBase32: challenge.secretBase32,
        code: bodyParse.data.code,
        periodSeconds: challenge.periodSeconds,
        digits: challenge.digits,
        algorithm: "SHA1",
        window: env.TOTP_VALIDATION_WINDOW
      });

      if (!isValid) {
        return reply.code(400).send({ message: "Invalid TOTP code" });
      }

      const updated = await db
        .update(totpChallenges)
        .set({
          verifiedAt: new Date(),
          ...buildAuditUpdateFields()
        })
        .where(eq(totpChallenges.id, challenge.id))
        .returning({
          challengeId: totpChallenges.challengeId,
          verifiedAt: totpChallenges.verifiedAt
        });

      const updatedChallenge = updated[0];

      return reply.send({
        message: "TOTP verification successful",
        challenge: {
          challengeId: updatedChallenge.challengeId,
          verifiedAt: updatedChallenge.verifiedAt
        }
      });
    }

    return reply.send({
      message: "TOTP challenge already verified",
      challenge: {
        challengeId: challenge.challengeId,
        verifiedAt: challenge.verifiedAt
      }
    });
  });
};

export default totpRoutes;
