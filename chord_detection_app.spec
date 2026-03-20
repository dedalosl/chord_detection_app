# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller spec for Chord Detection App.
Build with:  pyinstaller chord_detection_app.spec
"""

from PyInstaller.utils.hooks import collect_data_files, collect_submodules

# Include the frontend files and imageio-ffmpeg's bundled binary
datas = [
    ('public', 'public'),
    *collect_data_files('imageio_ffmpeg'),   # bundled ffmpeg binary
    *collect_data_files('librosa'),
]

hiddenimports = [
    # librosa
    *collect_submodules('librosa'),
    # scipy (librosa uses many sub-packages not auto-detected)
    'scipy',
    'scipy.signal',
    'scipy.fft',
    'scipy.linalg',
    'scipy.linalg.blas',
    'scipy.linalg.lapack',
    'scipy.interpolate',
    'scipy.ndimage',
    'scipy.sparse',
    'scipy.sparse.csgraph',
    'scipy.special',
    # scikit-learn
    *collect_submodules('sklearn'),
    # audio backends
    'audioread',
    'audioread.rawread',
    'audioread.ffdec',
    'soundfile',
    'soxr',
    # imageio / ffmpeg
    'imageio_ffmpeg',
    # numba (imported by librosa; JIT disabled via env var but must be importable)
    'numba',
    'numba.core',
    'numba.core.types',
    'numba.np.ufunc',
    'llvmlite',
    'llvmlite.binding',
    # flask stack
    'flask',
    'flask.json.provider',
    'werkzeug',
    'werkzeug.serving',
    'werkzeug.routing',
    'jinja2',
    'jinja2.ext',
    'click',
    'itsdangerous',
    'blinker',
    # misc
    'pooch',
    'joblib',
    'lazy_loader',
    'msgpack',
    'decorator',
    'packaging',
    'cffi',
    'pycparser',
]

a = Analysis(
    ['launcher.py'],
    pathex=[],
    binaries=[],
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        'matplotlib',
        'IPython',
        'notebook',
        'tkinter',
        'PySide2',
        'PyQt5',
        'PIL',
    ],
    noarchive=False,
)

pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='ChordDetectionApp',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    console=True,   # set False on Mac to suppress terminal window (requires icon)
    disable_windowed_traceback=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=False,
    upx_exclude=[],
    name='ChordDetectionApp',
)
