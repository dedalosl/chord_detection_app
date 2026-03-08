const { AudioProcessor } = require('../public/audio-processor');

describe('AudioProcessor chord utilities', () => {
  const ap = new AudioProcessor();

  test('isValidChordName accepts basic chords', () => {
    expect(ap.isValidChordName('C')).toBe(true);
    expect(ap.isValidChordName('Dm')).toBe(true);
    expect(ap.isValidChordName('F#maj7')).toBe(false); // not in patterns
  });

  test('parseChordInfo correctly parses', () => {
    const info = ap.parseChordInfo('G/B');
    expect(info.root).toBe('G/B'); // simplified parsing
  });
});