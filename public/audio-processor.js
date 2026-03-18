/**
 * Audio Processor Module
 * Handles audio file upload, analysis, and chord detection simulation
 */

class AudioProcessor {
    constructor() {
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
        // Prioritized: basic triads first, then extended chords
        this.chordTemplates = {
            'major': [0, 4, 7],      // Major triad (highest priority)
            'minor': [0, 3, 7],      // Minor triad (highest priority)
            'dim': [0, 3, 6],        // Diminished
            'sus2': [0, 2, 7],       // Suspended 2nd
            'sus4': [0, 5, 7],       // Suspended 4th
            'maj7': [0, 4, 7, 11],   // Major 7th
            'min7': [0, 3, 7, 10],   // Minor 7th
            'dom7': [0, 4, 7, 10],   // Dominant 7th
        };

        // Chord detection priorities (lower = higher priority)
        this.chordPriorities = {
            'major': 0,
            'minor': 0,
            'dim': 2,
            'sus2': 3,
            'sus4': 3,
            'maj7': 4,
            'min7': 4,
            'dom7': 4,
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
            onProgress(10);

            // Decode audio locally for playback only
            const audioCtx = this.initAudioContext();
            if (audioCtx.state === 'suspended') {
                audioCtx.resume().catch(err => console.warn('Could not resume audio context:', err));
            }
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
            this.decodedBuffer = audioBuffer;
            onProgress(20);

            // Upload to server for Python-based chord + structure detection
            const formData = new FormData();
            formData.append('audioFile', file);

            onProgress(30);

            const response = await fetch('/api/chords', {
                method: 'POST',
                body: formData
            });

            onProgress(90);

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || `Server error ${response.status}`);
            }

            const result = await response.json();
            onProgress(100);

            onComplete({
                chords:       result.chords       || [],
                sections:     result.sections      || [],
                uniqueChords: result.uniqueChords  || [],
                key:          result.key,
                tempo:        result.tempo,
                duration:     result.duration || Math.round(audioBuffer.duration),
                fileName:     file.name,
                method:       'Python / librosa'
            });

        } catch (error) {
            console.error('Error processing audio:', error);
            onError(error.message || 'Failed to process audio file. Please try again.');
        }
    }

    /** Analyze audio buffer for chord detection using FFT (Fast Fourier Transform) */
    async analyzeChords(audioBuffer, progressCallback, fileName) {
        return await this.fftAnalyze(audioBuffer, progressCallback);
    }

    /**
     * Implements FFT-based frequency analysis to detect the dominant frequency (pitch)
     * and maps it to a musical note (Root).
     * 
     * @param {AudioBuffer} audioBuffer - The audio buffer to analyze.
     * @returns {string|null} - The detected root note (e.g., "C", "C#", "D") or null.
     */
    getDominantRoot(audioBuffer) {
        const channelData = audioBuffer.getChannelData(0);
        const length = channelData.length;
        
        // Use FFT to analyze the entire buffer
        const fftSize = Math.min(4096, length);
        const fftResult = this.computeFFT(channelData.slice(0, fftSize), fftSize);
        
        // Find the frequency bin with maximum magnitude
        let maxMagnitude = 0;
        let maxBin = 0;
        
        for (let i = 0; i < fftSize / 2; i++) {
            const magnitude = Math.sqrt(fftResult.real[i] ** 2 + fftResult.imag[i] ** 2);
            if (magnitude > maxMagnitude) {
                maxMagnitude = magnitude;
                maxBin = i;
            }
        }
        
        // Map the dominant frequency bin to a note
        const sampleRate = audioBuffer.sampleRate;
        const dominantFreq = (maxBin * sampleRate) / fftSize;
        
        return this.frequencyToNote(dominantFreq);
    }
    
    /**
     * Compute FFT using Cooley-Tukey algorithm
     * @param {Float32Array} signal - Input signal (must be power of 2 length)
     * @param {number} n - Size of FFT (must be power of 2)
     * @returns {Object} - Object with real and imaginary arrays
     */
    computeFFT(signal, n) {
        // Ensure input is power of 2
        if (!this.isPowerOfTwo(n)) {
            n = this.nextPowerOfTwo(signal.length);
        }
        
        // Pad signal with zeros if necessary
        const padded = new Float32Array(n);
        padded.set(signal.slice(0, Math.min(signal.length, n)));
        
        // Initialize complex arrays
        const real = new Float64Array(n);
        const imag = new Float64Array(n);
        
        for (let i = 0; i < n; i++) {
            real[i] = padded[i];
            imag[i] = 0;
        }
        
        // Bit-reversal permutation
        this.bitReverseCopy(real, imag, n);
        
        // Cooley-Tukey FFT algorithm
        const logN = Math.log2(n);
        for (let stage = 1; stage <= logN; stage++) {
            const m = 1 << stage; // 2^stage
            const mHalf = m >> 1;
            const angleStep = -2 * Math.PI / m;
            
            for (let k = 0; k < n; k += m) {
                let angle = 0;
                for (let j = 0; j < mHalf; j++) {
                    const wReal = Math.cos(angle);
                    const wImag = Math.sin(angle);
                    angle += angleStep;
                    
                    const i1 = k + j;
                    const i2 = k + j + mHalf;
                    
                    const tReal = wReal * real[i2] - wImag * imag[i2];
                    const tImag = wReal * imag[i2] + wImag * real[i2];
                    
                    real[i2] = real[i1] - tReal;
                    imag[i2] = imag[i1] - tImag;
                    real[i1] = real[i1] + tReal;
                    imag[i1] = imag[i1] + tImag;
                }
            }
        }
        
        return { real, imag };
    }
    
    /** Bit-reversal permutation for FFT */
    bitReverseCopy(real, imag, n) {
        const logN = Math.log2(n);
        const resultReal = new Float64Array(n);
        const resultImag = new Float64Array(n);
        
        for (let i = 0; i < n; i++) {
            let rev = 0;
            let temp = i;
            for (let j = 0; j < logN; j++) {
                rev = (rev << 1) | (temp & 1);
                temp >>= 1;
            }
            resultReal[rev] = real[i];
            resultImag[rev] = imag[i];
        }
        
        real.set(resultReal);
        imag.set(resultImag);
    }
    
    /** Check if number is power of 2 */
    isPowerOfTwo(n) {
        return (n > 0) && ((n & (n - 1)) === 0);
    }
    
    /** Get next power of 2 */
    nextPowerOfTwo(n) {
        if (n <= 0) return 1;
        let power = 1;
        while (power < n) power *= 2;
        return power;
    }
    
    /**
     * Detect BPM from audio data using onset-strength autocorrelation.
     * Returns a tempo in the range 70–160 BPM.
     */
    detectBPM(data, sampleRate) {
        // Analyse only the first 30 s for speed
        const analyzeLen = Math.min(data.length, sampleRate * 30);

        // Onset-strength envelope at ~100 fps (10 ms hop)
        const hopSize = Math.max(1, Math.floor(sampleRate / 100));
        const winSize = hopSize * 2;
        const fps     = sampleRate / hopSize;

        const onsets = [];
        let prevEnergy = 0;
        for (let i = 0; i + winSize <= analyzeLen; i += hopSize) {
            let e = 0;
            for (let j = 0; j < winSize; j++) e += data[i + j] ** 2;
            e = Math.sqrt(e / winSize);
            onsets.push(Math.max(0, e - prevEnergy));
            prevEnergy = e;
        }

        // Autocorrelation over the lag range for 55 – 205 BPM
        const lagMin = Math.max(1, Math.floor(fps * 60 / 205));
        const lagMax = Math.ceil(fps * 60 / 55);
        const n = onsets.length;

        let bestLag   = Math.round(fps * 60 / 120);
        let bestScore = -Infinity;

        for (let lag = lagMin; lag <= lagMax; lag++) {
            let score = 0;
            for (let i = 0; i < n - lag; i++) score += onsets[i] * onsets[i + lag];
            if (score > bestScore) { bestScore = score; bestLag = lag; }
        }

        let bpm = fps * 60 / bestLag;

        // Resolve octave ambiguity — keep in musical range 70–160
        while (bpm > 160) bpm /= 2;
        while (bpm < 70)  bpm *= 2;

        return bpm;
    }

    /**
     * Find the time offset (in seconds) of the first bar downbeat.
     * Tests every 50 ms phase shift within one bar and picks the one
     * that maximises energy at bar-boundary positions.
     */
    detectBeatPhase(data, sampleRate, bpm) {
        const beatDuration = 60 / bpm;
        const barDuration  = beatDuration * 4;

        const hopSize    = Math.max(1, Math.floor(sampleRate / 100)); // 10 ms
        const winSize    = hopSize * 2;
        const fps        = sampleRate / hopSize;
        const barFrames  = Math.round(barDuration * fps);
        const phaseStep  = Math.max(1, Math.round(0.05 * fps)); // test every 50 ms

        // Energy envelope
        const envelope = [];
        for (let i = 0; i + winSize <= data.length; i += hopSize) {
            let e = 0;
            for (let j = 0; j < winSize; j++) e += data[i + j] ** 2;
            envelope.push(Math.sqrt(e / winSize));
        }

        // Search within the first 8 bars for the best phase
        const searchEnd = Math.min(envelope.length, barFrames * 8);

        let bestPhase = 0;
        let bestScore = -Infinity;

        for (let phase = 0; phase < barFrames; phase += phaseStep) {
            let score = 0, count = 0;
            for (let pos = phase; pos < searchEnd; pos += barFrames) {
                score += envelope[pos] ?? 0;
                count++;
            }
            if (count > 0 && score / count > bestScore) {
                bestScore = score / count;
                bestPhase = phase;
            }
        }

        return bestPhase / fps; // seconds
    }

    /**
     * Detect the musical key from audio using the Krumhansl-Schmuckler profiles.
     * Accumulates a full-song chromagram and correlates it against all 24 key templates.
     * Returns { root: 'A', mode: 'major' }.
     */
    detectKey(data, sampleRate) {
        const fftSize    = 4096;
        const hopSize    = 4096; // non-overlapping for speed
        const analyzeLen = Math.min(data.length, sampleRate * 90);
        const totalChroma = new Float32Array(12);

        for (let i = 0; i + fftSize <= analyzeLen; i += hopSize) {
            const frame = new Float32Array(fftSize);
            let energy = 0;
            for (let j = 0; j < fftSize; j++) {
                const w = 0.5 * (1 - Math.cos(2 * Math.PI * j / fftSize));
                frame[j] = data[Math.min(i + j, data.length - 1)] * w;
                energy += frame[j] ** 2;
            }
            if (energy < 0.001 * fftSize) continue;
            const fft    = this.computeFFT(frame, fftSize);
            const chroma = this.computeChromagram(fft, fftSize, sampleRate);
            for (let j = 0; j < 12; j++) totalChroma[j] += chroma[j];
        }

        // Normalise total chroma to a probability distribution
        const sum = totalChroma.reduce((a, b) => a + b, 0);
        if (sum > 0) for (let i = 0; i < 12; i++) totalChroma[i] /= sum;

        // Krumhansl-Schmuckler key profiles (index 0 = root of key)
        const majorProfile = [6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88];
        const minorProfile = [6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17];
        const notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

        let bestScore = -Infinity, bestRoot = 'A', bestMode = 'major';

        for (let root = 0; root < 12; root++) {
            for (const [mode, profile] of [['major', majorProfile], ['minor', minorProfile]]) {
                let score = 0;
                for (let i = 0; i < 12; i++) score += totalChroma[(root + i) % 12] * profile[i];
                if (score > bestScore) { bestScore = score; bestRoot = notes[root]; bestMode = mode; }
            }
        }
        return { root: bestRoot, mode: bestMode };
    }

    /**
     * Generate triad chord candidates for a given key.
     * Includes the 7 diatonic chords + secondary dominants (major chord a
     * perfect 5th above each diatonic root) to cover chords like V/vi.
     * Only triads — no 7th chords — to avoid harmonic-series false positives.
     */
    getKeyCandidates(keyRoot, keyMode) {
        const notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
        const ri = notes.indexOf(keyRoot);
        const seen = new Map();
        const add  = (root, quality) => { const k = root + quality; if (!seen.has(k)) seen.set(k, { root, quality }); };

        if (keyMode === 'major') {
            // I  ii  iii  IV  V  vi  vii°
            const scale = [0, 2, 4, 5, 7, 9, 11];
            const quals = ['major','minor','minor','major','major','minor','dim'];
            for (let i = 0; i < 7; i++) add(notes[(ri + scale[i]) % 12], quals[i]);
            // Secondary dominants: major triad a 5th above each diatonic chord (skip vii°)
            for (let i = 0; i < 6; i++) add(notes[(ri + scale[i] + 7) % 12], 'major');
        } else {
            // i  ii°  III  iv  v  VI  VII  (natural minor)
            const scale = [0, 2, 3, 5, 7, 8, 10];
            const quals = ['minor','dim','major','minor','minor','major','major'];
            for (let i = 0; i < 7; i++) add(notes[(ri + scale[i]) % 12], quals[i]);
            // Harmonic minor V (raised 7th)
            add(notes[(ri + 7) % 12], 'major');
            for (let i = 0; i < 6; i++) add(notes[(ri + scale[i] + 7) % 12], 'major');
        }

        return Array.from(seen.values());
    }

    /**
     * Convert frequency to nearest musical note
     * @param {number} freq - Frequency in Hz
     * @returns {string} - Note name (e.g., "C", "C#", "D")
     */
    frequencyToNote(freq) {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const A4 = 440;
        const semitone = 12 * Math.log2(freq / A4);
        const noteIndex = Math.round(semitone) + 9; // A4 is at index 9
        return notes[noteIndex % 12];
    }
    /**
     * FFT-based chord analysis using Fast Fourier Transform
     */
    async fftAnalyze(audioBuffer, progressCallback) {
        // Estimate dominant root for key biasing using FFT
        const dominantRoot = this.getDominantRoot(audioBuffer);
        console.log('Using FFT-based chord detection');
        console.log('Dominant root detected:', dominantRoot);

        const channelData = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate;
        const duration = audioBuffer.duration;

        // Downsample for efficiency if needed
        let dataToProcess = channelData;
        let effectiveSampleRate = sampleRate;
        if (sampleRate > 22050) {
            const ratio = Math.floor(sampleRate / 22050);
            dataToProcess = new Float32Array(channelData.length / ratio);
            for (let i = 0; i < dataToProcess.length; i++) {
                dataToProcess[i] = channelData[i * ratio];
            }
            effectiveSampleRate = sampleRate / ratio;
        }

        const frameSize = 2048; // Must be power of 2 for FFT
        const hopSize = 512;

        // --- BPM detection & bar-aligned chunk boundaries ---
        const bpm         = this.detectBPM(dataToProcess, effectiveSampleRate);
        const beatDuration = 60 / bpm;
        const barDuration  = beatDuration * 4; // 4/4 time
        const beatPhase    = this.detectBeatPhase(dataToProcess, effectiveSampleRate, bpm);

        console.log(`BPM: ${bpm.toFixed(1)}, bar: ${barDuration.toFixed(2)}s, phase offset: ${beatPhase.toFixed(2)}s`);

        // Build list of bar start times aligned to detected downbeat
        const chunkStarts = [];
        for (let t = beatPhase; t < duration - barDuration * 0.25; t += barDuration) {
            chunkStarts.push(t);
        }
        // Fallback: fixed 2 s windows if BPM detection gave too few chunks
        if (chunkStarts.length < 3) {
            chunkStarts.length = 0;
            for (let t = 0; t < duration; t += 2.0) chunkStarts.push(t);
        }

        console.log(`Bar-aligned analysis: ${chunkStarts.length} bars at ${bpm.toFixed(0)} BPM`);

        // Detect key and build constrained chord candidate list (triads only)
        const key        = this.detectKey(dataToProcess, effectiveSampleRate);
        const candidates = this.getKeyCandidates(key.root, key.mode);
        console.log(`Key: ${key.root} ${key.mode} → candidates: ${candidates.map(c => c.root + (c.quality === 'major' ? '' : c.quality === 'minor' ? 'm' : c.quality)).join(' ')}`);

        // Analyze each bar
        const chordScoresAtTime = [];

        for (let chunkIdx = 0; chunkIdx < chunkStarts.length; chunkIdx++) {
            const barStartSec = chunkStarts[chunkIdx];
            const barEndSec   = chunkStarts[chunkIdx + 1] ?? duration;

            const chunkStartTime = Math.floor(barStartSec * effectiveSampleRate / hopSize);
            const chunkEndTime   = Math.min(
                Math.floor(barEndSec * effectiveSampleRate / hopSize),
                Math.floor(dataToProcess.length / hopSize)
            );

            // Accumulate a chroma vector across all frames in this bar
            const barChroma = new Float32Array(12);
            let activeFrames = 0;

            for (let frame = chunkStartTime; frame < chunkEndTime; frame++) {
                const startSample = frame * hopSize;

                // Extract frame with Hann window
                const frameData = new Float32Array(frameSize);
                let energy = 0;
                for (let i = 0; i < frameSize; i++) {
                    const s = dataToProcess[Math.min(startSample + i, dataToProcess.length - 1)];
                    const w = 0.5 * (1 - Math.cos(2 * Math.PI * i / frameSize));
                    frameData[i] = s * w;
                    energy += frameData[i] ** 2;
                }

                if (energy < 0.005) continue; // skip silent frames

                // Compute FFT → chroma and accumulate into bar chroma
                const fftResult = this.computeFFT(frameData, frameSize);
                const frameChroma = this.computeChromagram(fftResult, frameSize, effectiveSampleRate);
                for (let i = 0; i < 12; i++) barChroma[i] += frameChroma[i];
                activeFrames++;
            }

            if (activeFrames === 0) continue;

            // Normalise accumulated bar chroma
            const chromaMax = Math.max(...barChroma);
            if (chromaMax > 0) for (let i = 0; i < 12; i++) barChroma[i] /= chromaMax;

            // Match bar chroma against key-constrained triad candidates
            let bestScore = -Infinity;
            let bestMatch = null;

            for (const { root, quality } of candidates) {
                const intervals = this.chordTemplates[quality];
                if (!intervals) continue;
                const score = this.scoreChordWithChroma(barChroma, root, intervals);
                if (score > bestScore) {
                    bestScore = score;
                    const suffix = quality === 'minor' ? 'm' : quality === 'major' ? '' : quality;
                    bestMatch = suffix ? `${root}${suffix}` : root;
                }
            }

            // Require a minimum confidence to avoid tagging silent/ambiguous bars
            if (bestMatch && bestScore >= 0.45) {
                chordScoresAtTime.push({
                    name:       bestMatch,
                    time:       Math.round(barStartSec * 100) / 100,
                    confidence: bestScore
                });
            }

            progressCallback(65 + (chunkIdx / chunkStarts.length) * 25);
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
     * Uses weighted scoring that favors simpler chords (triads) over extended chords
     */
    calculateChordScore(frequencies, root, intervals) {
        const rootIndex = this.noteIndex(root);
        const detectedNoteClasses = new Set();
        
        // Extract note classes from detected frequencies
        for (const freq of frequencies) {
            const noteClass = this.noteIndex(freq.note);
            detectedNoteClasses.add(noteClass);
        }

        // Count how many chord tones are present
        let matchCount = 0;
        let exactMatches = 0;
        
        for (const interval of intervals) {
            const targetSemitone = (rootIndex + interval) % 12;
            
            // Check if this note class is in the detected frequencies
            if (detectedNoteClasses.has(targetSemitone)) {
                matchCount++;
                exactMatches++;
            }
        }

        // Calculate base score (percentage of chord tones detected)
        const baseScore = matchCount / intervals.length;
        
        // Apply penalties for complex chords to favor simple triads
        const complexityPenalty = intervals.length > 3 ? 0.15 : 0;
        
        // Apply bonus for detecting all essential chord tones (root, 3rd, 5th)
        const essentialTones = [0, intervals[1], intervals[intervals.length - 1]]; // root, 3rd/minor 3rd, 5th
        const essentialMatches = essentialTones.filter(interval => {
            const targetSemitone = (rootIndex + interval) % 12;
            return detectedNoteClasses.has(targetSemitone);
        }).length;
        
        const essentialBonus = essentialMatches === essentialTones.length ? 0.1 : 0;
        
        // Final score with adjustments
        return Math.max(0, baseScore - complexityPenalty + essentialBonus);
    }

    /**
     * Detect dominant frequencies using FFT (Fast Fourier Transform)
     * @param {Float32Array} frameData - Audio frame data (must be power of 2 length)
     * @param {number} sampleRate - Sample rate of the audio
     * @returns {Array} - Array of detected notes with frequency and magnitude
     */
    detectFrequenciesWithFFT(frameData, sampleRate) {
        const detectedNotes = [];
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        
        // Compute FFT
        const fftResult = this.computeFFT(frameData, frameData.length);
        
        // Calculate frequency resolution
        const freqResolution = sampleRate / frameData.length;
        
        // Analyze frequency bins to find musical notes
        // Focus on the range C2 (65.41 Hz) to B5 (987.77 Hz)
        const minFreq = 65.41;  // C2
        const maxFreq = 987.77; // B5
        
        const minBin = Math.floor(minFreq / freqResolution);
        const maxBin = Math.min(Math.floor(maxFreq / freqResolution), frameData.length / 2);
        
        // Create a map to store best magnitude for each note class (0-11)
        const noteMagnitudes = new Array(12).fill(0);
        const noteFreqs = new Array(12).fill(0);
        
        for (let bin = minBin; bin < maxBin; bin++) {
            // Calculate magnitude from FFT result
            const magnitude = Math.sqrt(fftResult.real[bin] ** 2 + fftResult.imag[bin] ** 2);
            
            // Apply adaptive threshold based on signal energy
            const threshold = 0.005 * frameData.length;
            if (magnitude < threshold) continue;
            
            // Convert bin to frequency
            const freq = bin * freqResolution;
            
            // Convert frequency to semitone (relative to A4 = 440Hz)
            const semitone = 12 * Math.log2(freq / 440);
            const noteClass = Math.round(semitone + 9) % 12;
            
            // Handle negative modulo for notes below A4
            const adjustedNoteClass = (noteClass + 12) % 12;
            
            // Store if this is a better match for this note class
            if (magnitude > noteMagnitudes[adjustedNoteClass]) {
                noteMagnitudes[adjustedNoteClass] = magnitude;
                noteFreqs[adjustedNoteClass] = freq;
            }
        }
        
        // Convert note class magnitudes to detected notes array
        const finalThreshold = 0.008 * frameData.length;
        for (let i = 0; i < 12; i++) {
            if (noteMagnitudes[i] > finalThreshold) {
                detectedNotes.push({
                    note: notes[i],
                    freq: noteFreqs[i],
                    magnitude: noteMagnitudes[i]
                });
            }
        }
        
        // Sort by magnitude (strongest notes first)
        return detectedNotes.sort((a, b) => b.magnitude - a.magnitude);
    }

    /**
     * Compute a 12-dimensional chroma vector from an FFT result.
     * Each pitch class (C=0 … B=11) receives the summed magnitude of
     * every FFT bin whose frequency maps to that semitone class,
     * across ALL octaves.  This is the standard PCP (Pitch Class Profile).
     */
    computeChromagram(fftResult, fftSize, sampleRate) {
        const chroma = new Float32Array(12);
        const freqRes = sampleRate / fftSize;

        // Cover A1 (55 Hz) to C8 (4186 Hz) — the musical range of a guitar
        const minBin = Math.max(1, Math.floor(55   / freqRes));
        const maxBin = Math.min(fftSize / 2, Math.ceil(6000 / freqRes));

        for (let bin = minBin; bin < maxBin; bin++) {
            const mag = Math.sqrt(fftResult.real[bin] ** 2 + fftResult.imag[bin] ** 2);
            if (mag < 1e-6) continue;

            const freq = bin * freqRes;
            // Semitones above A4; shift by +9 to make C=0 (A is 9 semitones above C)
            const pitchClass = ((Math.round(12 * Math.log2(freq / 440)) + 9) % 12 + 12) % 12;
            chroma[pitchClass] += mag;
        }

        return chroma;
    }

    /**
     * Cosine similarity between a chroma vector and a chord template.
     * Returns 0–1 (1 = perfect match).
     */
    scoreChordWithChroma(chroma, rootName, intervals) {
        const notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
        const rootIdx = notes.indexOf(rootName);
        if (rootIdx < 0) return 0;

        // Binary chord template (1 at each chord tone, 0 elsewhere)
        const template = new Float32Array(12);
        for (const iv of intervals) template[(rootIdx + iv) % 12] = 1.0;

        let dot = 0, normA = 0, normB = 0;
        for (let i = 0; i < 12; i++) {
            dot   += chroma[i] * template[i];
            normA += chroma[i] ** 2;
            normB += template[i] ** 2;
        }
        return normA === 0 ? 0 : dot / (Math.sqrt(normA) * Math.sqrt(normB));
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
            { frequency: 392, note: 'G4', chord: ['C', 'G', 'Em', 'Dm'] },
            { frequency: 440, note: 'A4', chord: ['Am', 'F', 'D', 'Bm'] },
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
            this.pauseTime = this.audioContext.currentTime + this.startTime - this.pausedAt;
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
            return this.audioContext.currentTime + this.startTime - this.pausedAt;
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
    audioContext = null;
    analyser = null;
    source = null;
    isPlaying = false;
    startTime = 0;
    pausedAt = 0;
}

// Create global instance for use across modules
// This must happen AFTER the class is defined and exported
const audioProcessor = new AudioProcessor();

// CommonJS fallback (for Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AudioProcessor, audioProcessor };
}