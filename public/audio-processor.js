class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 2048;
    this.buffer = new Int16Array(this.bufferSize);
    this.bufferIndex = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0) {
      const channelData = input[0];
      for (let i = 0; i < channelData.length; i++) {
        // Convert Float32 (-1.0 to 1.0) to Int16 (-32768 to 32767)
        let s = Math.max(-1, Math.min(1, channelData[i]));
        this.buffer[this.bufferIndex++] = s < 0 ? s * 0x8000 : s * 0x7fff;

        if (this.bufferIndex >= this.bufferSize) {
          // Send the full buffer to the main thread
          this.port.postMessage(this.buffer);
          // Allocate a new buffer to avoid overwriting the one we just posted
          this.buffer = new Int16Array(this.bufferSize);
          this.bufferIndex = 0;
        }
      }
    }
    return true;
  }
}

registerProcessor("audio-processor", AudioProcessor);
