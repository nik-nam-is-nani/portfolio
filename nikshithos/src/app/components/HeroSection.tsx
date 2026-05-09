'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';

const ROLES = [
  'AI/ML Engineer',
  'Multi-Agent RL Builder',
  'PyTorch Hacker',
  'LLM Fine-Tuner',
  'Emergency Response AI Builder',
];

const TICKER_TECHS = [
  'PyTorch', 'Python', 'Reinforcement Learning', 'LLM Fine-Tuning', 'GRPO',
  'Qwen2.5', 'React', 'Next.js', 'Flask', 'FastAPI', 'PostgreSQL', 'MongoDB',
  'Docker', 'Git', 'CARLA', 'OpenCV', 'Pandas', 'NumPy', 'Matplotlib',
  'Transformers', 'HuggingFace', 'LangChain', 'SQL', 'JavaScript', 'TypeScript',
  'TailwindCSS', 'Linux', 'CUDA', 'TensorFlow', 'Scikit-Learn', 'Ray RLlib',
];

interface Node {
  x: number; y: number;
  vx: number; vy: number;
  radius: number;
  color: string;
  pulse: number;
  pulseSpeed: number;
}

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const icosphereCanvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const nodesRef = useRef<Node[]>([]);
  const rafRef = useRef<number>(0);
  const icosphereRafRef = useRef<number>(0);
  const rotationRef = useRef({ x: 0.3, y: 0 });
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const icoRotVelRef = useRef({ x: 0, y: 0.003 });
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayedRole, setDisplayedRole] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [clock, setClock] = useState('');
  const [stats, setStats] = useState({ parse: 0, agents: 0 });
  const [showIcoTooltip, setShowIcoTooltip] = useState(false);
  const [tickerTooltip, setTickerTooltip] = useState<{ text: string; x: number; visible: boolean }>({ text: '', x: 0, visible: false });

  // IST Clock
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const ist = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      const h = ist.getUTCHours().toString().padStart(2, '0');
      const m = ist.getUTCMinutes().toString().padStart(2, '0');
      const s = ist.getUTCSeconds().toString().padStart(2, '0');
      setClock(`${h}:${m}:${s} IST`);
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);

  // Stat counters
  useEffect(() => {
    let frame = 0;
    const iv = setInterval(() => {
      frame++;
      if (frame <= 60) {
        setStats({
          parse: parseFloat((frame * 1.643).toFixed(1)),
          agents: Math.min(4, Math.floor(frame / 15)),
        });
      } else {
        setStats({ parse: 98.6, agents: 4 });
        clearInterval(iv);
      }
    }, 30);
    return () => clearInterval(iv);
  }, []);

  // Typewriter
  useEffect(() => {
    const current = ROLES[roleIndex];
    let timeout: ReturnType<typeof setTimeout>;
    if (!isDeleting) {
      if (displayedRole.length < current.length) {
        timeout = setTimeout(() => setDisplayedRole(current.slice(0, displayedRole.length + 1)), 80);
      } else {
        timeout = setTimeout(() => setIsDeleting(true), 2000);
      }
    } else {
      if (displayedRole.length > 0) {
        timeout = setTimeout(() => setDisplayedRole(displayedRole.slice(0, -1)), 40);
      } else {
        setIsDeleting(false);
        setRoleIndex(prev => (prev + 1) % ROLES.length);
      }
    }
    return () => clearTimeout(timeout);
  }, [displayedRole, isDeleting, roleIndex]);

  // Neural network canvas
  const initNodes = useCallback((canvas: HTMLCanvasElement) => {
    const colors = ['#00E5FF', '#FF6B2B', '#A855F7'];
    nodesRef.current = Array.from({ length: 85 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: 2 + Math.random() * 3,
      color: colors[Math.floor(Math.random() * 3)],
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.03,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initNodes(canvas);
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const ripples: { x: number; y: number; r: number; maxR: number; alpha: number }[] = [];
      ripples.push({ x: cx, y: cy, r: 0, maxR: 120, alpha: 0.8 });
      const rippleAnim = () => {
        ripples.forEach((rip, i) => {
          rip.r += 3;
          rip.alpha -= 0.015;
          if (rip.alpha <= 0) ripples.splice(i, 1);
        });
        if (ripples.length > 0) requestAnimationFrame(rippleAnim);
      };
      requestAnimationFrame(rippleAnim);
    };
    canvas.addEventListener('click', handleClick);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const nodes = nodesRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      nodes.forEach(n => {
        n.pulse += n.pulseSpeed;
        const dx = mx - n.x;
        const dy = my - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          n.vx += (dx / dist) * 0.08;
          n.vy += (dy / dist) * 0.08;
        }
        const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (speed > 2) { n.vx = (n.vx / speed) * 2; n.vy = (n.vy / speed) * 2; }
        n.vx *= 0.99;
        n.vy *= 0.99;
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0) n.x = canvas.width;
        if (n.x > canvas.width) n.x = 0;
        if (n.y < 0) n.y = canvas.height;
        if (n.y > canvas.height) n.y = 0;
      });

      nodes.forEach((a, i) => {
        nodes.slice(i + 1).forEach(b => {
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            const alpha = (1 - d / 100) * 0.35;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(0,229,255,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      nodes.forEach(n => {
        const pr = n.radius + Math.sin(n.pulse) * 1.5;
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, pr * 3);
        const hex = n.color;
        grad.addColorStop(0, hex + 'FF');
        grad.addColorStop(0.5, hex + '88');
        grad.addColorStop(1, hex + '00');
        ctx.beginPath();
        ctx.arc(n.x, n.y, pr * 3, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(n.x, n.y, pr, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [initNodes]);

  // Icosphere
  useEffect(() => {
    const canvas = icosphereCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width = 240;
    const H = canvas.height = 240;

    const phi = (1 + Math.sqrt(5)) / 2;
    const icoVerts: [number, number, number][] = [
      [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
      [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
      [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1],
    ].map(([x, y, z]) => {
      const len = Math.sqrt(x * x + y * y + z * z);
      return [x / len, y / len, z / len];
    });

    const icoFaces = [
      [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
      [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
      [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
      [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1],
    ];

    const rotX = (v: [number,number,number], a: number): [number,number,number] => [
      v[0], v[1] * Math.cos(a) - v[2] * Math.sin(a), v[1] * Math.sin(a) + v[2] * Math.cos(a)
    ];
    const rotY = (v: [number,number,number], a: number): [number,number,number] => [
      v[0] * Math.cos(a) + v[2] * Math.sin(a), v[1], -v[0] * Math.sin(a) + v[2] * Math.cos(a)
    ];

    const project = (v: [number,number,number]) => {
      const z = v[2] + 2.5;
      const fov = 200;
      return { x: W / 2 + (v[0] * fov) / z, y: H / 2 + (v[1] * fov) / z, z: v[2] };
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      if (!isDraggingRef.current) {
        rotationRef.current.x += icoRotVelRef.current.x;
        rotationRef.current.y += icoRotVelRef.current.y;
        icoRotVelRef.current.x *= 0.99;
      }

      const rx = rotationRef.current.x;
      const ry = rotationRef.current.y;
      const transformed = icoVerts.map(v => rotY(rotX(v, rx), ry));
      const projected = transformed.map(project);

      const facesWithDepth = icoFaces.map(f => ({
        indices: f,
        depth: (transformed[f[0]][2] + transformed[f[1]][2] + transformed[f[2]][2]) / 3,
      })).sort((a, b) => a.depth - b.depth);

      facesWithDepth.forEach(({ indices, depth }) => {
        const [a, b, c] = indices.map(i => projected[i]);
        const t = (depth + 1) / 2;
        const alpha = 0.08 + t * 0.18;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(c.x, c.y);
        ctx.closePath();
        ctx.fillStyle = `rgba(0,229,255,${alpha})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(0,229,255,${0.3 + t * 0.4})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      // Center glow
      const centerGrad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, 30);
      centerGrad.addColorStop(0, 'rgba(168,85,247,0.6)');
      centerGrad.addColorStop(1, 'rgba(168,85,247,0)');
      ctx.beginPath();
      ctx.arc(W/2, H/2, 30, 0, Math.PI * 2);
      ctx.fillStyle = centerGrad;
      ctx.fill();

      icosphereRafRef.current = requestAnimationFrame(draw);
    };
    draw();

    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      icoRotVelRef.current.y = dx * 0.01;
      icoRotVelRef.current.x = dy * 0.01;
      rotationRef.current.y += dx * 0.01;
      rotationRef.current.x += dy * 0.01;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseUp = () => { isDraggingRef.current = false; };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      cancelAnimationFrame(icosphereRafRef.current);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const tickerContent = [...TICKER_TECHS, ...TICKER_TECHS];

  return (
    <section id="hero" className="relative w-full min-h-screen overflow-hidden" style={{ background: 'var(--background)' }}>
      {/* Neural Network Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.55 }}
      />

      {/* Ambient gradient overlays */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 60% at 30% 50%, rgba(0,229,255,0.04) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 70% 30%, rgba(168,85,247,0.04) 0%, transparent 70%)'
      }} />

      {/* Main content */}
      <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 pt-32 pb-20 min-h-screen flex flex-col justify-center">
        <div className="grid lg:grid-cols-12 gap-8 items-center">

          {/* LEFT PANEL */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.4em] text-muted-foreground uppercase">
              <span className="w-8 h-px" style={{ background: 'var(--primary)' }} />
              <span>IDENTITY CARD // AI ENGINEER</span>
            </div>

            <div className="relative">
              <h1
                className="hero-title-main text-foreground glitch-text"
                data-text="NIKSHITH"
                onTripleClickCapture={() => {
                  const el = document.createElement('div');
                  el.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:99999;font-family:var(--font-display);font-size:1.5rem;color:var(--primary);background:rgba(3,3,3,0.95);border:1px solid var(--primary);padding:1.5rem 3rem;letter-spacing:0.3em;pointer-events:none;';
                  el.textContent = 'IDENTITY CONFIRMED';
                  document.body.appendChild(el);
                  setTimeout(() => el.remove(), 2000);
                }}
              >
                NIKSHITH
              </h1>
              {/* Scanline effect over name */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20" style={{
                background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,229,255,0.15) 3px, rgba(0,229,255,0.15) 4px)'
              }} />
            </div>

            <div className="font-mono text-lg md:text-2xl tracking-widest" style={{ color: 'var(--accent)' }}>
              &gt; <span style={{ color: 'var(--primary)' }}>{displayedRole}</span>
              <span className="inline-block w-0.5 h-6 ml-0.5 align-middle" style={{ background: 'var(--primary)', animation: 'typewriter-blink 1s step-end infinite' }} />
            </div>

            <div className="flex items-center gap-3 font-mono text-sm" style={{ color: 'var(--muted-foreground)' }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--primary)' }} />
              <span>{clock}</span>
              <span className="opacity-40">|</span>
              <span>Kurnool, AP, India</span>
            </div>

            {/* Stat counters */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="terminal-window p-4 space-y-1">
                <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">JSON Parse Rate</div>
                <div className="font-display text-3xl font-bold" style={{ color: 'var(--primary)' }}>
                  {stats.parse.toFixed(1)}%
                </div>
                <div className="font-mono text-[9px] text-muted-foreground/60 tracking-widest">CRISIS TRIAGE ARENA</div>
              </div>
              <div className="terminal-window p-4 space-y-1">
                <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">Agents Coordinated</div>
                <div className="font-display text-3xl font-bold" style={{ color: 'var(--accent)' }}>
                  {stats.agents}
                </div>
                <div className="font-mono text-[9px] text-muted-foreground/60 tracking-widest">MULTI-AGENT SYSTEM</div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <a
                href="#projects"
                className="font-mono text-xs tracking-[0.3em] uppercase px-6 py-3 border transition-all duration-300 hover:bg-primary hover:text-background"
                style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
              >
                VIEW MISSIONS
              </a>
              <a
                href="#contact"
                className="font-mono text-xs tracking-[0.3em] uppercase px-6 py-3 border transition-all duration-300 hover:bg-accent hover:text-background"
                style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
              >
                OPEN CHANNEL
              </a>
            </div>
          </div>

          {/* RIGHT PANEL — Icosphere */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center gap-4">
            <div
              className="relative cursor-grab active:cursor-grabbing"
              onMouseEnter={() => setShowIcoTooltip(true)}
              onMouseLeave={() => setShowIcoTooltip(false)}
            >
              <canvas
                ref={icosphereCanvasRef}
                width={240}
                height={240}
                className="select-none"
                style={{ filter: 'drop-shadow(0 0 30px rgba(0,229,255,0.4))' }}
              />
              {showIcoTooltip && (
                <div className="node-tooltip absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full -mt-2">
                  MULTI-AGENT CORE
                </div>
              )}
            </div>
            <div className="font-mono text-[10px] tracking-[0.4em] text-muted-foreground uppercase text-center">
              DRAG TO ROTATE
            </div>
            <div className="terminal-window px-4 py-3 text-center">
              <div className="font-mono text-[10px] tracking-widest text-muted-foreground">META PYTORCH × SCALER</div>
              <div className="font-display text-xs font-bold tracking-widest mt-1" style={{ color: 'var(--accent)' }}>
                GRAND FINALE FINALIST
              </div>
              <div className="font-mono text-[9px] tracking-widest text-muted-foreground/60 mt-0.5">
                BANGALORE · APRIL 2025
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ticker bar */}
      <div className="absolute bottom-0 left-0 right-0 border-t overflow-hidden py-3" style={{ borderColor: 'rgba(0,229,255,0.15)', background: 'rgba(3,3,3,0.85)' }}>
        <div className="relative">
          <div className="ticker-track">
            {tickerContent.map((tech, i) => (
              <span
                key={i}
                className="font-mono text-[10px] tracking-[0.3em] uppercase px-8 transition-colors duration-200 hover:cursor-default"
                style={{ color: i % 3 === 0 ? 'var(--primary)' : i % 3 === 1 ? 'var(--accent)' : 'var(--accent2)', opacity: 0.7 }}
                onMouseEnter={(e) => {
                  const rect = (e.target as HTMLElement).getBoundingClientRect();
                  setTickerTooltip({ text: tech, x: rect.left, visible: true });
                }}
                onMouseLeave={() => setTickerTooltip(prev => ({ ...prev, visible: false }))}
              >
                {tech}
                <span className="mx-6 opacity-20">·</span>
              </span>
            ))}
          </div>
          {tickerTooltip.visible && (
            <div
              className="node-tooltip fixed"
              style={{ left: tickerTooltip.x, bottom: 60, zIndex: 500 }}
            >
              {tickerTooltip.text}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}