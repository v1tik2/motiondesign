import { staticFile } from "remotion";

// Resolves a file from public/. The web preview preloads every asset into
// blob: URLs (its sandbox can't load them by path); the renderer uses staticFile.
declare global {
  interface Window {
    __assets?: Record<string, string>;
    __previewDpr?: number;
  }
}

export const asset = (path: string) =>
  (typeof window !== "undefined" && window.__assets?.[path]) || staticFile(path);
