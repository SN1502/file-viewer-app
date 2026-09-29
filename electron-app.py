#!/usr/bin/env python3
"""
File Viewer Desktop App
Wraps the web app with a simple desktop interface
"""

import os
import sys
import json
import webbrowser
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler
from threading import Thread
import time

class CORSRequestHandler(SimpleHTTPRequestHandler):
    """HTTP Request Handler with CORS support"""

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def log_message(self, format, *args):
        """Suppress log messages"""
        pass

def start_server(port=8888):
    """Start a simple HTTP server"""
    # Change to dist directory
    dist_path = Path(__file__).parent / 'dist'
    if not dist_path.exists():
        print("Error: dist directory not found. Please build the app first.")
        sys.exit(1)

    os.chdir(str(dist_path))

    server = HTTPServer(('127.0.0.1', port), CORSRequestHandler)
    server_thread = Thread(target=server.serve_forever, daemon=True)
    server_thread.start()

    return server

def main():
    """Main application entry point"""
    port = 8888
    url = f'http://127.0.0.1:{port}'

    print("Starting File Viewer Application...")
    print(f"Opening browser at {url}")

    # Start the server
    server = start_server(port)

    # Wait a moment for server to start
    time.sleep(1)

    # Open browser
    try:
        webbrowser.open(url)
    except Exception as e:
        print(f"Could not open browser: {e}")
        print(f"Please open {url} manually")

    # Keep the server running
    print("File Viewer is running. Press Ctrl+C to exit.")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down...")
        server.shutdown()

if __name__ == '__main__':
    main()
