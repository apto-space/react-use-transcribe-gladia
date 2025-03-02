import React from "react";
import { useState, useEffect } from "react";
import { useTranscribeMic } from "./useTranscribeMic";
import { GladiaWsMessage } from "./gladia/client";

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
      {mics.map((mic) => {
        return (
          <div key={mic.device.deviceId}>
            {mic.device.label}
            <button
              onClick={async () => {
                const closeConn = await mic.streamTranscribe(
                  (message: GladiaWsMessage) => {
                    setMessages((prevMessages: GladiaWsMessage[]) => [
                      ...prevMessages,
                      message,
                    ]);
                  }
                );
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
