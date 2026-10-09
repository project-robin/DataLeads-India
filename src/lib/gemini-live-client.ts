import type { MicVAD } from "@ricky0123/vad-web";

// VAD assets (worklet, Silero model, onnxruntime wasm) are served from jsDelivr.
// Versions must match the exact versions pinned in package.json.
const VAD_ASSET_PATH = "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.30/dist/";
const ORT_WASM_PATH = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.30.0/dist/";

// Mic audio kept while the user is silent, flushed on speech start so the first
// syllables (spoken before Silero confirms speech) aren't clipped. ~1s at 128ms/chunk.
const PRE_ROLL_CHUNKS = 8;

export class GeminiLiveClient {
  private ws: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private nextPlayTime: number = 0;
  private vad: MicVAD | null = null;
  private userSpeaking = false;
  private preRoll: Int16Array[] = [];
  private playingSources = new Set<AudioBufferSourceNode>();
  
  public onStateChange: ((state: "connecting" | "listening" | "error" | "disconnected", msg?: string) => void) | null = null;
  public onVolumeChange: ((volume: number) => void) | null = null;
  public onTranscript: ((role: string, text: string) => void) | null = null;

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

      // Load the Worklet, and the Silero VAD model in parallel with the WebSocket handshake
      await this.audioContext.audioWorklet.addModule("/audio-processor.js");
      const vadReady = this.createVad(this.audioContext);
      vadReady.catch(() => {}); // surfaced when awaited in onopen

      // 2. Connect WebSocket (v1beta is required when authenticating with a standard API key)
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${this.apiKey}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = async () => {
        if (!this.audioContext || !this.ws) return;

        try {
          // 1. Get mic permission FIRST so we can immediately stream audio
          this.mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              channelCount: 1,
              echoCancellation: true,
              autoGainControl: true,
              noiseSuppression: true,
            },
          });

          // 2. Send setup frame AFTER mic is ready — Gemini will generate greeting
          //    and we can capture it since we're already listening
          this.ws.send(
            JSON.stringify({
              setup: {
                model: this.config.model || "models/gemini-3.1-flash-live-preview",
                systemInstruction: this.config.systemInstruction,
                // Turn-taking is driven by the client-side Silero VAD (activityStart/activityEnd).
                // An activityStart while the model is talking interrupts it (barge-in).
                realtimeInputConfig: {
                  automaticActivityDetection: { disabled: true },
                },
                generationConfig: {
                  responseModalities: ["AUDIO"],
                  speechConfig: {
                    voiceConfig: {
                      prebuiltVoiceConfig: {
                        voiceName: "Charon", // Informative, confident, calm — not shrill
                      },
                    },
                  },
                },
              },
            })
          );

          if (!this.audioContext || !this.ws) return;

          const source = this.audioContext.createMediaStreamSource(this.mediaStream);
          this.workletNode = new AudioWorkletNode(this.audioContext, "audio-processor");

          this.workletNode.port.onmessage = (event) => {
            if (this.ws?.readyState === WebSocket.OPEN) {
              // Calculate a simple volume metric for the UI visualizer
              let max = 0;
              for (let i = 0; i < event.data.length; i++) {
                  const val = Math.abs(event.data[i]);
                  if (val > max) max = val;
              }
              
              if (this.onVolumeChange) {
                  // Send true max volume (scaled 0-100)
                  this.onVolumeChange(Math.min(100, (max / 32768) * 1000)); 
              }

              // Only stream audio while the VAD says the user is speaking; otherwise
              // keep a short pre-roll so the start of the utterance isn't lost.
              if (this.userSpeaking) {
                this.sendAudio(event.data);
              } else {
                this.preRoll.push(event.data);
                if (this.preRoll.length > PRE_ROLL_CHUNKS) this.preRoll.shift();
              }
            }
          };

          source.connect(this.workletNode);

          const vad = await vadReady;
          if (!this.ws) {
            // Disconnected while the model was loading
            vad.destroy().catch(console.error);
            return;
          }
          this.vad = vad;
          await vad.start();
          
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
          if (msg.serverContent?.interrupted) {
            this.stopPlayback();
          }
          // Drop agent audio while the user is talking (e.g. tail chunks of an interrupted turn)
          if (msg.serverContent?.modelTurn?.parts && !this.userSpeaking) {
            const parts = msg.serverContent.modelTurn.parts;
            for (const part of parts) {
              if (part.inlineData && part.inlineData.data) {
                this.playAudioChunk(part.inlineData.data);
              }
              if (part.text && this.onTranscript) {
                this.onTranscript("agent", part.text);
              }
            }
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket Error:", error);
        this.onStateChange?.("error", "Connection failed. Please check your network connection and try again.");
        this.disconnect(true);
      };

      this.ws.onclose = (event) => {
        console.warn("WebSocket Closed. Code:", event.code, "Reason:", event.reason);
        // Standard normal closures are 1000, 1001 (going away), or 1005 (no status).
        // Anything else is treated as an abnormal connection closure or API error.
        if (event.code !== 1000 && event.code !== 1001 && event.code !== 1005) {
          let msg = "Connection failed. Please check your network connection and try again.";
          if (event.code === 1008) {
            msg = "Connection failed due to a policy restriction. Please try a different network or contact support.";
          } else if (event.code === 1014) {
            msg = "Connection failed due to a security certificate issue. Please check your network settings.";
          } else if (event.code === 1011) {
            msg = "Connection failed — the service is temporarily unavailable. Please try again in a moment.";
          }
          this.onStateChange?.("error", msg);
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

  private async createVad(audioContext: AudioContext): Promise<MicVAD> {
    const { MicVAD } = await import("@ricky0123/vad-web");
    return MicVAD.new({
      model: "v5",
      baseAssetPath: VAD_ASSET_PATH,
      onnxWASMBasePath: ORT_WASM_PATH,
      audioContext,
      startOnLoad: false,
      // Share the mic stream we already opened; disconnect() owns stopping it.
      getStream: async () => this.mediaStream!,
      pauseStream: async () => {},
      resumeStream: async (stream) => stream,
      positiveSpeechThreshold: 0.5,
      negativeSpeechThreshold: 0.35,
      // Sustained speech required before we treat it as a turn / barge-in (filters coughs, clicks)
      minSpeechMs: 300,
      // Silence before the user's turn ends (Gemini recommends >= 500ms for manual VAD)
      redemptionMs: 700,
      onSpeechRealStart: () => this.handleUserSpeechStart(),
      onSpeechEnd: () => this.handleUserSpeechEnd(),
    });
  }

  private handleUserSpeechStart() {
    if (this.ws?.readyState !== WebSocket.OPEN || this.userSpeaking) return;
    this.userSpeaking = true;
    // Barge-in: cut the agent off locally right away; the server cancels its turn on activityStart.
    this.stopPlayback();
    this.ws.send(JSON.stringify({ realtimeInput: { activityStart: {} } }));
    for (const chunk of this.preRoll) this.sendAudio(chunk);
    this.preRoll = [];
  }

  private handleUserSpeechEnd() {
    if (!this.userSpeaking) return;
    this.userSpeaking = false;
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ realtimeInput: { activityEnd: {} } }));
    }
  }

  private sendAudio(pcm: Int16Array) {
    if (this.ws?.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({
      realtimeInput: { audio: { mimeType: "audio/pcm;rate=16000", data: this.arrayBufferToBase64(pcm.buffer as ArrayBuffer) } }
    }));
  }

  private stopPlayback() {
    for (const source of this.playingSources) {
      source.onended = null;
      try { source.stop(); } catch {}
    }
    this.playingSources.clear();
    this.nextPlayTime = 0;
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
    
    // JITTER BUFFER FIX:
    // If the queue is empty or we fell behind (e.g. starting a new sentence), 
    // add a 150ms artificial delay. This allows the browser to queue up the next 
    // few incoming network chunks behind this one, ensuring perfectly fluid playback 
    // even if the network stutters slightly.
    if (this.nextPlayTime < currentTime) {
      this.nextPlayTime = currentTime + 0.3; // 300ms buffer for seamless streaming
    }
    source.start(this.nextPlayTime);
    this.nextPlayTime += audioBuffer.duration;
    this.playingSources.add(source);
    source.onended = () => this.playingSources.delete(source);
  }


  public disconnect(suppressStateChange = false) {
    if (this.vad) {
      this.vad.destroy().catch(console.error);
      this.vad = null;
    }
    this.userSpeaking = false;
    this.preRoll = [];
    this.playingSources.clear();
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
