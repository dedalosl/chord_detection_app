/**
 * Tab Renderer Module
 * Renders guitar tablature organized by song section,
 * with chord columns proportional to beat duration.
 */

class TabRenderer {
    constructor() {
        this.tabDisplay = document.getElementById('tabDisplay');
        this.diagramContainer = document.getElementById('chordDiagramContainer');
        this.currentChord = null;
        this.stringLabels = ['E', 'A', 'D', 'G', 'B', 'e'];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Chord Diagrams
    // ─────────────────────────────────────────────────────────────────────────

    renderChordDiagrams(chords) {
        this.diagramContainer.innerHTML = '';
        const uniqueChords = [...new Set(chords.map(c => c.name))];
        uniqueChords.forEach((chordName, index) => {
            const chart = getChordChart(chordName);
            if (chart) {
                this.createChordDiagram(chart, chordName, index === 0);
            } else {
                this.createUnknownChordDiagram(chordName);
            }
        });
        return uniqueChords;
    }

    createChordDiagram(chart, chordName, isFirst) {
        const container = document.createElement('div');
        container.className = `chord-diagram ${isFirst ? 'active' : ''}`;
        container.dataset.chord = chordName;
        container.addEventListener('click', () => this.selectChord(chordName));

        const canvas = document.createElement('canvas');
        canvas.width = 140;
        canvas.height = 150;
        canvas.style.display = 'block';
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        this.drawChordOnCanvas(canvas, chart);

        const info = document.createElement('div');
        info.className = 'chord-info';
        info.innerHTML = `
            <span class="chord-label">${chart.name}</span>
            ${chart.bassNote ? `<span class="bass-note">Bass: ${chart.bassNote}</span>` : ''}
        `;

        container.appendChild(canvas);
        container.appendChild(info);
        this.diagramContainer.appendChild(container);
    }

    drawChordOnCanvas(canvas, chart) {
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        const frets = chart.frets || [0, 0, 0, 0, 0, 0];
        const numStrings = 6;
        const numFretRows = 5;

        const padLeft = 20, padRight = 14, padTop = 28, padBottom = 8;
        const boardW = W - padLeft - padRight;
        const boardH = H - padTop - padBottom;
        const stringSpacing = boardW / (numStrings - 1);
        const fretSpacing = boardH / numFretRows;

        const numericFrets = frets.filter(f => typeof f === 'number' && f > 0);
        const maxFret = numericFrets.length > 0 ? Math.max(...numericFrets) : 0;
        const minFret = numericFrets.length > 0 ? Math.min(...numericFrets) : 1;
        const startFret = maxFret > numFretRows ? minFret : 1;

        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0, padTop, W, H - padTop);

        if (startFret <= 1) {
            ctx.fillStyle = '#b0bec5';
            ctx.fillRect(padLeft, padTop, boardW, 5);
        } else {
            ctx.fillStyle = '#90a4ae';
            ctx.font = 'bold 9px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${startFret}fr`, 2, padTop + fretSpacing * 0.5);
        }

        ctx.strokeStyle = '#546e7a';
        ctx.lineWidth = 1;
        for (let f = 1; f <= numFretRows; f++) {
            const y = padTop + f * fretSpacing;
            ctx.beginPath(); ctx.moveTo(padLeft, y); ctx.lineTo(padLeft + boardW, y); ctx.stroke();
        }

        ctx.strokeStyle = '#607d8b';
        ctx.lineWidth = 1;
        const nutOffset = startFret <= 1 ? 5 : 0;
        for (let s = 0; s < numStrings; s++) {
            const x = padLeft + s * stringSpacing;
            ctx.beginPath(); ctx.moveTo(x, padTop + nutOffset); ctx.lineTo(x, padTop + boardH); ctx.stroke();
        }

        const dotRadius = Math.min(stringSpacing, fretSpacing) * 0.32;
        for (let s = 0; s < numStrings; s++) {
            const fret = frets[s];
            const x = padLeft + s * stringSpacing;
            if (fret === 'x') {
                ctx.strokeStyle = '#cfd8dc'; ctx.lineWidth = 1.5;
                const r = 4, cy = padTop - 10;
                ctx.beginPath(); ctx.moveTo(x - r, cy - r); ctx.lineTo(x + r, cy + r); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(x + r, cy - r); ctx.lineTo(x - r, cy + r); ctx.stroke();
            } else if (fret === 0) {
                ctx.strokeStyle = '#cfd8dc'; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.arc(x, padTop - 10, 4, 0, Math.PI * 2); ctx.stroke();
            } else {
                const relFret = fret - startFret + 1;
                if (relFret >= 1 && relFret <= numFretRows) {
                    const y = padTop + (relFret - 0.5) * fretSpacing;
                    ctx.fillStyle = '#ecf0f1';
                    ctx.beginPath(); ctx.arc(x, y, dotRadius, 0, Math.PI * 2); ctx.fill();
                }
            }
        }
    }

    createUnknownChordDiagram(chordName) {
        const container = document.createElement('div');
        container.className = 'chord-diagram placeholder';

        const canvas = document.createElement('canvas');
        canvas.width = 140; canvas.height = 150;
        canvas.style.display = 'block'; canvas.style.width = '100%'; canvas.style.height = 'auto';

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#eceff1';
        ctx.fillRect(0, 0, 140, 150);
        ctx.fillStyle = '#90a4ae';
        ctx.font = 'bold 56px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', 70, 75);

        const info = document.createElement('div');
        info.className = 'chord-info';
        info.innerHTML = `<span class="chord-label">${chordName}</span><span class="unknown-note">Chord chart not available</span>`;

        container.appendChild(canvas);
        container.appendChild(info);
        this.diagramContainer.appendChild(container);
    }

    selectChord(chordName) {
        document.querySelectorAll('.chord-diagram').forEach(diag => {
            diag.classList.toggle('active', diag.dataset.chord === chordName);
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Section-based Tablature
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Render tablature grouped by unique song sections.
     * Each unique section (Intro, Verse, Chorus…) gets a header and a TAB row
     * where column widths are proportional to each chord's beat duration.
     *
     * @param {Array}  chords   - [{name, time}, …]
     * @param {Array}  sections - [{label, name, start, end}, …]
     * @param {number} tempo    - BPM
     */
    renderFullTab(chords, sections, tempo) {
        this.tabDisplay.innerHTML = '';
        if (!chords || chords.length === 0) return;

        this._tabChords   = chords;
        this._tabSections = sections || [];
        this._tabTempo    = tempo || 120;
        this._tabHighlight = null;
        this._sectionDrawData = []; // [{canvas, secChords, sec, tempo}]

        if (this._tabSections.length > 0) {
            this._drawSectionedTab();
        } else {
            // Fallback: single sequential canvas
            this._tabCanvas = null;
            this._tabPositions = [];
            this._drawTab();
        }
    }

    /** Build one header+canvas block per unique section label. */
    _drawSectionedTab() {
        const chords   = this._tabChords;
        const sections = this._tabSections;
        const tempo    = this._tabTempo;

        // Section label → count of occurrences, and first occurrence
        const labelCount = {};
        const seenLabels = new Set();
        const uniqueSections = [];

        sections.forEach(sec => {
            labelCount[sec.label] = (labelCount[sec.label] || 0) + 1;
            if (!seenLabels.has(sec.label)) {
                seenLabels.add(sec.label);
                uniqueSections.push(sec);
            }
        });

        // Colour palette matching the Song Structure bar
        const NAME_COLORS = {
            'Intro':  { bg: '#6ee7b7', text: '#064e3b' },
            'Verse':  { bg: '#93c5fd', text: '#1e3a5f' },
            'Chorus': { bg: '#fca5a5', text: '#7f1d1d' },
            'Bridge': { bg: '#fde68a', text: '#78350f' },
            'Outro':  { bg: '#c4b5fd', text: '#4c1d95' },
        };
        const LABEL_BG = ['#bfdbfe','#bbf7d0','#fef08a','#fdba74','#f9a8d4','#c7d2fe','#d1fae5','#fecaca'];

        uniqueSections.forEach(sec => {
            const count     = labelCount[sec.label] || 1;
            const secChords = chords.filter(c => c.time >= sec.start - 0.3 && c.time < sec.end - 0.1);

            // ── Section header ────────────────────────────────────────────────
            const badgeLabel = sec.label === '__intro__' ? sec.name[0] : sec.label;
            const colors = NAME_COLORS[sec.name] || {
                bg: LABEL_BG[(badgeLabel.charCodeAt(0) - 65 + 26) % LABEL_BG.length],
                text: '#1a1a2e'
            };

            const header = document.createElement('div');
            header.className = 'tab-section-header';
            header.innerHTML = `
                <span class="tab-section-badge" style="background:${colors.bg};color:${colors.text}">${badgeLabel}</span>
                <span class="tab-section-name">${sec.name}</span>
                ${count > 1 ? `<span class="tab-section-count">×${count}</span>` : ''}
            `;
            this.tabDisplay.appendChild(header);

            // ── TAB canvas ────────────────────────────────────────────────────
            if (secChords.length === 0) {
                const empty = document.createElement('div');
                empty.className = 'tab-section-empty';
                empty.textContent = '(instrumental / no chords detected)';
                this.tabDisplay.appendChild(empty);
                return;
            }

            const canvas = document.createElement('canvas');
            canvas.className = 'tab-section-canvas';
            canvas.style.display = 'block';
            canvas.style.width = '100%';
            canvas.style.marginBottom = '6px';
            this.tabDisplay.appendChild(canvas);

            const drawData = { canvas, secChords, sec, tempo };
            this._sectionDrawData.push(drawData);
            this._drawSectionCanvas(drawData);
        });
    }

    /**
     * Draw a single section's TAB onto its canvas.
     * Column widths are proportional to each chord's duration in beats.
     */
    _drawSectionCanvas({ canvas, secChords, sec, tempo }) {
        // Layout constants
        const SS        = 15;                          // string spacing
        const N_STR     = 6;
        const STAFF_H   = (N_STR - 1) * SS;           // 75 px
        const L_MARGIN  = 28;
        const TOP_MAR   = 34;   // chord name + beat label
        const BOT_MAR   = 12;
        const ROW_H     = TOP_MAR + STAFF_H + BOT_MAR;
        const STR_LBLS  = ['e', 'B', 'G', 'D', 'A', 'E'];

        // ── Compute beat duration for each chord ──────────────────────────────
        const beatData = secChords.map((chord, i) => {
            const nextTime = i < secChords.length - 1 ? secChords[i + 1].time : sec.end;
            const durSecs  = Math.max(0.25, nextTime - chord.time);
            const durBeats = durSecs * tempo / 60;
            // Round to nearest whole beat, minimum 1
            const beats    = Math.max(1, Math.round(durBeats));
            return { chord, beats };
        });

        const totalBeats = beatData.reduce((s, d) => s + d.beats, 0);

        // Fill the container width
        const containerW = this.tabDisplay.clientWidth || 700;
        const usableW    = Math.max(200, containerW - L_MARGIN - 12);
        const BEAT_W     = usableW / totalBeats;

        const canvasW = L_MARGIN + usableW + 4;
        const canvasH = ROW_H + 4;

        canvas.width  = canvasW;
        canvas.height = canvasH;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#f8f9fc';
        ctx.fillRect(0, 0, canvasW, canvasH);

        const staffTop = TOP_MAR;

        // ── String lines + labels ─────────────────────────────────────────────
        for (let s = 0; s < N_STR; s++) {
            const y = staffTop + s * SS;
            ctx.font         = 'bold 10px monospace';
            ctx.fillStyle    = '#555';
            ctx.textAlign    = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(STR_LBLS[s], L_MARGIN - 4, y);

            ctx.strokeStyle = '#aaa';
            ctx.lineWidth   = (s === 0 || s === N_STR - 1) ? 1.2 : 0.8;
            ctx.beginPath();
            ctx.moveTo(L_MARGIN, y);
            ctx.lineTo(L_MARGIN + usableW, y);
            ctx.stroke();
        }

        // Opening barline
        ctx.strokeStyle = '#555';
        ctx.lineWidth   = 2;
        ctx.beginPath();
        ctx.moveTo(L_MARGIN, staffTop);
        ctx.lineTo(L_MARGIN, staffTop + STAFF_H);
        ctx.stroke();

        // ── Chord columns ─────────────────────────────────────────────────────
        let beatOffset = 0;

        beatData.forEach(({ chord, beats }) => {
            const colX    = L_MARGIN + beatOffset * BEAT_W;
            const colW    = beats * BEAT_W;
            const centerX = colX + colW / 2;
            const isHl    = this._tabHighlight === chord.name;

            // Highlight rect
            if (isHl) {
                ctx.fillStyle = 'rgba(37,99,235,0.10)';
                ctx.fillRect(colX + 1, 1, colW - 2, canvasH - 2);
            }

            // Chord name
            ctx.font         = 'bold 12px sans-serif';
            ctx.textAlign    = 'center';
            ctx.textBaseline = 'top';
            ctx.fillStyle    = isHl ? '#1d4ed8' : '#2563eb';
            ctx.fillText(chord.name, centerX, 2);

            // Beat count label  e.g. "4♩"
            ctx.font      = '9px sans-serif';
            ctx.fillStyle = '#9ca3af';
            ctx.fillText(`${beats}\u2669`, centerX, 17);

            // Fret numbers on each string
            const chart = getChordChart(chord.name);
            const raw   = chart ? chart.frets : [0, 0, 0, 0, 0, 0];
            // Reverse: raw = [E,A,D,G,B,e] → display top-to-bottom = [e,B,G,D,A,E]
            const disp  = [raw[5], raw[4], raw[3], raw[2], raw[1], raw[0]];

            ctx.font         = '11px monospace';
            ctx.textAlign    = 'center';
            ctx.textBaseline = 'middle';

            for (let s = 0; s < N_STR; s++) {
                const lineY = staffTop + s * SS;
                const fret  = disp[s];

                if (fret === 'x') {
                    ctx.fillStyle = '#999';
                    ctx.fillText('\u00d7', centerX, lineY);
                } else {
                    const txt  = fret.toString();
                    const pw   = txt.length > 1 ? 18 : 13;
                    ctx.fillStyle = isHl ? '#dbeafe' : '#f8f9fc';
                    ctx.fillRect(centerX - pw / 2, lineY - 6, pw, 12);
                    ctx.fillStyle = fret === 0 ? '#aaa' : '#111';
                    ctx.fillText(txt, centerX, lineY);
                }
            }

            // Bar lines (heavy) at every 4 beats within this section
            for (let b = 1; b <= beats; b++) {
                const globalBeat = beatOffset + b;
                if (globalBeat % 4 === 0 && globalBeat < totalBeats) {
                    const bx = L_MARGIN + globalBeat * BEAT_W;
                    ctx.strokeStyle = '#777';
                    ctx.lineWidth   = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(bx, staffTop);
                    ctx.lineTo(bx, staffTop + STAFF_H);
                    ctx.stroke();
                }
            }

            // Thin separator after each chord (if not last)
            if (beatOffset + beats < totalBeats) {
                const sepX = colX + colW;
                ctx.strokeStyle = '#ddd';
                ctx.lineWidth   = 0.5;
                ctx.beginPath();
                ctx.moveTo(sepX, staffTop);
                ctx.lineTo(sepX, staffTop + STAFF_H);
                ctx.stroke();
            }

            beatOffset += beats;
        });

        // Closing barline
        ctx.strokeStyle = '#555';
        ctx.lineWidth   = 2;
        ctx.beginPath();
        ctx.moveTo(L_MARGIN + usableW, staffTop);
        ctx.lineTo(L_MARGIN + usableW, staffTop + STAFF_H);
        ctx.stroke();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Highlight during playback
    // ─────────────────────────────────────────────────────────────────────────

    highlightCurrentChord(chordName) {
        // Diagram highlights
        document.querySelectorAll('.chord-diagram').forEach(diag => {
            diag.classList.toggle('active', diag.dataset.chord === chordName);
        });

        if (!this._sectionDrawData || this._sectionDrawData.length === 0) {
            // Legacy single-canvas fallback
            if (this._tabChords && this._tabCanvas) {
                this._tabHighlight = chordName;
                this._drawTab();
            }
            return;
        }

        const prev = this._tabHighlight;
        this._tabHighlight = chordName;

        let scrolled = false;
        for (const data of this._sectionDrawData) {
            const hasNow    = data.secChords.some(c => c.name === chordName);
            const hadBefore = prev && data.secChords.some(c => c.name === prev);
            if (hasNow || hadBefore) {
                this._drawSectionCanvas(data);
            }
            if (hasNow && !scrolled) {
                data.canvas.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                scrolled = true;
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Legacy sequential TAB (fallback, no sections)
    // ─────────────────────────────────────────────────────────────────────────

    _drawTab() {
        const chords = this._tabChords;
        if (!chords || !chords.length) return;

        const STRING_SPACING = 15, NUM_STRINGS = 6;
        const STAFF_H  = (NUM_STRINGS - 1) * STRING_SPACING;
        const LEFT_MARGIN = 28, TOP_MARGIN = 36, BOTTOM_MARGIN = 18;
        const ROW_H = TOP_MARGIN + STAFF_H + BOTTOM_MARGIN;
        const CHORD_COL_W = 58, MIN_CHORDS_PER_ROW = 4;

        const containerW   = this.tabDisplay.clientWidth || 800;
        const usableW      = containerW - LEFT_MARGIN - 8;
        const chordsPerRow = Math.max(MIN_CHORDS_PER_ROW, Math.floor(usableW / CHORD_COL_W));
        const numRows      = Math.ceil(chords.length / chordsPerRow);
        const canvasW      = LEFT_MARGIN + chordsPerRow * CHORD_COL_W + 4;
        const canvasH      = numRows * ROW_H + 12;

        let canvas = this._tabCanvas;
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.style.width   = '100%';
            canvas.style.display = 'block';
            this._tabCanvas = canvas;
            this.tabDisplay.appendChild(canvas);
        }
        canvas.width  = canvasW;
        canvas.height = canvasH;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#f8f9fc';
        ctx.fillRect(0, 0, canvasW, canvasH);

        this._tabPositions = [];

        for (let row = 0; row < numRows; row++) {
            const rowY      = row * ROW_H + 8;
            const staffTop  = rowY + TOP_MARGIN;
            const rowStart  = row * chordsPerRow;
            const rowEnd    = Math.min(rowStart + chordsPerRow, chords.length);
            const rowW      = (rowEnd - rowStart) * CHORD_COL_W;

            const STRING_LABELS = ['e', 'B', 'G', 'D', 'A', 'E'];
            for (let s = 0; s < NUM_STRINGS; s++) {
                const y = staffTop + s * STRING_SPACING;
                ctx.font = 'bold 10px monospace'; ctx.fillStyle = '#555';
                ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
                ctx.fillText(STRING_LABELS[s], LEFT_MARGIN - 4, y);
                ctx.strokeStyle = '#aaa';
                ctx.lineWidth = s === 0 || s === NUM_STRINGS - 1 ? 1.2 : 0.8;
                ctx.beginPath();
                ctx.moveTo(LEFT_MARGIN, y); ctx.lineTo(LEFT_MARGIN + rowW, y); ctx.stroke();
            }

            ctx.strokeStyle = '#555'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(LEFT_MARGIN, staffTop); ctx.lineTo(LEFT_MARGIN, staffTop + STAFF_H); ctx.stroke();

            for (let ci = rowStart; ci < rowEnd; ci++) {
                const chord  = chords[ci];
                const colIdx = ci - rowStart;
                const colX   = LEFT_MARGIN + colIdx * CHORD_COL_W;
                const cx     = colX + CHORD_COL_W / 2;

                this._tabPositions.push({ chordIndex: ci, x: colX, colW: CHORD_COL_W, rowY, staffTop });

                if (this._tabHighlight && chord.name === this._tabHighlight) {
                    ctx.fillStyle = 'rgba(37,99,235,0.10)';
                    ctx.fillRect(colX + 1, rowY + 2, CHORD_COL_W - 2, ROW_H - 4);
                }

                ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
                ctx.fillStyle = this._tabHighlight && chord.name === this._tabHighlight ? '#1d4ed8' : '#2563eb';
                ctx.fillText(chord.name, cx, rowY + 2);

                ctx.font = '9px sans-serif'; ctx.fillStyle = '#9ca3af';
                ctx.fillText(this.formatTime(chord.time), cx, rowY + 17);

                const chart = getChordChart(chord.name);
                const raw   = chart ? chart.frets : [0, 0, 0, 0, 0, 0];
                const disp  = [raw[5], raw[4], raw[3], raw[2], raw[1], raw[0]];

                ctx.font = '11px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                for (let s = 0; s < NUM_STRINGS; s++) {
                    const lineY = staffTop + s * STRING_SPACING;
                    const fret  = disp[s];
                    if (fret === 'x') {
                        ctx.fillStyle = '#999'; ctx.fillText('\u00d7', cx, lineY);
                    } else {
                        const txt = fret.toString(), pw = txt.length > 1 ? 18 : 13;
                        ctx.fillStyle = this._tabHighlight && chord.name === this._tabHighlight ? '#dbeafe' : '#f8f9fc';
                        ctx.fillRect(cx - pw / 2, lineY - 6, pw, 12);
                        ctx.fillStyle = fret === 0 ? '#999' : '#111';
                        ctx.fillText(txt, cx, lineY);
                    }
                }

                const barX = colX + CHORD_COL_W;
                ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(barX, staffTop); ctx.lineTo(barX, staffTop + STAFF_H); ctx.stroke();
            }

            const endX = LEFT_MARGIN + (rowEnd - rowStart) * CHORD_COL_W;
            ctx.strokeStyle = '#555'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(endX, staffTop); ctx.lineTo(endX, staffTop + STAFF_H); ctx.stroke();
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

window.TabRenderer = TabRenderer;
