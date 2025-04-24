// Converts a big-endian bitstring (LSB at index n-1) to a numeric index
export function bitstringToIndex(bitstring: string): number {
  let index = 0;
  const n = bitstring.length;
  for (let i = 0; i < n; i++) {
    if (bitstring[n-i-1] === '1') {
      index |= (1 << i);
    }
  }
  return index;
}

// Converts a numeric index to a big-endian bitstring of given length (LSB at index n-1)
export function indexToBitstring(index: number, numBits: number): string {
  let bits = '';
  for (let i = numBits - 1; i >= 0; i--) {
    bits += ((index >> i) & 1).toString();
  }
  return bits;
} 