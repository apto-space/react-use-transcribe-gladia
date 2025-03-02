"use client";
import { createGladiaWebSocket, GladiaWsMessage } from "./gladia/client";
import { initiateSession } from "./gladia/server";
import { ChunkCallback, listenToAudioDevice } from "./listenToChunks";
import { useMic } from "./useMic";

export interface UseTranscribeMicProps {
  gladia_api_key: string;
}

export const connectToGladia =
  (gladia_api_key: string) => async (cb: (msg: GladiaWsMessage) => void) => {
    const session = await initiateSession(gladia_api_key);
    const { sendBuffer, close } = createGladiaWebSocket(session, {
      onMessage: (data: GladiaWsMessage) => {
        cb(data);
      },
    });
    return { sendBuffer, close };
  };

export const useTranscribeMic = ({ gladia_api_key }: UseTranscribeMicProps) => {
  const audioDevices = useMic();

  return audioDevices.map((device: MediaDeviceInfo) => {
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
          audioStream
            .getTracks()
            .forEach((track: MediaStreamTrack) => track.stop());
        };
      },
    };
  });
};
