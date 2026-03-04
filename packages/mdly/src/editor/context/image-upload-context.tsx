"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * Image upload config supplied by the host app (e.g. wyrdos). Mdly does not
 * implement upload itself: pass your existing upload function and optional
 * error handler (e.g. toast). When not provided, images are embedded as data URLs.
 */
export interface ImageUploadConfig {
  upload: (file: File) => Promise<string>;
  onUploadError?: (error: Error) => void;
}

const ImageUploadContext = createContext<ImageUploadConfig | null>(null);

export function ImageUploadContextProvider({
  children,
  config,
}: {
  children: ReactNode;
  config: ImageUploadConfig | null;
}) {
  return (
    <ImageUploadContext.Provider value={config}>
      {children}
    </ImageUploadContext.Provider>
  );
}

export function useImageUploadConfig(): ImageUploadConfig | null {
  return useContext(ImageUploadContext);
}
