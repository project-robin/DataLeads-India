"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { GeminiLiveClient } from "../../../lib/gemini-live-client";

export default function VoiceDemoPage() {
  const params = useParams();
  const leadId = params.leadId as string;

  const [status, setStatus] = useState<"loading" | "ready" | "connecting" | "listening" | "error" | "disconnected">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [volume, setVolume] = useState(0);
  
  const clientRef = useRef<GeminiLiveClient | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 2-Minute Session Limit
  useEffect(() => {
    if (status === "listening") {
      timerRef.current = setTimeout(() => {
        if (clientRef.current) {
          clientRef.current.disconnect();
        }
        setStatus("disconnected");
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
          body: JSON.stringify({ leadId }),
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
        clientRef.current.disconnect();
      }
    };
  }, [leadId]);

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

    await client.connect();
  };

  const disconnect = () => {
    if (clientRef.current) {
      clientRef.current.disconnect();
    }
    setStatus("ready");
  };

  return (
    <div className="min-h-screen bg-[#05090f] text-[#f5f8ff] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Permanent Top-Right Booking Button */}
      <a
        href="https://cal.com/kabir-aura-mpaprf/30min"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-6 right-6 z-50 px-5 py-2.5 rounded-full border border-[rgba(0,212,255,0.3)] bg-[rgba(13,26,46,0.6)] backdrop-blur-md text-sm font-semibold text-[#00d4ff] hover:bg-[rgba(0,212,255,0.1)] hover:border-[rgba(0,212,255,0.6)] hover:shadow-[0_0_20px_rgba(0,212,255,0.2)] transition-all duration-300 flex items-center gap-2"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        Book Consultation
      </a>

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

        {status === "disconnected" && (
          <div className="flex flex-col items-center mt-4 w-full animate-in fade-in zoom-in duration-500">
            <div className="p-6 bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)] rounded-2xl w-full">
              <h3 className="text-xl font-bold text-white mb-2">Ready to Upgrade?</h3>
              <p className="text-sm text-[rgba(200,215,240,0.8)] mb-6">
                Your demo has concluded. Want to implement this AI voice agent in your own business?
              </p>
              <a
                href="https://cal.com/kabir-aura-mpaprf/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full px-6 py-3 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#0088ff] text-[#05090f] font-semibold hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] transition-all duration-300"
              >
                Book a Consultation
              </a>
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
