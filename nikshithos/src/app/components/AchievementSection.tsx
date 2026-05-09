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

export default function AchievementSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'idle' | 'dark' | 'spotlight' | 'slam' | 'confetti' | 'full'>('idle');
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const confettiRafRef = useRef<number>(0);
  const hasTriggered = useRef(false);

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

  return (
    <section
      id="achievement"
      ref={sectionRef}
      className="py-20 px-6 md:px-12 relative overflow-hidden"
      style={{
        background: phase === 'idle' ? 'var(--background)' : 'var(--background)',
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
          <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight text-foreground glitch-text" data-text="ACHIEVEMENT">
            ACHIEVEMENT
          </h2>
        </div>

        {/* Main achievement */}
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

        {/* ASCII Trophy + floating particles */}
        {(phase === 'full') && (
          <div className="text-center mb-16">
            <pre
              className="font-mono text-xs leading-tight inline-block"
              style={{ color: 'var(--accent)', opacity: 0.8, animation: 'spotlight-reveal 0.8s ease forwards' }}
            >
{`    ___________
   '._==_==_=_.'
   .-\\:      /-.
  | (|:.     |) |
   '-|:.     |-'
     \\::.    /
      '::. .'
        ) (
      _.''._ '-------'`}
            </pre>
            <div className="font-mono text-[10px] tracking-widest text-muted-foreground mt-2 uppercase">
              GRAND FINALE TROPHY
            </div>

            {/* Floating particles */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
                style={{
                  left: `${20 + i * 10}%`,
                  top: `${30 + Math.sin(i) * 20}%`,
                  background: ['#00E5FF','#FF6B2B','#A855F7'][i % 3],
                  animation: `float-particle ${2 + i * 0.3}s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                  zIndex: 15,
                }}
              />
            ))}
          </div>
        )}

        {/* Certification flip cards */}
        {(phase === 'full') && (
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
                  {/* Front */}
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
                  {/* Back */}
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