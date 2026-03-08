/**
 * Timeline Viewer Module
 * Renders a visual timeline of detected chords with clickable playback controls
 */

class TimelineViewer {
    constructor(canvasId, chordDisplayCallback) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.chordDisplayCallback = chordDisplayCallback;
        this.scaleX = 10; // pixels per second
        this.scaleY = 80; // height of each chord row
        this.chords = [];
        this.hoveredChord = null;
        this.clickableArea = { x: 0, y: 0, width: 0, height: 0 };

        // Colors for different chord qualities
        this.colors = {
            major: '#3498db',      // Blue
            minor: '#e74c3c',      // Red
            sus2: '#2ecc71',       // Green
            sus4: '#f39c12',       // Orange
            maj7: '#9b59b6',       // Purple
            min7: '#1abc9c',       // Teal
            dom7: '#e67e22',       // Dark orange
            dim: '#34495e',        // Dark blue-gray
            aug: '#d35400',        // Pumpkin
            default: '#3498db'
        };

        this.initEvents();
    }

    /**
     * Initialize event listeners
     */
    initEvents() {
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseleave', () => this.clearHover());
        this.canvas.addEventListener('click', (e) => this.handleClick(e));

        // Handle window resize
        window.addEventListener('resize', () => this.renderTimeline());
    }

    /**
     * Set chords data for timeline
     */
    setChords(chords, duration) {
        this.chords = chords;
        this.duration = duration || (chords[chords.length - 1]?.time || 0) + 5;
        this.renderTimeline();
    }

    /**
     * Get mouse position relative to canvas
     */
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    /**
     * Handle mouse move on canvas
     */
    handleMouseMove(e) {
        const pos = this.getMousePos(e);

        // Check if hovering over a chord segment
        let hovered = null;
        for (let i = 0; i < this.chords.length; i++) {
            const chord = this.chords[i];
            const x = 50 + chord.time * this.scaleX; // 50px padding left

            if (pos.x >= x && pos.x <= x + this.scaleX) {
                hovered = { ...chord, index: i };
                break;
            }
        }

        if (hovered !== this.hoveredChord) {
            this.hoveredChord = hovered;
            this.renderTimeline();

            // Update cursor
            this.canvas.style.cursor = hovered ? 'pointer' : 'default';

            // Call callback for tooltip display
            if (this.chordDisplayCallback && hovered) {
                this.chordDisplayCallback(hovered);
            }
        }

        // Store clickable area for click handler
        if (hovered) {
            const x = 50 + hovered.time * this.scaleX;
            this.clickableArea = { x, y: 10, width: this.scaleX, height: 60 };
        } else {
            this.clickableArea = null;
        }
    }

    /**
     * Clear hover state
     */
    clearHover() {
        if (this.hoveredChord) {
            this.hoveredChord = null;
            this.renderTimeline();
            if (this.chordDisplayCallback) {
                this.chordDisplayCallback(null);
            }
        }
    }

    /**
     * Handle click on timeline
     */
    handleClick(e) {
        if (!this.hoveredChord || !this.clickableArea) return;

        const pos = this.getMousePos(e);
        if (pos.x >= this.clickableArea.x &&
            pos.x <= this.clickableArea.x + this.clickableArea.width &&
            pos.y >= this.clickableArea.y &&
            pos.y <= this.clickableArea.y + this.clickableArea.height) {

            // Trigger seek to chord time
            if (this.chordDisplayCallback) {
                this.chordDisplayCallback(this.hoveredChord, true);
            }
        }
    }

    /**
     * Render the timeline
     */
    renderTimeline() {
        const width = Math.max(400, this.duration * this.scaleX + 100);
        const height = 120;

        // Set canvas size (with higher resolution for retina displays)
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;

        this.ctx.scale(dpr, dpr);

        // Clear canvas
        this.ctx.clearRect(0, 0, width, height);

        // Draw background
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(0, 0, width, height);

        // Draw time markers every 5 seconds
        this.drawTimeMarkers(width);

        // Draw chord segments
        this.chords.forEach((chord, index) => {
            this.drawChordSegment(chord, index);
        });

        // Draw current playback position (if playing)
        if (this.currentPosition !== undefined && this.isPlaying) {
            const x = 50 + this.currentPosition * this.scaleX;
            this.ctx.strokeStyle = '#e74c3c';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 10);
            this.ctx.lineTo(x, height - 10);
            this.ctx.stroke();
        }

        // Draw hover highlight
        if (this.hoveredChord) {
            const x = 50 + this.hoveredChord.time * this.scaleX;
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.fillRect(x - 2, 10, this.scaleX + 4, height - 20);

            // Draw outline
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x - 2, 10, this.scaleX + 4, height - 20);
        }
    }

    /**
     * Draw time markers on timeline
     */
    drawTimeMarkers(width) {
        this.ctx.fillStyle = '#6c757d';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';

        for (let t = 0; t < Math.ceil(this.duration); t += 5) {
            const x = 50 + t * this.scaleX;
            if (x > width - 30) continue;

            // Draw tick mark
            this.ctx.beginPath();
            this.ctx.moveTo(x, 10);
            this.ctx.lineTo(x, 20);
            this.ctx.stroke();

            // Draw time label
            const mins = Math.floor(t / 60);
            const secs = t % 60;
            const label = mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `0:${secs}`;
            this.ctx.fillText(label, x, 35);

            // Draw vertical grid line (faint)
            if (t % 10 === 0) {
                this.ctx.strokeStyle = '#e9ecef';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(x, 45);
                this.ctx.lineTo(x, 100);
                this.ctx.stroke();
            }
        }

        // Draw duration label at end
        const endX = 50 + this.duration * this.scaleX;
        this.ctx.fillStyle = '#6c757d';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Duration: ${this.formatTime(this.duration)}s`, width - 100, 35);
    }

    /**
     * Draw a single chord segment on timeline
     */
    drawChordSegment(chord, index) {
        const x = 50 + chord.time * this.scaleX;
        const y = 25 + (index % 2) * 30; // Alternate rows

        // Get color for chord quality
        const color = this.getChordColor(chord.name);

        // Draw segment background
        if (!this.hoveredChord || this.hoveredChord.index !== index) {
            this.ctx.fillStyle = color + '40'; // Semi-transparent version
            this.ctx.fillRect(x, 15, this.scaleX, 20);
        }

        // Draw chord label
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(chord.name, x + this.scaleX / 2, 28);

        // Add time indicator below chord
        this.ctx.fillStyle = color;
        this.ctx.font = '10px Arial';
        const timeLabel = this.formatTime(chord.time);
        this.ctx.fillText(timeLabel, x + this.scaleX / 2, y - 5);
    }

    /**
     * Get color for chord based on quality
     */
    getChordColor(chordName) {
        const name = chordName.toLowerCase();

        if (name.includes('maj7')) return this.colors.maj7;
        if (name.includes('min') || name.endsWith('m')) return this.colors.minor;
        if (name.includes('sus2')) return this.colors.sus2;
        if (name.includes('sus4')) return this.colors.sus4;
        if (name.includes('min7') || name.includes('m7')) return this.colors.min7;
        if (name.includes('dom7') || name.endsWith('7')) return this.colors.dom7;
        if (name.includes('dim')) return this.colors.dim;
        if (name.includes('aug')) return this.colors.aug;

        return this.colors.major; // Default to major color
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
     * Set playback state for visual indicator
     */
    setPlaying(isPlaying) {
        this.isPlaying = isPlaying;
        if (isPlaying) {
            this.renderTimeline();
        }
    }

    /**
     * Update current position during playback
     */
    updatePosition(position) {
        this.currentPosition = position;
        this.renderTimeline();
    }

    /**
     * Get chord at specific time
     */
    getChordAtTime(time) {
        for (let i = 0; i < this.chords.length; i++) {
            const chord = this.chords[i];
            const nextChord = this.chords[i + 1];

            if (time >= chord.time && (!nextChord || time < nextChord.time)) {
                return chord;
            }
        }
        return null;
    }
}

// Export for use in other modules
window.TimelineViewer = TimelineViewer;
