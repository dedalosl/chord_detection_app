/**
 * Main Application Module
 * Ties all modules together and handles user interactions
 */

//const { AudioProcessor } = require('./audio-processor').default;
//const audioProcessor = new AudioProcessor();

// Initialize global variables
let timelineViewer = null;
let tabRenderer = null;
let detectedChords = [];
let audioBuffer = null;
let isPlaying = false;
let currentPlaybackTime = 0;
let audioDuration = 0;
let audioSource = null;      // AudioBufferSourceNode
let audioStartTime = 0;      // audioContext.currentTime when play started
let audioPausedAt = 0;       // audio offset where playback was paused

// DOM Elements
const audioFileInput   = document.getElementById('audioFile');
const processButton    = document.getElementById('processButton');
const resultsSection   = document.getElementById('resultsSection');
const progressContainer= document.getElementById('progressContainer');
const progressFill     = document.querySelector('.progress-fill');
const progressText     = document.getElementById('progressText');
const errorMessage     = document.getElementById('errorMessage');
const chordDisplay     = document.getElementById('currentChordDisplay');
const chordNameElement = document.getElementById('chordName');
const chordTimeElement = document.getElementById('chordTime');
const currentTimeElement = document.getElementById('currentTime');
const playButton       = document.getElementById('playButton');
const pauseButton      = document.getElementById('pauseButton');
const playerBar        = document.getElementById('playerBar');
const fileNameDisplay  = document.getElementById('fileNameDisplay');

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if canvas exists for timeline viewer
    const timelineCanvas = document.getElementById('timelineCanvas');
    if (timelineCanvas) {
        timelineViewer = new TimelineViewer('timelineCanvas', handleTimelineInteraction);
    }

    tabRenderer = new TabRenderer();

    // Show selected file name in the drop zone label
    audioFileInput.addEventListener('change', () => {
        const file = audioFileInput.files[0];
        if (file && fileNameDisplay) {
            fileNameDisplay.textContent = file.name;
            fileNameDisplay.classList.add('has-file');
        }
    });

    // Drag & drop support on the file-drop-zone label
    const dropZone = document.querySelector('.file-drop-zone');
    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', (e) => {
            if (!dropZone.contains(e.relatedTarget)) {
                dropZone.classList.remove('drag-over');
            }
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('audio/')) {
                const dt = new DataTransfer();
                dt.items.add(file);
                audioFileInput.files = dt.files;
                if (fileNameDisplay) {
                    fileNameDisplay.textContent = file.name;
                    fileNameDisplay.classList.add('has-file');
                }
            }
        });
    }

    // Set up event listeners
    setupEventListeners();
});

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    processButton.addEventListener('click', handleProcessAudio);
    playButton.addEventListener('click', handlePlayAudio);
    pauseButton.addEventListener('click', handlePauseAudio);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && detectedChords.length > 0) {
            e.preventDefault();
            if (isPlaying) {
                handlePauseAudio();
            } else {
                handlePlayAudio();
            }
        }
    });
}

/**
 * Handle audio file processing
 */
async function handleProcessAudio() {
    // Validate file selection
    if (!audioFileInput.files.length) {
        showError('Please select an audio file first.');
        return;
    }

    // Reset UI state
    hideError();
    showProgress(true);
    resultsSection.classList.add('hidden');

    try {
        await audioProcessor.uploadAndProcess(
            audioFileInput,
            updateProgress,
            handleProcessingComplete,
            handleProcessingError
        );
    } catch (error) {
        console.error('Error in process:', error);
        handleProcessingError(error.message || 'Failed to process audio');
    }
}

/**
 * Update progress bar during processing
 */
function updateProgress(percentage) {
    const percent = Math.min(100, Math.max(0, percentage));
    progressFill.style.width = `${percent}%`;
    progressText.textContent = `Processing... ${Math.round(percent)}%`;

    if (percent >= 100) {
        setTimeout(() => {
            showProgress(false);
        }, 500);
    }
}

/**
 * Handle successful processing completion
 */
function handleProcessingComplete(result) {
    detectedChords = result.chords;
    audioDuration = result.duration || 0;
    audioBuffer = audioProcessor.decodedBuffer;
    audioPausedAt = 0;
    currentPlaybackTime = 0;

    console.log('Detected chords:', detectedChords);
    if (result.method) {
        console.log(`Using ${result.method} for chord detection`);
    }

    // Update UI with results
    displayResults(result);

    hideError();
}

/**
 * Handle processing errors
 */
function handleProcessingError(error) {
    showError(error || 'Failed to process audio file.');
    showProgress(false);
    progressFill.style.width = '0%';
}

/**
 * Display analysis results
 */
function displayResults(result) {
    // Hide progress, show results
    showProgress(false);
    resultsSection.classList.remove('hidden');

    // Render song structure
    renderSongStructure(result.sections || [], result.duration || 30);

    // Render timeline viewer
    if (timelineViewer) {
        timelineViewer.setChords(detectedChords, result.duration || 30);
    }

    // Render chord diagrams
    const uniqueChords = tabRenderer.renderChordDiagrams(result.chords);
    console.log('Unique chords:', uniqueChords);

    // Render full tablature sequence (section-based)
    tabRenderer.renderFullTab(detectedChords, result.sections || [], result.tempo || 120);

    // Populate chords list
    populateChordsList();

    // Enable playback controls and show sticky player bar
    enablePlaybackControls(true);
    if (playerBar) playerBar.classList.remove('hidden');

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Colours per section name (for the structure map)
const SECTION_COLORS = {
    'Intro':   { bg: '#6ee7b7', text: '#064e3b' },
    'Verse':   { bg: '#93c5fd', text: '#1e3a5f' },
    'Chorus':  { bg: '#fca5a5', text: '#7f1d1d' },
    'Bridge':  { bg: '#c4b5fd', text: '#3b0764' },
    'Outro':   { bg: '#d1d5db', text: '#374151' },
};
const SECTION_LABEL_COLORS = [
    { bg: '#93c5fd', text: '#1e3a5f' },  // A – blue
    { bg: '#fca5a5', text: '#7f1d1d' },  // B – red
    { bg: '#6ee7b7', text: '#064e3b' },  // C – green
    { bg: '#c4b5fd', text: '#3b0764' },  // D – purple
    { bg: '#fde68a', text: '#713f12' },  // E – yellow
    { bg: '#fbcfe8', text: '#831843' },  // F – pink
    { bg: '#a5f3fc', text: '#164e63' },  // G – cyan
    { bg: '#d9f99d', text: '#365314' },  // H – lime
];

function sectionColor(section) {
    if (SECTION_COLORS[section.name]) return SECTION_COLORS[section.name];
    const idx = section.label.charCodeAt(0) - 65; // A=0, B=1…
    return SECTION_LABEL_COLORS[idx % SECTION_LABEL_COLORS.length];
}

/**
 * Render the Song Structure horizontal map + legend.
 */
function renderSongStructure(sections, totalDuration) {
    const container = document.getElementById('structureDisplay');
    if (!container) return;
    container.innerHTML = '';

    if (!sections || sections.length === 0) {
        container.innerHTML = '<p class="structure-empty">Structure not available for this track.</p>';
        return;
    }

    // ── Horizontal structure bar ──────────────────────────────
    const bar = document.createElement('div');
    bar.className = 'structure-bar';

    sections.forEach(sec => {
        const pct = ((sec.end - sec.start) / totalDuration * 100).toFixed(2);
        const col = sectionColor(sec);

        const seg = document.createElement('div');
        seg.className = 'structure-segment';
        seg.style.cssText = `width:${pct}%;background:${col.bg};color:${col.text};`;
        seg.title = `${sec.name} (${formatTime(sec.start)} – ${formatTime(sec.end)})`;
        seg.dataset.start = sec.start;

        seg.innerHTML = `
            <span class="structure-seg-label">${sec.label}</span>
            <span class="structure-seg-name">${sec.name}</span>
        `;

        // Click → seek to section start
        seg.addEventListener('click', () => seekToTime(sec.start));
        bar.appendChild(seg);
    });

    container.appendChild(bar);

    // ── Time ruler ───────────────────────────────────────────
    const ruler = document.createElement('div');
    ruler.className = 'structure-ruler';
    sections.forEach(sec => {
        const pct = (sec.start / totalDuration * 100).toFixed(2);
        const tick = document.createElement('span');
        tick.className = 'structure-tick';
        tick.style.left = `${pct}%`;
        tick.textContent = formatTime(sec.start);
        ruler.appendChild(tick);
    });
    container.appendChild(ruler);

    // ── Legend ───────────────────────────────────────────────
    const legend = document.createElement('div');
    legend.className = 'structure-legend';

    // Deduplicate by label
    const seen = new Set();
    sections.forEach(sec => {
        if (seen.has(sec.label)) return;
        seen.add(sec.label);
        const col = sectionColor(sec);

        const item = document.createElement('div');
        item.className = 'structure-legend-item';

        const swatch = document.createElement('span');
        swatch.className = 'structure-legend-swatch';
        swatch.style.background = col.bg;

        const labelEl = document.createElement('span');
        labelEl.className = 'structure-legend-text';
        labelEl.textContent = `${sec.label} – ${sec.name}`;

        // Show chords for this section
        if (sec.chords && sec.chords.length) {
            const chordsEl = document.createElement('span');
            chordsEl.className = 'structure-legend-chords';
            chordsEl.textContent = sec.chords.join(' › ');
            item.appendChild(swatch);
            item.appendChild(labelEl);
            item.appendChild(chordsEl);
        } else {
            item.appendChild(swatch);
            item.appendChild(labelEl);
        }

        legend.appendChild(item);
    });

    container.appendChild(legend);
}

/** Seek audio playback to a specific time in seconds */
function seekToTime(seconds) {
    // Find the chord index closest to the requested time and use existing seek logic
    if (!detectedChords.length) return;
    let closest = 0;
    let minDiff = Infinity;
    detectedChords.forEach((c, i) => {
        const diff = Math.abs(c.time - seconds);
        if (diff < minDiff) { minDiff = diff; closest = i; }
    });
    seekToChord(closest);
}

/**
 * Populate the chords timeline list
 */
function populateChordsList() {
    const list = document.getElementById('chordsList');
    if (!list) return;

    list.innerHTML = '';

    detectedChords.forEach((chord, index) => {
        const li = document.createElement('li');
        li.className = 'timeline-item';
        li.dataset.index = index;
        li.innerHTML = `
            <span class="time-badge">${formatTime(chord.time)}</span>
            <span class="chord-badge" data-chord="${chord.name}">${chord.name}</span>
            ${index > 0 ? '<span class="arrow">→</span>' : ''}
        `;

        li.addEventListener('click', () => {
            // Seek to this chord (would trigger playback if we had audio)
            seekToChord(index);
        });

        list.appendChild(li);
    });
}

/**
 * Handle timeline interaction (hover/click)
 */
function handleTimelineInteraction(chord, isClick = false) {
    if (!chord) {
        chordDisplay.classList.add('hidden');
        return;
    }

    // Update current chord display
    chordNameElement.textContent = chord.name;
    chordTimeElement.textContent = `at ${formatTime(chord.time)}`;
    chordDisplay.classList.remove('hidden');

    if (isClick) {
        // Would trigger playback to this position
        seekToChord(chord.index);
    }
}

/**
 * Handle play button click — uses Web Audio API for real playback
 */
function handlePlayAudio() {
    if (!audioBuffer || !detectedChords.length) return;

    const ctx = audioProcessor.initAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    audioSource = ctx.createBufferSource();
    audioSource.buffer = audioBuffer;
    audioSource.connect(ctx.destination);
    audioSource.start(0, audioPausedAt);
    audioStartTime = ctx.currentTime - audioPausedAt;

    isPlaying = true;
    playButton.disabled = true;
    pauseButton.disabled = false;

    audioSource.onended = () => { if (isPlaying) stopPlayback(); };

    if (timelineViewer) timelineViewer.setPlaying(true);
    startPlayback();
}

/**
 * Handle pause button click
 */
function handlePauseAudio() {
    if (!isPlaying) return;

    audioPausedAt = audioProcessor.audioContext.currentTime - audioStartTime;
    if (audioSource) {
        audioSource.onended = null;
        try { audioSource.stop(); } catch (e) {}
        audioSource = null;
    }

    isPlaying = false;
    clearInterval(playbackInterval);
    playButton.disabled = false;
    pauseButton.disabled = true;
    if (timelineViewer) timelineViewer.setPlaying(false);
}

/**
 * Sync UI to AudioContext position during playback
 */
let playbackInterval = null;

function startPlayback() {
    clearInterval(playbackInterval);
    playbackInterval = setInterval(() => {
        if (!isPlaying || !audioProcessor.audioContext) return;

        currentPlaybackTime = audioProcessor.audioContext.currentTime - audioStartTime;
        currentTimeElement.textContent = `${formatTime(currentPlaybackTime)} / ${formatTime(audioDuration)}`;

        const currentChord = findCurrentChord();
        if (currentChord) {
            chordNameElement.textContent = currentChord.name;
            chordTimeElement.textContent = `at ${formatTime(currentPlaybackTime)}`;
            chordDisplay.classList.remove('hidden');
            if (timelineViewer) timelineViewer.updatePosition(currentPlaybackTime);
            if (tabRenderer) tabRenderer.highlightCurrentChord(currentChord.name);
            highlightChordInList(currentChord);
        }

        if (currentPlaybackTime >= audioDuration) stopPlayback();
    }, 100);
}

/**
 * Highlight the active chord in the strip — scrolls only within the container
 */
function highlightChordInList(chord) {
    const list = document.getElementById('chordsList');
    if (!list) return;
    list.querySelectorAll('.timeline-item').forEach(el => el.classList.remove('active-chord'));
    const index = detectedChords.indexOf(chord);
    if (index >= 0) {
        const item = list.querySelector(`[data-index="${index}"]`);
        if (item) {
            item.classList.add('active-chord');
            // Scroll only the strip container — never the page
            const targetLeft = item.offsetLeft - list.offsetLeft
                             - list.clientWidth / 2 + item.clientWidth / 2;
            list.scrollTo({ left: targetLeft, behavior: 'smooth' });
        }
    }
}

/**
 * Find current chord based on playback time
 */
function findCurrentChord() {
    for (let i = 0; i < detectedChords.length; i++) {
        const chord = detectedChords[i];
        const nextChord = detectedChords[i + 1];

        if (currentPlaybackTime >= chord.time && (!nextChord || currentPlaybackTime < nextChord.time)) {
            return chord;
        }
    }
    return null;
}

/**
 * Stop playback and reset to start
 */
function stopPlayback() {
    isPlaying = false;
    audioPausedAt = 0;
    clearInterval(playbackInterval);

    if (audioSource) {
        audioSource.onended = null;
        try { audioSource.stop(); } catch (e) {}
        audioSource = null;
    }

    playButton.disabled = false;
    pauseButton.disabled = true;
    if (timelineViewer) timelineViewer.setPlaying(false);
    currentPlaybackTime = 0;
    currentTimeElement.textContent = `${formatTime(0)} / ${formatTime(audioDuration)}`;
}

/**
 * Seek to a specific chord by index
 */
function seekToChord(index) {
    if (!detectedChords[index]) return;

    const wasPlaying = isPlaying;

    // Stop current source without resetting audioPausedAt yet
    if (isPlaying) {
        if (audioSource) {
            audioSource.onended = null;
            try { audioSource.stop(); } catch (e) {}
            audioSource = null;
        }
        isPlaying = false;
        clearInterval(playbackInterval);
    }

    audioPausedAt = detectedChords[index].time;
    currentPlaybackTime = audioPausedAt;
    currentTimeElement.textContent = `${formatTime(currentPlaybackTime)} / ${formatTime(audioDuration)}`;

    if (timelineViewer) timelineViewer.updatePosition(currentPlaybackTime);

    const chord = detectedChords[index];
    if (tabRenderer) tabRenderer.highlightCurrentChord(chord.name);
    chordNameElement.textContent = chord.name;
    chordTimeElement.textContent = `at ${formatTime(currentPlaybackTime)}`;
    chordDisplay.classList.remove('hidden');

    if (wasPlaying && audioBuffer) handlePlayAudio();
}

/**
 * Enable or disable playback controls
 */
function enablePlaybackControls(enabled) {
    playButton.disabled = !enabled;
    pauseButton.disabled = !enabled || !isPlaying;
}

/**
 * Show error message
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Hide error message
 */
function hideError() {
    errorMessage.classList.add('hidden');
}

/**
 * Show/hide progress container
 */
function showProgress(show) {
    if (show) {
        progressContainer.classList.remove('hidden');
    } else {
        progressContainer.classList.add('hidden');
    }
}

/**
 * Format time in seconds to MM:SS
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Clean up on page unload
 */
window.addEventListener('beforeunload', () => {
    audioProcessor.cleanup();
});
