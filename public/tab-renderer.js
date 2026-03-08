/**
 * Tab Renderer Module
 * Renders guitar tablature for chords with visual diagrams
 */

class TabRenderer {
    constructor() {
        this.tabDisplay = document.getElementById('tabDisplay');
        this.diagramContainer = document.getElementById('chordDiagramContainer');
        this.currentChord = null;

        // Standard tuning (E A D G B E from low to high)
        this.strings = [
            { note: 'E', frets: 0 },  // Low E - string 6
            { note: 'A', frets: 0 },  // String 5
            { note: 'D', frets: 0 },  // String 4
            { note: 'G', frets: 0 },  // String 3
            { note: 'B', frets: 0 },  // String 2
            { note: 'E', frets: 0 }   // High E - string 1
        ];

        this.stringLabels = ['E', 'A', 'D', 'G', 'B', 'e'];
    }

    /**
     * Render chord diagrams for all detected chords
     */
    renderChordDiagrams(chords) {
        this.diagramContainer.innerHTML = '';

        const uniqueChords = [...new Set(chords.map(c => c.name))];

        uniqueChords.forEach((chordName, index) => {
            const chart = getChordChart(chordName);
            if (chart) {
                this.createChordDiagram(chart, chordName, index === 0);
            } else {
                // Create placeholder for unknown chords
                this.createUnknownChordDiagram(chordName);
            }
        });

        return uniqueChords;
    }

    /**
     * Create a chord diagram element
     */
    createChordDiagram(chart, chordName, isFirst) {
        const container = document.createElement('div');
        container.className = `chord-diagram ${isFirst ? 'active' : ''}`;
        container.dataset.chord = chordName;

        // Click to view this chord in tab
        container.addEventListener('click', () => this.selectChord(chordName));

        const diagram = document.createElement('div');
        diagram.className = 'diagram-main';

        // Fretboard visualization
        const fretboard = document.createElement('div');
        fretboard.className = 'fretboard';
        fretboard.innerHTML = `
            <div class="nut"></div>
            ${this.createFretLines()}
            ${this.createStringNotation(chart.frets)}
        `;

        diagram.appendChild(fretboard);

        // Chord info below diagram
        const info = document.createElement('div');
        info.className = 'chord-info';
        info.innerHTML = `
            <span class="chord-label">${chart.name}</span>
            ${chart.bassNote ? `<span class="bass-note">Bass: ${chart.bassNote}</span>` : ''}
        `;

        container.appendChild(diagram);
        container.appendChild(info);

        this.diagramContainer.appendChild(container);
    }

    /**
     * Create fret lines for chord diagram
     */
    createFretLines() {
        let html = '';
        // Draw 4-5 frets per diagram (enough to show the chord)
        const maxFret = Math.max(...this.strings.map(s => s.frets || 0), 3);
        for (let i = 1; i <= Math.min(maxFret + 1, 5); i++) {
            html += `<div class="fret-line" data-fret="${i}"></div>`;
        }
        return html;
    }

    /**
     * Create string notation (dots for finger positions)
     */
    createStringNotation(frets) {
        let html = '';
        const maxFret = Math.max(...frets, 3);

        // Pad frets array to ensure we have all strings
        const paddedFrets = [...frets];
        while (paddedFrets.length < 6) {
            paddedFrets.push(0);
        }

        for (let i = maxFret; i > 0; i--) {
            html += '<div class="fret-row">';
            for (let string = 5; string >= 0; string--) {
                const fretPos = paddedFrets[string];
                if (fretPos === i) {
                    html += `<div class="finger-dot" data-string="${string}" data-fret="${i}"></div>`;
                } else if (fretPos > i + 1) {
                    // Show continuation dot for barre chords
                    html += `<div class="continuation-dot"></div>`;
                } else {
                    html += '<div class="empty-cell"></div>';
                }
            }
            html += '</div>';
        }

        // Add string numbers (optional)
        const numRow = document.createElement('div');
        numRow.className = 'string-numbers';
        for (let i = 0; i < 6; i++) {
            numRow.innerHTML += `<span class="string-number">${this.stringLabels[i]}</span>`;
        }

        return html + '\n' + numRow.outerHTML;
    }

    /**
     * Create diagram for unknown chord type
     */
    createUnknownChordDiagram(chordName) {
        const container = document.createElement('div');
        container.className = 'chord-diagram placeholder';
        container.innerHTML = `
            <div class="diagram-main">
                <div class="unknown-chord">?</div>
            </div>
            <div class="chord-info">
                <span class="chord-label">${chordName}</span>
                <span class="unknown-note">Chord chart not available</span>
            </div>
        `;

        // Click to show more info modal would go here
        this.diagramContainer.appendChild(container);
    }

    /**
     * Select a chord and render its tab position
     */
    selectChord(chordName) {
        const chart = getChordChart(chordName);
        if (chart) {
            this.currentChord = { ...chart, name: chordName };
            this.renderTabForCurrentChord();

            // Update active diagram
            document.querySelectorAll('.chord-diagram').forEach(diag => {
                diag.classList.remove('active');
                if (diag.dataset.chord === chordName) {
                    diag.classList.add('active');
                }
            });
        }
    }

    /**
     * Render tablature for current selected chord
     */
    renderTabForCurrentChord() {
        if (!this.currentChord || !this.tabDisplay) return;

        const chart = this.currentChord;
        const frets = chart.frets || [0, 0, 0, 0, 0, 0];

        // Render tab staff
        const tabStaff = document.createElement('div');
        tabStaff.className = 'tab-staff';

        // Tab header with chord name
        const header = document.createElement('div');
        header.className = 'tab-header';
        header.innerHTML = `
            <h3>Chord: ${chart.name}</h3>
            <p>${chart.description || chart.quality}</p>
        `;

        // Fretboard visualization (large view for tab)
        const fretboardView = document.createElement('div');
        fretboardView.className = 'tab-fretboard';
        fretboardView.innerHTML = this.createTabFretboard(chart);

        // Tab notation below
        const tabNotation = document.createElement('div');
        tabNotation.className = 'tab-notation';

        // String labels (bottom)
        const stringLabels = document.createElement('div');
        stringLabels.className = 'string-labels';
        this.stringLabels.forEach(label => {
            const span = document.createElement('span');
            span.className = 'string-label';
            span.textContent = label;
            tabNotation.appendChild(span);
        });

        // Fret numbers (top)
        const fretNumbers = document.createElement('div');
        fretNumbers.className = 'fret-numbers';
        const maxFret = Math.max(...frets, 3);
        for (let i = 1; i <= Math.min(maxFret + 2, 6); i++) {
            const span = document.createElement('span');
            span.className = 'fret-number';
            span.textContent = i;
            fretNumbers.appendChild(span);
        }

        // Tab lines with notes
        const tabLines = document.createElement('div');
        tabLines.className = 'tab-lines';

        for (let string = 5; string >= 0; string--) {
            const line = document.createElement('div');
            line.className = 'tab-line';

            // Draw fret positions as dots on lines
            const fretPos = frets[string];
            if (fretPos > 0) {
                const dot = document.createElement('span');
                dot.className = `tab-note fret-${fretPos}`;
                dot.textContent = fretPos;
                line.appendChild(dot);

                // Indicate which string to play
                const stringNum = document.createElement('span');
                stringNum.className = 'string-indicator';
                stringNum.dataset.string = 6 - string;
                stringNum.textContent = (6 - string).toString();
                line.appendChild(stringNum);
            } else {
                // Open string
                const openDot = document.createElement('span');
                openDot.className = 'tab-note open-string';
                openDot.textContent = '○';
                line.appendChild(openDot);

                const stringNum = document.createElement('span');
                stringNum.className = 'string-indicator';
                stringNum.dataset.string = 6 - string;
                stringNum.textContent = (6 - string).toString();
                line.appendChild(stringNum);
            }

            tabLines.appendChild(line);
        }

        // Finger positions indicator
        const fingersDiv = document.createElement('div');
        fingersDiv.className = 'finger-guide';
        if (chart.fingers) {
            chart.fingers.forEach((finger, index) => {
                if (finger && finger !== '') {
                    const span = document.createElement('span');
                    span.className = `finger-marker`;
                    span.textContent = finger;
                    fingersDiv.appendChild(span);
                } else {
                    fingersDiv.innerHTML += '<span class="no-finger"></span>';
                }
            });
        }

        tabStaff.appendChild(header);
        tabStaff.appendChild(fretboardView);
        tabNotation.appendChild(fretNumbers);
        tabNotation.appendChild(tabLines);
        tabNotation.appendChild(fingersDiv);
        tabStaff.appendChild(tabNotation);

        this.tabDisplay.innerHTML = '';
        this.tabDisplay.appendChild(tabStaff);
    }

    /**
     * Create large fretboard view for tab display
     */
    createTabFretboard(chart) {
        const frets = chart.frets || [0, 0, 0, 0, 0, 0];
        const maxFret = Math.max(...frets, 3);

        let html = '<div class="large-fretboard">';

        // Nut indicator for first position chords
        if (maxFret <= 2) {
            html += '<div class="nut-large"></div>';
        }

        // Draw frets and strings
        const numRows = Math.min(maxFret + 1, 5);
        for (let row = maxFret; row > 0; row--) {
            html += '<div class="fret-row-large">';
            for (let string = 5; string >= 0; string--) {
                const fretPos = frets[string];
                if (fretPos === row) {
                    // Calculate finger position based on common fingering patterns
                    let finger = '';
                    switch(chart.name.toUpperCase()) {
                        case 'C':
                            if (string === 5) finger = '1';
                            else if (string === 4) finger = '2';
                            else if (string === 3) finger = '3';
                            break;
                        case 'G':
                            if (string === 6) finger = '1';
                            else if (string === 5) finger = '2';
                            else if (string === 0) finger = '3';
                            break;
                        case 'AM':
                        case 'A':
                            if (string === 4) finger = '1';
                            else if (string === 3 || string === 2) finger = '2';
                            else if (string === 0) finger = '3';
                            break;
                    }

                    html += `<div class="fret-dot"><span class="finger">${finger}</span></div>`;
                } else {
                    html += '<div class="empty-cell-large"></div>';
                }
            }
            html += '</div>';
        }

        // Add string labels on left side
        for (let i = 0; i < 6; i++) {
            if (!html.includes(`data-string="${i}"`)) {
                const pos = maxFret - i;
                if (pos > 0) {
                    html = html.replace(`</div>`, `<span class="string-side">${this.stringLabels[i]}</span></div>`);
                    break;
                }
            }
        }

        html += '</div>';
        return html;
    }

    /**
     * Render complete tab for all chords in sequence
     */
    renderFullTab(chords) {
        this.tabDisplay.innerHTML = '<h3>Complete Tablature</h3>';

        const section = document.createElement('div');
        section.className = 'full-tab-section';

        let staffHTML = '';

        chords.forEach((chord, index) => {
            const chart = getChordChart(chord.name);
            const frets = chart?.frets || [0, 0, 0, 0, 0, 0];

            // Time indicator
            staffHTML += `<div class="tab-time-marker">${this.formatTime(chord.time)}</div>`;

            // Fretboard for this chord position
            staffHTML += '<div class="chord-position">';

            const maxFret = Math.max(...frets, 3);
            const numRows = Math.min(maxFret + 1, 5);

            for (let row = maxFret; row > 0; row--) {
                staffHTML += '<div class="tab-row">';
                for (let string = 5; string >= 0; string--) {
                    const fretPos = frets[string];
                    if (fretPos === row) {
                        staffHTML += `<span class="tab-fret">${row}</span>`;
                    } else if (fretPos > row + 1) {
                        staffHTML += '<span class="continuation">...</span>';
                    } else {
                        staffHTML += '<span class="empty-tab-cell"></span>';
                    }
                }
                staffHTML += '</div>';
            }

            // Add string numbers at bottom
            staffHTML += '<div class="tab-strings">';
            this.stringLabels.forEach(label => {
                staffHTML += `<span class="string-num">${label}</span>`;
            });
            staffHTML += '</div>';

            staffHTML += '</div>';

            // Add chord label below position
            staffHTML += `<div class="chord-label-position">${chord.name}</div>`;
        });

        section.innerHTML = staffHTML;
        this.tabDisplay.appendChild(section);
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
     * Highlight current chord in tab display during playback
     */
    highlightCurrentChord(chordName) {
        if (!chordName || !this.tabDisplay) return;

        // Remove previous highlights
        this.tabDisplay.querySelectorAll('.highlight-current').forEach(el => {
            el.classList.remove('highlight-current');
        });

        // Add highlight to current chord diagram
        const activeDiagram = this.tabDisplay.querySelector(`[data-chord="${chordName}"]`);
        if (activeDiagram) {
            activeDiagram.classList.add('highlight-current');
            activeDiagram.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Highlight in full tab view
        const chordPositions = this.tabDisplay.querySelectorAll('.chord-label-position');
        for (const position of chordPositions) {
            if (position.textContent.trim() === chordName) {
                position.classList.add('highlight-current');
            }
        }
    }
}

// Export for use in other modules
window.TabRenderer = TabRenderer;
