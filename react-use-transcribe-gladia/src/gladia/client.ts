import { z } from "zod";

const GladiaWsMessageSchema = z.object({
  type: z.literal("transcript"),
  data: z.object({
    utterance: z.object({
      text: z.string(),
    }),
  }),
});
export type GladiaWsMessage = z.infer<typeof GladiaWsMessageSchema>;

type GladiaWebSocket = {
  sendBuffer: (buffer: ArrayBuffer) => void;
  close: () => void;
};

type WebSocketCallbacks = {
  onMessage?: (data: GladiaWsMessage) => void;
  onError?: (error: Event) => void;
  onClose?: (event: CloseEvent) => void;
};

export const createGladiaWebSocket = (
  session: { url: string },
  { onMessage, onError, onClose }: WebSocketCallbacks
): GladiaWebSocket => {
  const socket = new WebSocket(session.url);

  socket.onopen = () => console.log("WebSocket connection established");
  socket.onerror = (error) => onError?.(error);
  socket.onclose = (event) => onClose?.(event);
  socket.onmessage = (event) => {
    try {
      const data_ = GladiaWsMessageSchema.safeParse(JSON.parse(event.data));
      if (data_.success === false) {
        console.log("ignoring message", event.data);
        return;
      }
      const data = data_.data;
      onMessage?.(data);
    } catch (err) {
      console.error("Error parsing message", err);
    }
  };

  return {
    sendBuffer: (buffer: ArrayBuffer) => {
      socket.readyState === WebSocket.OPEN && socket.send(buffer);
    },
    close: () => socket.close(),
  };
};
