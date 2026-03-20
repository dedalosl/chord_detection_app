"""
Flask server for the Chord Detection App.
Serves the frontend static files and exposes /api/chords for audio analysis.
"""

import sys
import os
import tempfile
from flask import Flask, request, jsonify, send_from_directory
from chord_detector import detect_chords

# Resolve the project root — works both normally and when frozen by PyInstaller
_root = sys._MEIPASS if getattr(sys, 'frozen', False) else os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__, static_folder=os.path.join(_root, 'public'), static_url_path='')

ALLOWED_EXTENSIONS = {'.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac'}


def allowed_file(filename):
    return os.path.splitext(filename.lower())[1] in ALLOWED_EXTENSIONS


def format_for_frontend(result):
    """Map chord_detector output to the shape the frontend expects."""
    chords = [
        {'name': c['chord'], 'time': c['start']}
        for c in result.get('chords', [])
    ]
    return {
        'success':      True,
        'key':          result.get('key', 'Unknown'),
        'tempo':        result.get('tempo', 0),
        'chords':       chords,
        'uniqueChords': result.get('unique_chords', []),
        'sections':     result.get('sections', []),
        'duration':     round(result.get('duration', 0)),
        'message':      'Chords detected successfully',
    }


# ── Static frontend ────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return send_from_directory(os.path.join(_root, 'public'), 'index.html')


# ── API ────────────────────────────────────────────────────────────────────────

@app.route('/api/chords', methods=['POST'])
def api_chords():
    if 'audioFile' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    file = request.files['audioFile']

    if not file.filename or not allowed_file(file.filename):
        return jsonify({'error': 'Unsupported file type'}), 400

    suffix = os.path.splitext(file.filename)[1]
    tmp_path = None

    try:
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            file.save(tmp.name)
            tmp_path = tmp.name

        result = detect_chords(tmp_path)

        if 'error' in result:
            return jsonify({'error': result['error']}), 500

        return jsonify(format_for_frontend(result))

    except Exception as e:
        import traceback
        app.logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)


@app.route('/health')
def health():
    return jsonify({'status': 'ok'})


# ── Entry point ────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=port, debug=False)
