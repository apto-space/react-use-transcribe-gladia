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

**IMPORTANT**: The current implementation requires passing the Gladia API key directly to the hook. This means the API key will be exposed in your client-side code. This is not secure for production applications.

For production use, you should never expose your API key in client-side code.
Instead:
1. Set up a backend service to handle API calls
2. Use environment variables on your server

## Examples

### Basic Demo Component

You can find a complete demo implementation in the package's source code at `src/Demo.tsx`. The demo showcases:
- Multiple microphone handling
- WebSocket connection management
- Real-time message handling
- Clean connection cleanup on unmount

Here's a simplified example component with status indicators and error handling:

```tsx ./src/Demo.tsx
import React from "react";
import { useState, useEffect } from "react";
import { useTranscribeMic, GladiaWsMessage } from "@apto-space/react-use-transcribe-gladia";

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

```

This example includes:
- Recording status indicators
- Error handling and display
- Processing state feedback
- Styled components (using Tailwind CSS classes)
- Environment variable usage for API key

For a more advanced implementation with multiple microphone support and WebSocket handling, refer to the `src/Demo.tsx` file in the package source code.

## Requirements

- React 16.8.0 or higher
- A Gladia API key

## License

MIT 