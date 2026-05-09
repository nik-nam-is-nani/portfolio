'use client';
import React, { useEffect, useRef, useState } from 'react';

const AMBIENT_MESSAGES = [
  '> Scanning for incoming transmissions...',
  '> Signal strength: STRONG',
  '> Encryption: AES-256 active',
  '> Uplink established via GitHub relay...',
  '> Ready to receive. Awaiting your signal.',
  '> Neural handshake protocol: READY',
  '> Multi-agent comm bus: ONLINE',
];

const CONTACT_CHANNELS = [
  {
    id: 'github',
    label: 'GitHub',
    handle: 'nikshithkyathrigi',
    url: 'https://github.com/nik-nam-is-nani',
    color: '#00E5FF',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
    desc: 'Source code & projects',
  },
  {
    id: 'huggingface',
    label: 'HuggingFace',
    handle: 'nikshith',
    url: 'https://huggingface.co/nik0name0is0nani',
    color: '#FF6B2B',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l7 4.5-7 4.5z"/>
      </svg>
    ),
    desc: 'ML models & datasets',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    handle: 'nikshith-kyatherigi',
    url: 'https://www.linkedin.com/in/k-nikshith-b4b8b42ba/',
    color: '#A855F7',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
      </svg>
    ),
    desc: 'Professional network',
  },
  {
    id: 'email',
    label: 'Email',
    handle: 'nikshithkyathrigi2005@gmail.com',
    url: 'mailto:nikshithkyathrigi2005@gmail.com',
    color: '#22C55E',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
      </svg>
    ),
    desc: 'Direct transmission',
  },
];

export default function ContactSection() {
  const [ambientIndex, setAmbientIndex] = useState(0);
  const [ambientText, setAmbientText] = useState('');
  const [isTypingAmbient, setIsTypingAmbient] = useState(true);
  const [signalStrength, setSignalStrength] = useState(0);
  const [hoveredChannel, setHoveredChannel] = useState<string | null>(null);
  const radarCanvasRef = useRef<HTMLCanvasElement>(null);
  const radarRafRef = useRef<number>(0);
  const radarAngleRef = useRef(0);

  // Ambient typewriter
  useEffect(() => {
    const msg = AMBIENT_MESSAGES[ambientIndex % AMBIENT_MESSAGES.length];
    let i = 0;
    setAmbientText('');
    setIsTypingAmbient(true);
    const iv = setInterval(() => {
      if (i <= msg.length) {
        setAmbientText(msg.slice(0, i));
        i++;
      } else {
        clearInterval(iv);
        setIsTypingAmbient(false);
        setTimeout(() => setAmbientIndex(prev => prev + 1), 2500);
      }
    }, 40);
    return () => clearInterval(iv);
  }, [ambientIndex]);

  // Signal strength
  useEffect(() => {
    const iv = setInterval(() => {
      setSignalStrength(prev => {
        const next = prev + (Math.random() - 0.3) * 15;
        return Math.max(60, Math.min(100, next));
      });
    }, 800);
    return () => clearInterval(iv);
  }, []);

  // Radar canvas
  useEffect(() => {
    const canvas = radarCanvasRef.current;
    if (!canvas) return;
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext('2d')!;
    const cx = W / 2, cy = H / 2;
    const maxR = Math.min(W, H) * 0.42;

    const blips: { angle: number; r: number; alpha: number; color: string }[] = [];
    const addBlip = () => {
      blips.push({
        angle: radarAngleRef.current,
        r: maxR * (0.3 + Math.random() * 0.6),
        alpha: 1,
        color: ['#00E5FF', '#FF6B2B', '#A855F7', '#22C55E'][Math.floor(Math.random() * 4)],
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      radarAngleRef.current += 0.025;

      // Grid rings
      for (let ring = 1; ring <= 4; ring++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (maxR / 4) * ring, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,229,255,0.1)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Cross lines
      ctx.beginPath();
      ctx.moveTo(cx - maxR, cy); ctx.lineTo(cx + maxR, cy);
      ctx.moveTo(cx, cy - maxR); ctx.lineTo(cx, cy + maxR);
      ctx.strokeStyle = 'rgba(0,229,255,0.08)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Sweep
      const sweepGrad = ctx.createConicGradient
        ? ctx.createConicGradient(radarAngleRef.current, cx, cy)
        : null;

      if (!sweepGrad) {
        const angle = radarAngleRef.current;
        for (let a = 0; a < Math.PI / 2; a += 0.02) {
          const alpha = (1 - a / (Math.PI / 2)) * 0.3;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, maxR, angle - a, angle - a + 0.02);
          ctx.closePath();
          ctx.fillStyle = `rgba(0,229,255,${alpha})`;
          ctx.fill();
        }
      }

      // Sweep line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(
        cx + Math.cos(radarAngleRef.current) * maxR,
        cy + Math.sin(radarAngleRef.current) * maxR
      );
      ctx.strokeStyle = 'rgba(0,229,255,0.8)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Add blip occasionally
      if (Math.random() < 0.03) addBlip();

      // Draw blips
      blips.forEach((b, i) => {
        b.alpha -= 0.008;
        if (b.alpha <= 0) { blips.splice(i, 1); return; }
        const bx = cx + Math.cos(b.angle) * b.r;
        const by = cy + Math.sin(b.angle) * b.r;
        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, 6);
        grad.addColorStop(0, b.color + Math.round(b.alpha * 255).toString(16).padStart(2,'0'));
        grad.addColorStop(1, b.color + '00');
        ctx.beginPath();
        ctx.arc(bx, by, 6, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      radarRafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => cancelAnimationFrame(radarRafRef.current);
  }, []);

  return (
    <section id="contact" className="py-20 px-6 md:px-12 relative" style={{ background: 'var(--background)' }}>
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <span className="font-mono text-[10px] tracking-[0.4em] text-muted-foreground uppercase">06 //</span>
          <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight text-foreground glitch-text" data-text="> OPEN CHANNEL">
            &gt; OPEN CHANNEL
          </h2>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left: Radar + info */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Radar */}
            <div className="terminal-window p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">SIGNAL RADAR</span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--primary)' }} />
                  <span className="font-mono text-[9px] text-primary tracking-widest">LIVE</span>
                </div>
              </div>
              <canvas
                ref={radarCanvasRef}
                className="w-full"
                style={{ height: '220px' }}
              />
            </div>

            {/* Location */}
            <div className="terminal-window p-4 space-y-3">
              <div className="font-mono text-[10px] tracking-[0.4em] text-muted-foreground uppercase">LOCATION DATA</div>
              <div className="flex items-center gap-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <div>
                  <div className="font-mono text-sm text-foreground">Kurnool, Andhra Pradesh</div>
                  <div className="font-mono text-[10px] text-muted-foreground">India · IST (UTC+5:30)</div>
                </div>
              </div>

              {/* Signal strength */}
              <div className="space-y-1.5 pt-2 border-t border-muted">
                <div className="flex justify-between">
                  <span className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">Signal Strength</span>
                  <span className="font-mono text-[9px]" style={{ color: 'var(--primary)' }}>{Math.round(signalStrength)}%</span>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${signalStrength}%`,
                      background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                    }}
                  />
                </div>
                <div className="signal-bar justify-start gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="signal-bar-item"
                      style={{
                        height: `${6 + i * 3}px`,
                        animationDelay: `${i * 0.2}s`,
                        opacity: signalStrength > i * 20 ? 1 : 0.15,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Ambient typewriter */}
            <div className="terminal-window px-4 py-3">
              <div className="font-mono text-xs" style={{ color: 'var(--primary)', minHeight: '20px' }}>
                {ambientText}
                {isTypingAmbient && (
                  <span className="inline-block w-0.5 h-3.5 ml-0.5 align-middle" style={{ background: 'var(--primary)', animation: 'typewriter-blink 0.7s step-end infinite' }} />
                )}
              </div>
            </div>
          </div>

          {/* Right: Contact channels */}
          <div className="lg:col-span-7 flex flex-col gap-4 justify-center">
            <div className="font-mono text-[10px] tracking-[0.4em] text-muted-foreground uppercase mb-2">
              TRANSMISSION CHANNELS
            </div>

            {CONTACT_CHANNELS.map((ch) => (
              <a
                key={ch.id}
                href={ch.url}
                target={ch.id !== 'email' ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="group flex items-center gap-4 p-4 border transition-all duration-300"
                style={{
                  borderColor: hoveredChannel === ch.id ? ch.color : 'var(--muted)',
                  background: hoveredChannel === ch.id ? `${ch.color}08` : 'var(--card)',
                  boxShadow: hoveredChannel === ch.id ? `0 0 20px ${ch.color}22` : 'none',
                }}
                onMouseEnter={() => setHoveredChannel(ch.id)}
                onMouseLeave={() => setHoveredChannel(null)}
              >
                {/* Radar ping dot */}
                <div
                  className="relative flex-shrink-0 w-10 h-10 flex items-center justify-center"
                  style={{ color: ch.color }}
                >
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: `1px solid ${ch.color}`,
                      animation: hoveredChannel === ch.id ? 'radar-pulse 1.5s ease-out infinite' : 'none',
                    }}
                  />
                  {ch.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold tracking-wider" style={{ color: ch.color }}>
                      {ch.label}
                    </span>
                    <span className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">
                      {ch.desc}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-muted-foreground truncate mt-0.5">
                    {ch.handle}
                  </div>
                </div>

                <div
                  className="flex-shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                  style={{ color: ch.color, opacity: hoveredChannel === ch.id ? 1 : 0.3 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M7 17L17 7M7 7h10v10"/>
                  </svg>
                </div>
              </a>
            ))}

            {/* CTA */}
            <div className="mt-4 terminal-window p-5 text-center">
              <div className="font-mono text-[10px] tracking-[0.4em] text-muted-foreground uppercase mb-3">
                DIRECT TRANSMISSION
              </div>
              <a
                href="mailto:nikshithkyathrigi2005@gmail.com"
                className="inline-flex items-center gap-3 font-mono text-xs tracking-[0.3em] uppercase px-8 py-3 border transition-all duration-300 hover:bg-primary hover:text-background group"
                style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
              >
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--primary)' }} />
                SEND MESSAGE
                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  <path d="M5 12h14m-7-7l7 7-7 7"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
