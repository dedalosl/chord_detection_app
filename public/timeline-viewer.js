/**
 * Timeline Viewer Module
 * Renders a visual timeline of detected chords with clickable playback controls
 */

class TimelineViewer {
    constructor(canvasId, chordDisplayCallback) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.chordDisplayCallback = chordDisplayCallback;
        this.scaleX = 12;    // pixels per second
        this.PAD_LEFT = 54;  // left padding for time labels
        this.PAD_RIGHT = 16;
        this.TRACK_TOP = 42;
        this.TRACK_H = 52;
        this.chords = [];
        this.hoveredChord = null;
        this.currentPosition = undefined;
        this.isPlaying = false;
        this.duration = 0;

        this.colors = {
            major:   '#3b82f6',
            minor:   '#ef4444',
            sus2:    '#10b981',
            sus4:    '#f59e0b',
            maj7:    '#8b5cf6',
            min7:    '#06b6d4',
            dom7:    '#f97316',
            dim:     '#64748b',
            aug:     '#ec4899',
            default: '#3b82f6'
        };

        this.initEvents();
    }

    initEvents() {
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseleave', () => this.clearHover());
        this.canvas.addEventListener('click',     (e) => this.handleClick(e));
        window.addEventListener('resize', () => this.renderTimeline());
    }

    setChords(chords, duration) {
        this.chords = chords;
        this.duration = duration || (chords[chords.length - 1]?.time ?? 0) + 5;
        this.renderTimeline();
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        return {
            x: (e.clientX - rect.left) * (this.canvas.width  / dpr / rect.width),
            y: (e.clientY - rect.top)  * (this.canvas.height / dpr / rect.height)
        };
    }

    /** Returns pixel x start and width of chord segment i */
    segmentBounds(index) {
        const chord    = this.chords[index];
        const nextTime = this.chords[index + 1]?.time ?? this.duration;
        const x        = this.PAD_LEFT + chord.time * this.scaleX;
        const w        = Math.max(30, (nextTime - chord.time) * this.scaleX) - 2;
        return { x, w };
    }

    handleMouseMove(e) {
        const pos = this.getMousePos(e);
        let hovered = null;

        for (let i = 0; i < this.chords.length; i++) {
            const { x, w } = this.segmentBounds(i);
            if (pos.x >= x && pos.x < x + w &&
                pos.y >= this.TRACK_TOP && pos.y <= this.TRACK_TOP + this.TRACK_H) {
                hovered = { ...this.chords[i], index: i };
                break;
            }
        }

        if (hovered?.index !== this.hoveredChord?.index) {
            this.hoveredChord = hovered;
            this.renderTimeline();
            this.canvas.style.cursor = hovered ? 'pointer' : 'default';
            if (this.chordDisplayCallback) this.chordDisplayCallback(hovered ?? null);
        }
    }

    clearHover() {
        if (this.hoveredChord) {
            this.hoveredChord = null;
            this.renderTimeline();
            if (this.chordDisplayCallback) this.chordDisplayCallback(null);
        }
    }

    handleClick(e) {
        if (!this.hoveredChord) return;
        if (this.chordDisplayCallback) this.chordDisplayCallback(this.hoveredChord, true);
    }

    renderTimeline() {
        if (!this.chords.length) return;

        const height = this.TRACK_TOP + this.TRACK_H + 12;
        const width  = Math.max(600, this.PAD_LEFT + this.duration * this.scaleX + this.PAD_RIGHT);

        const dpr = window.devicePixelRatio || 1;
        this.canvas.width  = width  * dpr;
        this.canvas.height = height * dpr;
        this.canvas.style.width  = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Background
        this.ctx.fillStyle = '#1e2333';
        this.ctx.fillRect(0, 0, width, height);

        // Axis line
        this.ctx.strokeStyle = '#374151';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(this.PAD_LEFT, this.TRACK_TOP - 2);
        this.ctx.lineTo(width - this.PAD_RIGHT, this.TRACK_TOP - 2);
        this.ctx.stroke();

        this.drawTimeMarkers(width, height);

        this.chords.forEach((_, i) => this.drawChordSegment(i));

        if (this.currentPosition !== undefined) this.drawPlayhead(height);
    }

    drawTimeMarkers(width, height) {
        const interval = this.duration > 180 ? 30
                       : this.duration > 90  ? 15
                       : this.duration > 30  ? 10
                       : 5;

        this.ctx.fillStyle   = '#6b7280';
        this.ctx.strokeStyle = '#2d3748';
        this.ctx.lineWidth   = 1;
        this.ctx.font        = '10px Arial';
        this.ctx.textAlign   = 'center';

        for (let t = 0; t <= this.duration; t += interval) {
            const x = this.PAD_LEFT + t * this.scaleX;
            if (x > width - this.PAD_RIGHT) break;

            // Tick
            this.ctx.strokeStyle = '#4b5563';
            this.ctx.beginPath();
            this.ctx.moveTo(x, 10);
            this.ctx.lineTo(x, 22);
            this.ctx.stroke();

            // Label
            this.ctx.fillStyle = '#9ca3af';
            this.ctx.fillText(this.formatTime(t), x, 35);

            // Faint grid line into track
            this.ctx.strokeStyle = '#252c3d';
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.TRACK_TOP);
            this.ctx.lineTo(x, this.TRACK_TOP + this.TRACK_H);
            this.ctx.stroke();
        }

        // Duration label at far right
        this.ctx.fillStyle  = '#6b7280';
        this.ctx.textAlign  = 'right';
        this.ctx.font       = '10px Arial';
        this.ctx.fillText(this.formatTime(this.duration), width - this.PAD_RIGHT, 35);
    }

    drawChordSegment(index) {
        const chord    = this.chords[index];
        const { x, w } = this.segmentBounds(index);
        const color    = this.getChordColor(chord.name);
        const TT       = this.TRACK_TOP;
        const TH       = this.TRACK_H;

        const isActive  = this.currentPosition !== undefined &&
                          this.currentPosition >= chord.time &&
                          this.currentPosition < (this.chords[index + 1]?.time ?? this.duration);
        const isHovered = this.hoveredChord?.index === index;

        // Segment fill
        this.ctx.fillStyle = isActive  ? color + 'cc'
                           : isHovered ? color + '88'
                           : color + '44';
        this.ctx.fillRect(x, TT, w, TH);

        // Left accent bar
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, TT, 3, TH);

        // Top highlight for active
        if (isActive) {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x, TT, w, 3);
        }

        // Chord name
        const fontSize = w > 45 ? 13 : 10;
        this.ctx.fillStyle = isActive || isHovered ? '#ffffff' : '#d1d5db';
        this.ctx.font      = `bold ${fontSize}px Arial`;
        this.ctx.textAlign = 'left';
        this.ctx.fillText(chord.name, x + 6, TT + 22, Math.max(0, w - 10));

        // Time label (only if wide enough)
        if (w > 36) {
            this.ctx.fillStyle = isActive ? color : '#6b7280';
            this.ctx.font      = `10px Arial`;
            this.ctx.fillText(this.formatTime(chord.time), x + 6, TT + 38, Math.max(0, w - 10));
        }
    }

    drawPlayhead(height) {
        const x = this.PAD_LEFT + this.currentPosition * this.scaleX;

        // Line
        this.ctx.strokeStyle = '#f87171';
        this.ctx.lineWidth   = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x, this.TRACK_TOP - 4);
        this.ctx.lineTo(x, this.TRACK_TOP + this.TRACK_H);
        this.ctx.stroke();

        // Triangle pointer
        this.ctx.fillStyle = '#f87171';
        this.ctx.beginPath();
        this.ctx.moveTo(x - 5, this.TRACK_TOP - 4);
        this.ctx.lineTo(x + 5, this.TRACK_TOP - 4);
        this.ctx.lineTo(x,     this.TRACK_TOP + 6);
        this.ctx.fill();
    }

    getChordColor(name) {
        const n = name.toLowerCase();
        if (n.includes('maj7'))              return this.colors.maj7;
        if (n.endsWith('m7') || n.includes('min7')) return this.colors.min7;
        if (n.endsWith('m') || n.includes('min'))   return this.colors.minor;
        if (n.includes('sus2'))              return this.colors.sus2;
        if (n.includes('sus4'))              return this.colors.sus4;
        if (n.endsWith('7'))                 return this.colors.dom7;
        if (n.includes('dim'))               return this.colors.dim;
        if (n.includes('aug'))               return this.colors.aug;
        return this.colors.major;
    }

    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    setPlaying(playing) {
        this.isPlaying = playing;
        this.renderTimeline();
    }

    updatePosition(position) {
        this.currentPosition = position;
        this.renderTimeline();
    }

    getChordAtTime(time) {
        for (let i = 0; i < this.chords.length; i++) {
            const next = this.chords[i + 1];
            if (time >= this.chords[i].time && (!next || time < next.time)) return this.chords[i];
        }
        return null;
    }
}

window.TimelineViewer = TimelineViewer;
