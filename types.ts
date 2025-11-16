

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
        reviewSnippets?: {
            uri: string;
            reviewText: string;
        }[]
    }[]
  };
}

export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

export interface VeoOperation {
  name: string;
  done: boolean;
  response?: {
    generatedVideos: {
      video: {
        uri: string;
        aspectRatio: string;
      };
    }[];
  };
  error?: any;
}

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}