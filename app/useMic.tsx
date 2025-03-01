"use client";
// inspired by https://github.com/gladiaio/gladia-samples/blob/main/javascript-browser/src/live-from-microphone.html

import { useEffect, useState } from "react";

// simple hook to allow microphone access
type Interface = Awaited<ReturnType<typeof getDeviceList>>;

const connectToGladia = async (cb: (msg: GladiaWsMessage) => void) => {
  const sessionUrl = await initiateSession(GLADIA_API_KEY);
  const { sendBuffer, close } = createGladiaWebSocket(sessionUrl.url, {
    onMessage: (data) => {
      cb(data);
    },
  });
  return { sendBuffer, close };
};

export const useMic = () => {
  const [mics, setMics] = useState<Interface>([]);

  useEffect(() => {
    getDeviceList().then(setMics);
    return () => {};
  }, []);
  return mics;
};

export const MicTest = () => {
  const mics = useMic();
  const [openSockets, setOpenSockets] = useState<(() => void)[]>([]);
  useEffect(() => {
    return () => {
      openSockets.forEach((x) => x());
    };
  }, []);
  const [messages, setMessages] = useState<GladiaWsMessage[]>([]);
  return (
    <div>
      {openSockets.length ? (
        <button
          onClick={() => {
            openSockets.forEach((x) => x());
            setOpenSockets([]);
          }}
        >
          close
        </button>
      ) : (
        "no open sockets"
      )}
      {mics.map((m) => {
        return (
          <div key={m.device.deviceId}>
            {m.device.label}
            <button
              onClick={async () => {
                const closeConn = await m.streamTranscribe((x) => {
                  setMessages((messages) => [...messages, x]);
                });
                setOpenSockets([...openSockets, closeConn]);
              }}
            >
              {"stream transcribe "}
            </button>
          </div>
        );
      })}
      {JSON.stringify(messages, null, 2)}
    </div>
  );
};
type MediaDeviceInfo_ = Omit<MediaDeviceInfo, "kind" | "deviceId"> & {
  kind: "audioinput";
  deviceId: string;
};

const getDeviceList = async () => {
  // const media = await navigator.mediaDevices.getUserMedia({
  //   audio: true,
  // });
  // media.getTracks().forEach((track) => track.stop());

  const audioDevices = (await navigator.mediaDevices
    .enumerateDevices()
    .then((devices) =>
      devices.filter((d) => d.kind === "audioinput" && d.deviceId)
    )) as MediaDeviceInfo_[];
  return audioDevices.map((device) => {
    return {
      device,
      stream: (cb: ChunkCallback) => listenToAudioDevice(device.deviceId, cb),
      streamTranscribe: async (cb: (msg: GladiaWsMessage) => void) => {
        const { sendBuffer, close } = await connectToGladia(cb);
        const { recorder, audioStream } = await listenToAudioDevice(
          device.deviceId,
          sendBuffer
        );
        return () => {
          close();

          recorder.stopRecording();
          recorder.destroy();
          audioStream.getTracks().forEach((track) => track.stop());
        };
      },
    };
  });
};

type ChunkCallback = (buf: ArrayBuffer) => void;

const SAMPLE_RATE = 48000;
import RecordRTC from "recordrtc";
import { GLADIA_API_KEY } from "./constants";
import { GladiaWsMessage, GladiaWsMessageSchema } from "./gladia-types";

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

const createGladiaWebSocket = (
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

// pass a device id to listen to a specific device and get buffers to the callback
// those can be transcribed or whatever
async function listenToAudioDevice(
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
