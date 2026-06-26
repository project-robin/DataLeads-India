"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { GeminiLiveClient } from "../../../lib/gemini-live-client";
import { getCalApi } from "@calcom/embed-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

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
  const cardRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  const saveTranscript = useMutation(api.conversations.saveTranscript);

  const calLink = process.env.NEXT_PUBLIC_CAL_LINK || "vectis-aura-mpaprf/30min";
  const calNamespace = process.env.NEXT_PUBLIC_CAL_NAMESPACE || "30min";

  // Entrance animation for the demo card and blobs
  useGSAP(() => {
    gsap.from(cardRef.current, {
      y: 40,
      opacity: 0,
      duration: 1.0,
      ease: "power3.out",
    });

    gsap.to(".bg-orb", {
      x: "random(-40, 40)",
      y: "random(-40, 40)",
      duration: 8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: 0.5
    });
  }, { scope: pageRef });

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

  // Initialize Cal.com Embed with clean dark/charcoal styling
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: calNamespace });
      cal("ui", {
        styles: { branding: { brandColor: "#111111" } },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, [calNamespace]);

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
    // Fetch token/config and verify lead
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
    
    setStatus("connecting");
    
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
    <div ref={pageRef} className="relative min-h-screen bg-grid-overlay bg-[#F7F7F5] text-[#111111] font-sans flex flex-col items-center justify-center p-6 overflow-hidden select-none">
      
      {/* Dynamic Ambient Gradient Orbs in Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="bg-orb absolute top-[15%] left-[20%] w-[380px] h-[380px] rounded-full bg-gradient-to-tr from-[#A87C43]/20 to-amber-300/10 blur-[80px]" />
        <div className="bg-orb absolute bottom-[20%] right-[15%] w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-indigo-500/15 to-purple-400/10 blur-[100px]" />
        <div className="bg-orb absolute top-[50%] left-[60%] w-[260px] h-[260px] rounded-full bg-gradient-to-tr from-emerald-400/10 to-teal-300/10 blur-[60px]" />
      </div>
      
      {/* Top Header Booking Trigger */}
      <button
        data-cal-namespace={calNamespace}
        data-cal-link={calLink}
        data-cal-config='{"layout":"month_view"}'
        className="absolute top-6 right-6 z-30 px-5 py-2.5 rounded-full border border-[#111111]/8 bg-[#FCFCFB]/80 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-[#111111] hover:bg-[#111111] hover:text-[#FCFCFB] hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-sm shadow-[#111111]/2"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        Book Consultation
      </button>

      {/* Main Glassmorphic Console Card */}
      <div ref={cardRef} className="relative z-10 w-full max-w-[460px] bg-[#FCFCFB]/60 backdrop-blur-2xl border border-[#FCFCFB]/90 rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-[#111111]/4 flex flex-col items-center text-center">
        
        {/* Header Indicator / Security Status */}
        <div className="w-full flex justify-between items-center mb-8 border-b border-[#111111]/5 pb-4">
          <div className={`text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full flex items-center gap-2 ${
            status === "listening" 
              ? "bg-emerald-500/10 text-emerald-700 font-bold" 
              : status === "connecting" 
              ? "bg-amber-500/10 text-amber-700 font-bold animate-pulse"
              : status === "disconnected"
              ? "bg-[#111111]/5 text-[#6B6B6B]"
              : "bg-[#111111]/5 text-[#111111] font-semibold"
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              status === "listening" ? "bg-emerald-500" : status === "connecting" ? "bg-amber-500" : "bg-[#6B6B6B]"
            }`} />
            {status === "loading" && "Provisioning Line"}
            {status === "ready" && "Ready to Connect"}
            {status === "connecting" && "Dialing Voice Agent"}
            {status === "listening" && "Agent Online"}
            {status === "disconnected" && "Call Concluded"}
            {status === "error" && "System Alert"}
          </div>
          
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#6B6B6B]/60 uppercase tracking-widest">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            SSL Secure
          </div>
        </div>

        <h1 className="font-serif text-3xl md:text-4xl text-[#111111] mb-2 leading-tight tracking-tight">
          Vetics Voice Agent
        </h1>
        
        {/* Explanatory description area */}
        <p className="text-xs text-[#6B6B6B] leading-relaxed mb-8 min-h-[48px] max-w-sm">
          {status === "loading" && "Securing and configuring lead parameters..."}
          {status === "ready" && "Click the microphone button below to initiate a real-time conversation and test qualification skills."}
          {status === "connecting" && "Dialing and connecting the Gemini Live audio pathway..."}
          {status === "listening" && "Connection established. You can start speaking now — the agent is listening."}
          {status === "disconnected" && "Your demo session has ended. Check the Admin Control Panel to view transcripts."}
          {status === "error" && errorMsg}
        </p>

        {/* Loading spinners (only during loading) */}
        {status === "loading" && (
          <div className="my-8 relative flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-[#111111]/8 border-t-[#111111] rounded-full animate-spin" />
            <span className="text-[10px] text-[#111111]/60 font-bold uppercase tracking-wider absolute mt-24">Connecting</span>
          </div>
        )}

        {/* Spectral Visualizer (visible in ready, connecting, listening) */}
        {(status === "ready" || status === "connecting" || status === "listening") && (
          <div className="flex items-end justify-center h-20 gap-1.5 w-full max-w-[260px] relative z-10 border-b border-[#111111]/5 pb-6 my-6">
            {[...Array(13)].map((_, i) => {
              const modifier = 0.3 + (i % 4) * 0.22;
              const delay = `${i * 0.08}s`;
              
              const isListening = status === "listening";
              const barHeight = isListening
                ? Math.max(12, Math.min(100, volume * 100 * modifier))
                : 25; // 25% base height for breathing

              return (
                <div
                  key={i}
                  className={`w-1.5 bg-[#111111] rounded-full ${!isListening ? "animate-wave-bar" : ""}`}
                  style={{
                    height: `${barHeight}%`,
                    animationDelay: !isListening ? delay : undefined,
                    animationDuration: status === "ready" ? "2.5s" : status === "connecting" ? "0.8s" : undefined,
                    boxShadow: "0 0 12px rgba(17, 17, 17, 0.15)",
                    transition: isListening ? "height 75ms ease" : undefined
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Error state alert panel */}
        {status === "error" && (
          <div className="flex flex-col items-center gap-4 w-full my-6">
            <div className="text-red-800 p-4 bg-red-50/50 border border-red-100 rounded-2xl w-full text-xs text-left leading-normal">
              {errorMsg.includes("401") || errorMsg.includes("API key") 
                ? "Authorization failed. Check if GEMINI_API_KEY environment variable is configured properly on the server." 
                : errorMsg}
            </div>
            <button
              onClick={() => setStatus("ready")}
              className="px-6 py-2.5 rounded-full border border-[#111111]/20 text-xs font-bold uppercase tracking-wider text-[#111111] hover:bg-[#111111]/5 transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Play Button Trigger */}
        {status === "ready" && (
          <div className="relative my-4 flex justify-center items-center w-full">
            {/* Inline SVG waves behind the button */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.04] flex items-center justify-center">
              <svg width="240" height="120" viewBox="0 0 240 120" fill="none">
                <path d="M10 60 C 50 10, 90 110, 130 30 C 170 100, 210 20, 230 60" stroke="#111111" strokeWidth="2.5" />
                <path d="M10 60 C 40 90, 80 20, 120 100 C 160 10, 200 80, 230 60" stroke="#111111" strokeWidth="1.5" strokeDasharray="4 4" />
              </svg>
            </div>
            
            <button
              onClick={connectToGeminiLive}
              className="w-24 h-24 rounded-full bg-[#111111] text-[#FCFCFB] flex items-center justify-center shadow-xl shadow-[#111111]/15 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
              aria-label="Start Conversation"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-[#A87C43] transition-colors">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="22"></line>
              </svg>
            </button>
          </div>
        )}

        {/* Connecting feedback state under visualizer */}
        {status === "connecting" && (
          <div className="my-4 relative flex items-center justify-center">
            <span className="text-[10px] text-[#111111]/60 font-bold uppercase tracking-wider">Connecting Pathway</span>
          </div>
        )}

        {/* Active conversation visualizer & end button */}
        {status === "listening" && (
          <div className="flex flex-col items-center gap-6 w-full my-4 relative">
            {/* Info warning tooltip */}
            <div className="w-full px-4 py-3 rounded-2xl border border-[#A87C43]/15 bg-[#A87C43]/5 flex items-start gap-2.5 text-left mb-2 relative z-10">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A87C43" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span className="text-[10px] text-[#A87C43] font-semibold leading-normal">
                Please allow the agent to finish its response before speaking.
              </span>
            </div>

            <button
              onClick={disconnect}
              className="px-6 py-2.5 rounded-full border border-red-200 bg-red-50/50 hover:bg-red-50 hover:border-red-400 text-xs font-bold uppercase tracking-wider text-red-600 transition-all cursor-pointer relative z-10"
            >
              End Conversation
            </button>
          </div>
        )}

        {/* Telemetry Telemetry Card grid inside Card */}
        {status !== "disconnected" && (
          <div className="grid grid-cols-2 gap-4 w-full mt-4 pt-4 border-t border-[#111111]/5">
            <div className="p-3 bg-[#F3F2EF] rounded-2xl border border-[#E7E7E4] text-left flex flex-col gap-0.5">
              <span className="text-[9px] uppercase tracking-wider text-[#6B6B6B] font-bold">Latency</span>
              <span className="text-xs font-bold text-[#111111]">
                {status === "listening" ? "0.8s responsive" : "Pending call"}
              </span>
            </div>
            <div className="p-3 bg-[#F3F2EF] rounded-2xl border border-[#E7E7E4] text-left flex flex-col gap-0.5">
              <span className="text-[9px] uppercase tracking-wider text-[#6B6B6B] font-bold">Signal</span>
              <span className="text-xs font-bold text-[#111111]">
                {status === "listening" ? "Secured WebSocket" : "Ready"}
              </span>
            </div>
          </div>
        )}

        {/* 2-Minute session alert footer label */}
        {status !== "disconnected" && (
          <div className="mt-6 text-[10px] text-[#6B6B6B]/80 flex items-center gap-1.5 justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            Demo sessions are capped at 2 minutes duration.
          </div>
        )}

        {/* Concluded Call Upgrades / Next Steps */}
        {status === "disconnected" && (
          <div className="flex flex-col items-center mt-6 w-full animate-in fade-in zoom-in-95 duration-500">
            <div className="p-6 bg-[#F3F2EF] border border-[#E7E7E4] rounded-3xl w-full text-center">
              <h3 className="text-lg font-serif text-[#111111] mb-2">Ready to Upgrade?</h3>
              <p className="text-xs text-[#6B6B6B] mb-5 leading-relaxed font-light">
                Your demo has concluded. Want to implement this autonomous AI voice receptionist or callback assistant in your business?
              </p>
              <button
                data-cal-namespace={calNamespace}
                data-cal-link={calLink}
                data-cal-config='{"layout":"month_view"}'
                className="inline-flex items-center justify-center w-full px-5 py-3 rounded-full bg-[#111111] text-[#FCFCFB] text-xs font-bold uppercase tracking-wider hover:bg-[#111111]/90 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer shadow-md shadow-[#111111]/10"
              >
                Book a Consultation
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
