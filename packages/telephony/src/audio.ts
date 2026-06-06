const BIAS = 0x84;
const CLIP = 32635;

/**
 * Decodes a single 8-bit μ-law byte to a 16-bit signed linear PCM sample.
 */
export function mulawToPcm16(mulawByte: number): number {
  const code = ~mulawByte & 0xff;
  const sign = code & 0x80;
  const exponent = (code & 0x70) >> 4;
  const mantissa = code & 0x0f;

  let sample = ((mantissa << 3) + BIAS) << exponent;
  sample -= BIAS;

  return sign ? -sample : sample;
}

/**
 * Encodes a single 16-bit signed linear PCM sample to an 8-bit μ-law byte.
 */
export function pcm16ToMulaw(sample: number): number {
  const sign = sample < 0 ? 0x80 : 0x00;
  let magnitude = sample < 0 ? -sample : sample;

  // Clip to 15-bit range
  if (magnitude > CLIP) magnitude = CLIP;

  magnitude += BIAS;

  let exponent = 7;
  let mask = 0x4000;
  while ((magnitude & mask) === 0 && exponent > 0) {
    mask >>= 1;
    exponent--;
  }

  const mantissa = (magnitude >> (exponent + 3)) & 0x0f;
  return ~(sign | (exponent << 4) | mantissa) & 0xff;
}


/**
 * Decodes 8kHz 8-bit μ-law audio to 16kHz 16-bit linear PCM by duplicating samples.
 */
export function decodeMulawToPcm16kHz(mulawBuffer: Buffer): Buffer {
  const pcm16 = Buffer.alloc(mulawBuffer.length * 2 * 2); // 2 samples per input sample, 2 bytes per sample
  let offset = 0;
  for (let i = 0; i < mulawBuffer.length; i++) {
    const sample = mulawToPcm16(mulawBuffer[i]);

    // Resample from 8kHz to 16kHz by duplicating the sample
    pcm16.writeInt16LE(sample, offset);
    offset += 2;
    pcm16.writeInt16LE(sample, offset);
    offset += 2;
  }
  return pcm16;
}

/**
 * Encodes 16-bit linear PCM (from 16kHz or 24kHz) to 8kHz 8-bit μ-law by downsampling.
 */
export function encodePcmToMulaw8kHz(pcmBuffer: Buffer, inputRate: number): Buffer {
  const bytesPerSample = 2; // 16-bit
  const totalSamples = pcmBuffer.length / bytesPerSample;

  // Resampling factor
  const factor = Math.round(inputRate / 8000);
  const mulawBuffer = Buffer.alloc(Math.floor(totalSamples / factor));

  let mulawIdx = 0;
  for (let i = 0; i < totalSamples; i += factor) {
    if (mulawIdx >= mulawBuffer.length) break;
    const sample = pcmBuffer.readInt16LE(i * bytesPerSample);
    mulawBuffer[mulawIdx++] = pcm16ToMulaw(sample);
  }

  return mulawBuffer;
}
