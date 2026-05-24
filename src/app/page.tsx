"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

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
          Data<span>Leads</span> India
        </div>
        <a
          className="nav-cta"
          href="https://wa.me/918329727869?text=Hi%20DataLeads,%20I%20would%20like%20a%20free%20sample%20of%20GST%20leads."
          target="_blank"
          rel="noopener noreferrer"
        >
          Get Free Sample
        </a>
      </nav>

      {/* HERO */}
      <section className="hero" style={{ position: "relative" }}>
        <p className="eyebrow">Verified B2B Data — For Financial Professionals</p>
        <h1>
          Stop Hunting<br />
          for <span className="accent">Clients.</span><br />
          We Deliver.
        </h1>
        <p className="hero-sub">
          Fresh <strong>GST Business Leads</strong> delivered directly to Chartered
          Accountants — newly registered businesses in Tier‑2 cities, with the
          owner's direct mobile number, within <strong>30 days of incorporation.</strong>
        </p>
        <div className="hero-actions">
          <a
            className="btn-primary"
            href="https://wa.me/918329727869?text=Hi%20DataLeads,%20I%20would%20like%20a%20free%20sample%20of%20GST%20leads."
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              className="whatsapp-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Request Free 10-Lead Sample
          </a>
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
        <p className="section-label reveal">How It Works</p>
        <h2 className="section-title reveal">
          Proprietary extraction.<br />
          <em>Precision targeting.</em>
        </h2>

        <div className="value-grid">
          <div className="value-card reveal">
            <div className="value-num">01</div>
            <h3>Proprietary GST Extraction</h3>
            <p>
              We use a custom data pipeline to monitor newly registered GST
              businesses the moment they appear — before anyone else reaches out.
            </p>
          </div>
          <div className="value-card reveal">
            <div className="value-num">02</div>
            <h3>Tier-2 City Focus</h3>
            <p>
              Less competition, more opportunity. We target emerging business
              districts in Tier-2 cities where CAs are underrepresented.
            </p>
          </div>
          <div className="value-card reveal">
            <div className="value-num">03</div>
            <h3>Owner's Direct Number</h3>
            <p>
              No gatekeepers. Each lead includes the owner's verified mobile
              number — reach decision-makers on day one.
            </p>
          </div>
          <div className="value-card reveal">
            <div className="value-num">04</div>
            <h3>Within 30 Days of Incorporation</h3>
            <p>
              Strike while the iron is hot. New businesses need CA services
              immediately. You'll be calling before they've signed with anyone.
            </p>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* PRICING */}
      <section className="pricing-section" id="pricing">
        <p className="section-label reveal">Transparent Pricing</p>
        <h2 className="section-title reveal">
          Pay only for<br />
          <em>verified leads.</em>
        </h2>

        <div className="pricing-grid">
          <div className="price-card reveal">
            <p className="price-label">Starter Pack</p>
            <h3 className="price-title">100 Verified Local Leads</h3>
            <div className="price-amount">₹2,000</div>
            <p className="price-unit">One-time · Specific city</p>
            <ul className="price-features">
              <li>100 newly registered GST businesses</li>
              <li>Owner's direct mobile number</li>
              <li>Within 30 days of incorporation</li>
              <li>Tier-2 city of your choice</li>
              <li>CSV / Excel delivery</li>
            </ul>
            <a
              href="https://wa.me/918329727869?text=Hi%20DataLeads,%20I%20would%20like%20a%20free%20sample%20of%20GST%20leads."
              className="btn-card btn-card-cyan"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Started on WhatsApp
            </a>
          </div>

          <div className="price-card featured reveal">
            <span className="featured-badge">Best Value</span>
            <p className="price-label">City Exclusivity</p>
            <h3 className="price-title">Full City Exclusivity Pack</h3>
            <div className="price-amount">₹15,000</div>
            <p className="price-unit">Monthly · Exclusive territory</p>
            <ul className="price-features">
              <li>All new GST businesses in your city</li>
              <li>No other CA gets the same leads</li>
              <li>Owner's direct mobile — verified</li>
              <li>Continuous monthly delivery</li>
              <li>Priority support & refresh</li>
            </ul>
            <a
              href="https://wa.me/918329727869?text=Hi%20DataLeads,%20I%20would%20like%20a%20free%20sample%20of%20GST%20leads."
              className="btn-card btn-card-gold"
              target="_blank"
              rel="noopener noreferrer"
            >
              Lock My City Now
            </a>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="cta-band">
        <div className="cta-band-inner">
          <h2 className="cta-headline reveal">
            Try before<br />
            you buy.
          </h2>
          <p className="cta-sub reveal">
            We're confident enough to give you 10 real, verified leads at zero
            cost. No credit card. No commitment. Just results you can call today.
          </p>
          <a
            className="whatsapp-btn reveal"
            href="https://wa.me/918329727869?text=Hi%20DataLeads,%20I%20would%20like%20a%20free%20sample%20of%20GST%20leads."
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="whatsapp-icon" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Request a Free 10-Lead Sample via WhatsApp
          </a>
        </div>
      </section>

      <footer>
        <div className="logo">
          Data<span>Leads</span> India
        </div>
        <p>Verified B2B Data for Financial Professionals · India</p>
      </footer>
    </>
  );
}
