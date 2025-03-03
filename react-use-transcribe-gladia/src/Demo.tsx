import React from "react";
import { useState, useEffect } from "react";
import { useTranscribeMic, GladiaWsMessage } from ".";

export const MicTest = (args: { gladia_api_key: string }) => {
  const mics = useTranscribeMic(args);
  const [openStreams, setOpenStreams] = useState<(() => void)[]>([]);
  useEffect(() => {
    return () => {
      openStreams.forEach((close) => close());
    };
  }, []);
  const [messages, setMessages] = useState<GladiaWsMessage[]>([]);
  return (
    <div>
      {openStreams.length ? (
        <button
          onClick={() => {
            openStreams.forEach((close) => close());
            setOpenStreams([]);
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
                setOpenStreams([...openStreams, closeConn]);
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
