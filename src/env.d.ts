/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly REACT_APP_OPENAI_API_KEY: string
  readonly REACT_APP_FIREBASE_API_KEY: string
  readonly REACT_APP_FIREBASE_AUTH_DOMAIN: string
  readonly REACT_APP_FIREBASE_PROJECT_ID: string
  readonly REACT_APP_FIREBASE_STORAGE_BUCKET: string
  readonly REACT_APP_FIREBASE_MESSAGING_SENDER_ID: string
  readonly REACT_APP_FIREBASE_APP_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_OPENAI_API_KEY: string;
    REACT_APP_FIREBASE_API_KEY: string;
    REACT_APP_FIREBASE_AUTH_DOMAIN: string;
    REACT_APP_FIREBASE_PROJECT_ID: string;
    REACT_APP_FIREBASE_STORAGE_BUCKET: string;
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID: string;
    REACT_APP_FIREBASE_APP_ID: string;
  }
} 