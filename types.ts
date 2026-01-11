export interface VideoState {
  isLoading: boolean;
  status: string;
  videoUrl: string | null;
  error: string | null;
}

export type AspectRatio = '16:9' | '9:16';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_KEY: string;
    }
  }
  
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    }
  }
}