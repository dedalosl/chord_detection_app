/**
 * Audio Processor Module
 * Handles audio file upload, analysis, and chord detection simulation
 */

class AudioProcessor {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.source = null;
        this.isPlaying = false;
        this.startTime = 0;
        this.pausedAt = 0;
        this.chordsDetected = [];
        this.currentChordIndex = -1;

        // Note frequencies (Hz) for chord detection
        this.noteFrequencies = {
            'C': 261.63, 'C#': 277.18, 'Db': 277.18, 'D': 293.66,
            'D#': 311.13, 'Eb': 311.13, 'E': 329.63, 'F': 349.23,
            'F#': 369.99, 'Gb': 369.99, 'G': 392.00, 'G#': 415.30,
            'Ab': 415.30, 'A': 440.00, 'A#': 466.16, 'Bb': 466.16,
            'B': 493.88
        };

        // Chord templates (root + intervals in semitones from root)
        this.chordTemplates = {
            'major': [0, 4, 7],      // Major triad
            'minor': [0, 3, 7],      // Minor triad
            'dim': [0, 3, 6],        // Diminished
            'aug': [0, 4, 8],        // Augmented
            'sus2': [0, 2, 7],       // Suspended 2nd
            'sus4': [0, 5, 7],       // Suspended 4th
            'maj7': [0, 4, 7, 11],   // Major 7th
            'min7': [0, 3, 7, 10],   // Minor 7th
            'dom7': [0, 4, 7, 10],   // Dominant 7th
            'maj6': [0, 4, 7, 9],    // Major 6th
            'min6': [0, 3, 7, 9],    // Minor 6th
            'add9': [0, 4, 7, 14],   // Add 9th
            'm9': [0, 3, 7, 10, 14]  // Minor 9th
        };

        // Scale degrees for roman numeral analysis (C major as reference)
        this.scaleDegrees = {
            'C': ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'],
            'G': ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'],
            'D': ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim'],
            'A': ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim'],
            'E': ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim'],
            'B': ['B', 'C#m', 'D#m', 'E', 'F#', 'G#m', 'A#dim'],
            'F': ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'Edim']
        };
    }

    /** Initialize audio context */
    initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioContext;
    }

    /** Upload and process audio file from input element */
    async uploadAndProcess(fileInputElement, onProgress, onComplete, onError) {
        const file = fileInputElement.files[0];
        if (!file) {
            onError('Please select an audio file');
            return;
        }

        // Validate file type
        const validTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/x-m4a', 'audio/m4a'];
        if (!validTypes.some(type => file.type.includes(type.split('/')[1]) || this.isValidExtension(file.name))) {
            onError('Please select a valid audio file (WAV, MP3, OGG, M4A)');
            return;
        }

        try {
            onProgress(0);
            const audioCtx = this.initAudioContext();
            if (audioCtx.state === 'suspended') {
                audioCtx.resume().catch(err => console.warn('Could not resume audio context:', err));
            }
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
            onProgress(50);
            const analysis = await this.analyzeChords(audioBuffer, (pct) => {
                const newProgress = Math.min(95, Math.max(50, 50 + pct * 0.4));
                onProgress(newProgress);
            }, file.name);
            onProgress(100);
            onComplete({
                chords: analysis.chords,
                duration: Math.round(audioBuffer.duration),
                fileName: file.name,
                method: 'Goertzel algorithm'
            });
        } catch (error) {
            console.error('Error processing audio:', error);
            let errorMessage = 'Failed to process audio file. Please try again.';
            if (error.name === 'InvalidStateError') {
                errorMessage = 'Audio context is not ready. Please refresh the page and try again.';
            } else if (error.name === 'NotSupportedError') {
                errorMessage = 'This audio format is not supported by your browser. Try WAV, MP3, OGG, or M4A.';
            } else if (error.message.includes('decode') || error.message.includes('Decode')) {
                errorMessage = 'Could not decode the audio file. It may be corrupted or in an unsupported format.';
            }
            onError(errorMessage);
        }
    }

    /** Analyze audio buffer for chord detection using Goertzel algorithm */
    async analyzeChords(audioBuffer, progressCallback, fileName) {
        return await this.fallbackAnalyze(audioBuffer, progressCallback);
    }

    /** Fallback analysis using pitch detection (Goertzel algorithm) */
    // Stub for key detection – returns null as a placeholder
    getDominantRoot(_audioBuffer) { return null; }

    // Stub for file extension validation – always true
    isValidExtension(_name) { return true; }

    async fallbackAnalyze(audioBuffer, progressCallback) {
        const dominantRoot = this.getDominantRoot(audioBuffer);
        console.log('Using pitch-based chord detection');
        const channelData = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate;
        const duration = audioBuffer.duration;
        let dataToProcess = channelData;
        if (sampleRate > 22050) {
            const ratio = Math.floor(sampleRate / 22050);
            dataToProcess = new Float32Array(channelData.length / ratio);
            for (let i = 0; i < dataToProcess.length; i++) {
                dataToProcess[i] = channelData[i * ratio];
            }
        }
        const frameSize = 2048;
        const hopSize = 512;
        const estimatedChords = Math.max(3, Math.min(8, Math.floor(duration / 4)));
        const chunkDuration = duration / estimatedChords;
        console.log(`Analyzing ${duration}s song with ~${estimatedChords} chords (chunk: ${chunkDuration.toFixed(1)}s)`);
        const chordScoresAtTime = [];
        const numFramesPerChunk = Math.floor((chunkDuration * sampleRate) / hopSize);
        for (let chunkIdx = 0; chunkIdx < estimatedChords; chunkIdx++) {
            const chunkStartTime = chunkIdx * numFramesPerChunk;
            const chunkEndTime = Math.min(chunkStartTime + numFramesPerChunk, dataToProcess.length / hopSize);
            const chunkScores = [];
            for (let frame = chunkStartTime; frame < chunkEndTime; frame++) {
                const startTime = frame * hopSize;
                const frameData = new Float32Array(frameSize);
                for (let i = 0; i < frameSize; i++) {
                    const idx = Math.min(startTime + i, dataToProcess.length - 1);
                    frameData[i] = dataToProcess[idx] * (0.5 * (1 - Math.cos(2 * Math.PI * i / frameSize)));
                }
            }
        }
    }
}

module.exports = { AudioProcessor };
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.source = null;
        this.isPlaying = false;
        this.startTime = 0;
        this.pausedAt = 0;
        this.chordsDetected = [];
        this.currentChordIndex = -1;

        // Note frequencies (Hz) for chord detection
        this.noteFrequencies = {
            'C': 261.63, 'C#': 277.18, 'Db': 277.18, 'D': 293.66,
            'D#': 311.13, 'Eb': 311.13, 'E': 329.63, 'F': 349.23,
            'F#': 369.99, 'Gb': 369.99, 'G': 392.00, 'G#': 415.30,
            'Ab': 415.30, 'A': 440.00, 'A#': 466.16, 'Bb': 466.16,
            'B': 493.88
        };

        // Chord templates (root + intervals in semitones from root)
        this.chordTemplates = {
            'major': [0, 4, 7],      // Major triad
            'minor': [0, 3, 7],      // Minor triad
            'dim': [0, 3, 6],        // Diminished
            'aug': [0, 4, 8],        // Augmented
            'sus2': [0, 2, 7],       // Suspended 2nd
            'sus4': [0, 5, 7],       // Suspended 4th
            'maj7': [0, 4, 7, 11],   // Major 7th
            'min7': [0, 3, 7, 10],   // Minor 7th
            'dom7': [0, 4, 7, 10],   // Dominant 7th
            'maj6': [0, 4, 7, 9],    // Major 6th
            'min6': [0, 3, 7, 9],    // Minor 6th
            'add9': [0, 4, 7, 14],   // Add 9th
            'm9': [0, 3, 7, 10, 14]  // Minor 9th
        };

        // Scale degrees for roman numeral analysis (C major as reference)
        this.scaleDegrees = {
            'C': ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'],
            'G': ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'],
            'D': ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim'],
            'A': ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim'],
            'E': ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim'],
            'B': ['B', 'C#m', 'D#m', 'E', 'F#', 'G#m', 'A#dim'],
            'F': ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'Edim']
        };
    }

    /**
     * Initialize audio context
     */
    initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioContext;
    }

    /**
     * Upload and process audio file from input element
     */
    async uploadAndProcess(fileInputElement, onProgress, onComplete, onError) {
        const file = fileInputElement.files[0];
        if (!file) {
            onError('Please select an audio file');
            return;
        }

        // Validate file type
        const validTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/x-m4a', 'audio/m4a'];
        if (!validTypes.some(type => file.type.includes(type.split('/')[1]) || this.isValidExtension(file.name))) {
            onError('Please select a valid audio file (WAV, MP3, OGG, M4A)');
            return;
        }

        try {
            onProgress(0);

            // Initialize audio context first
            const audioCtx = this.initAudioContext();

            // Ensure audio context is running (don't await - resume is synchronous for promise)
            if (audioCtx.state === 'suspended') {
                audioCtx.resume().catch(err => console.warn('Could not resume audio context:', err));
            }

            // Read file as ArrayBuffer
            const arrayBuffer = await file.arrayBuffer();

            // Decode audio data
            const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

            console.log('Audio decoded:', {
                duration: audioBuffer.duration,
                sampleRate: audioBuffer.sampleRate,
                channels: audioBuffer.numberOfChannels
            });

            onProgress(50);

            // Analyze audio for chord detection using Goertzel algorithm
            const analysis = await this.analyzeChords(audioBuffer, (pct) => {
                const newProgress = Math.min(95, Math.max(50, 50 + pct * 0.4));
                onProgress(newProgress);
            }, file.name);

            // Complete progress to 100%
            onProgress(100);

            onComplete({
                chords: analysis.chords,
                duration: Math.round(audioBuffer.duration),
                fileName: file.name,
                method: 'Goertzel algorithm'
            });

        } catch (error) {
            console.error('Error processing audio:', error);
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Stack trace:', error.stack);

            let errorMessage = 'Failed to process audio file. Please try again.';

            if (error.name === 'InvalidStateError') {
                errorMessage = 'Audio context is not ready. Please refresh the page and try again.';
            } else if (error.name === 'NotSupportedError') {
                errorMessage = 'This audio format is not supported by your browser. Try WAV, MP3, OGG, or M4A.';
            } else if (error.message.includes('decode') || error.message.includes('Decode')) {
                errorMessage = 'Could not decode the audio file. It may be corrupted or in an unsupported format.';
            }

            onError(errorMessage);
        }
    }

    /**
     * Analyze audio buffer for chord detection using Goertzel algorithm
     */
    async analyzeChords(audioBuffer, progressCallback, fileName) {
        return await this.fallbackAnalyze(audioBuffer, progressCallback);
    }

    /**
     * Fallback analysis using pitch detection (Goertzel algorithm)
     */
    async fallbackAnalyze(audioBuffer, progressCallback) {
        // Estimate dominant root for key biasing
        const dominantRoot = this.getDominantRoot(audioBuffer);
        console.log('Using pitch-based chord detection');

        const channelData = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate;
        const duration = audioBuffer.duration;

        // Downsample for efficiency if needed
        let dataToProcess = channelData;
        if (sampleRate > 22050) {
            const ratio = Math.floor(sampleRate / 22050);
            dataToProcess = new Float32Array(channelData.length / ratio);
            for (let i = 0; i < dataToProcess.length; i++) {
                dataToProcess[i] = channelData[i * ratio];
            }
        }

        // Process the song in time-based chunks - each chunk represents one chord duration
        const frameSize = 2048;
        const hopSize = 512;

        // Estimate number of chords (typically 3-8 for most songs)
        const estimatedChords = Math.max(3, Math.min(8, Math.floor(duration / 4)));
        const chunkDuration = duration / estimatedChords;

        console.log(`Analyzing ${duration}s song with ~${estimatedChords} chords (chunk: ${chunkDuration.toFixed(1)}s)`);

        // Analyze each time chunk separately
        const chordScoresAtTime = [];
        const numFramesPerChunk = Math.floor((chunkDuration * sampleRate) / hopSize);

        for (let chunkIdx = 0; chunkIdx < estimatedChords; chunkIdx++) {
            const chunkStartTime = chunkIdx * numFramesPerChunk;
            const chunkEndTime = Math.min(chunkStartTime + numFramesPerChunk, dataToProcess.length / hopSize);

            // Collect chord scores for all frames in this chunk
            const chunkScores = [];

            for (let frame = chunkStartTime; frame < chunkEndTime; frame++) {
                const startTime = frame * hopSize;

                // Extract frame with Hann window
                const frameData = new Float32Array(frameSize);
                for (let i = 0; i < frameSize; i++) {
                    const idx = Math.min(startTime + i, dataToProcess.length - 1);
                    frameData[i] = dataToProcess[idx] * (0.5 * (1 - Math.cos(2 * Math.PI * i / frameSize)));
                }

                // Calculate energy for silence detection
                let energy = 0;
                for (let i = 0; i < frameSize; i++) {
                    energy += frameData[i] * frameData[i];
                }

                if (energy < 0.01) continue; // Skip silent frames

                // Detect dominant frequencies using Goertzel algorithm
                const frequencies = this.detectFrequencies(frameData, sampleRate);

                // Score each chord template at this time point
                let bestScore = -Infinity;
                let bestMatch = null;

                const roots = ['A','B','C','C#','D','E','F','F#','G'];
        for (const root of roots) {
                    for (const [quality, intervals] of Object.entries(this.chordTemplates)) {
                        const score = this.calculateChordScore(frequencies, root, intervals);
                        if (score > bestScore && score >= 0.4) {
                            bestScore = score;
                            bestMatch = quality === 'major' ? root : `${root}${quality}`;
                        }
                    }
                }

                if (bestMatch) {
                    const timeInSong = startTime / sampleRate;
                    chunkScores.push({ chord: bestMatch, score: bestScore, time: timeInSong });
                }
            }

            // Find the most common chord in this chunk (voting)
            let dominantChord = null;
            let maxVotes = 0;

            if (chunkScores.length > 0) {
                const chordCounts = {};
                for (const entry of chunkScores) {
                    chordCounts[entry.chord] = (chordCounts[entry.chord] || 0) + entry.score;
                }

                let maxScore = -Infinity;
                for (const [chord, score] of Object.entries(chordCounts)) {
                    if (score > maxScore) {
                        maxScore = score;
                        dominantChord = chord;
                    }
                }

                // Calculate average time for this chunk's chord
                const avgTime = chunkScores.reduce((sum, e) => sum + e.time, 0) / chunkScores.length;

                if (dominantChord) {
                    chordScoresAtTime.push({
                        name: dominantChord,
                        time: Math.round(avgTime * 100) / 100,
                        confidence: maxScore / chunkScores.length
                    });
                }
            }

            progressCallback(65 + (chunkIdx / estimatedChords) * 25);
        }

        // Ensure we have at least one chord detected
        if (chordScoresAtTime.length === 0) {
            console.log('No chords detected, using fallback');
            return { chords: [{ name: 'C', time: 0, duration: Math.round(duration * 100) / 100 }] };
        }

        // Merge consecutive same chords and detect transitions
        progressCallback(95);
        const merged = this.mergeChordSequences(chordScoresAtTime, duration);

        console.log('Detected chord sequence:', merged);
        return { chords: merged };
    }

    /**
     * Calculate how well detected frequencies match a chord template
     */
    calculateChordScore(frequencies, root, intervals, dominantRoot = null) {
        const rootIndex = this.noteIndex(root);
        let matchCount = 0;
        let totalExpected = intervals.length;

        for (const interval of intervals) {
            const targetSemitone = (rootIndex + interval) % 12;
            const targetNote = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'][targetSemitone];

            // Check if any detected frequency matches this note (within semitone tolerance)
            for (const freq of frequencies) {
                if (freq.note === targetNote || freq.note === ['C', 'Db', 'D#', 'Eb', 'E', 'F', 'Gb', 'G#', 'A', 'Bb', 'B'][targetSemitone]) {
                    matchCount++;
                    break;
                }
            }
        }

        return matchCount / totalExpected;
    }

    /**
     * Merge consecutive same chords and detect transitions
     */
    mergeChordSequences(frameChords, duration) {
        if (frameChords.length === 0) {
            return [{ name: 'C', time: 0, duration: Math.round(duration * 100) / 100 }];
        }

        const merged = [];
        let currentName = frameChords[0].name;
        let currentTime = frameChords[0].time;

        for (let i = 1; i < frameChords.length; i++) {
            if (frameChords[i].name === currentName) continue;

            // Save current chord with duration to next transition
            const nextTime = frameChords[i].time;
            merged.push({ name: currentName, time: Math.round(currentTime * 100) / 100 });

            currentName = frameChords[i].name;
            currentTime = nextTime;
        }

        // Add final chord (goes to end of song)
        merged.push({
            name: currentName,
            time: Math.round(currentTime * 100) / 100,
            duration: Math.round((duration - currentTime) * 100) / 100
        });

        return merged;
    }

    /**
     * Detect dominant frequencies using Goertzel algorithm for specific notes
     */
    detectFrequencies(frameData, sampleRate) {
        const detectedNotes = [];

        // Calculate frequency resolution
        const freqResolution = sampleRate / frameData.length;

        // Check each note across 3 octaves (C2 to B5)
        for (let octave = 2; octave <= 5; octave++) {
            for (const note of ['C', 'D', 'E', 'F', 'G', 'A', 'B']) {
                const semitone = this.noteIndex(note);
                const targetFreq = (semitone + (octave - 1) * 12) * freqResolution;

                // Calculate Goertzel coefficient for this frequency
                const k = Math.round(targetFreq / freqResolution);
                if (k < 2 || k >= frameData.length / 2) continue;

                const coeff = 2 * Math.cos(2 * Math.PI * k / frameData.length);

                // Goertzel algorithm
                let sPrev = 0, sPrev2 = 0;
                for (let i = 0; i < frameData.length; i++) {
                    const s = coeff * sPrev - sPrev2 + frameData[i];
                    sPrev2 = sPrev;
                    sPrev = s;
                }

                // Calculate magnitude squared
                const magSq = sPrev * sPrev + sPrev2 * sPrev2 - coeff * sPrev * sPrev2;

                if (magSq > 50) { // Threshold for detection
                    detectedNotes.push({ note: note, freq: targetFreq, magnitude: Math.sqrt(magSq), octave });
                }
            }
        }

        return detectedNotes.sort((a, b) => b.magnitude - a.magnitude);
    }

    /**
     * Get semitone index for a note (C=0, C#=1, etc.)
     */
    noteIndex(note) {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        return notes.indexOf(note);
    }

    /**
     * Match detected frequencies to a chord name
     */
    matchChordToNotes(frequencies, time) {
        if (frequencies.length < 2) return null;

        const rootCandidates = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        let bestMatch = null;
        let bestScore = -Infinity;

        // Try each possible root note
        for (const root of rootCandidates) {
            for (const [quality, intervals] of Object.entries(this.chordTemplates)) {
                const score = this.calculateChordScore(frequencies, root, intervals);
                if (score > bestScore && score >= 0.5) {
                    bestScore = score;
                    bestMatch = quality === 'major' ? root : `${root}${quality}`;
                }
            }
        }

        return bestMatch;
    }

    /**
     * Detect dominant frequencies using Goertzel algorithm for specific notes
     */
    detectFrequencies(frameData, sampleRate) {
        const detectedNotes = [];

        // Calculate frequency resolution
        const freqResolution = sampleRate / frameData.length;

        // Check each note across 3 octaves (C2 to B5)
        for (let octave = 2; octave <= 5; octave++) {
            for (const note of ['C', 'D', 'E', 'F', 'G', 'A', 'B']) {
                const semitone = this.noteIndex(note);
                const targetFreq = (semitone + (octave - 1) * 12) * freqResolution;

                // Calculate Goertzel coefficient for this frequency
                const k = Math.round(targetFreq / freqResolution);
                if (k < 2 || k >= frameData.length / 2) continue;

                const coeff = 2 * Math.cos(2 * Math.PI * k / frameData.length);

                // Goertzel algorithm
                let sPrev = 0, sPrev2 = 0;
                for (let i = 0; i < frameData.length; i++) {
                    const s = coeff * sPrev - sPrev2 + frameData[i];
                    sPrev2 = sPrev;
                    sPrev = s;
                }

                // Calculate magnitude squared
                const magSq = sPrev * sPrev + sPrev2 * sPrev2 - coeff * sPrev * sPrev2;

                if (magSq > 50) { // Threshold for detection
                    detectedNotes.push({ note: note, freq: targetFreq, magnitude: Math.sqrt(magSq), octave });
                }
            }
        }

        return detectedNotes.sort((a, b) => b.magnitude - a.magnitude);
    }

    /**
     * Get semitone index for a note (C=0, C#=1, etc.)
     */
    noteIndex(note) {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        return notes.indexOf(note);
    }

    /**
     * Match detected frequencies to a chord name
     */
    matchChordToNotes(frequencies, time) {
        if (frequencies.length < 2) return null;

        const rootCandidates = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        let bestMatch = null;
        let bestScore = -Infinity;

        // Try each possible root note
        for (const root of rootCandidates) {
            for (const [quality, intervals] of Object.entries(this.chordTemplates)) {
                const score = this.calculateChordScore(frequencies, root, intervals);
                if (score > bestScore && score >= 0.5) {
                    bestScore = score;
                    bestMatch = quality === 'major' ? root : `${root}${quality}`;
                }
            }
        }

        return bestMatch;
    }

    /**
     * Calculate how well detected frequencies match a chord template
     */
    calculateChordScore(frequencies, root, intervals, dominantRoot = null) {
        const rootIndex = this.noteIndex(root);
        let matchCount = 0;
        let totalExpected = intervals.length;

        for (const interval of intervals) {
            const targetSemitone = (rootIndex + interval) % 12;
            const targetNote = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'][targetSemitone];

            // Check if any detected frequency matches this note (within semitone tolerance)
            for (const freq of frequencies) {
                if (freq.note === targetNote || freq.note === ['C', 'Db', 'D#', 'Eb', 'E', 'F', 'Gb', 'G#', 'A', 'Bb', 'B'][targetSemitone]) {
                    matchCount++;
                    break;
                }
            }
        }

        return matchCount / totalExpected;
    }

    /**
     * Merge consecutive same chords and detect transitions
     */
    mergeChordSequences(frameChords, duration) {
        if (frameChords.length === 0) {
            return [{ name: 'C', time: 0, duration: Math.round(duration * 100) / 100 }];
        }

        const merged = [];
        let currentName = frameChords[0].name;
        let currentTime = frameChords[0].time;

        for (let i = 1; i < frameChords.length; i++) {
            if (frameChords[i].name === currentName) continue;

            // Save current chord with duration to next transition
            const nextTime = frameChords[i].time;
            merged.push({ name: currentName, time: Math.round(currentTime * 100) / 100 });

            currentName = frameChords[i].name;
            currentTime = nextTime;
        }

        // Add final chord (goes to end of song)
        merged.push({
            name: currentName,
            time: Math.round(currentTime * 100) / 100,
            duration: Math.round((duration - currentTime) * 100) / 100
        });

        return merged;
    }

    /**
     * Find dominant frequencies in audio buffer (simplified)
     */
    findDominantFrequencies(audioBuffer) {
        // This is a simplified frequency analysis
        // In production, use proper FFT-based analysis
        const channelData = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate;

        // Basic spectral estimation using Goertzel algorithm would go here
        // For now, return placeholder frequencies

        const commonFrequencies = [
            { frequency: 329.63, note: 'E4', chord: ['C', 'Am'] },
            { frequency: 392.00, note: 'G4', chord: ['C', 'G', 'Em', 'Dm'] },
            { frequency: 440.00, note: 'A4', chord: ['Am', 'F', 'D', 'Bm'] },
            { frequency: 523.25, note: 'C5', chord: ['C', 'F', 'G7', 'Em'] }
        ];

        return commonFrequencies;
    }

    /**
     * Play audio with real-time chord highlighting
     */
    playAudioWithChords(audioBuffer, chords) {
        this.audioContext = this.initAudioContext();
        this.isPlaying = true;
        this.startTime = 0;
        this.pausedAt = 0;
        this.chordIndex = -1;

        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.audioContext.destination);

        // Start playback
        if (this.pausedAt > 0) {
            source.start(0, this.pausedAt);
        } else {
            source.start(0);
        }

        // Monitor playback position for chord updates
        const updateInterval = setInterval(() => {
            const currentTime = this.audioContext.currentTime + this.startTime - this.pausedAt;

            if (currentTime >= audioBuffer.duration) {
                clearInterval(updateInterval);
                this.isPlaying = false;
                return;
            }

            // Check for current chord
            for (let i = 0; i < chords.length; i++) {
                if (currentTime >= chords[i].time && (!chords[i + 1] || currentTime < chords[i + 1].time)) {
                    this.chordIndex = i;
                    break;
                }
            }

        }, 100);

        source.onended = () => {
            clearInterval(updateInterval);
            this.isPlaying = false;
            this.startTime = 0;
            this.pausedAt = 0;
        };

        return source;
    }

    /**
     * Pause audio playback
     */
    pauseAudio() {
        if (this.audioContext && this.isPlaying) {
            this.pauseTime = this.audioContext.currentTime + this.startTime - this.pauseAt;
            this.isPlaying = false;
        }
    }

    /**
     * Resume audio playback
     */
    resumeAudio() {
        if (this.audioContext && !this.isPlaying) {
            this.isPlaying = true;
            // This would need to maintain reference to source buffer for proper resume
        }
    }

    /**
     * Seek to specific time position
     */
    seekTo(position, audioBuffer) {
        if (audioBuffer && this.audioContext) {
            this.startTime = Math.max(0, Math.min(position, audioBuffer.duration));
            return true;
        }
        return false;
    }

    /**
     * Get current playback position
     */
    getCurrentPosition() {
        if (this.audioContext && this.isPlaying) {
            return this.audioContext.currentTime + this.startTime - this.pauseAt;
        }
        return 0;
    }

    /**
     * Check if a chord name is valid
     */
    isValidChordName(chordName) {
        const validPatterns = [
            /^[A-G]$/,           // Basic major/minor
            /^[A-G](m|sus2|sus4|maj7|min7)$/,
            /^[A-G][#b](m|sus2|sus4|maj7|min7)?$/,
            /^[A-G]([79])$/,      // Dominant 7th, add9
            /^[A-G](m[79])$/,     // Minor 7th, madd9
            /^[A-G]\/.$/          // Slash chords (e.g., G/B)
        ];

        return validPatterns.some(pattern => pattern.test(chordName));
    }

    /**
     * Parse chord name to get basic information
     */
    parseChordInfo(chordName) {
        const rootNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const qualities = ['major', 'minor', 'sus2', 'sus4', 'maj7', 'min7', 'dim', 'aug'];

        let root = '';
        let quality = 'major';
        let bassNote = null;

        // Parse slash chord (e.g., G/B)
        if (chordName.includes('/')) {
            const [chord, bass] = chordName.split('/');
            root = chord.trim();
            bassNote = bass.trim();
        } else {
            root = chordName;
        }

        // Determine quality
        for (const qual of qualities) {
            if (root.endsWith(qual)) {
                quality = qual;
                break;
            }
        }

        return { root, quality, bassNote };
    }

    /**
     * Check file extension validity
     */
    isValidExtension(filename) {
        const validExtensions = ['wav', 'mp3', 'ogg', 'm4a', 'flac'];
        const ext = filename.split('.').pop().toLowerCase();
        return validExtensions.includes(ext);
    }

    /**
     * Format time in seconds to MM:SS
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Cleanup audio resources
     */
    cleanup() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.isPlaying = false;
        this.startTime = 0;
        this.pausedAt = 0;
    }
}

// Create global instance for use across modules
const audioProcessor = new AudioProcessor();
