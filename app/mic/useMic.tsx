"use client";

import { useEffect, useState } from "react";
import { GladiaWsMessage } from "../gladia-types";
import {
  ChunkCallback,
  connectToGladia,
  listenToAudioDevice,
} from "./transcribe";

type MediaDeviceInfo_ = Omit<MediaDeviceInfo, "kind" | "deviceId"> & {
  kind: "audioinput";
  deviceId: string;
};

const getDeviceList = async () => {
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

type Interface = Awaited<ReturnType<typeof getDeviceList>>;

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
