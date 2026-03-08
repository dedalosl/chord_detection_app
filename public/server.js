const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all requests
app.use(cors());

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

// Define a route for chord detection - receives uploaded audio file
app.post('/api/chords', upload.single('audioFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        // Simulate processing time for chord detection
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Return mock chord data (in real app, this would come from actual analysis)
        res.json({
            success: true,
            file: req.file.originalname,
            chords: [
                { name: 'C', time: 0 },
                { name: 'G', time: 4 },
                { name: 'Am', time: 8 },
                { name: 'F', time: 12 }
            ],
            duration: 30, // seconds
            message: 'Chords detected successfully'
        });

    } catch (error) {
        console.error('Error processing audio:', error);
        res.status(500).json({ error: 'Failed to process audio file' });
    }
});

// Define a route for chord detection from base64 data
app.post('/api/chords/base64', async (req, res) => {
    try {
        const { audioData } = req.body;

        if (!audioData) {
            return res.status(400).json({ error: 'No audio data provided' });
        }

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));

        res.json({
            success: true,
            chords: [
                { name: 'C', time: 0 },
                { name: 'G', time: 4 },
                { name: 'Am', time: 8 },
                { name: 'F', time: 12 }
            ],
            duration: 30,
            message: 'Chords detected successfully'
        });

    } catch (error) {
        console.error('Error processing audio:', error);
        res.status(500).json({ error: 'Failed to process audio file' });
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
