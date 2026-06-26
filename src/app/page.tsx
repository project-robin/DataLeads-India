"use client";

import { useState, useEffect, useRef } from "react";
import { getCalApi } from "@calcom/embed-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger client-side
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [activeTab, setActiveTab] = useState<"receptionist" | "dialer" | "crm">("receptionist");
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  const calLink = process.env.NEXT_PUBLIC_CAL_LINK || "vectis-aura-mpaprf/30min";
  const calNamespace = process.env.NEXT_PUBLIC_CAL_NAMESPACE || "30min";

  // Initialize Cal.com Embed
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

  // GSAP Animations
  useGSAP(
    () => {
      // ── HERO ENTRANCE ──
      const heroTl = gsap.timeline();
      heroTl
        .from(".hero-eyebrow", {
          y: 20,
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
        })
        .from(
          ".hero-title",
          {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.4"
        )
        .from(
          ".hero-sub",
          {
            y: 20,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
          },
          "-=0.5"
        )
        .from(
          ".hero-actions",
          {
            y: 20,
            opacity: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.4"
        )
        .from(
          ".hero-showcase",
          {
            y: 40,
            opacity: 0,
            duration: 1.0,
            ease: "power3.out",
          },
          "-=0.6"
        );

      // ── SCROLL REVEALS ──
      const scrollSections = gsap.utils.toArray(".scroll-reveal");
      scrollSections.forEach((section: any) => {
        gsap.from(section, {
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            toggleActions: "play none none none",
          },
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
        });
      });

      // Stagger Bento Grid cards
      gsap.from(".bento-card", {
        scrollTrigger: {
          trigger: ".bento-grid",
          start: "top 80%",
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden bg-grid-overlay bg-[#F7F7F5] min-h-screen text-[#111111] font-sans selection:bg-[#E7E7E4]"
    >
      {/* HEADER NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-[#F7F7F5]/85 backdrop-blur-md border-b border-[#111111]/5 transition-all duration-300">
        <a href="#" className="flex items-center gap-2 text-xl font-bold tracking-tighter text-[#111111] font-serif hover:opacity-80 transition-opacity">
          Vetics<span className="text-[10px] font-sans font-bold tracking-widest uppercase bg-[#111111] text-[#F7F7F5] px-1.5 py-0.5 rounded">.space</span>
        </a>
        <div className="hidden md:flex items-center gap-8">
          <a href="#about" className="text-xs font-semibold uppercase tracking-wider text-[#595959] hover:text-[#111111] transition-colors">
            The Cost of Missed Calls
          </a>
          <a href="#outreach" className="text-xs font-semibold uppercase tracking-wider text-[#595959] hover:text-[#111111] transition-colors">
            Call Journey
          </a>
          <a href="#capabilities" className="text-xs font-semibold uppercase tracking-wider text-[#595959] hover:text-[#111111] transition-colors">
            Industry Solutions
          </a>
        </div>
        <button
          data-cal-namespace={calNamespace}
          data-cal-link={calLink}
          data-cal-config='{"layout":"month_view"}'
          className="text-xs font-bold uppercase tracking-wider bg-[#111111] text-[#F7F7F5] border border-[#111111] px-5 py-2.5 rounded-full hover:bg-transparent hover:text-[#111111] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer shadow-sm shadow-[#111111]/5"
        >
          Book Consultation
        </button>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 max-w-[1280px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          <div className="lg:col-span-8 flex flex-col items-start text-left">
            <span className="hero-eyebrow text-[10px] md:text-xs font-bold tracking-[0.2em] text-[#A87C43] uppercase mb-4 bg-[#A87C43]/10 px-3 py-1 rounded-full">
              24/7 Conversational AI Voice Assistants
            </span>
            <h1 className="hero-title text-4xl md:text-6xl lg:text-7xl font-serif text-[#111111] leading-[1.08] tracking-tight mb-6 max-w-3xl">
              Never Miss a Booking or a <span className="italic font-serif text-[#A87C43]">Customer Call Again.</span>
            </h1>
            <div className="hero-actions flex gap-4 mt-2 flex-wrap">
              <button
                data-cal-namespace={calNamespace}
                data-cal-link={calLink}
                data-cal-config='{"layout":"month_view"}'
                className="text-xs font-bold uppercase tracking-wider bg-[#111111] text-[#F7F7F5] border border-[#111111] px-6 py-3.5 rounded-full hover:bg-transparent hover:text-[#111111] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer shadow-md shadow-[#111111]/10"
              >
                Try a Live Demo Call
              </button>
              <a href="#capabilities" className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#111111] border border-[#111111]/15 px-6 py-3.5 rounded-full hover:border-[#111111] hover:-translate-y-0.5 transition-all duration-200">
                View Solutions &rarr;
              </a>
            </div>
          </div>
          <div className="lg:col-span-4 lg:col-start-9 pt-2 lg:pt-14">
            <p className="hero-sub text-base md:text-lg text-[#595959] leading-relaxed font-light">
              We deploy custom, human-like voice receptionists and automated call assistants that run 24/7. Handle bookings, answer customer FAQs, and call back web leads in under 10 seconds—with zero phone menus or button presses.
            </p>
          </div>
        </div>

        {/* HERO SHOWCASE (PRODUCT PANEL) */}
        <div className="hero-showcase w-full mt-6 bg-[#F3F2EF] rounded-3xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden border border-[#E7E7E4] min-h-[500px] shadow-sm shadow-[#111111]/2">
          {/* Top Panel Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10">
            <div className="flex bg-[#FCFCFB] p-1 rounded-full border border-[#E7E7E4] shadow-sm">
              <button
                onClick={() => setActiveTab("receptionist")}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "receptionist" ? "bg-[#111111] text-[#F7F7F5]" : "text-[#595959] hover:text-[#111111]"
                }`}
              >
                24/7 Receptionist (Inbound)
              </button>
              <button
                onClick={() => setActiveTab("dialer")}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "dialer" ? "bg-[#111111] text-[#F7F7F5]" : "text-[#595959] hover:text-[#111111]"
                }`}
              >
                Instant Callback (Outbound)
              </button>
              <button
                onClick={() => setActiveTab("crm")}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "crm" ? "bg-[#111111] text-[#F7F7F5]" : "text-[#595959] hover:text-[#111111]"
                }`}
              >
                Calendar & Software Booking
              </button>
            </div>
            <div className="bg-[#FCFCFB] px-4 py-2 rounded-full border border-[#E7E7E4] flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#111111]">Live Voice Line Active</span>
            </div>
          </div>

          {/* Ambient blurred gradient orbs inside the console panel */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-45">
            <div className="w-[260px] h-[260px] rounded-full bg-gradient-to-tr from-[#A87C43] to-orange-300 blur-[80px] absolute -ml-36 -mt-10"></div>
            <div className="w-[320px] h-[320px] rounded-full bg-gradient-to-tr from-indigo-400 to-purple-400 blur-[100px] absolute"></div>
            <div className="w-[200px] h-[200px] rounded-full bg-gradient-to-tr from-emerald-300 to-teal-300 blur-[70px] absolute ml-36 mt-16"></div>
          </div>

          {/* Call/Audio Simulation Console */}
          <div className="z-10 self-center my-auto flex flex-col items-center gap-6 w-full max-w-md bg-[#FCFCFB]/60 backdrop-blur-xl border border-[#FCFCFB]/80 p-6 md:p-8 rounded-[2rem] shadow-xl shadow-[#111111]/3 text-center">
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#595959] mb-1">
                {activeTab === "receptionist" ? "Conversational Voice Engine" : activeTab === "dialer" ? "Instant Outbound Callback" : "Calendar Sync Ledger"}
              </span>
              <span className="text-xs font-semibold text-[#111111] tracking-tight">
                {activeTab === "receptionist" ? "Natural Conversational Speech" : activeTab === "dialer" ? "Real-time Customer Engagement" : "Automated Booking Synchronization"}
              </span>
            </div>

            {/* Glowing Spectral Waveform */}
            <div className="flex items-end justify-center h-20 gap-1.5 w-full px-4 border-b border-[#111111]/5 pb-6">
              {(activeTab === "receptionist"
                ? [0.3, 0.5, 0.8, 0.7, 0.9, 0.95, 0.75, 0.6, 0.85, 0.5, 0.7, 0.4, 0.6, 0.3]
                : activeTab === "dialer"
                ? [0.1, 0.2, 0.4, 0.3, 0.5, 0.6, 0.4, 0.3, 0.5, 0.2, 0.4, 0.1, 0.3, 0.1]
                : [0.9, 0.9, 0.1, 0.1, 0.9, 0.9, 0.1, 0.1, 0.9, 0.9, 0.1, 0.1, 0.9, 0.9]
              ).map((heightMod, i) => {
                const delay = `${i * 0.08}s`;
                return (
                  <div
                    key={i}
                    className="w-1.5 bg-[#111111] rounded-full animate-wave-bar"
                    style={{
                      height: `${heightMod * 100}%`,
                      animationDelay: delay,
                      animationDuration: activeTab === "dialer" ? "0.9s" : activeTab === "crm" ? "2.5s" : "1.4s"
                    }}
                  />
                );
              })}
            </div>

            {/* Telemetry Metrics */}
            <div className="grid grid-cols-3 gap-6 w-full py-1">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-[#595959] font-bold">Response Time</span>
                <span className="text-sm font-bold text-[#111111] mt-0.5">
                  {activeTab === "receptionist" ? "~0.8s" : activeTab === "dialer" ? "~0.8s" : "< 0.5s"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-[#595959] font-bold">
                  {activeTab === "crm" ? "Sync status" : "Connection Rate"}
                </span>
                <span className="text-sm font-bold text-[#111111] mt-0.5">
                  {activeTab === "receptionist" ? "98%+ Accurate" : activeTab === "dialer" ? "< 10s callback" : "Real-time"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-[#595959] font-bold">
                  {activeTab === "crm" ? "Integration" : "Interface"}
                </span>
                <span className="text-sm font-bold text-[#111111] mt-0.5">
                  {activeTab === "receptionist" ? "Conversational" : activeTab === "dialer" ? "Local Caller" : "Calendar Sync"}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Bar Info Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10 bg-[#FCFCFB]/70 backdrop-blur-md p-4 rounded-2xl border border-[#E7E7E4] shadow-sm">
            <div className="flex gap-6 overflow-x-auto no-scrollbar py-1">
              <span className="text-xs font-semibold text-[#111111] whitespace-nowrap">Interactive Booking Demo</span>
              <span className="text-xs font-semibold text-[#595959] whitespace-nowrap">FAQ Answering</span>
              <span className="text-xs font-semibold text-[#595959] whitespace-nowrap">Calendar Scheduling</span>
              <span className="text-xs font-semibold text-[#595959] whitespace-nowrap">Zero Dropdowns or Buttons</span>
            </div>
            <button
              data-cal-namespace={calNamespace}
              data-cal-link={calLink}
              data-cal-config='{"layout":"month_view"}'
              className="w-full sm:w-auto bg-[#111111] text-[#F7F7F5] px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-[#111111]/90 transition-all text-center"
            >
              Consult Team
            </button>
          </div>
        </div>
      </section>

      {/* TRUST STRIP & LOGO MARQUEE */}
      <section className="relative w-full overflow-hidden py-12 bg-[#FCFCFB] border-y border-[#E7E7E4]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 text-center mb-8">
          <span className="text-[10px] font-bold text-[#595959] uppercase tracking-[0.2em]">
            Verified Performance &middot; Over 150 pilot calls handled successfully with 98%+ conversational accuracy
          </span>
        </div>
        <div className="flex whitespace-nowrap overflow-hidden group relative w-full border-y border-[#E7E7E4]/70 py-6 bg-[#F3F2EF]/20">
          <div className="flex items-center gap-16 shrink-0 animate-marquee-reverse group-hover:pause-marquee">
            {/* Stats Set 1 */}
            <div className="flex items-center gap-3.5 text-[#111111]/70 font-serif text-sm font-medium tracking-wide">
              <span className="text-[#92652B]">✦</span> 5 Active Client Integrations Deployed
            </div>
            <div className="flex items-center gap-3.5 text-[#111111]/70 font-serif text-sm font-medium tracking-wide">
              <span className="text-[#92652B]">✦</span> 98%+ Conversational Booking Accuracy
            </div>
            <div className="flex items-center gap-3.5 text-[#111111]/70 font-serif text-sm font-medium tracking-wide">
              <span className="text-[#92652B]">✦</span> Zero Frustrating Phone Tree Menus
            </div>
            <div className="flex items-center gap-3.5 text-[#111111]/70 font-serif text-sm font-medium tracking-wide">
              <span className="text-[#92652B]">✦</span> 5 Active Client Integrations Deployed
            </div>
            <div className="flex items-center gap-3.5 text-[#111111]/70 font-serif text-sm font-medium tracking-wide">
              <span className="text-[#92652B]">✦</span> 98%+ Conversational Booking Accuracy
            </div>
            <div className="flex items-center gap-3.5 text-[#111111]/70 font-serif text-sm font-medium tracking-wide">
              <span className="text-[#92652B]">✦</span> Zero Frustrating Phone Tree Menus
            </div>
          </div>
          <div aria-hidden="true" className="flex items-center gap-16 shrink-0 animate-marquee-reverse group-hover:pause-marquee">
            {/* Stats Set 2 (Duplicate for loop) */}
            <div className="flex items-center gap-3.5 text-[#111111]/70 font-serif text-sm font-medium tracking-wide">
              <span className="text-[#92652B]">✦</span> 5 Active Client Integrations Deployed
            </div>
            <div className="flex items-center gap-3.5 text-[#111111]/70 font-serif text-sm font-medium tracking-wide">
              <span className="text-[#92652B]">✦</span> 98%+ Conversational Booking Accuracy
            </div>
            <div className="flex items-center gap-3.5 text-[#111111]/70 font-serif text-sm font-medium tracking-wide">
              <span className="text-[#92652B]">✦</span> Zero Frustrating Phone Tree Menus
            </div>
            <div className="flex items-center gap-3.5 text-[#111111]/70 font-serif text-sm font-medium tracking-wide">
              <span className="text-[#92652B]">✦</span> 5 Active Client Integrations Deployed
            </div>
            <div className="flex items-center gap-3.5 text-[#111111]/70 font-serif text-sm font-medium tracking-wide">
              <span className="text-[#92652B]">✦</span> 98%+ Conversational Booking Accuracy
            </div>
            <div className="flex items-center gap-3.5 text-[#111111]/70 font-serif text-sm font-medium tracking-wide">
              <span className="text-[#92652B]">✦</span> Zero Frustrating Phone Tree Menus
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM BENTO GRID ENGINE */}
      <section className="relative py-20 md:py-28 max-w-[1280px] mx-auto px-6 md:px-12">
        <div id="about" className="relative -top-24" />
        
        {/* Section Header */}
        <div className="text-center mb-16 scroll-reveal">
          <span className="text-[10px] font-bold text-[#92652B] uppercase tracking-[0.2em] bg-[#92652B]/10 px-3 py-1 rounded-full">
            Conversational Voice Solutions
          </span>
          <h2 className="text-3xl md:text-5xl font-serif text-[#111111] mt-4">
            Every customer call, <span className="italic font-serif text-[#92652B]">seamlessly handled.</span>
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="bento-grid grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Card 1: The Bottleneck (Span 7) */}
          <div className="bento-card lg:col-span-7 bg-[#FCFCFB] border border-[#E7E7E4] rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-[#111111]/15 transition-[box-shadow,border-color] duration-300 relative overflow-hidden group">
            <div className="space-y-4">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#92652B]">
                The Cost of Missed Calls
              </span>
              <h3 className="text-2xl md:text-3xl font-serif text-[#111111] leading-tight">
                Small businesses miss up to <span className="italic font-serif text-[#92652B]">62% of incoming calls.</span>
              </h3>
              <p className="text-xs md:text-sm text-[#595959] leading-relaxed font-light">
                When a customer calls a dental clinic, spa, or restaurant during a rush, they expect an immediate answer. If the call goes to voicemail, they hang up and dial your nearest competitor. Vetics voice assistants field every call instantly, booking appointments and answering questions with zero hold time.
              </p>
            </div>
            
            {/* Visual Gauge representation of 62% wasted time */}
            <div className="mt-8 pt-6 border-t border-[#111111]/5 flex items-center gap-6">
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#F3F2EF]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#92652B] transition-all duration-1000 ease-out"
                    strokeDasharray="62, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-xs font-bold text-[#111111]">62%</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#111111]">Average Unanswered Call Rate</h4>
                <p className="text-[10px] text-[#595959] font-light mt-0.5">Average proportion of leads lost to voicemail during peak business hours.</p>
              </div>
            </div>
          </div>

          {/* Card 2: Performance Telemetry (Span 5) */}
          <div className="bento-card lg:col-span-5 bg-[#111111] text-[#FCFCFB] rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="w-[200px] h-[200px] rounded-full bg-gradient-to-tr from-[#92652B] to-purple-800 blur-[60px] absolute -right-10 -top-10" />
            </div>
            
            <div className="space-y-4 relative z-10">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#92652B]">
                Key Performance Metrics
              </span>
              <h3 className="text-xl md:text-2xl font-serif text-[#FCFCFB]">
                Engineered for natural conversation.
              </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 my-8 relative z-10">
              <div className="p-4 bg-[#FCFCFB]/5 border border-[#FCFCFB]/10 rounded-2xl flex flex-col justify-between">
                <span className="font-serif text-3xl text-[#FCFCFB]">24/7</span>
                <span className="text-[#FCFCFB]/60 text-[9px] font-bold tracking-wider uppercase mt-2">Coverage</span>
              </div>
              <div className="p-4 bg-[#FCFCFB]/5 border border-[#FCFCFB]/10 rounded-2xl flex flex-col justify-between">
                <span className="font-serif text-3xl text-[#FCFCFB]">~0.8s</span>
                <span className="text-[#FCFCFB]/60 text-[9px] font-bold tracking-wider uppercase mt-2">Turn Latency</span>
              </div>
              <div className="p-4 bg-[#FCFCFB]/5 border border-[#FCFCFB]/10 rounded-2xl flex flex-col justify-between">
                <span className="font-serif text-3xl text-[#FCFCFB]">98%+</span>
                <span className="text-[#FCFCFB]/60 text-[9px] font-bold tracking-wider uppercase mt-2">Speech Accuracy</span>
              </div>
              <div className="p-4 bg-[#FCFCFB]/5 border border-[#FCFCFB]/10 rounded-2xl flex flex-col justify-between">
                <span className="font-serif text-3xl text-[#FCFCFB]">Zero</span>
                <span className="text-[#FCFCFB]/60 text-[9px] font-bold tracking-wider uppercase mt-2">Button Menus</span>
              </div>
            </div>
            
            <p className="text-[10px] text-[#FCFCFB]/50 font-light relative z-10">
              ⚡ Ultra-fast speech-to-text ensures dynamic, lag-free conversations without delays.
            </p>
          </div>

          {/* Card 3: Capabilities Directory (Span 4) */}
          <div className="bento-card lg:col-span-4 bg-[#FCFCFB] border border-[#E7E7E4] rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-[#111111]/15 transition-[box-shadow,border-color] duration-300 relative overflow-hidden group">
            <div id="capabilities" className="absolute -top-24" />
            <div className="space-y-4">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#92652B]">
                Industry Solutions
              </span>
              <h3 className="text-xl md:text-2xl font-serif text-[#111111]">
                Customized for your business model
              </h3>
              
              <ul className="space-y-4 pt-2">
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded bg-[#F3F2EF] flex items-center justify-center text-xs shrink-0 mt-0.5">💆</div>
                  <div>
                    <h4 className="text-xs font-bold text-[#111111]">Spas &amp; Dental Clinics</h4>
                    <p className="text-[10px] text-[#595959] font-light leading-relaxed mt-0.5">AI receptionist answers patient FAQs and schedules bookings directly in your calendar tool (Jane, Mindbody, or GCal).</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded bg-[#F3F2EF] flex items-center justify-center text-xs shrink-0 mt-0.5">🍕</div>
                  <div>
                    <h4 className="text-xs font-bold text-[#111111]">Restaurants</h4>
                    <p className="text-[10px] text-[#595959] font-light leading-relaxed mt-0.5">Automate reservation bookings, handle takeout orders, and share hours or parking details without holding up service staff.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded bg-[#F3F2EF] flex items-center justify-center text-xs shrink-0 mt-0.5">☀️</div>
                  <div>
                    <h4 className="text-xs font-bold text-[#111111]">Solar &amp; Real Estate</h4>
                    <p className="text-[10px] text-[#595959] font-light leading-relaxed mt-0.5">Trigger outbound qualification calls within 10 seconds of web form submissions. Screen out tire kickers instantly.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded bg-[#F3F2EF] flex items-center justify-center text-xs shrink-0 mt-0.5">🔒</div>
                  <div>
                    <h4 className="text-xs font-bold text-[#111111]">Secure &amp; Compliant</h4>
                    <p className="text-[10px] text-[#595959] font-light leading-relaxed mt-0.5">Built on highly secure infrastructure with call redacting and full GDPR/HIPAA-ready guidelines.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 4: Interactive Stepper Journey (Span 8) */}
          <div className="bento-card lg:col-span-8 bg-[#FCFCFB] border border-[#E7E7E4] rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-[#111111]/15 transition-[box-shadow,border-color] duration-300 relative overflow-hidden group">
            <div id="outreach" className="absolute -top-24" />
            <div className="space-y-4 w-full">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#92652B]">
                Interactive Flow
              </span>
              <h3 className="text-xl md:text-2xl font-serif text-[#111111]">
                The 10-Second Customer Journey
              </h3>
              
              {/* Stepper Tabs */}
              <div className="flex bg-[#F3F2EF] p-1 rounded-xl border border-[#E7E7E4] w-full max-w-lg mt-4">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className={`flex-1 py-2 text-center rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeStep === 1 ? "bg-[#111111] text-[#FCFCFB] shadow-sm" : "text-[#595959] hover:text-[#111111]"
                  }`}
                >
                  01 / Customer Event
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className={`flex-1 py-2 text-center rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeStep === 2 ? "bg-[#111111] text-[#FCFCFB] shadow-sm" : "text-[#595959] hover:text-[#111111]"
                  }`}
                >
                  02 / Natural Call
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className={`flex-1 py-2 text-center rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeStep === 3 ? "bg-[#111111] text-[#FCFCFB] shadow-sm" : "text-[#595959] hover:text-[#111111]"
                  }`}
                >
                  03 / Booking Sync
                </button>
              </div>
              
              {/* Step Detail Content */}
              <div className="pt-4 grid grid-cols-1 md:grid-cols-12 gap-6 items-center min-h-[160px]">
                <div className="md:col-span-7 space-y-2">
                  <h4 className="text-sm font-bold text-[#111111]">
                    {activeStep === 1 && "Customer Action Triggers Call"}
                    {activeStep === 2 && "Natural Voice Conversation Initiated"}
                    {activeStep === 3 && "Booking confirmed & Calendar Sync"}
                  </h4>
                  <p className="text-xs text-[#595959] leading-relaxed font-light">
                    {activeStep === 1 && "A client dials your front desk, or a prospect submits a web lead form. Vetics captures the event and routes it to the voice assistant pathway immediately."}
                    {activeStep === 2 && "The voice receptionist answers instantly. Speaks naturally with zero button tree menus. Qualifies the caller's request, resolves FAQs, and checks calendar slots."}
                    {activeStep === 3 && "Once the booking details are gathered, the system schedules the slot directly in your calendar software (Jane, Mindbody, HubSpot) and updates your records."}
                  </p>
                </div>
                
                {/* Simulated Telemetry Visual box */}
                <div className="md:col-span-5 bg-[#F3F2EF] border border-[#E7E7E4] rounded-2xl p-4 font-mono text-[10px] space-y-2 w-full text-left">
                  <div className="flex items-center justify-between border-b border-[#111111]/5 pb-1.5 mb-1.5">
                    <span className="font-bold text-[#111111]">EVENT CONSOLE</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  </div>
                  {activeStep === 1 && (
                    <div className="space-y-1 text-[#595959]">
                      <p><span className="text-[#92652B]">trigger:</span> "incoming_call"</p>
                      <p><span className="text-[#92652B]">line_status:</span> "ringing"</p>
                      <p><span className="text-[#92652B]">routing_delay:</span> "110ms"</p>
                      <p className="text-[#111111] font-bold">&gt; routing to voice assistant...</p>
                    </div>
                  )}
                  {activeStep === 2 && (
                    <div className="space-y-1 text-[#595959]">
                      <p><span className="text-[#92652B]">speech_engine:</span> "conversational"</p>
                      <p><span className="text-[#92652B]">latency:</span> "0.78s"</p>
                      <p><span className="text-[#92652B]">user_intent:</span> "book_appointment"</p>
                      <p className="text-[#111111] font-bold">&gt; answering customer FAQ...</p>
                    </div>
                  )}
                  {activeStep === 3 && (
                    <div className="space-y-1 text-[#595959]">
                      <p><span className="text-[#92652B]">booking_status:</span> "confirmed"</p>
                      <p><span className="text-[#92652B]">calendar_sync:</span> "JaneApp_OK"</p>
                      <p><span className="text-[#92652B]">duration:</span> "1m 45s"</p>
                      <p className="text-[#111111] font-bold">&gt; booking synced successfully.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Visual bottom progress bar indicator */}
            <div className="w-full bg-[#F3F2EF] h-1.5 rounded-full mt-6 overflow-hidden">
              <div 
                className="bg-[#92652B] h-full transition-all duration-500 ease-out" 
                style={{ width: `${(activeStep / 3) * 100}%` }}
              />
            </div>
          </div>
          
        </div>
      </section>

      {/* CTA BAND */}
      <section className="cta-band bg-[#111111] py-24 text-[#FCFCFB] text-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-[#A87C43] to-purple-800 blur-[100px] absolute" />
        </div>
        <div className="cta-band-inner max-w-3xl mx-auto px-6 relative z-10 scroll-reveal">
          <h2 className="font-serif text-3xl md:text-5xl text-[#FCFCFB] mb-6">
            Scale your front-desk capacity today.
          </h2>
          <p className="text-base md:text-lg text-[#FCFCFB]/70 font-light leading-relaxed mb-10 max-w-xl mx-auto">
            Eliminate missed calls, automate your scheduling, and follow up with leads instantly. Let Vetics voice assistants keep your calendar full.
          </p>
          <button
            data-cal-namespace={calNamespace}
            data-cal-link={calLink}
            data-cal-config='{"layout":"month_view"}'
            className="text-xs font-bold uppercase tracking-wider bg-[#FCFCFB] text-[#111111] border border-[#FCFCFB] px-8 py-4 rounded-full hover:bg-transparent hover:text-[#FCFCFB] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer shadow-lg shadow-[#111111]/30"
          >
            Schedule Consultation
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#FCFCFB] border-t border-[#E7E7E4] py-16 px-6 md:px-12">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-start gap-12 pb-12 border-b border-[#E7E7E4]">
          <div className="max-w-xs">
            <a href="#" className="flex items-center gap-2 text-xl font-bold tracking-tighter text-[#111111] font-serif hover:opacity-80 transition-opacity">
              Vetics<span className="text-[9px] font-sans font-bold tracking-widest uppercase bg-[#111111] text-[#F7F7F5] px-1 py-0.5 rounded">.space</span>
            </a>
            <p className="text-xs text-[#595959] mt-4 leading-relaxed font-light">
              24/7 conversational voice receptionists and instant outbound call assistants for modern business scheduling.
            </p>
          </div>
          <div className="flex gap-16">
            <div>
              <h4 className="text-[10px] tracking-[0.15em] uppercase text-[#111111] font-bold mb-4">Structure</h4>
              <ul className="flex flex-col gap-2.5 text-xs text-[#595959] font-semibold list-none p-0 m-0">
                <li><a href="#about" className="hover:text-[#111111] transition-colors">The Cost of Missed Calls</a></li>
                <li><a href="#outreach" className="hover:text-[#111111] transition-colors">Call Journey</a></li>
                <li><a href="#capabilities" className="hover:text-[#111111] transition-colors">Industry Solutions</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] tracking-[0.15em] uppercase text-[#111111] font-bold mb-4">Connect</h4>
              <ul className="flex flex-col gap-2.5 text-xs text-[#595959] font-semibold list-none p-0 m-0">
                <li><a href="mailto:support@vetics.space" className="hover:text-[#111111] transition-colors">support@vetics.space</a></li>
                <li>
                  <button
                    data-cal-namespace={calNamespace}
                    data-cal-link={calLink}
                    data-cal-config='{"layout":"month_view"}'
                    className="hover:text-[#111111] transition-colors bg-transparent border-none p-0 cursor-pointer text-left font-semibold text-xs uppercase tracking-wider"
                  >
                    Book Call
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 pt-8 text-[10px] text-[#595959] font-light">
          <p>&copy; {new Date().getFullYear()} Vetics.space. All rights reserved.</p>
          <p className="disclaimer max-w-md text-left md:text-right leading-normal">
            Vetics.space is a technology platform building custom conversational voice integrations. All test sessions are logged and transcribed for verification.
          </p>
        </div>
      </footer>
    </div>
  );
}
