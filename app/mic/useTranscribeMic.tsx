"use client";
import { useState } from "react";
import { GladiaWsMessage } from "../gladia-types";
import { connectToGladia } from "./connectToGladia";
import { ChunkCallback, listenToAudioDevice } from "./listenToChunks";
import { useMics } from "./useMics";

export interface UseTranscribeMicProps {
  endpoint?: string;
}

export const useTranscribeMic = ({ endpoint }: UseTranscribeMicProps = {}) => {
  const status = useMics();
  const [messages, setMessages] = useState<GladiaWsMessage[]>([]);
  const [activeMic, setActiveMic] = useState<{
    device: MediaDeviceInfo;
    close: () => void;
  } | null>(null);
  if (status.type === "ready") {
    const mics = status.mics.audioDevices.map((device) => {
      return {
        device,
        stream: (cb: ChunkCallback) => listenToAudioDevice(device.deviceId, cb),
        streamTranscribe: async () => {
          const { sendBuffer, close } = await connectToGladia(endpoint)(
            (msg: GladiaWsMessage) => {
              setMessages((prev) => [...prev, msg]);
            }
          );
          const { recorder, audioStream } = await listenToAudioDevice(
            device.deviceId,
            sendBuffer
          );

          setActiveMic({
            device,
            close: () => {
              close();
              recorder.stopRecording();
              recorder.destroy();
              audioStream.getTracks().forEach((track) => track.stop());
              setActiveMic(null);
            },
          });
        },
      };
    });
    if (activeMic) {
      return { type: "transcribing" as const, activeMic, mics, messages };
    }
    return { ...status, mics, messages };
  }
  return status;
};
