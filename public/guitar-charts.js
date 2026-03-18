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
    },

    // ── Major chords ────────────────────────────────────────
    'A': {
        name: 'A',
        frets: ['x', 0, 2, 2, 2, 0],
        bassNote: 'A',
        quality: 'major',
        position: 2,
        fingers: ['', '', '1', '2', '3', ''],
        barre: null,
        description: 'A major open chord'
    },
    'Ab': {
        name: 'Ab',
        frets: [4, 6, 6, 5, 4, 4],
        bassNote: 'Ab',
        quality: 'major',
        position: 4,
        fingers: ['1', '3', '4', '2', '1', '1'],
        barre: 4,
        description: 'Ab major barre chord (E-shape)'
    },
    'Bb': {
        name: 'Bb',
        frets: ['x', 1, 3, 3, 3, 1],
        bassNote: 'Bb',
        quality: 'major',
        position: 1,
        fingers: ['', '1', '2', '3', '4', '1'],
        barre: 1,
        description: 'Bb major barre chord (A-shape)'
    },
    'C#': {
        name: 'C#',
        frets: ['x', 4, 6, 6, 6, 4],
        bassNote: 'C#',
        quality: 'major',
        position: 4,
        fingers: ['', '1', '2', '3', '4', '1'],
        barre: 4,
        description: 'C# major barre chord (A-shape)'
    },
    'Db': {
        name: 'Db',
        frets: ['x', 4, 6, 6, 6, 4],
        bassNote: 'Db',
        quality: 'major',
        position: 4,
        fingers: ['', '1', '2', '3', '4', '1'],
        barre: 4,
        description: 'Db major barre chord (A-shape)'
    },
    'Eb': {
        name: 'Eb',
        frets: ['x', 6, 8, 8, 8, 6],
        bassNote: 'Eb',
        quality: 'major',
        position: 6,
        fingers: ['', '1', '2', '3', '4', '1'],
        barre: 6,
        description: 'Eb major barre chord (A-shape)'
    },
    'Gb': {
        name: 'Gb',
        frets: [2, 4, 4, 3, 2, 2],
        bassNote: 'Gb',
        quality: 'major',
        position: 2,
        fingers: ['1', '3', '4', '2', '1', '1'],
        barre: 2,
        description: 'Gb major barre chord (E-shape)'
    },

    // ── Minor chords ────────────────────────────────────────
    'C#m': {
        name: 'C#m',
        frets: ['x', 4, 6, 6, 5, 4],
        bassNote: 'C#',
        quality: 'minor',
        position: 4,
        fingers: ['', '1', '3', '4', '2', '1'],
        barre: 4,
        description: 'C# minor barre chord (Am-shape)'
    },
    'Dbm': {
        name: 'Dbm',
        frets: ['x', 4, 6, 6, 5, 4],
        bassNote: 'Db',
        quality: 'minor',
        position: 4,
        fingers: ['', '1', '3', '4', '2', '1'],
        barre: 4,
        description: 'Db minor barre chord (Am-shape)'
    },
    'Ebm': {
        name: 'Ebm',
        frets: ['x', 6, 8, 8, 7, 6],
        bassNote: 'Eb',
        quality: 'minor',
        position: 6,
        fingers: ['', '1', '3', '4', '2', '1'],
        barre: 6,
        description: 'Eb minor barre chord (Am-shape)'
    },
    'Fm': {
        name: 'Fm',
        frets: [1, 3, 3, 1, 1, 1],
        bassNote: 'F',
        quality: 'minor',
        position: 1,
        fingers: ['1', '3', '4', '1', '1', '1'],
        barre: 1,
        description: 'F minor barre chord (Em-shape)'
    },
    'Abm': {
        name: 'Abm',
        frets: [4, 6, 6, 4, 4, 4],
        bassNote: 'Ab',
        quality: 'minor',
        position: 4,
        fingers: ['1', '3', '4', '1', '1', '1'],
        barre: 4,
        description: 'Ab minor barre chord (Em-shape)'
    },
    'G#m': {
        name: 'G#m',
        frets: [4, 6, 6, 4, 4, 4],
        bassNote: 'G#',
        quality: 'minor',
        position: 4,
        fingers: ['1', '3', '4', '1', '1', '1'],
        barre: 4,
        description: 'G# minor barre chord (Em-shape)'
    },
    'Bbm': {
        name: 'Bbm',
        frets: [6, 8, 8, 6, 6, 6],
        bassNote: 'Bb',
        quality: 'minor',
        position: 6,
        fingers: ['1', '3', '4', '1', '1', '1'],
        barre: 6,
        description: 'Bb minor barre chord (Em-shape)'
    },

    // ── Dominant 7th chords ─────────────────────────────────
    'B7': {
        name: 'B7',
        frets: ['x', 2, 1, 2, 0, 2],
        bassNote: 'B',
        quality: 'dom7',
        position: 2,
        fingers: ['', '2', '1', '3', '', '4'],
        barre: null,
        description: 'B dominant seventh open chord'
    },
    'C7': {
        name: 'C7',
        frets: ['x', 3, 2, 3, 1, 0],
        bassNote: 'C',
        quality: 'dom7',
        position: 3,
        fingers: ['', '3', '2', '4', '1', ''],
        barre: null,
        description: 'C dominant seventh open chord'
    },
    'D7': {
        name: 'D7',
        frets: ['x', 'x', 0, 2, 1, 2],
        bassNote: 'D',
        quality: 'dom7',
        position: 2,
        fingers: ['', '', '', '2', '1', '3'],
        barre: null,
        description: 'D dominant seventh open chord'
    },
    'F7': {
        name: 'F7',
        frets: [1, 3, 1, 2, 1, 1],
        bassNote: 'F',
        quality: 'dom7',
        position: 1,
        fingers: ['1', '3', '1', '2', '1', '1'],
        barre: 1,
        description: 'F dominant seventh barre chord'
    },
    'F#7': {
        name: 'F#7',
        frets: [2, 4, 2, 3, 2, 2],
        bassNote: 'F#',
        quality: 'dom7',
        position: 2,
        fingers: ['1', '3', '1', '2', '1', '1'],
        barre: 2,
        description: 'F# dominant seventh barre chord'
    },
    'Ab7': {
        name: 'Ab7',
        frets: [4, 6, 4, 5, 4, 4],
        bassNote: 'Ab',
        quality: 'dom7',
        position: 4,
        fingers: ['1', '3', '1', '2', '1', '1'],
        barre: 4,
        description: 'Ab dominant seventh barre chord'
    },
    'Bb7': {
        name: 'Bb7',
        frets: ['x', 1, 3, 1, 3, 1],
        bassNote: 'Bb',
        quality: 'dom7',
        position: 1,
        fingers: ['', '1', '3', '1', '4', '1'],
        barre: 1,
        description: 'Bb dominant seventh barre chord'
    },
    'C#7': {
        name: 'C#7',
        frets: ['x', 4, 3, 4, 2, 4],
        bassNote: 'C#',
        quality: 'dom7',
        position: 4,
        fingers: ['', '3', '2', '4', '1', '4'],
        barre: null,
        description: 'C# dominant seventh chord'
    },

    // ── Minor 7th chords ────────────────────────────────────
    'Bm7': {
        name: 'Bm7',
        frets: ['x', 2, 4, 2, 3, 2],
        bassNote: 'B',
        quality: 'min7',
        position: 2,
        fingers: ['', '1', '3', '1', '2', '1'],
        barre: 2,
        description: 'B minor seventh chord'
    },
    'Cm7': {
        name: 'Cm7',
        frets: ['x', 3, 5, 3, 4, 3],
        bassNote: 'C',
        quality: 'min7',
        position: 3,
        fingers: ['', '1', '3', '1', '2', '1'],
        barre: 3,
        description: 'C minor seventh chord'
    },
    'F#m7': {
        name: 'F#m7',
        frets: [2, 4, 2, 2, 2, 2],
        bassNote: 'F#',
        quality: 'min7',
        position: 2,
        fingers: ['1', '3', '1', '1', '1', '1'],
        barre: 2,
        description: 'F# minor seventh barre chord'
    },
    'Gm7': {
        name: 'Gm7',
        frets: [3, 5, 3, 3, 3, 3],
        bassNote: 'G',
        quality: 'min7',
        position: 3,
        fingers: ['1', '3', '1', '1', '1', '1'],
        barre: 3,
        description: 'G minor seventh barre chord'
    },
    'Abm7': {
        name: 'Abm7',
        frets: [4, 6, 4, 4, 4, 4],
        bassNote: 'Ab',
        quality: 'min7',
        position: 4,
        fingers: ['1', '3', '1', '1', '1', '1'],
        barre: 4,
        description: 'Ab minor seventh barre chord'
    },
    'Bbm7': {
        name: 'Bbm7',
        frets: [6, 8, 6, 6, 6, 6],
        bassNote: 'Bb',
        quality: 'min7',
        position: 6,
        fingers: ['1', '3', '1', '1', '1', '1'],
        barre: 6,
        description: 'Bb minor seventh barre chord'
    },
    'C#m7': {
        name: 'C#m7',
        frets: ['x', 4, 6, 4, 5, 4],
        bassNote: 'C#',
        quality: 'min7',
        position: 4,
        fingers: ['', '1', '3', '1', '2', '1'],
        barre: 4,
        description: 'C# minor seventh chord'
    },

    // ── Major 7th chords ────────────────────────────────────
    'Amaj7': {
        name: 'Amaj7',
        frets: ['x', 0, 2, 1, 2, 0],
        bassNote: 'A',
        quality: 'major7',
        position: 2,
        fingers: ['', '', '2', '1', '3', ''],
        barre: null,
        description: 'A major seventh open chord'
    },
    'Bmaj7': {
        name: 'Bmaj7',
        frets: ['x', 2, 4, 3, 4, 2],
        bassNote: 'B',
        quality: 'major7',
        position: 2,
        fingers: ['', '1', '3', '2', '4', '1'],
        barre: 2,
        description: 'B major seventh chord'
    },
    'Dmaj7': {
        name: 'Dmaj7',
        frets: ['x', 'x', 0, 2, 2, 2],
        bassNote: 'D',
        quality: 'major7',
        position: 2,
        fingers: ['', '', '', '1', '2', '3'],
        barre: null,
        description: 'D major seventh open chord'
    },
    'Emaj7': {
        name: 'Emaj7',
        frets: [0, 2, 1, 1, 0, 0],
        bassNote: 'E',
        quality: 'major7',
        position: 1,
        fingers: ['', '3', '1', '2', '', ''],
        barre: null,
        description: 'E major seventh open chord'
    },
    'Gmaj7': {
        name: 'Gmaj7',
        frets: [3, 2, 0, 0, 0, 2],
        bassNote: 'G',
        quality: 'major7',
        position: 2,
        fingers: ['3', '2', '', '', '', '1'],
        barre: null,
        description: 'G major seventh open chord'
    },
    'Abmaj7': {
        name: 'Abmaj7',
        frets: [4, 6, 5, 5, 4, 4],
        bassNote: 'Ab',
        quality: 'major7',
        position: 4,
        fingers: ['1', '4', '3', '2', '1', '1'],
        barre: 4,
        description: 'Ab major seventh barre chord'
    },
    'Bbmaj7': {
        name: 'Bbmaj7',
        frets: ['x', 1, 3, 2, 3, 1],
        bassNote: 'Bb',
        quality: 'major7',
        position: 1,
        fingers: ['', '1', '3', '2', '4', '1'],
        barre: 1,
        description: 'Bb major seventh barre chord'
    },

    // ── Suspended 2nd chords ─────────────────────────────────
    'Bsus2': {
        name: 'Bsus2',
        frets: ['x', 2, 4, 4, 2, 2],
        bassNote: 'B',
        quality: 'sus2',
        position: 2,
        fingers: ['', '1', '3', '4', '1', '1'],
        barre: 2,
        description: 'B suspended second'
    },
    'Dsus2': {
        name: 'Dsus2',
        frets: ['x', 'x', 0, 2, 3, 0],
        bassNote: 'D',
        quality: 'sus2',
        position: 2,
        fingers: ['', '', '', '1', '3', ''],
        barre: null,
        description: 'D suspended second open chord'
    },
    'Esus2': {
        name: 'Esus2',
        frets: [0, 2, 4, 4, 0, 0],
        bassNote: 'E',
        quality: 'sus2',
        position: 2,
        fingers: ['', '1', '3', '4', '', ''],
        barre: null,
        description: 'E suspended second open chord'
    },
    'Fsus2': {
        name: 'Fsus2',
        frets: ['x', 3, 3, 0, 1, 1],
        bassNote: 'F',
        quality: 'sus2',
        position: 3,
        fingers: ['', '3', '4', '', '1', '1'],
        barre: null,
        description: 'F suspended second chord'
    },
    'Gsus2': {
        name: 'Gsus2',
        frets: [3, 0, 0, 0, 3, 3],
        bassNote: 'G',
        quality: 'sus2',
        position: 3,
        fingers: ['2', '', '', '', '3', '4'],
        barre: null,
        description: 'G suspended second open chord'
    },

    // ── Suspended 4th chords ─────────────────────────────────
    'Dsus4': {
        name: 'Dsus4',
        frets: ['x', 'x', 0, 2, 3, 3],
        bassNote: 'D',
        quality: 'sus4',
        position: 2,
        fingers: ['', '', '', '1', '2', '3'],
        barre: null,
        description: 'D suspended fourth open chord'
    },
    'Esus4': {
        name: 'Esus4',
        frets: [0, 2, 2, 2, 0, 0],
        bassNote: 'E',
        quality: 'sus4',
        position: 2,
        fingers: ['', '1', '2', '3', '', ''],
        barre: null,
        description: 'E suspended fourth open chord'
    },
    'Fsus4': {
        name: 'Fsus4',
        frets: [1, 3, 3, 3, 1, 1],
        bassNote: 'F',
        quality: 'sus4',
        position: 1,
        fingers: ['1', '2', '3', '4', '1', '1'],
        barre: 1,
        description: 'F suspended fourth barre chord'
    },
    'Bsus4': {
        name: 'Bsus4',
        frets: ['x', 2, 4, 4, 0, 0],
        bassNote: 'B',
        quality: 'sus4',
        position: 2,
        fingers: ['', '1', '2', '3', '', ''],
        barre: null,
        description: 'B suspended fourth chord'
    },
    'F#sus2': {
        name: 'F#sus2',
        frets: [2, 4, 4, 4, 2, 2],
        bassNote: 'F#',
        quality: 'sus2',
        position: 2,
        fingers: ['1', '2', '3', '4', '1', '1'],
        barre: 2,
        description: 'F# suspended second barre chord'
    },
    'F#sus4': {
        name: 'F#sus4',
        frets: [2, 4, 4, 4, 2, 2],
        bassNote: 'F#',
        quality: 'sus4',
        position: 2,
        fingers: ['1', '2', '3', '4', '1', '1'],
        barre: 2,
        description: 'F# suspended fourth barre chord'
    },

    // ── Add9 chords ─────────────────────────────────────────
    'Aadd9': {
        name: 'Aadd9',
        frets: ['x', 0, 2, 4, 2, 0],
        bassNote: 'A',
        quality: 'add9',
        position: 2,
        fingers: ['', '', '1', '4', '2', ''],
        barre: null,
        description: 'A add 9 open chord'
    },
    'Dadd9': {
        name: 'Dadd9',
        frets: ['x', 'x', 0, 2, 3, 0],
        bassNote: 'D',
        quality: 'add9',
        position: 2,
        fingers: ['', '', '', '1', '3', ''],
        barre: null,
        description: 'D add 9 open chord'
    },
    'Eadd9': {
        name: 'Eadd9',
        frets: [0, 2, 2, 1, 0, 2],
        bassNote: 'E',
        quality: 'add9',
        position: 2,
        fingers: ['', '2', '3', '1', '', '4'],
        barre: null,
        description: 'E add 9 open chord'
    },
    'Gadd9': {
        name: 'Gadd9',
        frets: [3, 2, 0, 2, 3, 3],
        bassNote: 'G',
        quality: 'add9',
        position: 2,
        fingers: ['3', '2', '', '1', '4', '4'],
        barre: null,
        description: 'G add 9 open chord'
    },

    // ── Power chords (5th chords) ────────────────────────────
    'A5': {
        name: 'A5',
        frets: ['x', 0, 2, 2, 'x', 'x'],
        bassNote: 'A',
        quality: 'power',
        position: 2,
        fingers: ['', '', '1', '2', '', ''],
        barre: null,
        description: 'A power chord'
    },
    'B5': {
        name: 'B5',
        frets: ['x', 2, 4, 4, 'x', 'x'],
        bassNote: 'B',
        quality: 'power',
        position: 2,
        fingers: ['', '1', '3', '4', '', ''],
        barre: null,
        description: 'B power chord'
    },
    'C5': {
        name: 'C5',
        frets: ['x', 3, 5, 5, 'x', 'x'],
        bassNote: 'C',
        quality: 'power',
        position: 3,
        fingers: ['', '1', '3', '4', '', ''],
        barre: null,
        description: 'C power chord'
    },
    'D5': {
        name: 'D5',
        frets: ['x', 5, 7, 7, 'x', 'x'],
        bassNote: 'D',
        quality: 'power',
        position: 5,
        fingers: ['', '1', '3', '4', '', ''],
        barre: null,
        description: 'D power chord'
    },
    'E5': {
        name: 'E5',
        frets: [0, 2, 2, 'x', 'x', 'x'],
        bassNote: 'E',
        quality: 'power',
        position: 2,
        fingers: ['', '1', '2', '', '', ''],
        barre: null,
        description: 'E power chord'
    },
    'F5': {
        name: 'F5',
        frets: [1, 3, 3, 'x', 'x', 'x'],
        bassNote: 'F',
        quality: 'power',
        position: 1,
        fingers: ['1', '3', '4', '', '', ''],
        barre: null,
        description: 'F power chord'
    },
    'G5': {
        name: 'G5',
        frets: [3, 5, 5, 'x', 'x', 'x'],
        bassNote: 'G',
        quality: 'power',
        position: 3,
        fingers: ['1', '3', '4', '', '', ''],
        barre: null,
        description: 'G power chord'
    },
    'C#5': {
        name: 'C#5',
        frets: ['x', 4, 6, 6, 'x', 'x'],
        bassNote: 'C#',
        quality: 'power',
        position: 4,
        fingers: ['', '1', '3', '4', '', ''],
        barre: null,
        description: 'C# power chord'
    },

    // ── Slash / bass-note chords ─────────────────────────────
    'A/C#': {
        name: 'A/C#',
        frets: ['x', 4, 2, 2, 2, 0],
        bassNote: 'C#',
        quality: 'major',
        position: 4,
        fingers: ['', '4', '1', '2', '3', ''],
        barre: null,
        description: 'A major with C# bass'
    },
    'C/E': {
        name: 'C/E',
        frets: [0, 3, 2, 0, 1, 0],
        bassNote: 'E',
        quality: 'major',
        position: 3,
        fingers: ['', '3', '2', '', '1', ''],
        barre: null,
        description: 'C major with E bass'
    },
    'D/F#': {
        name: 'D/F#',
        frets: [2, 0, 0, 2, 3, 2],
        bassNote: 'F#',
        quality: 'major',
        position: 2,
        fingers: ['2', '', '', '1', '3', '1'],
        barre: null,
        description: 'D major with F# bass'
    },
    'D/A': {
        name: 'D/A',
        frets: ['x', 0, 0, 2, 3, 2],
        bassNote: 'A',
        quality: 'major',
        position: 2,
        fingers: ['', '', '', '1', '3', '2'],
        barre: null,
        description: 'D major with A bass'
    },
    'E/B': {
        name: 'E/B',
        frets: ['x', 2, 2, 1, 0, 0],
        bassNote: 'B',
        quality: 'major',
        position: 2,
        fingers: ['', '3', '4', '2', '', ''],
        barre: null,
        description: 'E major with B bass'
    },
    'G/D': {
        name: 'G/D',
        frets: ['x', 5, 5, 4, 3, 3],
        bassNote: 'D',
        quality: 'major',
        position: 5,
        fingers: ['', '3', '4', '2', '1', '1'],
        barre: null,
        description: 'G major with D bass'
    },
    'Am/C': {
        name: 'Am/C',
        frets: ['x', 3, 2, 2, 1, 0],
        bassNote: 'C',
        quality: 'minor',
        position: 3,
        fingers: ['', '4', '3', '2', '1', ''],
        barre: null,
        description: 'A minor with C bass'
    },
    'Am/E': {
        name: 'Am/E',
        frets: [0, 0, 2, 2, 1, 0],
        bassNote: 'E',
        quality: 'minor',
        position: 2,
        fingers: ['', '', '2', '3', '1', ''],
        barre: null,
        description: 'A minor with E bass'
    },
    'Em/B': {
        name: 'Em/B',
        frets: ['x', 2, 2, 0, 0, 0],
        bassNote: 'B',
        quality: 'minor',
        position: 2,
        fingers: ['', '1', '2', '', '', ''],
        barre: null,
        description: 'E minor with B bass'
    },
    'F/A': {
        name: 'F/A',
        frets: ['x', 0, 3, 2, 1, 1],
        bassNote: 'A',
        quality: 'major',
        position: 3,
        fingers: ['', '', '3', '2', '1', '1'],
        barre: null,
        description: 'F major with A bass'
    },
    'Bb/D': {
        name: 'Bb/D',
        frets: ['x', 5, 3, 3, 3, 1],
        bassNote: 'D',
        quality: 'major',
        position: 5,
        fingers: ['', '4', '2', '3', '3', '1'],
        barre: null,
        description: 'Bb major with D bass'
    },
    'G/F#': {
        name: 'G/F#',
        frets: [2, 0, 0, 0, 3, 2],
        bassNote: 'F#',
        quality: 'major',
        position: 3,
        fingers: ['2', '', '', '', '4', '1'],
        barre: null,
        description: 'G major with F# bass'
    },

    // ── Additional common chords ─────────────────────────────
    'Bdim': {
        name: 'Bdim',
        frets: ['x', 2, 3, 4, 3, 2],
        bassNote: 'B',
        quality: 'dim',
        position: 2,
        fingers: ['', '1', '2', '4', '3', '1'],
        barre: null,
        description: 'B diminished chord'
    },
    'Adim': {
        name: 'Adim',
        frets: ['x', 0, 1, 2, 1, 0],
        bassNote: 'A',
        quality: 'dim',
        position: 1,
        fingers: ['', '', '1', '3', '2', ''],
        barre: null,
        description: 'A diminished chord'
    },
    'Ddim': {
        name: 'Ddim',
        frets: ['x', 'x', 0, 1, 0, 1],
        bassNote: 'D',
        quality: 'dim',
        position: 1,
        fingers: ['', '', '', '1', '', '2'],
        barre: null,
        description: 'D diminished chord'
    },
    'Edim': {
        name: 'Edim',
        frets: [0, 1, 2, 0, 2, 0],
        bassNote: 'E',
        quality: 'dim',
        position: 1,
        fingers: ['', '1', '2', '', '3', ''],
        barre: null,
        description: 'E diminished chord'
    },
    'F#dim': {
        name: 'F#dim',
        frets: [2, 3, 4, 2, 'x', 'x'],
        bassNote: 'F#',
        quality: 'dim',
        position: 2,
        fingers: ['1', '2', '3', '1', '', ''],
        barre: null,
        description: 'F# diminished chord'
    },
    'G#dim': {
        name: 'G#dim',
        frets: ['x', 'x', 1, 2, 1, 2],
        bassNote: 'G#',
        quality: 'dim',
        position: 1,
        fingers: ['', '', '1', '3', '2', '4'],
        barre: null,
        description: 'G# diminished chord'
    },
    'Dm9': {
        name: 'Dm9',
        frets: ['x', 'x', 0, 2, 1, 0],
        bassNote: 'D',
        quality: 'min9',
        position: 2,
        fingers: ['', '', '', '2', '1', ''],
        barre: null,
        description: 'D minor ninth open chord'
    },
    'Em9': {
        name: 'Em9',
        frets: [0, 2, 0, 0, 0, 0],
        bassNote: 'E',
        quality: 'min9',
        position: 2,
        fingers: ['', '2', '', '', '', ''],
        barre: null,
        description: 'E minor ninth open chord'
    },
    'Gmaj9': {
        name: 'Gmaj9',
        frets: [3, 2, 0, 2, 0, 0],
        bassNote: 'G',
        quality: 'maj9',
        position: 2,
        fingers: ['3', '2', '', '1', '', ''],
        barre: null,
        description: 'G major ninth open chord'
    },
    'Am9': {
        name: 'Am9',
        frets: ['x', 0, 2, 0, 1, 0],
        bassNote: 'A',
        quality: 'min9',
        position: 2,
        fingers: ['', '', '2', '', '1', ''],
        barre: null,
        description: 'A minor ninth open chord'
    }
};

// Enharmonic equivalents map: alternative spelling → canonical key in GUITAR_CHARTS
const ENHARMONIC_MAP = {
    'A#':   'Bb',   'A#m':  'Bbm',  'A#7':  'Bb7',  'A#m7': 'Bbm7', 'A#maj7': 'Bbmaj7',
    'Db':   'C#',   'Dbm':  'C#m',  'Db7':  'C#7',  'Dbm7': 'C#m7',
    'D#':   'Eb',   'D#m':  'Ebm',  'D#7':  'Eb7',  'D#m7': 'Ebm7',
    'G#':   'Ab',   'G#m':  'Abm',  'G#7':  'Ab7',  'G#m7': 'Abm7', 'G#maj7': 'Abmaj7',
    'E#':   'F',    'B#':   'C',    'Fb':   'E',    'Cb':   'B',
    'Gbm':  'F#m',  'Gb7':  'F#7',  'Gbm7': 'F#m7',
};

/**
 * Get chord chart by name
 */
function getChordChart(chordName) {
    if (!chordName) return null;

    // Direct match first
    if (GUITAR_CHARTS[chordName]) {
        return GUITAR_CHARTS[chordName];
    }

    // Enharmonic alias
    if (ENHARMONIC_MAP[chordName] && GUITAR_CHARTS[ENHARMONIC_MAP[chordName]]) {
        return GUITAR_CHARTS[ENHARMONIC_MAP[chordName]];
    }

    // Try case-insensitive / whitespace-normalised match
    const normalized = chordName.toUpperCase().replace(/\s+/g, '');
    for (const [key, chart] of Object.entries(GUITAR_CHARTS)) {
        if (key.toUpperCase().replace(/\s+/g, '') === normalized) {
            return chart;
        }
    }

    // Try stripping quality suffixes to find a simpler match (last resort)
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
