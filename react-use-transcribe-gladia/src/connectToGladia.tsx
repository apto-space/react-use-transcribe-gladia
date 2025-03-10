"use client";
import { GladiaWsMessage } from "../gladia-types";
import { createGladiaWebSocket } from "./gladia/client";

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
    // Try to get cached session URL
    const STORAGE_KEY = "gladia_ws_session";
    let session: { url: string };

    // try {
    //   const cachedSession = localStorage.getItem(STORAGE_KEY);
    //   if (cachedSession) {
    //     session = JSON.parse(cachedSession);
    //     // Verify the URL is still valid by checking if it starts with wss://
    //     if (!session.url.startsWith("wss://")) {
    //       throw new Error("Invalid cached session URL");
    //     }
    //     console.log("existing session", cachedSession);
    //   } else {
    //     throw new Error("No cached session");
    //   }
    // } catch (e) {
    // If cache is invalid or missing, get a new session
    console.log("getting new session");
    session = await getSession(endpoint);
    // Store the new session
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    console.log("new session", session, "saved");
    // }

    const { sendBuffer, close } = createGladiaWebSocket(session, {
      onMessage: (data) => {
        cb(data);
      },
    });
    return {
      sendBuffer,
      close: () => {
        close();
        // Clear the cached session on close to ensure a fresh connection next time
        localStorage.removeItem(STORAGE_KEY);
      },
    };
  };
