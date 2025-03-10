import { z } from "zod";
import { SAMPLE_RATE } from "./SAMPLE_RATE";

export async function initiateSession(
  gladiaKey: string
): Promise<{ url: string }> {
  const response = await fetch("https://api.gladia.io/v2/live", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-GLADIA-KEY": gladiaKey,
    },
    body: JSON.stringify({
      sample_rate: SAMPLE_RATE,
      pre_processing: {
        speech_threshold: 0.8,
      },
    }),
  });
  if (!response.ok) {
    const message = `${response.status}: ${
      (await response.text()) || response.statusText
    }`;
    throw new Error(message);
  }
  const data = await response.json();
  return z.object({ url: z.string() }).parse(data);
}

export async function POST() {
  if (!process.env.GLADIA_API_KEY) {
    return Response.json(
      { error: "GLADIA_API_KEY is not configured" },
      { status: 500 }
    );
  }

  try {
    const session = await initiateSession(process.env.GLADIA_API_KEY);
    return Response.json(session);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
