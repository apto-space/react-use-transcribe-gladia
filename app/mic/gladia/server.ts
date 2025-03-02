import { z } from "~/node_modules/zod/lib/external";
import { SAMPLE_RATE } from "./SAMPLE_RATE";

// this can also be done on the server and forwarded to client for security

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
