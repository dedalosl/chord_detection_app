/**
 * Main Application Module
 * Ties all modules together and handles user interactions
 */

// Initialize global variables
let timelineViewer = null;
let tabRenderer = null;
let detectedChords = [];
let audioBuffer = null;
let isPlaying = false;
let currentPlaybackTime = 0;

// DOM Elements
const audioFileInput = document.getElementById('audioFile');
const processButton = document.getElementById('processButton');
const resultsSection = document.getElementById('resultsSection');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.querySelector('.progress-fill');
const progressText = document.getElementById('progressText');
const errorMessage = document.getElementById('errorMessage');
const chordDisplay = document.getElementById('currentChordDisplay');
const chordNameElement = document.getElementById('chordName');
const chordTimeElement = document.getElementById('chordTime');
const currentTimeElement = document.getElementById('currentTime');
const playButton = document.getElementById('playButton');
const pauseButton = document.getElementById('pauseButton');

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if canvas exists for timeline viewer
    const timelineCanvas = document.getElementById('timelineCanvas');
    if (timelineCanvas) {
        timelineViewer = new TimelineViewer('timelineCanvas', handleTimelineInteraction);
    }

    tabRenderer = new TabRenderer();

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
    audioBuffer = null; // Would be set if we actually played the audio

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

    // Render timeline viewer
    if (timelineViewer) {
        timelineViewer.setChords(detectedChords, result.duration || 30);
    }

    // Render chord diagrams
    const uniqueChords = tabRenderer.renderChordDiagrams(result.chords);
    console.log('Unique chords:', uniqueChords);

    // Render full tablature sequence
    tabRenderer.renderFullTab(detectedChords);

    // Populate chords list
    populateChordsList();

    // Enable playback controls (if we had actual audio)
    enablePlaybackControls(true);

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
 * Handle play button click
 */
function handlePlayAudio() {
    if (!detectedChords.length) return;

    isPlaying = true;
    playButton.disabled = true;
    pauseButton.disabled = false;

    if (timelineViewer) {
        timelineViewer.setPlaying(true);
    }

    // Start playback simulation
    startPlayback();
}

/**
 * Handle pause button click
 */
function handlePauseAudio() {
    isPlaying = false;
    playButton.disabled = false;
    pauseButton.disabled = true;

    if (timelineViewer) {
        timelineViewer.setPlaying(false);
    }

    // Clear playback interval
    clearInterval(playbackInterval);
}

/**
 * Simulate audio playback with chord updates
 */
let playbackInterval = null;

function startPlayback() {
    const startTime = Date.now();
    const initialTime = currentPlaybackTime;

    playbackInterval = setInterval(() => {
        if (!isPlaying) return;

        const elapsed = (Date.now() - startTime) / 1000;
        currentPlaybackTime = initialTime + elapsed;

        // Update time display
        currentTimeElement.textContent = `${formatTime(currentPlaybackTime)} / ${formatTime(30)}`;

        // Find and highlight current chord
        const currentChord = findCurrentChord();
        if (currentChord) {
            chordNameElement.textContent = currentChord.name;
            chordTimeElement.textContent = `at ${formatTime(currentPlaybackTime)}`;
            chordDisplay.classList.remove('hidden');

            // Update timeline viewer position
            if (timelineViewer) {
                timelineViewer.updatePosition(currentPlaybackTime);
            }

            // Highlight in tab view
            if (tabRenderer) {
                tabRenderer.highlightCurrentChord(currentChord.name);
            }
        }

        // Check if playback should stop
        if (currentPlaybackTime >= 30) {
            stopPlayback();
        }
    }, 100);
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
 * Stop playback and reset state
 */
function stopPlayback() {
    isPlaying = false;
    clearInterval(playbackInterval);
    playButton.disabled = false;
    pauseButton.disabled = true;

    if (timelineViewer) {
        timelineViewer.setPlaying(false);
    }

    currentTimeElement.textContent = 'Finished';
}

/**
 * Seek to a specific chord by index
 */
function seekToChord(index) {
    if (!detectedChords[index]) return;

    currentPlaybackTime = detectedChords[index].time;
    currentTimeElement.textContent = `${formatTime(currentPlaybackTime)} / ${formatTime(30)}`;

    // Update timeline viewer
    if (timelineViewer) {
        timelineViewer.updatePosition(currentPlaybackTime);
    }

    // Highlight chord in tab view
    const chord = detectedChords[index];
    if (tabRenderer) {
        tabRenderer.highlightCurrentChord(chord.name);
    }

    // Update current chord display
    chordNameElement.textContent = chord.name;
    chordTimeElement.textContent = `at ${formatTime(currentPlaybackTime)}`;
    chordDisplay.classList.remove('hidden');
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
