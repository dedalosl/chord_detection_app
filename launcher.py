"""
Standalone launcher for Chord Detection App.
Bundles Flask server + opens the browser automatically.
Built into a single executable with PyInstaller.
"""

import sys
import os

# Must be set before any librosa/numba import to skip JIT compilation.
# This reduces startup time and avoids LLVM issues in bundled executables.
os.environ.setdefault('NUMBA_DISABLE_JIT', '1')

# When frozen by PyInstaller, all bundled files live in sys._MEIPASS.
# Change to that directory so relative paths in app.py resolve correctly.
if getattr(sys, 'frozen', False):
    os.chdir(sys._MEIPASS)

# Inject the bundled ffmpeg binary (from imageio-ffmpeg) into PATH so that
# librosa / audioread can decode MP3 / M4A files without a system ffmpeg.
try:
    import imageio_ffmpeg
    _ffmpeg_dir = os.path.dirname(imageio_ffmpeg.get_ffmpeg_exe())
    os.environ['PATH'] = _ffmpeg_dir + os.pathsep + os.environ.get('PATH', '')
except Exception:
    pass  # fall back to system ffmpeg if imageio_ffmpeg is unavailable

import threading
import webbrowser
import time

from app import app  # noqa: E402

PORT = 5678


def _open_browser():
    time.sleep(1.5)
    webbrowser.open(f'http://127.0.0.1:{PORT}')


if __name__ == '__main__':
    print(f'Chord Detection App  →  http://127.0.0.1:{PORT}')
    print('Press Ctrl+C to quit.\n')
    threading.Thread(target=_open_browser, daemon=True).start()
    app.run(host='127.0.0.1', port=PORT, debug=False, use_reloader=False)
