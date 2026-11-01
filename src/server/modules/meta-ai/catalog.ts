/**
 * Model ids and paths copied from the Meta Model API docs:
 * https://dev.meta.ai/docs/models
 * https://dev.meta.ai/docs/quickstart
 * https://dev.meta.ai/docs/api-reference/chat-completions/create-chat-completion
 * https://dev.meta.ai/docs/speech-to-text
 * https://dev.meta.ai/docs/image-generation
 *
 * Muse Spark Open and Muse Glimmer are open-weight. They are not requested from this API.
 * SAM 3.1 is hosted, but this release does not assemble a media-segmentation body.
 */
export const META_API_BASE = "https://api.meta.ai/v1";

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
  "SAM 3.1 uses model id sam-3.1 on the Responses API and the media segmentation API. This release does not send segmentation requests.";

export function assertAllowedModel(kind: keyof typeof META_MODELS, model: string) {
  const allowed: readonly string[] = META_MODELS[kind];
  if (!allowed.includes(model)) {
    throw new Error(`${model} is not in the documented ${kind} model list.`);
  }
}
