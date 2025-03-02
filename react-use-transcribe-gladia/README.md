# react-use-transcribe-gladia

A React hook for real-time audio transcription using the Gladia API.

## Installation

```bash
npm install react-use-transcribe-gladia
# or
yarn add react-use-transcribe-gladia
```

## Usage

```tsx
import { useTranscribeMic } from 'react-use-transcribe-gladia';

function YourComponent() {
  const { startRecording, stopRecording, isRecording, transcription } = useTranscribeMic({
    gladia_api_key: 'YOUR_API_KEY'
  });

  return (
    <div>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      <p>{transcription}</p>
    </div>
  );
}
```

## Requirements

- React 16.8.0 or higher
- A Gladia API key

## License

MIT 