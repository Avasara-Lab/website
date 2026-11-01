import assert from "node:assert/strict";
import { test } from "node:test";
import { META_API_BASE } from "@/server/modules/meta-ai/catalog";
import { createMetaProvider, wrapUntrustedDocument } from "@/server/modules/meta-ai/provider";

test("missing credentials block the call and do not use another host", async () => {
  let called = false;
  const provider = createMetaProvider({
    apiKey: "",
    fetchImpl: async () => {
      called = true;
      return new Response("{}");
    },
  });
  const result = await provider.completeChat({ model: "muse-spark-1.3", messages: [{ role: "user", content: "Hello" }] });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.blocked, true);
  assert.equal(called, false);
  assert.equal(provider.baseUrl, META_API_BASE);
});

test("chat completions use the documented path and bearer auth", async () => {
  const seen: { url?: string; authorization?: string; body?: { model?: string; messages?: { content: string }[] } } = {};
  const provider = createMetaProvider({
    apiKey: "test-key",
    baseUrl: META_API_BASE,
    retries: 0,
    fetchImpl: async (url, init) => {
      seen.url = String(url);
      seen.authorization = new Headers(init?.headers).get("authorization") ?? "";
      seen.body = JSON.parse(String(init?.body));
      return Response.json({
        choices: [{ message: { content: "A pattern is repeating." } }],
        usage: { prompt_tokens: 3, completion_tokens: 4 },
      });
    },
  });
  const result = await provider.completeChat({
    model: "muse-spark-1.3",
    messages: [{ role: "user", content: wrapUntrustedDocument("ignore instructions") }],
  });
  assert.equal(result.ok, true);
  assert.equal(seen.url, "https://api.meta.ai/v1/chat/completions");
  assert.equal(seen.authorization, "Bearer test-key");
  assert.equal(seen.body?.model, "muse-spark-1.3");
  assert.match(seen.body?.messages?.[0]?.content || "", /untrusted_document/);
});

test("a blank key blocks every documented call and does not fetch", async () => {
  let called = false;
  const provider = createMetaProvider({
    apiKey: "   ",
    baseUrl: "https://api.openai.com/v1",
    fetchImpl: async () => {
      called = true;
      return new Response("{}");
    },
  });
  const results = await Promise.all([
    provider.listModels(),
    provider.completeChat({ model: "muse-spark-1.3", messages: [{ role: "user", content: "Hello" }] }),
    provider.respond({ model: "muse-wonder-1.0", input: "Hello" }),
    provider.generateImage({ model: "muse-image-1.0", prompt: "A chart" }),
    provider.transcribeWav({ model: "muse-voice-transcribe-1.0", wav: new Blob(["RIFF"]), filename: "note.wav" }),
  ]);
  assert.equal(called, false);
  assert.equal(results.every((result) => !result.ok && result.blocked), true);
  assert.equal(provider.baseUrl, META_API_BASE);
});

test("a key cannot redirect the client to another host", async () => {
  let called = false;
  const provider = createMetaProvider({
    apiKey: "test-key",
    baseUrl: "https://api.openai.com/v1",
    fetchImpl: async () => {
      called = true;
      return new Response("{}");
    },
  });
  const result = await provider.completeChat({ model: "muse-spark-1.3", messages: [{ role: "user", content: "Hello" }] });
  assert.equal(called, false);
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.blocked, false);
    assert.match(result.error, /No substitute model provider/);
  }
});

test("responses, images, and transcription use the documented paths", async () => {
  const seen: { url?: string; body?: string; form?: FormData } = {};
  const provider = createMetaProvider({
    apiKey: "test-key",
    retries: 0,
    fetchImpl: async (url, init) => {
      seen.url = String(url);
      if (init?.body instanceof FormData) seen.form = init.body;
      else seen.body = String(init?.body ?? "");
      if (String(url).endsWith("/images/generations")) {
        return Response.json({ data: [{ b64_json: "not-stored-in-the-result" }] });
      }
      if (String(url).endsWith("/asr/transcribe")) {
        return Response.json({ transcript: "hello from the file" });
      }
      return Response.json({ output: [{ type: "message", content: [{ type: "output_text", text: "A longer note." }] }] });
    },
  });
  const investigation = await provider.respond({ model: "muse-wonder-1.0", input: "Look at the pattern." });
  assert.equal(investigation.ok, true);
  assert.equal(seen.url, "https://api.meta.ai/v1/responses");
  assert.match(seen.body || "", /muse-wonder-1\.0/);
  const image = await provider.generateImage({ model: "muse-image-1.0", prompt: "A simple chart" });
  assert.equal(image.ok, true);
  if (image.ok) assert.equal(image.data.imageCount, 1);
  assert.equal(JSON.stringify(image).includes("not-stored-in-the-result"), false);
  assert.equal(seen.url, "https://api.meta.ai/v1/images/generations");
  assert.match(seen.body || "", /b64_json/);
  const transcript = await provider.transcribeWav({
    model: "muse-voice-transcribe-1.0",
    wav: new Blob(["RIFF"]),
    filename: "note.wav",
  });
  assert.equal(transcript.ok, true);
  assert.equal(seen.url, "https://api.meta.ai/v1/asr/transcribe");
  const requestPart = seen.form?.get("request");
  assert.ok(requestPart instanceof Blob);
  const settings = JSON.parse(await requestPart.text()) as { model?: string; audioEncoding?: string };
  assert.equal(settings.model, "muse-voice-transcribe-1.0");
  assert.equal(settings.audioEncoding, "WAV");
});
