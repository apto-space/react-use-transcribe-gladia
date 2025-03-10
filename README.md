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

## ⚠️ Security Warning

**IMPORTANT**: For production applications, you should never expose your Gladia API key in client-side code. Instead, set up a backend service to handle API calls securely.

## Setup

1. Create an API endpoint in your backend (e.g., using Next.js API routes):

```typescript
```

2. Set up your environment variables:
```env
# .env.local
GLADIA_API_KEY=your_gladia_api_key_here
```

## Basic usage

```tsx
import React from "react";
import { useState, useEffect } from "react";
import { useTranscribeMic, GladiaWsMessage } from "@apto-space/react-use-transcribe-gladia";

export const MicTest = () => {
  // get mic list and transcription status
  const { mics, requestPermissions } = useTranscribeMic();
  
  // track running mics that transcribe
  const [openSockets, setOpenSockets] = useState<(() => void)[]>([]);
  
  // close connection with gladia when component unmounts
  useEffect(() => {
    return () => {
      openSockets.forEach((x) => x());
    };
  }, [openSockets]);
  
  // track the messages transcribed by gladia
  const [messages, setMessages] = useState<GladiaWsMessage[]>([]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <button 
          onClick={requestPermissions}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Request Microphone Access
        </button>
        
        {openSockets.length > 0 && (
          <button
            onClick={() => {
              openSockets.forEach((x) => x());
              setOpenSockets([]);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Stop Recording
          </button>
        )}
      </div>

      {mics.length === 0 && (
        <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
          No microphones found. Please connect a microphone and grant permission.
        </div>
      )}

      {mics.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">Available Microphones</h2>
          <div className="grid gap-3">
            {mics.map((m) => (
              <div 
                key={m.device.deviceId}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <span className="text-gray-700">{m.device.label || "Unnamed Microphone"}</span>
                <button
                  onClick={async () => {
                    const closeConn = await m.streamTranscribe((x) => {
                      setMessages((messages) => [...messages, x]);
                    });
                    setOpenSockets([...openSockets, closeConn]);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                  disabled={openSockets.length > 0}
                >
                  Start Transcription
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {messages.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-700">Transcription</h2>
          <div className="h-64 overflow-y-auto p-4 bg-gray-50 rounded-lg space-y-2">
            {messages.map((msg, idx) => (
              <div 
                key={idx}
                className="p-2 bg-white rounded border border-gray-200"
              >
                {JSON.stringify(msg, null, 2)}
              </div>
            ))}
          </div>
        </div>
      )}
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