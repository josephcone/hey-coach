# Health Coach App

A voice-interactive health coaching application that uses OpenAI's Realtime API for natural language processing.

## Features

- Real-time voice recognition using OpenAI's Realtime API
- Text-to-speech feedback using OpenAI's TTS API
- Activity tracking with voice commands
- Timer functionality with voice announcements
- User authentication with Firebase

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- OpenAI API key with access to Realtime API
- Firebase project (for authentication)

## Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd health-coach
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your API keys:
```
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
```

4. Start the development server:
```bash
npm start
```

The app will be available at http://localhost:3000

## Testing

1. Run the test suite:
```bash
npm test
```

2. For voice interaction testing:
   - Use Chrome or Edge browser (WebSocket support required)
   - Allow microphone access when prompted
   - Test with different voice commands and activities

## Development

- `src/pages/` - Main page components
- `src/hooks/` - Custom React hooks
- `src/contexts/` - React context providers
- `src/config/` - Configuration files

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

MIT 