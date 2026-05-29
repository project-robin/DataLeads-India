"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { GeminiLiveClient } from "../../../lib/gemini-live-client";
import { getCalApi } from "@calcom/embed-react";

export default function VoiceDemoPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [status, setStatus] = useState<"loading" | "ready" | "connecting" | "listening" | "error" | "disconnected">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [volume, setVolume] = useState(0);
  
  const clientRef = useRef<GeminiLiveClient | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transcriptRef = useRef<{ role: string; text: string; timestamp: number }[]>([]);
  const speechRecognitionRef = useRef<any>(null);

  const saveTranscript = useMutation(api.conversations.saveTranscript);

  // Initialize Speech Recognition for User logging
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.onresult = (event: any) => {
          const last = event.results.length - 1;
          const text = event.results[last][0].transcript;
          if (text.trim()) {
            transcriptRef.current.push({ role: "user", text: text.trim(), timestamp: Date.now() });
          }
        };
        speechRecognitionRef.current = recognition;
      }
    }
  }, []);

  // Initialize Cal.com Embed
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({"namespace":"30min"});
      cal("ui", {"styles":{"branding":{"brandColor":"#00d4ff"}},"hideEventTypeDetails":false,"layout":"month_view"});
    })();
  }, []);

  // 2-Minute Session Limit
  useEffect(() => {
    if (status === "listening") {
      timerRef.current = setTimeout(() => {
        disconnect();
      }, 120000); // 2 minutes
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [status]);

  useEffect(() => {
    // 1. Fetch token/config and verify lead
    const init = async () => {
      try {
        const res = await fetch("/api/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Failed to load demo");
        if (data.apiKey === "MOCK_KEY") {
            console.warn("Using MOCK_KEY. Set GEMINI_API_KEY in environment to enable real connection.");
        }
        
        setTokenInfo(data);
        setStatus("ready");
      } catch (err: any) {
        console.error(err);
        setStatus("error");
        setErrorMsg(err.message);
      }
    };
    init();
    
    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect(true);
      }
    };
  }, [slug]);

  const connectToGeminiLive = async () => {
    if (!tokenInfo) return;
    
    const client = new GeminiLiveClient(tokenInfo.apiKey, tokenInfo.config);
    clientRef.current = client;

    client.onStateChange = (newState, msg) => {
      setStatus(newState);
      if (msg) setErrorMsg(msg);
    };

    client.onVolumeChange = (vol) => {
      setVolume(vol);
    };

    client.onTranscript = (role, text) => {
      transcriptRef.current.push({ role, text, timestamp: Date.now() });
    };

    await client.connect();

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.start();
      } catch (e) {
        console.warn("Speech recognition already started or failed", e);
      }
    }
  };

  const disconnect = () => {
    if (clientRef.current) {
      clientRef.current.disconnect();
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
    }
    if (transcriptRef.current.length > 0 && tokenInfo?.leadId) {
      saveTranscript({
        leadId: tokenInfo.leadId,
        transcript: transcriptRef.current,
      }).catch(console.error);
      transcriptRef.current = []; // Clear after saving
    }
    setStatus("disconnected");
  };

  return (
    <div className="min-h-screen bg-[#05090f] text-[#f5f8ff] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Permanent Top-Right Booking Button */}
      <button
        data-cal-namespace="30min"
        data-cal-link="vectis-aura-mpaprf/30min"
        data-cal-config='{"layout":"month_view"}'
        className="absolute top-6 right-6 z-50 px-5 py-2.5 rounded-full border border-[rgba(0,212,255,0.3)] bg-[rgba(13,26,46,0.6)] backdrop-blur-md text-sm font-semibold text-[#00d4ff] hover:bg-[rgba(0,212,255,0.1)] hover:border-[rgba(0,212,255,0.6)] hover:shadow-[0_0_20px_rgba(0,212,255,0.2)] transition-all duration-300 flex items-center gap-2"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        Book Consultation
      </button>

      {/* Decorative Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[rgba(0,212,255,0.03)] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-[rgba(13,26,46,0.5)] border border-[rgba(0,212,255,0.1)] rounded-2xl p-8 backdrop-blur-xl flex flex-col items-center text-center shadow-2xl">
        <h1 className="font-bebas-neue text-4xl mb-2 text-white">Voice Agent Demo</h1>
        <p className="text-[rgba(200,215,240,0.6)] mb-10 text-sm h-5">
          {status === "loading" && "Verifying private link..."}
          {status === "ready" && "Ready to speak with your dedicated assistant."}
          {status === "connecting" && "Connecting to Agent..."}
          {status === "listening" && "Listening... Start speaking!"}
          {status === "disconnected" && "Demo session completed."}
          {status === "error" && errorMsg}
        </p>

        {(status === "loading" || status === "connecting") && (
          <div className="w-16 h-16 border-4 border-[rgba(0,212,255,0.2)] border-t-[#00d4ff] rounded-full animate-spin" />
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="text-red-400 p-4 bg-red-400/10 rounded-lg w-full text-sm">
                {errorMsg.includes("401") || errorMsg.includes("API key") 
                  ? "Failed to authenticate. Please ensure GEMINI_API_KEY is set in your .env.local file and restart the server." 
                  : errorMsg}
            </div>
            <button
              onClick={() => setStatus("ready")}
              className="px-6 py-2 rounded-full border border-[rgba(0,212,255,0.5)] text-[#00d4ff] hover:bg-[#00d4ff]/10 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {status === "ready" && (
          <button
            onClick={connectToGeminiLive}
            className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#00d4ff] to-[#0088ff] flex items-center justify-center shadow-[0_0_40px_rgba(0,212,255,0.3)] hover:shadow-[0_0_60px_rgba(0,212,255,0.5)] hover:scale-105 transition-all duration-300"
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#05090f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="22"></line>
            </svg>
          </button>
        )}

        {status === "listening" && (
          <div className="mt-4 w-full px-4 py-3 rounded-lg border border-[rgba(255,180,0,0.25)] bg-[rgba(255,180,0,0.06)] flex items-center gap-2.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffb400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span className="text-xs text-[rgba(255,200,80,0.9)] leading-snug">
              Interruption is disabled in this demo. Please wait for the agent to finish speaking before responding.
            </span>
          </div>
        )}

        <div className="mt-4 text-xs text-[rgba(200,215,240,0.4)] flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          Demo auto-ends after 2 minutes.
        </div>

        {status === "disconnected" && (
          <div className="flex flex-col items-center mt-4 w-full animate-in fade-in zoom-in duration-500">
            <div className="p-6 bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)] rounded-2xl w-full">
              <h3 className="text-xl font-bold text-white mb-2">Ready to Upgrade?</h3>
              <p className="text-sm text-[rgba(200,215,240,0.8)] mb-6">
                Your demo has concluded. Want to implement this AI voice agent in your own business?
              </p>
              <button
                data-cal-namespace="30min"
                data-cal-link="vectis-aura-mpaprf/30min"
                data-cal-config='{"layout":"month_view"}'
                className="inline-flex items-center justify-center w-full px-6 py-3 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#0088ff] text-[#05090f] font-semibold hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] transition-all duration-300"
              >
                Book a Consultation
              </button>
            </div>
          </div>
        )}

        {status === "listening" && (
          <div className="flex flex-col items-center gap-8 w-full">
            {/* Visualizer tied to volume */}
            <div className="flex items-center gap-1.5 h-16">
              {[...Array(9)].map((_, i) => {
                // Add some math to make each bar respond slightly differently to the same volume
                const barHeight = Math.max(10, Math.min(100, volume * (0.5 + Math.random() * 0.8)));
                return (
                  <div
                    key={i}
                    className="w-2 bg-[#00d4ff] rounded-full transition-all duration-75"
                    style={{
                      height: `${barHeight}%`,
                    }}
                  />
                );
              })}
            </div>
            
            <button
              onClick={disconnect}
              className="px-6 py-2 rounded-full border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors"
            >
              End Conversation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
