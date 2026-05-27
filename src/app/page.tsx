"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { getCalApi } from "@calcom/embed-react";

export default function Home() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // ── CURSOR LOGIC ──
    const cursor = cursorRef.current;
    const ring = ringRef.current;
    if (!cursor || !ring) return;

    let mx = 0, my = 0, rx = 0, ry = 0;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.transform = `translate(${mx - 6}px, ${my - 6}px)`;
    };

    const animateCursor = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.transform = `translate(${rx - 20}px, ${ry - 20}px)`;
      animationFrameId = requestAnimationFrame(animateCursor);
    };

    document.addEventListener("mousemove", handleMouseMove);
    animateCursor();

    const handleMouseEnter = () => {
      cursor.style.transform += " scale(2.5)";
      cursor.style.background = "rgba(0,212,255,0.5)";
    };
    const handleMouseLeave = () => {
      cursor.style.background = "#00d4ff";
    };

    const interactiveElements = document.querySelectorAll("a, button");
    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
    });

    // ── LIQUID PAINT CANVAS ──
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W: number, H: number;
    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = document.body.scrollHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const nodes = Array.from({ length: 7 }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.3,
      r: 180 + Math.random() * 200,
      hue: i % 2 === 0 ? 190 : 45,
      alpha: 0.03 + Math.random() * 0.04,
    }));

    let frame = 0;
    let canvasAnimationId: number;
    const paint = () => {
      ctx.clearRect(0, 0, W, H);
      frame++;

      nodes.forEach((n) => {
        n.x += n.vx + Math.sin(frame * 0.003 + n.y * 0.002) * 0.3;
        n.y += n.vy + Math.cos(frame * 0.004 + n.x * 0.002) * 0.2;
        if (n.x < -n.r) n.x = W + n.r;
        if (n.x > W + n.r) n.x = -n.r;
        if (n.y < -n.r) n.y = H + n.r;
        if (n.y > H + n.r) n.y = -n.r;

        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        g.addColorStop(0, `hsla(${n.hue},100%,60%,${n.alpha})`);
        g.addColorStop(0.6, `hsla(${n.hue},80%,40%,${n.alpha * 0.4})`);
        g.addColorStop(1, `hsla(${n.hue},60%,20%,0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      });

      canvasAnimationId = requestAnimationFrame(paint);
    };
    paint();

    // ── SCROLL REVEAL ──
    const reveals = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add("visible"), 80);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach((el) => io.observe(el));

    // Stagger siblings in same grid
    document.querySelectorAll(".value-grid, .pricing-grid").forEach((grid) => {
      [...grid.children].forEach((child, i) => {
        (child as HTMLElement).style.transitionDelay = `${i * 0.1}s`;
      });
    });

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(document.body);

    // Initialize Cal.com Embed
    (async function () {
      const cal = await getCalApi({"namespace":"30min"});
      cal("ui", {"styles":{"branding":{"brandColor":"#00d4ff"}},"hideEventTypeDetails":false,"layout":"month_view"});
    })();

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      cancelAnimationFrame(canvasAnimationId);
      window.removeEventListener("resize", resize);
      resizeObserver.disconnect();
      io.disconnect();
      interactiveElements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, []);

  return (
    <>
      <div className="cursor" ref={cursorRef}></div>
      <div className="cursor-ring" ref={ringRef}></div>
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      <canvas id="liquidCanvas" ref={canvasRef}></canvas>

      {/* NAV */}
      <nav>
        <div className="nav-logo">
          Aura<span>Voice</span> AI
        </div>
        <button
          data-cal-namespace="30min"
          data-cal-link="kabir-aura-mpaprf/30min"
          data-cal-config='{"layout":"month_view"}'
          className="nav-cta"
        >
          Book Consultation
        </button>
      </nav>

      {/* HERO */}
      <section className="hero" style={{ position: "relative" }}>
        <p className="eyebrow">The New Standard in AI Automation</p>
        <h1>
          The AI Employee<br />
          That <span className="accent">Never Sleeps.</span>
        </h1>
        <p className="hero-sub">
          <strong>AI Voice Agents</strong> that close deals, book appointments, and handle customer support around the clock. 
          Ultra-low latency, completely indistinguishable from human receptionists.
        </p>
        <div className="hero-actions">
          <button
            data-cal-namespace="30min"
            data-cal-link="kabir-aura-mpaprf/30min"
            data-cal-config='{"layout":"month_view"}'
            className="btn-primary"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Book a Free Consultation
          </button>
          <a className="btn-ghost" href="#pricing">
            View Pricing →
          </a>
        </div>

        <div className="scroll-hint" style={{ position: "absolute" }}>
          <span>Scroll</span>
          <div className="scroll-line"></div>
        </div>
      </section>

      <div className="divider"></div>

      {/* VALUE PROP */}
      <section className="value-section">
        <p className="section-label reveal">Why Choose Us</p>
        <h2 className="section-title reveal">
          Beyond chatbots.<br />
          <em>True conversational AI.</em>
        </h2>

        <div className="value-grid">
          <div className="value-card reveal glass-card">
            <div className="value-num">01</div>
            <h3>Human-Like Conversations</h3>
            <p>
              Ultra-low latency models that understand context, nuance, and interruptions. Your customers won't know they are talking to an AI.
            </p>
          </div>
          <div className="value-card reveal glass-card">
            <div className="value-num">02</div>
            <h3>24/7 Availability</h3>
            <p>
              Never miss a lead or customer inquiry again. Handle support, booking, and sales calls around the clock, simultaneously.
            </p>
          </div>
          <div className="value-card reveal glass-card">
            <div className="value-num">03</div>
            <h3>Seamless Integrations</h3>
            <p>
              Our agents connect directly to your CRM, Calendly, and internal databases to update records and book appointments instantly.
            </p>
          </div>
          <div className="value-card reveal glass-card">
            <div className="value-num">04</div>
            <h3>Native Multilingual Support</h3>
            <p>
              Speaks English, Hindi, Spanish, Marathi, Arabic, and more. Instantly switches languages based on what the caller speaks.
            </p>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* PRICING */}
      <section className="pricing-section" id="pricing">
        <p className="section-label reveal">Transparent Pricing</p>
        <h2 className="section-title reveal">
          Scale your business<br />
          <em>without the overhead.</em>
        </h2>

        <div className="pricing-grid">
          <div className="price-card reveal glass-card">
            <p className="price-label">Standard Setup</p>
            <h3 className="price-title">Starter AI Agent</h3>
            <div className="price-amount">Custom</div>
            <p className="price-unit">One-time setup + Monthly SaaS</p>
            <ul className="price-features">
              <li>Inbound & Outbound capable</li>
              <li>Custom knowledge base integration</li>
              <li>Calendar / Booking system sync</li>
              <li>Post-call SMS & Email follow-ups</li>
              <li>Standard voice options</li>
            </ul>
            <button
              data-cal-namespace="30min"
              data-cal-link="kabir-aura-mpaprf/30min"
              data-cal-config='{"layout":"month_view"}'
              className="btn-card btn-card-cyan"
            >
              Get a Quote
            </button>
          </div>

          <div className="price-card featured reveal glass-card">
            <span className="featured-badge">Enterprise</span>
            <p className="price-label">Advanced Automation</p>
            <h3 className="price-title">Fully Custom Agent</h3>
            <div className="price-amount">Contact Us</div>
            <p className="price-unit">For high-volume operations</p>
            <ul className="price-features">
              <li>Everything in Starter</li>
              <li>Complex multi-step workflows</li>
              <li>Live transfer to human agents</li>
              <li>Voice cloning capabilities</li>
              <li>Dedicated priority support</li>
            </ul>
            <button
              data-cal-namespace="30min"
              data-cal-link="kabir-aura-mpaprf/30min"
              data-cal-config='{"layout":"month_view"}'
              className="btn-card btn-card-gold"
            >
              Schedule Discovery Call
            </button>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="cta-band">
        <div className="cta-band-inner">
          <h2 className="cta-headline reveal">
            Hear it in<br />
            action.
          </h2>
          <p className="cta-sub reveal">
            Stop losing leads to missed calls and slow response times. Let an AI employee handle the heavy lifting while you focus on what matters.
          </p>
          <button
            data-cal-namespace="30min"
            data-cal-link="kabir-aura-mpaprf/30min"
            data-cal-config='{"layout":"month_view"}'
            className="whatsapp-btn reveal"
          >
            <svg
              className="whatsapp-icon"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Book a Live Demo
          </button>
        </div>
      </section>

      <footer>
        <div className="logo">
          Aura<span>Voice</span> AI
        </div>
        <p>Next-Gen AI Voice Agents for Modern Businesses</p>
      </footer>
    </>
  );
}
