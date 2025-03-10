"use client";

import { useEffect, useState } from "react";

type MediaDeviceInfo_ = Omit<MediaDeviceInfo, "kind" | "deviceId"> & {
  kind: "audioinput";
  deviceId: string;
};

const getDeviceList = async () => {
  const userMedia = await navigator.mediaDevices.getUserMedia({
    audio: true, // { echoCancellation: true, noiseSuppression: true },
  });
  const audioDevices = (await navigator.mediaDevices
    .enumerateDevices()
    .then((devices) =>
      devices.filter((d) => d.kind === "audioinput" && d.deviceId)
    )) as MediaDeviceInfo_[];
  return { audioDevices, userMedia };
};
type Interface = Awaited<ReturnType<typeof getDeviceList>>;

export const useMics = ({
  autoStart = true,
}: { autoStart?: boolean } = {}): Status => {
  const requestPermissions = async () => {
    setStatus({ type: "awaiting-consent" });
    try {
      const mics = await getDeviceList();
      setStatus({ type: "ready", mics });
    } catch (error) {
      setStatus({ type: "error", error: error as Error });
    }
  };
  const [status, setStatus] = useState<Status>({
    type: "idle",
    requestPermissions,
  });
  useEffect(() => {
    if (autoStart && status.type === "idle") {
      requestPermissions();
    }
  }, [autoStart]);
  return status;
};
export type Status =
  | { type: "idle"; requestPermissions: () => Promise<void> }
  | { type: "awaiting-consent" }
  | { type: "ready"; mics: Interface }
  | { type: "error"; error: Error };
