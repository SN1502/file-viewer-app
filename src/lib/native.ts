import { App } from '@capacitor/app';
import { Capacitor, registerPlugin, type PluginListenerHandle } from '@capacitor/core';

export const isNativeApp = Capacitor.isNativePlatform();

interface FileOpenedEvent {
  path: string;
  name: string;
  mimeType: string;
  size: number;
}

interface FileOpenErrorEvent {
  message: string;
}

/** Native side: android/app/src/main/java/com/fileviewer/app/IncomingFilePlugin.java */
interface IncomingFilePlugin {
  addListener(eventName: 'fileOpened', listener: (event: FileOpenedEvent) => void): Promise<PluginListenerHandle>;
  addListener(eventName: 'fileOpenError', listener: (event: FileOpenErrorEvent) => void): Promise<PluginListenerHandle>;
}

const IncomingFile = registerPlugin<IncomingFilePlugin>('IncomingFile');

export interface IncomingFileHandlers {
  onStart(name: string): void;
  onFile(file: File): void;
  onError(message: string): void;
}

/**
 * Documents that other apps send to File Viewer ("Open with" / "Share").
 * Events that arrive before this is called (cold start) are held by the native
 * side and delivered as soon as we subscribe.
 */
export function listenForIncomingFiles(handlers: IncomingFileHandlers): () => void {
  if (!isNativeApp) return () => {};

  const subscriptions = [
    IncomingFile.addListener('fileOpened', async (event) => {
      handlers.onStart(event.name);
      try {
        const response = await fetch(Capacitor.convertFileSrc(event.path));
        if (!response.ok) throw new Error(`status ${response.status}`);
        const blob = await response.blob();
        handlers.onFile(new File([blob], event.name, { type: event.mimeType || '' }));
      } catch (error) {
        handlers.onError(`Couldn't read ${event.name} (${error instanceof Error ? error.message : String(error)})`);
      }
    }),
    IncomingFile.addListener('fileOpenError', (event) => handlers.onError(event.message)),
  ];

  return () => {
    subscriptions.forEach((subscription) => subscription.then((handle) => handle.remove()));
  };
}

/** Android hardware/gesture back. Once registered, we decide what back does. */
export function onBackButton(handler: () => void): () => void {
  if (!isNativeApp) return () => {};
  const subscription = App.addListener('backButton', handler);
  return () => {
    subscription.then((handle) => handle.remove());
  };
}

export function exitApp(): void {
  if (isNativeApp) void App.exitApp();
}
