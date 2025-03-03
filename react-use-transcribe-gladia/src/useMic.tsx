"use client";

import { useEffect, useState } from "react";

type MediaDeviceInfo_ = Omit<MediaDeviceInfo, "kind" | "deviceId"> & {
  kind: "audioinput";
  deviceId: string;
};

const askForPermissions = async () => {
  // Ask the permissions to the user
  const media = await navigator.mediaDevices.getUserMedia({
    audio: true,
  });

  const audioDevices = await navigator.mediaDevices
    .enumerateDevices()
    .then((devices) =>
      devices.filter((d) => d.kind === "audioinput" && d.deviceId)
    );

  // Stop all the tracks now that we have the user permission
  media.getTracks().forEach((track) => track.stop());
};

const getDeviceList = async () => {
  await askForPermissions();
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
