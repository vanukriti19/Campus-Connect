import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Bookmark, ArrowRight, Sparkles } from 'lucide-react';

export default function InteractiveHero() {
  const heroRef = useRef(null);
  const canvasRef = useRef(null);
  const lanternLayerRef = useRef(null);
  const contentRef = useRef(null);
  const [lanternCount, setLanternCount] = useState(0);
  const [showHint, setShowHint] = useState(true);

  // Spawns a floating sky lantern at given (x, y) relative to the hero element
  const spawnLantern = useCallback((x, y, isAmbient = false) => {
    if (!lanternLayerRef.current) return;
    const el = document.createElement('i');
    el.className = 'interactive-lantern';
    const size = isAmbient ? 10 + Math.random() * 14 : 14 + Math.random() * 20;
    const alpha = isAmbient ? 0.35 + Math.random() * 0.4 : 0.6 + Math.random() * 0.4;
    const duration = isAmbient ? 9 + Math.random() * 7 : 6 + Math.random() * 5;
    const drift = -45 + Math.random() * 90;

    el.style.cssText = `left:${x}px;top:${y}px;--size:${size}px;--alpha:${alpha};--duration:${duration}s;--drift:${drift}px`;
    lanternLayerRef.current.appendChild(el);

    el.addEventListener(
      'animationend',
      () => {
        el.remove();
      },
      { once: true }
    );

    if (!isAmbient) {
      setLanternCount((prev) => prev + 1);
      setShowHint(false);
    }
  }, []);

  // Ambient background lanterns periodically floating up
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    // Spawn 2 initial ambient lanterns after a short delay
    const initialTimer = setTimeout(() => {
      const w = hero.clientWidth;
      const h = hero.clientHeight;
      spawnLantern(w * 0.25 + Math.random() * (w * 0.5), h * 0.75, true);
      spawnLantern(w * 0.35 + Math.random() * (w * 0.4), h * 0.85, true);
    }, 1200);

    // Periodic gentle ambient floating lantern
    const interval = setInterval(() => {
      if (!heroRef.current) return;
      const w = heroRef.current.clientWidth;
      const h = heroRef.current.clientHeight;
      spawnLantern(Math.random() * w, h - 20, true);
    }, 4500);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [spawnLantern]);

  // Canvas particle starfield / embers effect
  useEffect(() => {
    const hero = heroRef.current;
    const canvas = canvasRef.current;
    if (!hero || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles = [];
    let raf = 0;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
      if (!hero || !canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = hero.clientWidth * dpr;
      canvas.height = hero.clientHeight * dpr;
      canvas.style.width = hero.clientWidth + 'px';
      canvas.style.height = hero.clientHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      particles = Array.from(
        { length: Math.min(95, Math.floor(hero.clientWidth / 10)) },
        () => ({
          x: Math.random() * hero.clientWidth,
          y: Math.random() * hero.clientHeight,
          r: Math.random() * 1.5 + 0.35,
          a: Math.random() * 0.55 + 0.12,
          speed: Math.random() * 0.22 + 0.04,
          phase: Math.random() * Math.PI * 2,
        })
      );
    }

    function draw() {
      if (!hero || !ctx) return;
      const w = hero.clientWidth;
      const h = hero.clientHeight;
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        if (!reduced) {
          p.y -= p.speed;
          p.phase += 0.015;
        }
        if (p.y < -3) {
          p.y = h + 3;
          p.x = Math.random() * w;
        }
        const twinkle = 0.55 + 0.45 * Math.sin(p.phase);
        ctx.beginPath();
        ctx.arc(p.x + Math.sin(p.phase) * 2, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,177,117,${p.a * twinkle})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }

    resize();
    draw();

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Pointer interaction: spotlight gradient and 3D card perspective tilt
  const handlePointerMove = (e) => {
    const hero = heroRef.current;
    const content = contentRef.current;
    if (!hero) return;

    const r = hero.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;

    hero.style.setProperty('--mx', `${(x / r.width) * 100}%`);
    hero.style.setProperty('--my', `${(y / r.height) * 100}%`);

    if (content && e.pointerType === 'mouse') {
      const ry = (x / r.width - 0.5) * 4.5;
      const rx = -(y / r.height - 0.5) * 3.5;
      content.style.setProperty('--ry', `${ry}deg`);
      content.style.setProperty('--rx', `${rx}deg`);
    }
  };

  const handlePointerLeave = () => {
    if (contentRef.current) {
      contentRef.current.style.setProperty('--rx', '0deg');
      contentRef.current.style.setProperty('--ry', '0deg');
    }
  };

  // Click handler on hero box to spawn lantern
  const handleClick = (e) => {
    // Ignore clicks on buttons/links
    if (e.target.closest('button, a, input, select')) return;
    const hero = heroRef.current;
    if (!hero) return;
    const r = hero.getBoundingClientRect();
    spawnLantern(e.clientX - r.left, e.clientY - r.top);
  };

  // Burst release function for the interactive button
  const handleBurstRelease = (e) => {
    e.stopPropagation();
    const hero = heroRef.current;
    if (!hero) return;
    const w = hero.clientWidth;
    const h = hero.clientHeight;
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        spawnLantern(
          w * 0.3 + Math.random() * (w * 0.4),
          h * 0.7 + Math.random() * (h * 0.2)
        );
      }, i * 180);
    }
  };

  return (
    <div
      ref={heroRef}
      id="hero"
      className="interactive-hero"
      aria-label="Campus Connect interactive hero poster"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
    >
      {/* Background Starfield Particles */}
      <canvas ref={canvasRef} id="particles" aria-hidden="true" />

      {/* Floating Sky Lanterns Layer */}
      <div ref={lanternLayerRef} id="lanterns" aria-hidden="true" />

      {/* Interactive Floating Status Pill */}
      <div className="absolute top-5 left-5 z-20 flex items-center gap-2">
        <div className="px-3 py-1.5 rounded-full bg-[#1c0f17]/70 backdrop-blur-md border border-[#ef9992]/25 text-[11px] font-mono tracking-wider text-[#ef9992] flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-[#ef9992] animate-ping" />
          <span>🏮 {lanternCount > 0 ? `${lanternCount} Lantern${lanternCount === 1 ? '' : 's'} Released` : 'Lantern Festival'}</span>
        </div>
      </div>

      {/* Interactive Helper Hint Badge */}
      {showHint && (
        <div className="absolute top-5 right-5 z-20 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1c0f17]/60 backdrop-blur-md border border-white/10 text-[11px] font-mono tracking-wider text-[#e8c8bd] animate-pulse pointer-events-none">
          <Sparkles className="w-3 h-3 text-[#ffad58]" />
          <span>Click anywhere to light a lantern</span>
        </div>
      )}

      {/* 3D Perspective Content Section */}
      <section ref={contentRef} id="content" className="interactive-hero-content">
        <h1 id="title" className="interactive-hero-title">
          Campus
          <br />
          Connect
        </h1>

        <p className="interactive-hero-quote">
          Find your people. Find your place.
        </p>

        {/* Action Button Strip embedded gracefully in the hero */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/events"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#ef9992] hover:bg-[#ffb0a7] text-[#10090d] font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-950/50 transition-all hover:scale-105"
          >
            <Compass className="w-4 h-4" />
            Explore All Events
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/saved"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#28151f]/80 hover:bg-[#382332] text-[#fff0e8] font-semibold text-xs uppercase tracking-wider border border-[#4a2838] transition hover:scale-105 backdrop-blur-sm"
          >
            <Bookmark className="w-4 h-4 text-[#ef9992]" />
            Saved Events
          </Link>

          <button
            type="button"
            onClick={handleBurstRelease}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[#ffad58]/20 hover:bg-[#ffad58]/30 text-[#ffad58] border border-[#ffad58]/40 text-xs font-mono tracking-wider uppercase backdrop-blur-sm transition hover:scale-105"
            title="Release a cluster of lanterns"
          >
            <span>🏮 Launch Lanterns</span>
          </button>
        </div>
      </section>

      {/* Bottom Sub-hint for touch devices */}
      <div className="absolute bottom-4 z-20 text-[10px] font-mono tracking-widest text-[#ef9992]/70 uppercase pointer-events-none">
        ✦ Interactive Collegiate Sky ✦ Tap to Ignite ✦
      </div>
    </div>
  );
}
