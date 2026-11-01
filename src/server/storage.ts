import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { PutObjectCommand, GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

export interface ObjectStore {
  kind: "local" | "r2";
  put(key: string, body: Buffer, contentType: string): Promise<void>;
  get(key: string): Promise<Buffer>;
}

function localRoot() {
  return path.join(process.cwd(), ".data", "uploads");
}

function localStore(): ObjectStore {
  return {
    kind: "local",
    async put(key, body) {
      const target = path.join(localRoot(), key);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, body);
    },
    async get(key) {
      return readFile(path.join(localRoot(), key));
    },
  };
}

function r2Store(): ObjectStore {
  const accountId = process.env.R2_ACCOUNT_ID ?? "";
  const bucket = process.env.R2_BUCKET ?? "";
  const client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
    },
  });
  return {
    kind: "r2",
    async put(key, body, contentType) {
      await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }));
    },
    async get(key) {
      const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
      const bytes = await result.Body?.transformToByteArray();
      if (!bytes) throw new Error("The stored object was empty.");
      return Buffer.from(bytes);
    },
  };
}

export function storageConfiguredForR2() {
  return Boolean(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET);
}

export function createObjectStore(): ObjectStore {
  return storageConfiguredForR2() ? r2Store() : localStore();
}

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const ALLOWED = new Map([
  [".csv", "text/csv"],
  [".txt", "text/plain"],
  [".md", "text/markdown"],
  [".json", "application/json"],
  [".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  [".pdf", "application/pdf"],
  [".wav", "audio/wav"],
]);

export function inspectUpload(filename: string, size: number) {
  const extension = path.extname(filename).toLowerCase();
  const mediaType = ALLOWED.get(extension);
  if (!mediaType) {
    throw new Error("Upload a CSV, Excel, PDF, TXT, JSON, Markdown, or WAV file.");
  }
  if (size <= 0 || size > MAX_UPLOAD_BYTES) {
    throw new Error("The file must be between 1 byte and 10 MB.");
  }
  const safeName = path.basename(filename).replace(/[^\w.\- ()]+/g, "_").slice(0, 180);
  return { extension, mediaType, safeName };
}
