/**
 * Model ids and paths copied from the Meta Model API docs on 1 November 2026:
 * https://dev.meta.ai/docs/models
 * https://dev.meta.ai/docs/api-reference
 * https://dev.meta.ai/docs/api-reference/chat-completions/create-chat-completion
 * https://dev.meta.ai/docs/speech-to-text
 * https://dev.meta.ai/docs/image-generation
 *
 * Base URL `https://api.meta.ai/v1`. Auth header `Authorization: Bearer $MODEL_API_KEY`.
 * Muse Spark Open and Muse Glimmer are open-weight. They are not requested from this API.
 * SAM 3.1 (`sam-3.1`) is hosted on Responses and media segmentation. This release does not send those requests.
 */
export const META_API_BASE = "https://api.meta.ai/v1";

export function readModelApiKey(env: Record<string, string | undefined> = process.env) {
  return env.MODEL_API_KEY?.trim() ?? "";
}

export const META_MODELS = {
  reasoning: ["muse-spark-1.3", "muse-spark-1.2", "muse-spark-1.1", "muse-spark-1.3-contributor", "muse-spark-1.2-contributor"],
  investigation: ["muse-wonder-1.0", "muse-spark-1.3"],
  transcribe: ["muse-voice-transcribe-1.0"],
  image: ["muse-image-1.0"],
} as const;

export const DEFAULT_MODELS = {
  reasoningModel: "muse-spark-1.3",
  investigationModel: "muse-wonder-1.0",
  transcribeModel: "muse-voice-transcribe-1.0",
  imageModel: "muse-image-1.0",
} as const;

export const OPEN_WEIGHT_NOTES = [
  {
    name: "Muse Spark Open",
    note: "Open-weight release. Meta Model API does not serve it. Run it on your own hardware or another host.",
  },
  {
    name: "Muse Glimmer",
    note: "Open-weight multimodal model. Meta Model API does not serve it.",
  },
] as const;

export const SAM_NOTE =
  "SAM 3.1 uses model id sam-3.1 on POST /responses and the media segmentation API. This release does not send segmentation requests.";

export const META_CAPABILITIES = [
  {
    key: "reasoning",
    label: "Muse Spark",
    endpoint: "POST /chat/completions",
    purpose: "Short interpretations of evidence already stored for this organization.",
    note: "Default id muse-spark-1.3. Ids ending in -contributor are Contributor mode: Meta may use that content to train future models. Audio understanding on 1.3 can be degraded, so speech uses Muse Voice Transcribe.",
  },
  {
    key: "investigation",
    label: "Muse Wonder",
    endpoint: "POST /responses",
    purpose: "Longer investigations. The same request shape also accepts Muse Spark.",
    note: "muse-wonder-1.0 is in preview and Standard mode only on this API. Muse Wonder Full is not available on pay-as-you-go. The model is not offered in South Korea.",
  },
  {
    key: "transcribe",
    label: "Muse Voice Transcribe",
    endpoint: "POST /asr/transcribe",
    purpose: "Turns an uploaded WAV file into transcript text.",
    note: "The realtime socket wss://api.meta.ai/v1/asr/realtime is not opened. A missing key stores the file and blocks transcription.",
  },
  {
    key: "image",
    label: "Muse Image",
    endpoint: "POST /images/generations",
    purpose: "One-shot image generation with muse-image-1.0.",
    note: "POST /images/edits is not called. The request asks for b64_json. Image bytes are not written to the usage log.",
  },
] as const;

export function assertAllowedModel(kind: keyof typeof META_MODELS, model: string) {
  const allowed: readonly string[] = META_MODELS[kind];
  if (!allowed.includes(model)) {
    throw new Error(`${model} is not in the documented ${kind} model list.`);
  }
}
