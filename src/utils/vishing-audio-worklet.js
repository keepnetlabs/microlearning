class VishingCaptureProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    if (input && input[0] && input[0].length > 0) {
      const channelData = input[0].slice(0);
      this.port.postMessage(channelData);
    }
    return true;
  }
}

registerProcessor("vishing-capture", VishingCaptureProcessor);
