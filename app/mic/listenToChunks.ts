import RecordRTC from "recordrtc";
import { SAMPLE_RATE } from "./gladia/SAMPLE_RATE";

export type ChunkCallback = (buf: ArrayBuffer) => void;
// pass a device id to listen to a specific device and get buffers to the callback
// those can be transcribed or whatever

export async function listenToAudioDevice(
  inputDevice: string,
  cb: ChunkCallback
): Promise<{ recorder: RecordRTC; audioStream: MediaStream }> {
  const audioStream = await navigator.mediaDevices.getUserMedia({
    audio: inputDevice ? { deviceId: { exact: inputDevice } } : true,
  });

  // const RecordRTC = (await import("recordrtc")).default;

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
