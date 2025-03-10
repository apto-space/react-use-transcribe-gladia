# react-use-transcribe-gladia

A React hook for real-time audio transcription using the Gladia API.

## Installation

```bash
npm install react-use-transcribe-gladia
# or
yarn add react-use-transcribe-gladia
# bun
bun add react-use-transcribe-gladia
```

## Setup

1. Create an API endpoint in your backend (e.g., using Next.js API routes):

```typescript /api/gladia/route.ts
export {POST} from '@apto-space/react-use-transcribe-gladia
```

2. Set up your environment variables:
```env
# .env.local
GLADIA_API_KEY=your_gladia_api_key_here
```

## Basic usage

```tsx ./src/MicTest.tsx
"use client";
import { UseTranscribeMicProps, useTranscribeMic } from "@apto-space/react-use-transcribe-gladia/useTranscribeMic";

export const MicTest = ({ endpoint }: UseTranscribeMicProps = {}) => {
  const status = useTranscribeMic({ endpoint });

  if (status.type === "idle") {
    return (
      <button
        onClick={status.requestPermissions}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Request Microphone Access
      </button>
    );
  }
  if (status.type === "awaiting-consent") {
    return <div>Awaiting microphone access...</div>;
  }
  if (status.type === "error") {
    return <div>Error: {status.error.message}</div>;
  }
  const messagesRender = (
    <div>
      {status.messages.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-700">Transcription</h2>
          <div className="h-64 overflow-y-auto p-4 bg-gray-50 rounded-lg space-y-2">
            {status.messages.map((msg, idx) => (
              <div
                key={idx}
                className="p-2 bg-white rounded border border-gray-200"
              >
                {JSON.stringify(msg, null, 2)}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>No messages</div>
      )}
    </div>
  );
  if (status.type === "transcribing") {
    return (
      <div>
        Transcribing...
        <br />
        {status.activeMic.device.label}
        <br />
        <button
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          onClick={status.activeMic.close}
        >
          Stop
        </button>
        {messagesRender}
      </div>
    );
  }
  const mics = status.mics;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 p-6 bg-white rounded-lg shadow-lg">
      {mics.length === 0 && (
        <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
          No microphones found. Please connect a microphone and grant
          permission.
        </div>
      )}

      {mics.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">
            Available Microphones
          </h2>
          <div className="grid gap-3">
            {mics.map((m) => (
              <div
                key={m.device.deviceId}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <span className="text-gray-700">
                  {m.device.label || "Unnamed Microphone"}
                </span>
                <button
                  onClick={async () => {
                    await m.streamTranscribe();
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  Start Transcription
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {messagesRender}
    </div>
  );
};

```

## Advanced Usage

### Custom Endpoint

You can specify a custom endpoint for the Gladia session creation:

```tsx
const { mics, requestPermissions } = useTranscribeMic({ 
  endpoint: "/custom/gladia/endpoint" 
});
```

### Using the Hook Directly

```tsx
const { mics, requestPermissions } = useTranscribeMic();
// or with custom endpoint
const { mics, requestPermissions } = useTranscribeMic({ 
  endpoint: "/custom/endpoint" 
});
```

## Features

- Real-time audio transcription
- Multiple microphone support
- WebSocket connection management
- Automatic cleanup on unmount
- Styled UI components (using Tailwind CSS)
- Secure API key handling through backend endpoints
- Error handling and status feedback

## Requirements

- React 16.8.0 or higher
- A Gladia API key
- Modern browser with WebSocket support
- Microphone access permissions

## License

MIT 