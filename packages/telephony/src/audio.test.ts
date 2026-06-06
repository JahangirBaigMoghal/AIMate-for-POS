import { describe, expect, it } from "vitest";
import {
  mulawToPcm16,
  pcm16ToMulaw,
  decodeMulawToPcm16kHz,
  encodePcmToMulaw8kHz
} from "./audio";

describe("Audio Transcoding", () => {
  it("converts a single PCM sample to mu-law and back within reasonable approximation", () => {
    const inputSample = 15000;
    const mulaw = pcm16ToMulaw(inputSample);
    const decoded = mulawToPcm16(mulaw);

    // Mu-law is lossy, but the difference should be small (usually within 5-10% of magnitude)
    expect(Math.abs(inputSample - decoded)).toBeLessThan(1000);
  });

  it("handles zero and negative sample values", () => {
    const zeroDecoded = mulawToPcm16(pcm16ToMulaw(0));
    expect(Math.abs(zeroDecoded)).toBeLessThan(150);

    const negSample = -10000;
    const negDecoded = mulawToPcm16(pcm16ToMulaw(negSample));
    expect(Math.abs(negSample - negDecoded)).toBeLessThan(1000);
  });

  it("decodes 8kHz mulaw to 16kHz PCM (doubling buffer size and sample count)", () => {
    // 4 bytes of 8kHz mulaw
    const mulawBuffer = Buffer.from([0xff, 0x00, 0x7f, 0x80]);
    const pcm = decodeMulawToPcm16kHz(mulawBuffer);

    // Each mulaw byte is expanded to 2 PCM samples, each sample is 2 bytes (writeInt16LE)
    // 4 input bytes -> 8 output samples -> 16 output bytes
    expect(pcm.length).toBe(16);

    const firstSample = pcm.readInt16LE(0);
    const secondSample = pcm.readInt16LE(2);
    expect(firstSample).toBe(secondSample); // Doubled sample
  });

  it("encodes 16kHz PCM to 8kHz mulaw (downsampling by half)", () => {
    // 8 samples of 16-bit PCM at 16kHz -> 16 bytes
    const pcmBuffer = Buffer.alloc(16);
    pcmBuffer.writeInt16LE(2000, 0);
    pcmBuffer.writeInt16LE(4000, 2);
    pcmBuffer.writeInt16LE(6000, 4);
    pcmBuffer.writeInt16LE(8000, 6);

    const mulaw = encodePcmToMulaw8kHz(pcmBuffer, 16000);

    // Resampling factor 16000 / 8000 = 2 -> 8 samples downsampled to 4
    expect(mulaw.length).toBe(4);
  });

  it("encodes 24kHz PCM to 8kHz mulaw (downsampling by third)", () => {
    // 12 samples of 16-bit PCM at 24kHz -> 24 bytes
    const pcmBuffer = Buffer.alloc(24);
    const mulaw = encodePcmToMulaw8kHz(pcmBuffer, 24000);

    // Resampling factor 24000 / 8000 = 3 -> 12 samples downsampled to 4
    expect(mulaw.length).toBe(4);
  });
});
