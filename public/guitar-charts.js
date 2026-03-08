/**
 * Guitar Chord Charts Module
 * Contains standard guitar chord fingerings and diagrams
 */

const GUITAR_CHARTS = {
    'C': {
        name: 'C',
        frets: [3, 2, 0, 1, 3, 0],
        bassNote: 'C',
        quality: 'major',
        position: 3,
        fingers: ['3', '2', '', '1', '3', ''],
        barre: null,
        description: 'Standard C major chord'
    },
    'Cm': {
        name: 'Cm',
        frets: [8, 6, 6, 7, 9, 8],
        bassNote: 'C',
        quality: 'minor',
        position: 8,
        fingers: ['3', '1', '1', '2', '4', '3'],
        barre: null,
        description: 'C minor chord'
    },
    'Csus2': {
        name: 'Csus2',
        frets: ['x', 3, 0, 0, 1, 0],
        bassNote: 'C',
        quality: 'sus2',
        position: 3,
        fingers: ['', '3', '', '', '1', ''],
        barre: null,
        description: 'C suspended second'
    },
    'Csus4': {
        name: 'Csus4',
        frets: ['x', 3, 5, 5, 1, 'x'],
        bassNote: 'D',
        quality: 'sus4',
        position: 3,
        fingers: ['', '2', '3', '3', '1', ''],
        barre: null,
        description: 'C suspended fourth'
    },
    'G': {
        name: 'G',
        frets: [3, 2, 0, 0, 0, 3],
        bassNote: 'G',
        quality: 'major',
        position: 3,
        fingers: ['1', '2', '', '', '', '3'],
        barre: null,
        description: 'Standard G major chord'
    },
    'Gm': {
        name: 'Gm',
        frets: [3, 5, 5, 4, 3, 3],
        bassNote: 'G',
        quality: 'minor',
        position: 3,
        fingers: ['1', '2', '2', '1', '', ''],
        barre: null,
        description: 'G minor chord'
    },
    'Am': {
        name: 'Am',
        frets: ['x', 0, 2, 2, 1, 0],
        bassNote: 'A',
        quality: 'minor',
        position: 5,
        fingers: ['', '', '3', '3', '2', ''],
        barre: null,
        description: 'Standard A minor chord'
    },
    'Asus2': {
        name: 'Asus2',
        frets: ['x', 0, 2, 0, 1, 0],
        bassNote: 'A',
        quality: 'sus2',
        position: 5,
        fingers: ['', '', '3', '', '2', ''],
        barre: null,
        description: 'A suspended second'
    },
    'Asus4': {
        name: 'Asus4',
        frets: ['x', 0, 2, 2, 3, 'x'],
        bassNote: 'E',
        quality: 'sus4',
        position: 5,
        fingers: ['', '', '1', '1', '3', ''],
        barre: null,
        description: 'A suspended fourth'
    },
    'F': {
        name: 'F',
        frets: ['x', 3, 2, 0, 1, 'x'],
        bassNote: 'F',
        quality: 'major',
        position: 5,
        fingers: ['', '3', '2', '', '1', ''],
        barre: null,
        description: 'Standard F major chord'
    },
    'Fmaj7': {
        name: 'Fmaj7',
        frets: ['x', 3, 5, 4, 1, 'x'],
        bassNote: 'F',
        quality: 'major7',
        position: 5,
        fingers: ['', '2', '4', '3', '1', ''],
        barre: null,
        description: 'F major seventh'
    },
    'D': {
        name: 'D',
        frets: ['x', 'x', 0, 2, 3, 2],
        bassNote: 'D',
        quality: 'major',
        position: 4,
        fingers: ['', '', '', '1', '3', '2'],
        barre: null,
        description: 'Standard D major chord'
    },
    'Dm': {
        name: 'Dm',
        frets: ['x', 'x', 0, 2, 3, 1],
        bassNote: 'D',
        quality: 'minor',
        position: 4,
        fingers: ['', '', '', '1', '3', '2'],
        barre: null,
        description: 'D minor chord'
    },
    'Em': {
        name: 'Em',
        frets: [0, 2, 2, 0, 0, 0],
        bassNote: 'E',
        quality: 'minor',
        position: 1,
        fingers: ['1', '2', '', '', '', ''],
        barre: null,
        description: 'Standard E minor chord'
    },
    'Em7': {
        name: 'Em7',
        frets: [0, 2, 0, 0, 0, 0],
        bassNote: 'E',
        quality: 'minor7',
        position: 1,
        fingers: ['1', '', '', '', '', ''],
        barre: null,
        description: 'E minor seventh'
    },
    'E': {
        name: 'E',
        frets: [0, 2, 2, 1, 0, 0],
        bassNote: 'E',
        quality: 'major',
        position: 1,
        fingers: ['1', '3', '2', '', '', ''],
        barre: null,
        description: 'Standard E major chord'
    },
    'E7': {
        name: 'E7',
        frets: [0, 2, 0, 1, 0, 0],
        bassNote: 'E',
        quality: 'dominant7',
        position: 1,
        fingers: ['1', '', '', '2', '', ''],
        barre: null,
        description: 'E dominant seventh'
    },
    'Bm': {
        name: 'Bm',
        frets: ['x', 2, 4, 4, 3, 2],
        bassNote: 'B',
        quality: 'minor',
        position: 2,
        fingers: ['', '1', '3', '3', '2', '1'],
        barre: null,
        description: 'Standard B minor chord'
    },
    'B': {
        name: 'B',
        frets: ['x', 2, 4, 4, 4, 2],
        bassNote: 'B',
        quality: 'major',
        position: 2,
        fingers: ['', '1', '3', '3', '3', '2'],
        barre: null,
        description: 'Standard B major chord'
    },
    'A7': {
        name: 'A7',
        frets: ['x', 0, 2, 0, 2, 0],
        bassNote: 'A',
        quality: 'dominant7',
        position: 5,
        fingers: ['', '', '1', '', '2', ''],
        barre: null,
        description: 'A dominant seventh'
    },
    'F#m': {
        name: 'F#m',
        frets: ['x', 2, 4, 4, 3, 2],
        bassNote: 'F#',
        quality: 'minor',
        position: 2,
        fingers: ['', '1', '3', '3', '2', '1'],
        barre: null,
        description: 'F sharp minor chord'
    },
    'Dm7': {
        name: 'Dm7',
        frets: ['x', 'x', 0, 2, 1, 1],
        bassNote: 'D',
        quality: 'minor7',
        position: 4,
        fingers: ['', '', '', '2', '1', '1'],
        barre: null,
        description: 'D minor seventh'
    },
    'G7': {
        name: 'G7',
        frets: [3, 2, 0, 0, 0, 1],
        bassNote: 'G',
        quality: 'dominant7',
        position: 3,
        fingers: ['1', '2', '', '', '', '4'],
        barre: null,
        description: 'G dominant seventh'
    },
    'Cadd9': {
        name: 'Cadd9',
        frets: ['x', 3, 5, 5, 3, 'x'],
        bassNote: 'E',
        quality: 'major/add9',
        position: 3,
        fingers: ['', '2', '4', '4', '3', ''],
        barre: null,
        description: 'C major add ninth'
    },
    'G/B': {
        name: 'G/B',
        frets: ['x', 'x', 0, 2, 3, 3],
        bassNote: 'B',
        quality: 'major',
        position: 4,
        fingers: ['', '', '', '1', '2', '3'],
        barre: null,
        description: 'G major with B in bass'
    },
    'Am7': {
        name: 'Am7',
        frets: ['x', 0, 2, 0, 1, 0],
        bassNote: 'A',
        quality: 'minor7',
        position: 5,
        fingers: ['', '', '3', '', '2', ''],
        barre: null,
        description: 'A minor seventh'
    },
    'F#': {
        name: 'F#',
        frets: ['x', 2, 4, 4, 4, 2],
        bassNote: 'F#',
        quality: 'major',
        position: 2,
        fingers: ['', '1', '3', '3', '3', '2'],
        barre: null,
        description: 'F sharp major chord'
    },
    'E7sus4': {
        name: 'E7sus4',
        frets: [0, 2, 0, 1, 0, 'x'],
        bassNote: 'E',
        quality: 'dominant7sus4',
        position: 1,
        fingers: ['1', '', '', '2', '', ''],
        barre: null,
        description: 'E dominant seventh suspended fourth'
    },
    'Cmaj7': {
        name: 'Cmaj7',
        frets: ['x', 3, 5, 4, 5, 'x'],
        bassNote: 'E',
        quality: 'major7',
        position: 3,
        fingers: ['', '2', '4', '3', '4', ''],
        barre: null,
        description: 'C major seventh'
    },
    'Gsus4': {
        name: 'Gsus4',
        frets: [3, 5, 5, 3, 'x', 'x'],
        bassNote: 'D',
        quality: 'sus4',
        position: 3,
        fingers: ['1', '2', '2', '1', '', ''],
        barre: null,
        description: 'G suspended fourth'
    },
    'Fmaj7 (easy)': {
        name: 'Fmaj7',
        frets: ['x', 3, 5, 4, 0, 'x'],
        bassNote: 'A',
        quality: 'major7',
        position: 5,
        fingers: ['', '2', '4', '3', '', ''],
        barre: null,
        description: 'F major seventh (open E version)'
    }
};

/**
 * Get chord chart by name
 */
function getChordChart(chordName) {
    // Direct match first
    if (GUITAR_CHARTS[chordName]) {
        return GUITAR_CHARTS[chordName];
    }

    // Try variations with different casing and spacing
    const normalized = chordName.toUpperCase().replace(/\s+/g, '');
    for (const [key, chart] of Object.entries(GUITAR_CHARTS)) {
        if (key.toUpperCase().replace(/\s+/g, '') === normalized) {
            return chart;
        }
    }

    // Try to match basic chord name
    const basicName = chordName.replace(/[79sus2sus4majaddm+]/gi, '').toUpperCase();
    for (const [key, chart] of Object.entries(GUITAR_CHARTS)) {
        if (chart.name.toUpperCase() === basicName) {
            return chart;
        }
    }

    return null;
}

/**
 * Get all available chord names
 */
function getAllChordNames() {
    return Object.keys(GUITAR_CHARTS);
}
