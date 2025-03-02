"use client";

import { useEffect, useState } from "react";

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
  return audioDevices;
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
