import OpenAI from "openai";
import type { Prisma } from "../generated/prisma/client";

type MutableJsonObject = Record<string, Prisma.InputJsonValue>;

let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set.");
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return openaiClient;
}

function safeJsonStringify(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function parseJsonSafely(value: string): MutableJsonObject {
  try {
    const parsed = JSON.parse(value);

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as MutableJsonObject;
    }

    return {
      rawResult: value,
    };
  } catch {
    return {
      rawResult: value,
    };
  }
}

export async function runOpenAITextAction(params: {
  prompt: string;
  inputData: unknown;
}): Promise<MutableJsonObject> {
  const client = getOpenAIClient();
  const model = process.env.OPENAI_MODEL ?? "gpt-5.2";

  const response = await client.responses.create({
    model,
    instructions:
      "You are an automation workflow step. Return only valid JSON. Do not include markdown.",
    input: `
Task:
${params.prompt}

Input JSON:
${safeJsonStringify(params.inputData)}

Return JSON with this structure:
{
  "classification": "hot | warm | cold | unknown",
  "summary": "short summary of the input",
  "recommendedAction": "what the SaaS team should do next",
  "confidence": 0.0
}
`,
  });

  const text = response.output_text.trim();

  return {
    action: "OPENAI_TEXT",
    model,
    status: "completed",
    result: parseJsonSafely(text),
  };
}
