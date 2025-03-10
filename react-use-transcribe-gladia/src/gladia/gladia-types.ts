import { z } from "zod";

const transcript_example = {
  session_id: "4a39145c-2844-4557-8f34-34883f7be7d9",
  created_at: "2021-09-01T12:00:00.123Z",
  type: "transcript",
  data: {
    id: "00-00000011",
    is_final: true,
    utterance: {
      language: "en",
      start: 123,
      end: 123,
      confidence: 123,
      channel: 1,
      speaker: 1,
      words: [
        {
          word: "<string>",
          start: 123,
          end: 123,
          confidence: 123,
        },
      ],
      text: "<string>",
    },
  },
};
const speech_end_example = {
  session_id: "4a39145c-2844-4557-8f34-34883f7be7d9",
  created_at: "2021-09-01T12:00:00.123Z",
  type: "speech_end",
  data: {
    time: 12.56,
    channel: 1,
  },
};

// as zod schema
const TranscriptMessageSchema = z.object({
  type: z.literal("transcript"),
  data: z.object({
    utterance: z.object({
      text: z.string(),
    }),
  }),
});

const SpeechEndMessageSchema = z.object({
  type: z.literal("speech_end"),
  data: z.object({
    time: z.number(),
  }),
});

export const GladiaWsMessageSchema = z.discriminatedUnion("type", [
  TranscriptMessageSchema,
  SpeechEndMessageSchema,
]);
export type GladiaWsMessage = z.infer<typeof GladiaWsMessageSchema>;
