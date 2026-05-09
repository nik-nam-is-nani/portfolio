'use client';
import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  rotation: number;
  rotSpeed: number;
}

interface Star {
  x: number; y: number;
  r: number;
  c: string;
  phase: number;
  speed: number;
}

interface Vec3 { x: number; y: number; z: number; }
interface Edge { a: number; b: number; }
interface Face { indices: number[]; }

export default function AchievementSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'idle' | 'dark' | 'spotlight' | 'slam' | 'confetti' | 'full'>('idle');
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  const trophyCanvasRef = useRef<HTMLCanvasElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const confettiRafRef = useRef<number>(0);
  const trophyRafRef = useRef<number>(0);
  const bgRafRef = useRef<number>(0);
  const hasTriggered = useRef(false);
  const rotYRef = useRef(0);
  const rotXRef = useRef(0.25);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const autoRotate = useRef(true);
  const floatOffset = useRef(0);

  // ─── confetti helpers ────────────────────────────────────────────────────────
  const spawnConfetti = () => {
    const colors = ['#00E5FF', '#FF6B2B', '#A855F7', '#ffffff', '#FFD700'];
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    for (let i = 0; i < 200; i++) {
      particlesRef.current.push({
        x: canvas.width * 0.5 + (Math.random() - 0.5) * 200,
        y: canvas.height * 0.3,
        vx: (Math.random() - 0.5) * 12,
        vy: -8 - Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 6,
        life: 0,
        maxLife: 120 + Math.random() * 80,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
      });
    }
  };

  const drawConfetti = () => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particlesRef.current = particlesRef.current.filter(p => p.life < p.maxLife);
    particlesRef.current.forEach(p => {
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3;
      p.vx *= 0.99;
      p.rotation += p.rotSpeed;
      const alpha = Math.max(0, 1 - p.life / p.maxLife);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });
    if (particlesRef.current.length > 0) {
      confettiRafRef.current = requestAnimationFrame(drawConfetti);
    }
  };

  // ─── 3-D trophy geometry ─────────────────────────────────────────────────────
  const buildTrophy = (): { verts: Vec3[]; edges: Edge[]; faces: Face[] } => {
    const verts: Vec3[] = [];
    const edges: Edge[] = [];
    const faces: Face[] = [];

    // Helper: add ring of verts at given y, radius
    const ring = (y: number, r: number, n = 12): number => {
      const start = verts.length;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        verts.push({ x: Math.cos(a) * r, y, z: Math.sin(a) * r });
      }
      return start;
    };

    // Cup profile  (y goes up = positive)
    const r0 = ring(1.05, 0.0);   // rim top center (lip)
    const r1 = ring(1.0,  0.72);  // rim outer top
    const r2 = ring(0.85, 0.65);  // rim inner
    const r3 = ring(0.55, 0.52);  // upper cup
    const r4 = ring(0.0,  0.38);  // mid cup
    const r5 = ring(-0.35, 0.18); // waist
    const r6 = ring(-0.55, 0.22); // stem top
    const r7 = ring(-0.85, 0.22); // stem bottom
    const r8 = ring(-0.95, 0.48); // base top
    const r9 = ring(-1.05, 0.55); // base bottom

    const N = 12;

    // Connect each consecutive ring with edges + quad faces
    const connectRings = (s: number, e: number) => {
      for (let i = 0; i < N; i++) {
        const ni = (i + 1) % N;
        edges.push({ a: s + i, b: e + i });
        edges.push({ a: s + i, b: s + ni });
        faces.push({ indices: [s + i, s + ni, e + ni, e + i] });
      }
    };

    connectRings(r0, r1);
    connectRings(r1, r2);
    connectRings(r2, r3);
    connectRings(r3, r4);
    connectRings(r4, r5);
    connectRings(r5, r6);
    connectRings(r6, r7);
    connectRings(r7, r8);
    connectRings(r8, r9);

    // Cross-bracing edges inside cup for holographic look
    for (let i = 0; i < N; i += 2) {
      edges.push({ a: r1 + i, b: r4 + ((i + 6) % N) });
      edges.push({ a: r2 + i, b: r3 + ((i + 4) % N) });
    }

    // Handles: two arcs left/right
    const handleVerts = (side: number) => {
      const hStart = verts.length;
      const steps = 8;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const a = Math.PI * t; // 0..PI arc
        const hx = side * (0.65 + 0.38 * Math.sin(a));
        const hy = 0.6 - 0.55 * t;
        verts.push({ x: hx, y: hy, z: 0 });
      }
      for (let i = 0; i < steps; i++) {
        edges.push({ a: hStart + i, b: hStart + i + 1 });
      }
    };
    handleVerts(1);
    handleVerts(-1);

    return { verts, edges, faces };
  };

  // ─── project + rotate ─────────────────────────────────────────────────────────
  const rotateVert = (v: Vec3, rx: number, ry: number): Vec3 => {
    // Rotate around Y
    let x = v.x * Math.cos(ry) - v.z * Math.sin(ry);
    let z = v.x * Math.sin(ry) + v.z * Math.cos(ry);
    // Rotate around X
    let y = v.y * Math.cos(rx) - z * Math.sin(rx);
    let z2 = v.y * Math.sin(rx) + z * Math.cos(rx);
    return { x, y, z: z2 };
  };

  const project = (v: Vec3, cx: number, cy: number, scale: number): { sx: number; sy: number; depth: number } => {
    const fov = 4.5;
    const d = fov / (fov + v.z + 2.5);
    return { sx: cx + v.x * scale * d, sy: cy - v.y * scale * d, depth: v.z };
  };

  // ─── bg star canvas ───────────────────────────────────────────────────────────
  const starsRef = useRef<Star[]>([]);

  const initStars = (w: number, h: number) => {
    starsRef.current = Array.from({ length: 80 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.8 + 0.3,
      c: ['#00E5FF', '#FF6B2B', '#A855F7', '#ffffff'][Math.floor(Math.random() * 4)],
      phase: Math.random() * Math.PI * 2,
      speed: 0.005 + Math.random() * 0.01,
    }));
  };

  const drawBg = (t: number) => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    starsRef.current.forEach(s => {
      const alpha = 0.2 + 0.5 * (0.5 + 0.5 * Math.sin(s.phase + t * s.speed));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.c + Math.round(alpha * 255).toString(16).padStart(2, '0');
      ctx.fill();
    });
  };

  // ─── main trophy render loop ──────────────────────────────────────────────────
  const trophyGeom = useRef(buildTrophy());

  const renderTrophy = (t: number) => {
    const canvas = trophyCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    if (autoRotate.current) rotYRef.current += 0.008;
    floatOffset.current = Math.sin(t * 0.001) * 12;

    const ry = rotYRef.current;
    const rx = rotXRef.current;
    const { verts, edges, faces } = trophyGeom.current;
    const cx = W / 2;
    const cy = H / 2 + 10 + floatOffset.current;
    const scale = Math.min(W, H) * 0.3;

    // Project all verts
    const projected = verts.map(v => {
      const rv = rotateVert(v, rx, ry);
      return { ...project(rv, cx, cy, scale), rv };
    });

    // Draw faces (back-faces dimmed for holographic translucency)
    faces.forEach(f => {
      const pts = f.indices.map(i => projected[i]);
      // Normal via cross-product for backface check
      const ax = pts[1].sx - pts[0].sx, ay = pts[1].sy - pts[0].sy;
      const bx = pts[2].sx - pts[0].sx, by = pts[2].sy - pts[0].sy;
      const cross = ax * by - ay * bx;
      const alpha = cross < 0 ? 0.04 : 0.12;
      ctx.beginPath();
      ctx.moveTo(pts[0].sx, pts[0].sy);
      pts.slice(1).forEach(p => ctx.lineTo(p.sx, p.sy));
      ctx.closePath();
      ctx.fillStyle = `rgba(0,229,255,${alpha})`;
      ctx.fill();
    });

    // Sort edges by avg depth (painter's algorithm)
    const sortedEdges = edges.map(e => ({
      e,
      depth: (projected[e.a].depth + projected[e.b].depth) / 2,
    })).sort((a, b) => a.depth - b.depth);

    // Draw edges with depth-based brightness
    const minD = -1.5, maxD = 1.5;
    sortedEdges.forEach(({ e, depth }) => {
      const pa = projected[e.a];
      const pb = projected[e.b];
      const t01 = Math.max(0, Math.min(1, (depth - minD) / (maxD - minD)));
      const bright = 0.25 + t01 * 0.75;
      const lineW = 0.4 + t01 * 1.0;

      ctx.beginPath();
      ctx.moveTo(pa.sx, pa.sy);
      ctx.lineTo(pb.sx, pb.sy);
      ctx.strokeStyle = `rgba(0,229,255,${bright})`;
      ctx.lineWidth = lineW;
      ctx.stroke();
    });

    // Inner glow orb
    const grd = ctx.createRadialGradient(cx, cy - scale * 0.1, 0, cx, cy - scale * 0.1, scale * 0.45);
    grd.addColorStop(0, 'rgba(138,43,226,0.18)');
    grd.addColorStop(0.5, 'rgba(0,229,255,0.04)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.ellipse(cx, cy - scale * 0.1, scale * 0.45, scale * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Floor reflection ellipse
    const floorY = cy + scale * 0.75;
    const floorGrd = ctx.createRadialGradient(cx, floorY, 0, cx, floorY, scale * 0.45);
    floorGrd.addColorStop(0, 'rgba(0,229,255,0.18)');
    floorGrd.addColorStop(1, 'rgba(0,229,255,0)');
    ctx.fillStyle = floorGrd;
    ctx.beginPath();
    ctx.ellipse(cx, floorY, scale * 0.45, scale * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();

    // Label
    ctx.font = '10px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,229,255,0.45)';
    ctx.fillText('GRAND FINALE TROPHY', cx, H - 16);

    drawBg(t);
    trophyRafRef.current = requestAnimationFrame(renderTrophy);
  };

  // ─── drag to rotate ───────────────────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    autoRotate.current = false;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    rotYRef.current += dx * 0.012;
    rotXRef.current += dy * 0.012;
    rotXRef.current = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotXRef.current));
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseUp = () => { isDragging.current = false; };

  const onTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    autoRotate.current = false;
    lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const dx = e.touches[0].clientX - lastMouse.current.x;
    const dy = e.touches[0].clientY - lastMouse.current.y;
    rotYRef.current += dx * 0.012;
    rotXRef.current += dy * 0.012;
    rotXRef.current = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotXRef.current));
    lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = () => { isDragging.current = false; };

  // ─── lifecycle ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = confettiCanvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasTriggered.current) {
          hasTriggered.current = true;
          setPhase('dark');
          setTimeout(() => setPhase('spotlight'), 600);
          setTimeout(() => setPhase('slam'), 1200);
          setTimeout(() => {
            setPhase('confetti');
            spawnConfetti();
            confettiRafRef.current = requestAnimationFrame(drawConfetti);
          }, 2000);
          setTimeout(() => setPhase('full'), 2800);
        }
      },
      { threshold: 0.4 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(confettiRafRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'full') return;

    // Init bg stars
    const bgCanvas = bgCanvasRef.current;
    if (bgCanvas) {
      bgCanvas.width = bgCanvas.offsetWidth;
      bgCanvas.height = bgCanvas.offsetHeight;
      initStars(bgCanvas.width, bgCanvas.height);
    }

    trophyRafRef.current = requestAnimationFrame(renderTrophy);
    return () => {
      cancelAnimationFrame(trophyRafRef.current);
      cancelAnimationFrame(bgRafRef.current);
    };
  }, [phase]);

  // ─── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <section
      id="achievement"
      ref={sectionRef}
      className="py-20 px-6 md:px-12 relative overflow-hidden"
      style={{
        background: 'var(--background)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {/* Dark overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          background: 'rgba(0,0,0,0.7)',
          opacity: phase === 'dark' || phase === 'spotlight' ? 1 : 0,
          zIndex: 5,
        }}
      />

      {/* Confetti canvas */}
      <canvas
        ref={confettiCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 20 }}
      />

      {/* Spotlight */}
      {(phase === 'spotlight' || phase === 'slam' || phase === 'confetti' || phase === 'full') && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(ellipse, rgba(0,229,255,0.08) 0%, transparent 70%)',
            zIndex: 6,
            animation: 'spotlight-reveal 0.6s ease forwards',
          }}
        />
      )}

      <div className="max-w-[1400px] mx-auto w-full relative z-10">
        <div className="flex items-center gap-4 mb-12">
          <span className="font-mono text-[10px] tracking-[0.4em] text-muted-foreground uppercase">05 //</span>
          <h2
            className="font-display text-3xl md:text-5xl font-black tracking-tight text-foreground glitch-text"
            data-text="ACHIEVEMENT"
          >
            ACHIEVEMENT
          </h2>
        </div>

        {/* Main achievement text */}
        <div className="text-center mb-16 relative z-10">
          {(phase === 'slam' || phase === 'confetti' || phase === 'full') && (
            <div
              className="space-y-4"
              style={{ animation: 'slam-in 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards' }}
            >
              <div className="font-mono text-[10px] tracking-[0.5em] text-muted-foreground uppercase">
                ACHIEVEMENT UNLOCKED
              </div>
              <div
                className="font-display font-black tracking-tight leading-none"
                style={{
                  fontSize: 'clamp(2rem, 7vw, 6rem)',
                  color: 'var(--accent)',
                  textShadow: '0 0 60px rgba(255,107,43,0.5)',
                }}
              >
                META PYTORCH<br />
                <span style={{ color: 'var(--primary)', textShadow: '0 0 60px rgba(0,229,255,0.5)' }}>
                  × SCALER
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 font-mono text-sm tracking-[0.3em] text-muted-foreground uppercase">
                <span>GRAND FINALE</span>
                <span style={{ color: 'var(--primary)' }}>·</span>
                <span>FINALIST</span>
                <span style={{ color: 'var(--accent)' }}>·</span>
                <span>BANGALORE</span>
                <span style={{ color: 'var(--accent2)' }}>·</span>
                <span>APRIL 2025</span>
              </div>
            </div>
          )}
        </div>

        {/* ── HOLOGRAPHIC 3D TROPHY ── */}
        {phase === 'full' && (
          <div
            className="text-center mb-16 relative"
            style={{ animation: 'spotlight-reveal 0.8s ease forwards' }}
          >
            {/* Floating particles around trophy */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
                style={{
                  left: `${20 + i * 10}%`,
                  top: `${30 + Math.sin(i) * 20}%`,
                  background: ['#00E5FF', '#FF6B2B', '#A855F7'][i % 3],
                  animation: `float-particle ${2 + i * 0.3}s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                  zIndex: 15,
                }}
              />
            ))}

            {/* Trophy container */}
            <div
              style={{
                position: 'relative',
                width: '340px',
                height: '400px',
                margin: '0 auto',
                borderRadius: '16px',
                overflow: 'hidden',
                background: 'rgba(5,13,18,0.85)',
                border: '1px solid rgba(0,229,255,0.15)',
                cursor: 'grab',
              }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* BG stars canvas */}
              <canvas
                ref={bgCanvasRef}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                }}
              />
              {/* Trophy canvas */}
              <canvas
                ref={trophyCanvasRef}
                width={340}
                height={400}
                style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'block',
                  width: '100%',
                  height: '100%',
                }}
              />
              {/* Scanline overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.06) 2px,rgba(0,0,0,0.06) 4px)',
                  pointerEvents: 'none',
                  zIndex: 3,
                }}
              />
              {/* Drag hint */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontFamily: '"Courier New", monospace',
                  fontSize: '9px',
                  letterSpacing: '0.45em',
                  color: 'rgba(0,229,255,0.4)',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  zIndex: 4,
                  pointerEvents: 'none',
                }}
              >
                DRAG TO ROTATE
              </div>
            </div>
          </div>
        )}

        {/* Certification flip cards */}
        {phase === 'full' && (
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {[
              {
                org: 'Deloitte Australia',
                title: 'Data Analytics',
                platform: 'Forage Virtual Experience',
                date: 'July 2025',
                color: 'var(--primary)',
                back: 'Completed real-world data analytics simulation: data cleaning, dashboarding, and insight generation using industry-standard tooling.',
              },
              {
                org: 'Tata Group',
                title: 'Data Visualisation',
                platform: 'Forage Virtual Experience',
                date: 'July 2025',
                color: 'var(--accent)',
                back: 'Completed Tata Consultancy Services data visualisation programme: framing business problems, selecting chart types, and presenting insights to executive stakeholders.',
              },
            ].map((cert, i) => (
              <div key={i} className="cert-card" style={{ height: '180px' }}>
                <div className="cert-inner">
                  <div
                    className="cert-front terminal-window p-5 flex flex-col justify-between"
                    style={{ borderColor: cert.color }}
                  >
                    <div>
                      <div className="font-mono text-[9px] tracking-[0.4em] text-muted-foreground uppercase mb-1">
                        CERTIFICATION
                      </div>
                      <div className="font-display text-sm font-bold tracking-tight" style={{ color: cert.color }}>
                        {cert.org}
                      </div>
                      <div className="font-mono text-xs text-foreground mt-1">{cert.title}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-[9px] text-muted-foreground">{cert.platform}</div>
                      <div className="font-mono text-[9px] tracking-widest" style={{ color: cert.color }}>{cert.date}</div>
                    </div>
                    <div className="font-mono text-[8px] text-muted-foreground/40 tracking-widest uppercase mt-1">
                      HOVER TO FLIP
                    </div>
                  </div>
                  <div
                    className="cert-back terminal-window p-5 flex items-center justify-center"
                    style={{ borderColor: cert.color, background: `${cert.color}0A` }}
                  >
                    <p className="font-mono text-xs leading-relaxed text-center" style={{ color: 'var(--foreground)', opacity: 0.8 }}>
                      {cert.back}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}