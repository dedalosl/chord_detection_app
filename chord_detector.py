#!/usr/bin/env python3
"""
Server-side chord detection using librosa.
Analyzes audio file and outputs detected chords as JSON.
"""

import sys
import json
import numpy as np
import librosa
import warnings
warnings.filterwarnings('ignore')

# Chord templates (intervals in semitones from root)
CHORD_TEMPLATES = {
    'major':  [0, 4, 7],
    'minor':  [0, 3, 7],
    'dim':    [0, 3, 6],
    'aug':    [0, 4, 8],
    'sus2':   [0, 2, 7],
    'sus4':   [0, 5, 7],
    'maj7':   [0, 4, 7, 11],
    'min7':   [0, 3, 7, 10],
    'dom7':   [0, 4, 7, 10],
}

NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

# Krumhansl-Schmuckler key profiles
MAJOR_PROFILE = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09,
                            2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
MINOR_PROFILE = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53,
                            2.54, 4.75, 3.98, 2.69, 3.34, 3.17])

# Confidence thresholds per chord category and quality
THRESHOLD_MAJOR   = 0.47    # Diatonic major triads
THRESHOLD_MINOR   = 0.47    # Diatonic minor triads
THRESHOLD_DIM     = 0.68    # Diminished - rare in pop/rock, needs strong evidence
THRESHOLD_SECONDARY = 0.65  # Secondary dominants - need clear evidence

def build_chord_vector(root, intervals, n=12):
    """Build a 12-dimensional binary chord template."""
    vec = np.zeros(n)
    for interval in intervals:
        vec[(root + interval) % 12] = 1.0
    return vec

def cosine_similarity(a, b):
    """Compute cosine similarity between two vectors."""
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return np.dot(a, b) / (norm_a * norm_b)

def detect_key(chroma_mean):
    """Detect musical key using Krumhansl-Schmuckler profiles."""
    best_score = -np.inf
    best_key = (0, 'major')

    for root in range(12):
        major_rotated = np.roll(MAJOR_PROFILE, root)
        minor_rotated = np.roll(MINOR_PROFILE, root)

        major_score = cosine_similarity(chroma_mean, major_rotated)
        minor_score = cosine_similarity(chroma_mean, minor_rotated)

        if major_score > best_score:
            best_score = major_score
            best_key = (root, 'major')
        if minor_score > best_score:
            best_score = minor_score
            best_key = (root, 'minor')

    return best_key

def get_key_candidates(key_root, key_mode):
    """
    Get chord candidates for the detected key.
    Returns list of (root, quality, threshold) tuples.
    """
    candidates = []

    def quality_threshold(quality):
        if quality == 'dim':
            return THRESHOLD_DIM
        elif quality == 'minor':
            return THRESHOLD_MINOR
        else:
            return THRESHOLD_MAJOR

    if key_mode == 'major':
        # Diatonic chords: I, ii, iii, IV, V, vi, viidim
        diatonic = [
            (key_root,           'major'),  # I
            ((key_root + 2) % 12, 'minor'), # ii
            ((key_root + 4) % 12, 'minor'), # iii
            ((key_root + 5) % 12, 'major'), # IV
            ((key_root + 7) % 12, 'major'), # V
            ((key_root + 9) % 12, 'minor'), # vi
            ((key_root + 11) % 12, 'dim'),  # viidim
        ]
    else:  # natural minor
        diatonic = [
            (key_root,            'minor'), # i
            ((key_root + 2) % 12, 'dim'),   # iidim
            ((key_root + 3) % 12, 'major'), # III
            ((key_root + 5) % 12, 'minor'), # iv
            ((key_root + 7) % 12, 'minor'), # v
            ((key_root + 8) % 12, 'major'), # VI
            ((key_root + 10) % 12, 'major'),# VII
            # Harmonic minor additions
            ((key_root + 7) % 12, 'major'), # V (raised 7th)
            ((key_root + 11) % 12, 'dim'),  # viidim
        ]

    # Add diatonic chords with quality-based thresholds
    diatonic_set = set()
    for root, quality in diatonic:
        key = (root, quality)
        if key not in diatonic_set:
            diatonic_set.add(key)
            candidates.append((root, quality, quality_threshold(quality)))

    # Add secondary dominants only for minor diatonic chords
    # These are: V/ii, V/iii, V/IV, V/vi (not V/V since that's already diatonic)
    for root, quality in diatonic:
        if quality in ['minor', 'dim']:
            secondary_root = (root + 7) % 12
            secondary_key = (secondary_root, 'major')
            # Don't add if already diatonic
            if secondary_key not in diatonic_set:
                # Check not already in candidates
                already_added = any(c[0] == secondary_root and c[1] == 'major'
                                    for c in candidates)
                if not already_added:
                    candidates.append((secondary_root, 'major', THRESHOLD_SECONDARY))

    return candidates

def format_chord_name(root, quality):
    """Format chord as readable name."""
    note = NOTE_NAMES[root]
    if quality == 'major':
        return note
    elif quality == 'minor':
        return note + 'm'
    elif quality == 'dim':
        return note + 'dim'
    elif quality == 'aug':
        return note + 'aug'
    elif quality == 'sus2':
        return note + 'sus2'
    elif quality == 'sus4':
        return note + 'sus4'
    elif quality == 'maj7':
        return note + 'maj7'
    elif quality == 'min7':
        return note + 'm7'
    elif quality == 'dom7':
        return note + '7'
    return note

def score_with_bass(chroma, root, intervals):
    """
    Enhanced scoring: cosine similarity + bass note weight.
    Root note presence in lower chroma bins boosts the score.
    """
    template = build_chord_vector(root, intervals)
    base_score = cosine_similarity(chroma, template)

    # Boost if root note is the strongest pitch class (common for guitar chords)
    dominant_pc = np.argmax(chroma)
    if dominant_pc == root:
        base_score *= 1.08

    # Penalty if root is nearly absent (avoids false positives)
    root_strength = chroma[root] / (np.max(chroma) + 1e-10)
    if root_strength < 0.15:
        base_score *= 0.80

    return base_score


SECONDARY_DIATONIC_MARGIN = 0.02  # Secondary dom must beat its diatonic sibling by this margin

def resolve_chord_winner(candidates_scored, chord_info):
    """
    Apply disambiguation rules to select the best chord from scored candidates.

    When a secondary dominant chord (not diatonic) wins over a diatonic chord with
    the same root by less than SECONDARY_DIATONIC_MARGIN, prefer the diatonic chord.
    """
    if not candidates_scored:
        return None

    # Sort by score descending
    sorted_candidates = sorted(candidates_scored, key=lambda x: x[1], reverse=True)
    winner_name, winner_score = sorted_candidates[0]
    winner_root, winner_quality, winner_threshold, _ = chord_info[winner_name]

    # If winner is a secondary dominant (higher threshold), check if same-root diatonic is close
    if winner_threshold >= THRESHOLD_SECONDARY:
        for alt_name, alt_score in sorted_candidates[1:]:
            alt_root, alt_quality, alt_threshold, _ = chord_info[alt_name]
            # Same root, lower threshold = diatonic chord
            if alt_root == winner_root and alt_threshold < THRESHOLD_SECONDARY:
                margin = winner_score - alt_score
                if margin < SECONDARY_DIATONIC_MARGIN and alt_score >= alt_threshold:
                    # Prefer the diatonic chord
                    return alt_name
                break

    return winner_name

def detect_sections(chords, tempo, total_duration):
    """
    Detect repeating song sections (Intro, Verse, Chorus, Bridge, Outro)
    by comparing chord-progression fingerprints across 4-bar time windows.

    Returns a list of {label, name, start, end, duration, chords} dicts.
    """
    if not chords or total_duration <= 0:
        return []

    from collections import Counter

    # ── 1. Build tempo-adaptive time segments (~10–12 s each) ─────────────────
    beats_per_bar    = 4
    # Target ~10 s per segment regardless of tempo
    bars_per_segment = max(4, min(8, round(10.0 * max(tempo, 60.0) / (beats_per_bar * 60.0))))
    segment_duration = bars_per_segment * beats_per_bar * 60.0 / max(tempo, 60.0)
    segment_duration = max(8.0, min(14.0, segment_duration))  # clamp 8–14 s

    # Detect leading silence → we'll prepend an explicit Intro later
    first_chord_time = chords[0]['start']

    segments = []
    t = 0.0
    while t < total_duration:
        end = min(t + segment_duration, total_duration)
        seg_chords = tuple(
            c['chord'] for c in chords
            if c['start'] >= t - 0.5 and c['start'] < end - 0.5
        )
        if seg_chords:
            segments.append({'start': t, 'end': end, 'chords': seg_chords})
        t += segment_duration

    if not segments:
        return []

    # ── 2. Chord-sequence similarity ─────────────────────────────────────────
    def chord_similarity(seq1, seq2):
        if not seq1 or not seq2:
            return 0.0
        s1, s2 = set(seq1), set(seq2)
        jaccard = len(s1 & s2) / len(s1 | s2)
        tr1 = {(seq1[i], seq1[i + 1]) for i in range(len(seq1) - 1)}
        tr2 = {(seq2[i], seq2[i + 1]) for i in range(len(seq2) - 1)}
        tr_sim = len(tr1 & tr2) / len(tr1 | tr2) if (tr1 or tr2) else (1.0 if seq1 == seq2 else 0.0)
        exact_bonus = 0.15 if seq1 == seq2 else 0.0
        return min(1.0, jaccard * 0.55 + tr_sim * 0.30 + exact_bonus)

    # ── 3. Label each segment ─────────────────────────────────────────────────
    THRESHOLD   = 0.50   # minimum match score to reuse an existing label
    MAX_LABELS  = 6      # cap unique section types
    LABEL_CHARS = 'ABCDEFGHIJ'
    known       = []     # [(chord_tuple, label_char)]
    assignments = []

    for seg in segments:
        scores = [(chord_similarity(seg['chords'], pattern), label)
                  for pattern, label in known]
        scores.sort(reverse=True)

        best_score, best_label = (scores[0] if scores else (0.0, None))

        if best_label is None or best_score < THRESHOLD:
            if len(known) < MAX_LABELS:
                best_label = LABEL_CHARS[len(known)]
                known.append((seg['chords'], best_label))
            else:
                # Cap reached: force-assign to the most similar existing label
                best_label = scores[0][1] if scores else known[0][1]

        assignments.append({'start': seg['start'], 'end': seg['end'], 'label': best_label})

    # ── 4. Merge consecutive identical labels ─────────────────────────────────
    merged_sec = []
    for a in assignments:
        if merged_sec and merged_sec[-1]['label'] == a['label']:
            merged_sec[-1]['end'] = a['end']
        else:
            merged_sec.append(dict(a))

    # ── 5. Absorb short orphan sections (< 0.7× segment_duration) ────────────
    min_dur = segment_duration * 0.7
    cleaned = []
    for m in merged_sec:
        dur = m['end'] - m['start']
        if dur < min_dur and cleaned:
            cleaned[-1]['end'] = m['end']
        else:
            cleaned.append(m)
    merged_sec = cleaned

    # Re-merge consecutive identical labels after absorption
    final_merged = []
    for m in merged_sec:
        if final_merged and final_merged[-1]['label'] == m['label']:
            final_merged[-1]['end'] = m['end']
        else:
            final_merged.append(m)
    merged_sec = final_merged

    # ── 6. Prepend intro if leading silence is significant ────────────────────
    first_seg_start = merged_sec[0]['start'] if merged_sec else first_chord_time
    if first_chord_time > segment_duration * 0.4 and first_seg_start > segment_duration * 0.4:
        merged_sec = [{'start': 0.0, 'end': first_seg_start, 'label': '__intro__'}] + merged_sec

    # ── 7. Heuristic names ────────────────────────────────────────────────────
    label_counts = Counter(a['label'] for a in merged_sec)

    label_chords_sets = {lbl: set() for lbl in label_counts}
    for a, seg in zip(assignments, segments):
        if a['label'] in label_chords_sets:
            label_chords_sets[a['label']].update(seg['chords'])
    complexity = {lbl: len(cset) for lbl, cset in label_chords_sets.items()}

    # Identify verse and chorus from repeating labels (appear >2 times):
    #   - simplest (fewest unique chords) = Verse
    #   - most complex = Chorus
    non_intro = [(lbl, cnt) for lbl, cnt in label_counts.items() if lbl != '__intro__']
    repeating = [(lbl, cnt) for lbl, cnt in non_intro if cnt > 2]
    pool = sorted(repeating if repeating else non_intro,
                  key=lambda x: complexity.get(x[0], 0))

    verse_label  = pool[0][0] if pool else None                             # simplest
    chorus_label = pool[-1][0] if len(pool) > 1 else None                  # most complex
    # If only one label, it's the chorus (main section)
    if len(pool) == 1:
        chorus_label = pool[0][0]
        verse_label  = None

    def name_section(label, idx, total, start, count):
        if label == '__intro__':
            return 'Intro'
        frac = start / total_duration if total_duration > 0 else 0
        is_unique = count == 1
        if idx == total - 1 and is_unique and frac > 0.80:
            return 'Outro'
        if count <= 2 and 0.25 < frac < 0.80 and label not in (chorus_label, verse_label):
            return 'Bridge'
        if label == chorus_label:
            return 'Chorus'
        if label == verse_label:
            return 'Verse'
        return f'Section {label}'

    result = []
    for i, m in enumerate(merged_sec):
        count = label_counts[m['label']]
        sec_chords = list(dict.fromkeys(
            c['chord'] for c in chords
            if c['start'] >= m['start'] - 0.5 and c['start'] < m['end'] - 0.5
        ))
        result.append({
            'label':    m['label'],
            'name':     name_section(m['label'], i, len(merged_sec), m['start'], count),
            'start':    round(m['start'], 2),
            'end':      round(m['end'], 2),
            'duration': round(m['end'] - m['start'], 2),
            'chords':   sec_chords
        })

    return result


def detect_chords(audio_path, hop_length=512, frame_length=4096):
    """
    Main chord detection function using librosa.

    Args:
        audio_path: Path to audio file
        hop_length: Hop size in samples (at 22050 Hz)
        frame_length: FFT frame size

    Returns:
        dict with 'chords' timeline and metadata
    """
    # Load audio at fixed sample rate
    y, sr = librosa.load(audio_path, sr=22050, mono=True)

    # Separate harmonic from percussive components
    y_harmonic, _ = librosa.effects.hpss(y, margin=3.0)

    # CQT-based chromagram (better frequency resolution than STFT for chords)
    chroma_cqt = librosa.feature.chroma_cqt(
        y=y_harmonic,
        sr=sr,
        hop_length=hop_length,
        bins_per_octave=36,
        norm=2,
        fmin=librosa.note_to_hz('C1')
    )

    # STFT chromagram for cross-validation
    chroma_stft = librosa.feature.chroma_stft(
        y=y_harmonic,
        sr=sr,
        n_fft=frame_length,
        hop_length=hop_length,
        norm=2
    )

    # Blend (CQT weighted more heavily — better pitch resolution)
    chroma_blend = 0.75 * chroma_cqt + 0.25 * chroma_stft

    # Temporal smoothing via median filter to reduce transient noise
    from scipy.ndimage import median_filter
    chroma_smooth = median_filter(chroma_blend, size=(1, 9))

    # Detect key from global chroma (entire song)
    chroma_mean = np.mean(chroma_smooth, axis=1)
    key_root, key_mode = detect_key(chroma_mean)
    key_name = NOTE_NAMES[key_root] + (' major' if key_mode == 'major' else ' minor')

    # Get candidates with individual thresholds
    candidates = get_key_candidates(key_root, key_mode)

    # Build chord info table: name -> (root, quality, threshold, template)
    chord_info = {}
    for root, quality, threshold in candidates:
        template = build_chord_vector(root, CHORD_TEMPLATES[quality])
        name = format_chord_name(root, quality)
        # Keep lower threshold if same chord added twice
        if name not in chord_info or chord_info[name][2] > threshold:
            chord_info[name] = (root, quality, threshold, template)

    # Detect BPM and beat grid
    tempo, beat_frames = librosa.beat.beat_track(
        y=y_harmonic, sr=sr, hop_length=hop_length
    )
    tempo = float(tempo) if np.isscalar(tempo) else float(tempo[0])

    n_frames = chroma_smooth.shape[1]
    chords_timeline = []

    beats_per_bar = 4

    if len(beat_frames) >= beats_per_bar:
        # Bar-aligned analysis
        bar_starts = beat_frames[::beats_per_bar]
        bar_ends = np.append(bar_starts[1:], n_frames)

        for bar_start, bar_end in zip(bar_starts, bar_ends):
            bar_end = min(int(bar_end), n_frames)
            bar_start = int(bar_start)
            if bar_start >= bar_end:
                continue

            bar_chroma = np.mean(chroma_smooth[:, bar_start:bar_end], axis=1)
            # Normalize
            norm = np.linalg.norm(bar_chroma)
            if norm > 0:
                bar_chroma = bar_chroma / norm

            candidates_scored = []
            for name, (root, quality, threshold, template) in chord_info.items():
                score = score_with_bass(bar_chroma, root, CHORD_TEMPLATES[quality])
                # Boost major and minor triads (most common in songs)
                if quality in ['major', 'minor']:
                    score *= 1.04
                if score >= threshold:
                    candidates_scored.append((name, score))

            best_chord = resolve_chord_winner(candidates_scored, chord_info)
            best_score = next((s for n, s in candidates_scored if n == best_chord), 0.0) if best_chord else 0.0

            time_start = librosa.frames_to_time(bar_start, sr=sr, hop_length=hop_length)
            time_end = librosa.frames_to_time(bar_end, sr=sr, hop_length=hop_length)

            if best_chord:
                chords_timeline.append({
                    'chord': best_chord,
                    'start': round(float(time_start), 2),
                    'end': round(float(time_end), 2),
                    'duration': round(float(time_end - time_start), 2),
                    'confidence': round(float(best_score), 3)
                })

    else:
        # Fallback: fixed 2-second windows
        segment_frames = int(2.0 * sr / hop_length)
        for start_frame in range(0, n_frames, segment_frames):
            end_frame = min(start_frame + segment_frames, n_frames)
            bar_chroma = np.mean(chroma_smooth[:, start_frame:end_frame], axis=1)
            norm = np.linalg.norm(bar_chroma)
            if norm > 0:
                bar_chroma = bar_chroma / norm

            candidates_scored = []
            for name, (root, quality, threshold, template) in chord_info.items():
                score = score_with_bass(bar_chroma, root, CHORD_TEMPLATES[quality])
                if quality in ['major', 'minor']:
                    score *= 1.04
                if score >= threshold:
                    candidates_scored.append((name, score))

            best_chord = resolve_chord_winner(candidates_scored, chord_info)
            best_score = next((s for n, s in candidates_scored if n == best_chord), 0.0) if best_chord else 0.0

            time_start = librosa.frames_to_time(start_frame, sr=sr, hop_length=hop_length)
            time_end = librosa.frames_to_time(end_frame, sr=sr, hop_length=hop_length)

            if best_chord:
                chords_timeline.append({
                    'chord': best_chord,
                    'start': round(float(time_start), 2),
                    'end': round(float(time_end), 2),
                    'duration': round(float(time_end - time_start), 2),
                    'confidence': round(float(best_score), 3)
                })

    # Merge consecutive identical chords
    merged = []
    for item in chords_timeline:
        if merged and merged[-1]['chord'] == item['chord']:
            merged[-1]['end'] = item['end']
            merged[-1]['duration'] = round(merged[-1]['end'] - merged[-1]['start'], 2)
        else:
            merged.append(dict(item))

    # Unique chords (first-appearance order)
    seen = set()
    unique_chords = []
    for c in merged:
        if c['chord'] not in seen:
            seen.add(c['chord'])
            unique_chords.append(c['chord'])

    total_duration = merged[-1]['end'] if merged else 0
    sections = detect_sections(merged, tempo, total_duration)

    return {
        'key': key_name,
        'tempo': round(tempo, 1),
        'chords': merged,
        'unique_chords': unique_chords,
        'total_chords': len(merged),
        'sections': sections,
        'duration': round(total_duration, 2)
    }


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Usage: python3 chord_detector.py <audio_file>'}))
        sys.exit(1)

    audio_path = sys.argv[1]

    try:
        result = detect_chords(audio_path)
        print(json.dumps(result, indent=2))
    except Exception as e:
        import traceback
        print(json.dumps({'error': str(e), 'traceback': traceback.format_exc()}))
        sys.exit(1)
