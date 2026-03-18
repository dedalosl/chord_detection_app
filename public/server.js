const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { execFile } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all requests
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// Path to the Python chord detection script (one level up from public/)
const CHORD_DETECTOR_SCRIPT = path.join(__dirname, '..', 'chord_detector.py');

/**
 * Run Python chord detector on an audio file.
 * Returns a Promise that resolves with the parsed JSON result.
 */
function runChordDetector(audioFilePath) {
    return new Promise((resolve, reject) => {
        execFile('python3', [CHORD_DETECTOR_SCRIPT, audioFilePath], { timeout: 300000 }, (err, stdout, stderr) => {
            if (err) {
                return reject(new Error(stderr || err.message));
            }
            try {
                resolve(JSON.parse(stdout));
            } catch (parseErr) {
                reject(new Error('Failed to parse chord detection output: ' + stdout));
            }
        });
    });
}

/**
 * Convert chord detection result to the format expected by the frontend.
 */
function formatChordsForFrontend(result) {
    const chords = (result.chords || []).map(c => ({
        name: c.chord,
        time: c.start,
        duration: c.duration,
        confidence: c.confidence
    }));

    const duration = chords.length > 0
        ? chords[chords.length - 1].time + (chords[chords.length - 1].duration || 0)
        : 0;

    return {
        success: true,
        key: result.key,
        tempo: result.tempo,
        chords,
        uniqueChords: result.unique_chords || [],
        sections: result.sections || [],
        duration: result.duration ? Math.round(result.duration) : Math.round(duration),
        message: 'Chords detected successfully'
    };
}

// Define a route for chord detection - receives uploaded audio file
app.post('/api/chords', upload.single('audioFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        const audioFilePath = req.file.path;
        const rawResult = await runChordDetector(audioFilePath);

        if (rawResult.error) {
            return res.status(500).json({ error: rawResult.error });
        }

        res.json({ file: req.file.originalname, ...formatChordsForFrontend(rawResult) });

    } catch (error) {
        console.error('Error processing audio:', error);
        res.status(500).json({ error: 'Failed to process audio file: ' + error.message });
    }
});

// Define a route for chord detection from base64 data
app.post('/api/chords/base64', async (req, res) => {
    try {
        const { audioData, mimeType } = req.body;

        if (!audioData) {
            return res.status(400).json({ error: 'No audio data provided' });
        }

        // Decode base64 and save to temp file
        const ext = (mimeType || 'audio/mpeg').includes('wav') ? '.wav' : '.mp3';
        const tmpPath = path.join(uploadsDir, `tmp_${Date.now()}${ext}`);
        fs.writeFileSync(tmpPath, Buffer.from(audioData, 'base64'));

        try {
            const rawResult = await runChordDetector(tmpPath);
            if (rawResult.error) {
                return res.status(500).json({ error: rawResult.error });
            }
            res.json(formatChordsForFrontend(rawResult));
        } finally {
            fs.unlink(tmpPath, () => {}); // cleanup temp file
        }

    } catch (error) {
        console.error('Error processing audio:', error);
        res.status(500).json({ error: 'Failed to process audio file: ' + error.message });
    }
});

// Serve static files from the parent directory (where public is located)
app.use(express.static(path.join(__dirname)));

// Handle 404 errors - must come after static file serving
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Handle errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser to access the application`);
});
