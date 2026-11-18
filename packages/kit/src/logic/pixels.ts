export interface PixelDifference { meanDifference: number; changedShare: number }

/**
 * Compares two pictures of equal size, given as raw red, green, blue, alpha bytes. `meanDifference` is the average difference
 * of a color channel (0 to 255); `changedShare` is the share of pixels in which a channel differs by more than `tolerance`.
 * The caller takes the pictures; this function only counts.
 */
export function comparePixels(a: Uint8Array | Uint8ClampedArray, b: Uint8Array | Uint8ClampedArray, tolerance = 24): PixelDifference {
  if (a.length !== b.length) throw new Error(`The pictures differ in size: ${a.length} and ${b.length} bytes.`);
  if (a.length % 4 !== 0) throw new Error('A picture needs four bytes for each pixel.');
  if (a.length === 0) return { meanDifference: 0, changedShare: 0 };
  let sum = 0;
  let changed = 0;
  for (let i = 0; i < a.length; i += 4) {
    let most = 0;
    for (let c = 0; c < 3; c++) { const d = Math.abs((a[i + c] ?? 0) - (b[i + c] ?? 0)); sum += d; if (d > most) most = d; }
    if (most > tolerance) changed++;
  }
  const pixels = a.length / 4;
  return { meanDifference: sum / (pixels * 3), changedShare: changed / pixels };
}
