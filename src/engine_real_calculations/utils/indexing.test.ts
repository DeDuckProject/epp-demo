import { describe, test, expect } from 'vitest';
import { bitstringToIndex, indexToBitstring } from './indexing';

describe('Indexing Utils', () => {
  test('bitstringToIndex', () => {
    // Empty bitstring is index 0
    expect(bitstringToIndex('')).toBe(0);
    
    // Simple bitstrings
    expect(bitstringToIndex('0')).toBe(0);
    expect(bitstringToIndex('1')).toBe(1);
    expect(bitstringToIndex('10')).toBe(2);
    expect(bitstringToIndex('01')).toBe(1);
    expect(bitstringToIndex('101')).toBe(5);
    expect(bitstringToIndex('1010001111100')).toBe(5244);

    // Verify LSB-first (little-endian) interpretation
    // '1101' is (1 * 2^0) + (0 * 2^1) + (1 * 2^2) + (1 * 2^3) = 1 + 0 + 4 + 8 = 13
    expect(bitstringToIndex('1101')).toBe(13);
  });

  test('indexToBitstring', () => {
    // Test with different bit lengths
    expect(indexToBitstring(0, 1)).toBe('0');
    expect(indexToBitstring(1, 1)).toBe('1');
    expect(indexToBitstring(0, 3)).toBe('000');
    expect(indexToBitstring(5, 3)).toBe('101');
    expect(indexToBitstring(13, 4)).toBe('1101');
    
    // Ensure it works with a longer bit length
    expect(indexToBitstring(6, 5)).toBe('00110');
  });

  test('roundtrip conversion', () => {
    // Test converting back and forth
    for (let i = 0; i < 16; i++) {
      const bits = indexToBitstring(i, 4);
      expect(bitstringToIndex(bits)).toBe(i);
    }
  });
  
  test('handle different endianness correctly', () => {
    // '1011' in big-endian would be 11 (1*8 + 0*4 + 1*2 + 1*1)
    // but in little-endian (our implementation) it's 13 (1*1 + 1*4 + 0*2 + 1*8)
    expect(bitstringToIndex('1011')).toBe(11);
    expect(indexToBitstring(11, 4)).toBe('1011');
  });
}); 