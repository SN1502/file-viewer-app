package com.fileviewer.app;

import android.content.ClipData;
import android.content.ContentResolver;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.provider.OpenableColumns;
import android.webkit.MimeTypeMap;
import com.getcapacitor.JSObject;
import com.getcapacitor.Logger;
import com.getcapacitor.Plugin;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Receives documents that other apps hand to File Viewer ("Open with" from a file
 * manager, WhatsApp, Gmail, Downloads, or "Share") and passes them to the web app.
 *
 * The document is copied into the app's cache so the WebView can read it through
 * Capacitor's local server, even after the sending app's temporary read grant ends.
 * The web app receives a "fileOpened" event with {path, name, mimeType, size}.
 */
@CapacitorPlugin(name = "IncomingFile")
public class IncomingFilePlugin extends Plugin {

    private static final String TAG = "IncomingFile";
    static final String EVENT_OPENED = "fileOpened";
    static final String EVENT_ERROR = "fileOpenError";

    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private File incomingDir;

    @Override
    public void load() {
        incomingDir = new File(getContext().getCacheDir(), "incoming");
        // Copies from earlier sessions are no longer needed.
        deleteRecursively(incomingDir);
        //noinspection ResultOfMethodCallIgnored
        incomingDir.mkdirs();

        // Cold start: the app was launched to open a document.
        handleIntent(getActivity().getIntent());
    }

    @Override
    protected void handleOnNewIntent(Intent intent) {
        super.handleOnNewIntent(intent);
        // Warm start: the app was already running (launchMode="singleTask").
        handleIntent(intent);
    }

    @Override
    protected void handleOnDestroy() {
        executor.shutdown();
        super.handleOnDestroy();
    }

    private void handleIntent(Intent intent) {
        final Uri uri = extractUri(intent);
        if (uri == null) {
            return;
        }
        final String intentType = intent.getType();
        executor.execute(() -> importDocument(uri, intentType));
    }

    @SuppressWarnings("deprecation")
    private static Uri extractUri(Intent intent) {
        if (intent == null) {
            return null;
        }
        String action = intent.getAction();
        if (Intent.ACTION_VIEW.equals(action)) {
            return intent.getData();
        }
        if (Intent.ACTION_SEND.equals(action)) {
            Uri stream;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                stream = intent.getParcelableExtra(Intent.EXTRA_STREAM, Uri.class);
            } else {
                Object extra = intent.getParcelableExtra(Intent.EXTRA_STREAM);
                stream = extra instanceof Uri ? (Uri) extra : null;
            }
            if (stream != null) {
                return stream;
            }
            ClipData clip = intent.getClipData();
            if (clip != null && clip.getItemCount() > 0) {
                return clip.getItemAt(0).getUri();
            }
        }
        return null;
    }

    private void importDocument(Uri uri, String intentType) {
        try {
            ContentResolver resolver = getContext().getContentResolver();

            String mimeType = null;
            try {
                mimeType = resolver.getType(uri);
            } catch (Exception ignored) {
                // Some providers throw instead of returning null.
            }
            if (isVague(mimeType) && !isVague(intentType)) {
                mimeType = intentType;
            }

            String name = queryDisplayName(resolver, uri);
            if (name == null || name.trim().isEmpty()) {
                name = fallbackName(uri, mimeType);
            }

            File dir = new File(incomingDir, Long.toString(System.nanoTime()));
            if (!dir.mkdirs() && !dir.isDirectory()) {
                throw new IOException("could not create a temporary folder");
            }
            // A fixed, URL-safe name: the real name is sent separately.
            File target = new File(dir, "document");

            long size = 0;
            try (InputStream in = openStream(resolver, uri); OutputStream out = new FileOutputStream(target)) {
                if (in == null) {
                    throw new IOException("the other app didn't provide the file contents");
                }
                byte[] buffer = new byte[64 * 1024];
                int read;
                while ((read = in.read(buffer)) != -1) {
                    out.write(buffer, 0, read);
                    size += read;
                }
            }

            JSObject data = new JSObject();
            data.put("path", target.getAbsolutePath());
            data.put("name", name);
            data.put("mimeType", mimeType == null ? "" : mimeType);
            data.put("size", size);
            emit(EVENT_OPENED, data);
        } catch (SecurityException e) {
            Logger.error(TAG, "No permission to read " + uri, e);
            emitError("File Viewer wasn't allowed to read this file. Open it again from the other app.");
        } catch (Exception e) {
            Logger.error(TAG, "Failed to import " + uri, e);
            emitError("Couldn't open the file: " + e.getMessage());
        }
    }

    private void emitError(String message) {
        JSObject data = new JSObject();
        data.put("message", message);
        emit(EVENT_ERROR, data);
    }

    private void emit(String event, JSObject data) {
        // Run on the plugin thread (the same one that handles addListener) and retain
        // the event until the web app subscribes, so nothing is lost during cold start.
        getBridge().execute(() -> notifyListeners(event, data, true));
    }

    private static boolean isVague(String mimeType) {
        return mimeType == null || mimeType.isEmpty() || mimeType.contains("*") || "application/octet-stream".equals(mimeType);
    }

    private static InputStream openStream(ContentResolver resolver, Uri uri) throws IOException {
        if ("file".equals(uri.getScheme())) {
            String path = uri.getPath();
            if (path == null) {
                throw new IOException("invalid file path");
            }
            return new FileInputStream(path);
        }
        return resolver.openInputStream(uri);
    }

    private static String queryDisplayName(ContentResolver resolver, Uri uri) {
        if ("file".equals(uri.getScheme())) {
            return uri.getLastPathSegment();
        }
        try (Cursor cursor = resolver.query(uri, new String[] { OpenableColumns.DISPLAY_NAME }, null, null, null)) {
            if (cursor != null && cursor.moveToFirst()) {
                int index = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                if (index >= 0) {
                    return cursor.getString(index);
                }
            }
        } catch (Exception e) {
            Logger.warn(TAG, "Could not read the display name: " + e.getMessage());
        }
        return null;
    }

    private static String fallbackName(Uri uri, String mimeType) {
        String name = uri.getLastPathSegment();
        if (name == null || name.trim().isEmpty()) {
            name = "Document";
        }
        int slash = name.lastIndexOf('/');
        if (slash >= 0) {
            name = name.substring(slash + 1);
        }
        if (!name.contains(".") && mimeType != null) {
            String extension = MimeTypeMap.getSingleton().getExtensionFromMimeType(mimeType);
            if (extension != null) {
                name = name + "." + extension;
            }
        }
        return name;
    }

    private static void deleteRecursively(File file) {
        if (file == null || !file.exists()) {
            return;
        }
        File[] children = file.listFiles();
        if (children != null) {
            for (File child : children) {
                deleteRecursively(child);
            }
        }
        //noinspection ResultOfMethodCallIgnored
        file.delete();
    }
}
