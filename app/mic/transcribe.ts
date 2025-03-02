import { GLADIA_API_KEY } from "../constants";
import { GladiaWsMessage, GladiaWsMessageSchema } from "../gladia-types";
import RecordRTC from "recordrtc";

const SAMPLE_RATE = 48000;

// this can also be done on the server and forwarded to client for security
async function initiateSession(gladiaKey: string): Promise<{ url: string }> {
  const response = await fetch("https://api.gladia.io/v2/live", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-GLADIA-KEY": gladiaKey,
    },
    body: JSON.stringify({
      sample_rate: 48000,
    }),
  });
  if (!response.ok) {
    const message = `${response.status}: ${
      (await response.text()) || response.statusText
    }`;
    throw new Error(message);
  }
  return await response.json();
}

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
  sessionUrl: string,
  { onMessage, onError, onClose }: WebSocketCallbacks
): GladiaWebSocket => {
  const socket = new WebSocket(sessionUrl);

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
      if (data?.type === "transcript" && data.data?.utterance?.text) {
        onMessage?.(data);
      }
    } catch (err) {
      console.error("Error parsing message", err);
    }
  };

  return {
    sendBuffer: (buffer: ArrayBuffer) => {
      socket.readyState === WebSocket.OPEN && socket.send(buffer.slice(44));
    },
    close: () => socket.close(),
  };
};

export const connectToGladia = async (cb: (msg: GladiaWsMessage) => void) => {
  const sessionUrl = await initiateSession(GLADIA_API_KEY);
  const { sendBuffer, close } = createGladiaWebSocket(sessionUrl.url, {
    onMessage: (data) => {
      cb(data);
    },
  });
  return { sendBuffer, close };
};

export type ChunkCallback = (buf: ArrayBuffer) => void;

// pass a device id to listen to a specific device and get buffers to the callback
// those can be transcribed or whatever
export async function listenToAudioDevice(
  inputDevice: string,
  cb: ChunkCallback
): Promise<{ recorder: RecordRTC; audioStream: MediaStream }> {
  const audioStream = await navigator.mediaDevices.getUserMedia({
    audio: inputDevice ? { deviceId: { exact: inputDevice } } : true,
  });

  const RecordRTC = (await import("recordrtc")).default;

  const recorder = new RecordRTC(audioStream, {
    type: "audio",
    mimeType: "audio/wav",
    recorderType: RecordRTC.StereoAudioRecorder,
    timeSlice: 1000,
    async ondataavailable(blob) {
      const buffer = await blob.arrayBuffer();
      cb(buffer.slice(44));
    },
    sampleRate: SAMPLE_RATE,
    desiredSampRate: SAMPLE_RATE,
    numberOfAudioChannels: 1,
  });
  recorder.startRecording();

  return { recorder, audioStream };
}
