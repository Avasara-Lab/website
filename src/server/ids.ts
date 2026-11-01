import { createHash, randomBytes, randomUUID } from "node:crypto";

export function createId() {
  return randomUUID();
}

export function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}
