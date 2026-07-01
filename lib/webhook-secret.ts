import crypto from "crypto";

export function createWebhookSecret() {
  return `wh_${crypto.randomBytes(32).toString("hex")}`;
}

export function hashWebhookSecret(secret: string) {
  return crypto.createHash("sha256").update(secret).digest("hex");
}

export function verifyWebhookSecret(params: {
  providedSecret: string | null;
  storedHash: string;
}) {
  if (!params.providedSecret) {
    return false;
  }

  const providedHash = hashWebhookSecret(params.providedSecret);

  const providedBuffer = Buffer.from(providedHash);
  const storedBuffer = Buffer.from(params.storedHash);

  if (providedBuffer.length !== storedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(providedBuffer, storedBuffer);
}
