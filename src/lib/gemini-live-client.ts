export class GeminiLiveClient {
  private ws: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private nextPlayTime: number = 0;
  
  public onStateChange: ((state: "connecting" | "listening" | "error" | "disconnected", msg?: string) => void) | null = null;
  public onVolumeChange: ((volume: number) => void) | null = null;

  constructor(
    private apiKey: string,
    private config: any
  ) {}

  public async connect() {
    this.onStateChange?.("connecting");

    try {
      // 1. Initialize Audio Context for Microphone Input (16kHz required by Gemini)
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });

      // Load the Worklet
      await this.audioContext.audioWorklet.addModule("/audio-processor.js");

      // 2. Connect WebSocket (v1beta is required when authenticating with a standard API key)
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${this.apiKey}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = async () => {
        if (!this.audioContext || !this.ws) return;

        try {
          // Send initial setup frame
          this.ws.send(
            JSON.stringify({
              setup: {
                model: this.config.model || "models/gemini-3.1-flash-live-preview",
                systemInstruction: this.config.systemInstruction,
                generationConfig: {
                  responseModalities: ["AUDIO"],
                  speechConfig: {
                    voiceConfig: {
                      prebuiltVoiceConfig: {
                        voiceName: "Aoede", // or Puck, Charon, Kore, Fenrir, Aoede
                      },
                    },
                  },
                },
              },
            })
          );

          // Start Microphone
          this.mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              channelCount: 1,
              echoCancellation: true,
              autoGainControl: true,
              noiseSuppression: true,
            },
          });

          if (!this.audioContext || !this.ws) return;

          const source = this.audioContext.createMediaStreamSource(this.mediaStream);
          this.workletNode = new AudioWorkletNode(this.audioContext, "audio-processor");

          this.workletNode.port.onmessage = (event) => {
            if (this.ws?.readyState === WebSocket.OPEN) {
              // event.data is Int16Array
              const base64Data = this.arrayBufferToBase64(event.data.buffer);
              this.ws.send(
                JSON.stringify({
                  realtimeInput: {
                    audio: {
                      mimeType: "audio/pcm;rate=16000",
                      data: base64Data,
                    },
                  },
                })
              );
              
              // Calculate a simple volume metric for the UI visualizer
              if (this.onVolumeChange) {
                  let sum = 0;
                  for (let i = 0; i < event.data.length; i++) {
                      sum += Math.abs(event.data[i]);
                  }
                  const avg = sum / event.data.length;
                  this.onVolumeChange(Math.min(100, (avg / 32768) * 500)); 
              }
            }
          };

          source.connect(this.workletNode);
          
          this.onStateChange?.("listening");
        } catch (err: any) {
          console.error("Error during live session connection:", err);
          this.onStateChange?.("error", err.message || "Microphone access denied.");
          this.disconnect();
        }
      };

      this.ws.onmessage = async (event) => {
        try {
          let textData: string;
          if (event.data instanceof Blob) {
            // Some network proxies or browsers pack the JSON text frames inside a binary Blob.
            // We convert the Blob back to a UTF-8 text string.
            textData = await event.data.text();
          } else if (typeof event.data === "string") {
            textData = event.data;
          } else {
            console.warn("Unsupported WebSocket message data type:", typeof event.data);
            return;
          }

          // Parse the UTF-8 JSON message
          const msg = JSON.parse(textData);
          if (msg.serverContent?.modelTurn?.parts) {
            const parts = msg.serverContent.modelTurn.parts;
            for (const part of parts) {
              if (part.inlineData && part.inlineData.data) {
                this.playAudioChunk(part.inlineData.data);
              }
            }
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket Error:", error);
        this.onStateChange?.("error", "Connection failed. Please ensure your GEMINI_API_KEY is valid.");
        this.disconnect(true);
      };

      this.ws.onclose = (event) => {
        console.warn("WebSocket Closed. Code:", event.code, "Reason:", event.reason);
        // Standard normal closures are 1000, 1001 (going away), or 1005 (no status).
        // Anything else is treated as an abnormal connection closure or API error.
        if (event.code !== 1000 && event.code !== 1001 && event.code !== 1005) {
          this.onStateChange?.("error", `Connection failed (code ${event.code}). Please check your API key validity and network.`);
          this.disconnect(true);
        } else {
          this.disconnect(false);
        }
      };

    } catch (err: any) {
      console.error(err);
      this.onStateChange?.("error", err.message);
      this.disconnect(true);
    }
  }

  private playAudioChunk(base64Data: string) {
    if (!this.audioContext) return;

    // Gemini Server returns 24kHz PCM16 audio
    const sampleRate = 24000;
    const arrayBuffer = this.base64ToArrayBuffer(base64Data);
    const int16Array = new Int16Array(arrayBuffer);
    const float32Array = new Float32Array(int16Array.length);

    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }

    const audioBuffer = this.audioContext.createBuffer(1, float32Array.length, sampleRate);
    audioBuffer.getChannelData(0).set(float32Array);

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);

    // Schedule playback to avoid gaps
    const currentTime = this.audioContext.currentTime;
    if (this.nextPlayTime < currentTime) {
      this.nextPlayTime = currentTime;
    }
    source.start(this.nextPlayTime);
    this.nextPlayTime += audioBuffer.duration;
  }


  public disconnect(suppressStateChange = false) {
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.close();
      this.ws = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.workletNode) {
      this.workletNode.disconnect();
      this.workletNode = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    if (!suppressStateChange) {
      this.onStateChange?.("disconnected");
    }
  }

  // --- Helpers ---
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
