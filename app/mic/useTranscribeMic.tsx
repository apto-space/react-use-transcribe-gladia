"use client";
import { useEffect, useState } from "react";
import { GladiaWsMessage } from "../gladia-types";
import { createGladiaWebSocket } from "./gladia/client";
import { initiateSession } from "./gladia/server";
import { ChunkCallback, listenToAudioDevice } from "./listenToChunks";
import { useMic } from "./useMic";

export const connectToGladia =
  (gladia_api_key: string) => async (cb: (msg: GladiaWsMessage) => void) => {
    const session = await initiateSession(gladia_api_key);
    const { sendBuffer, close } = createGladiaWebSocket(session, {
      onMessage: (data) => {
        cb(data);
      },
    });
    return { sendBuffer, close };
  };

const useTranscribeMic = ({ gladia_api_key }: { gladia_api_key: string }) => {
  const audioDevices = useMic();

  return audioDevices.map((device) => {
    return {
      device,
      stream: (cb: ChunkCallback) => listenToAudioDevice(device.deviceId, cb),
      streamTranscribe: async (cb: (msg: GladiaWsMessage) => void) => {
        const { sendBuffer, close } = await connectToGladia(gladia_api_key)(cb);
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

export const MicTest = (args: { gladia_api_key: string }) => {
  const mics = useTranscribeMic(args);
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
      {mics.length ? "" : "no mics found"}
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
