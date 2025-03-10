"use client";
import { createGladiaWebSocket, GladiaWsMessage } from "./gladia/client";

const getSession = async (
  endpoint: string = "/api/gladia"
): Promise<{ url: string }> => {
  const response = await fetch(endpoint, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Failed to get session: ${response.statusText}`);
  }
  return response.json();
};

export const connectToGladia =
  (endpoint?: string) => async (cb: (msg: GladiaWsMessage) => void) => {
    const session = await getSession(endpoint);

    const { sendBuffer, close } = createGladiaWebSocket(session, {
      onMessage: (data) => {
        cb(data);
      },
    });
    return {
      sendBuffer,
      close: () => {
        close();
      },
    };
  };
