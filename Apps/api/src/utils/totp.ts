import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

type SupportedTotpAlgorithm = "SHA1";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

function base32Decode(input: string): Buffer {
  const normalized = input.toUpperCase().replace(/\s+/g, "").replace(/-/g, "").replace(/=+$/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (const char of normalized) {
    const index = BASE32_ALPHABET.indexOf(char);

    if (index < 0) {
      throw new Error("Invalid Base32 secret");
    }

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

function getAlgorithmName(algorithm: SupportedTotpAlgorithm): "sha1" {
  if (algorithm === "SHA1") {
    return "sha1";
  }

  throw new Error("Unsupported TOTP algorithm");
}

function normalizeCode(input: string): string {
  return input.replace(/\s+/g, "").trim();
}

export function generateTotpSecret(byteLength = 20): string {
  return base32Encode(randomBytes(byteLength));
}

export function generateTotpCode(input: {
  secretBase32: string;
  periodSeconds: number;
  digits: number;
  algorithm: SupportedTotpAlgorithm;
  timestampMs?: number;
}): string {
  const timestampMs = input.timestampMs ?? Date.now();
  const counter = Math.floor(timestampMs / 1000 / input.periodSeconds);

  const counterBuffer = Buffer.alloc(8);
  const high = Math.floor(counter / 0x100000000);
  const low = counter % 0x100000000;

  counterBuffer.writeUInt32BE(high, 0);
  counterBuffer.writeUInt32BE(low, 4);

  const secret = base32Decode(input.secretBase32);
  const digest = createHmac(getAlgorithmName(input.algorithm), secret).update(counterBuffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const code = binary % 10 ** input.digits;
  return code.toString().padStart(input.digits, "0");
}

export function verifyTotpCode(input: {
  secretBase32: string;
  code: string;
  periodSeconds: number;
  digits: number;
  algorithm: SupportedTotpAlgorithm;
  window: number;
  timestampMs?: number;
}): boolean {
  const normalizedCode = normalizeCode(input.code);

  if (!/^\d+$/.test(normalizedCode)) {
    return false;
  }

  if (normalizedCode.length !== input.digits) {
    return false;
  }

  const timestampMs = input.timestampMs ?? Date.now();

  for (let offset = -input.window; offset <= input.window; offset += 1) {
    const expected = generateTotpCode({
      secretBase32: input.secretBase32,
      periodSeconds: input.periodSeconds,
      digits: input.digits,
      algorithm: input.algorithm,
      timestampMs: timestampMs + offset * input.periodSeconds * 1000
    });

    if (timingSafeEqual(Buffer.from(expected), Buffer.from(normalizedCode))) {
      return true;
    }
  }

  return false;
}

export function buildOtpAuthUri(input: {
  secretBase32: string;
  issuer: string;
  accountName: string;
  periodSeconds: number;
  digits: number;
  algorithm: SupportedTotpAlgorithm;
}): string {
  const label = `${input.issuer}:${input.accountName}`;
  const params = new URLSearchParams({
    secret: input.secretBase32,
    issuer: input.issuer,
    period: String(input.periodSeconds),
    digits: String(input.digits),
    algorithm: input.algorithm
  });

  return `otpauth://totp/${encodeURIComponent(label)}?${params.toString()}`;
}
