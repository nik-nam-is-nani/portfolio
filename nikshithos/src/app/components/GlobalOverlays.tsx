'use client';
import React, { useEffect, useRef, useState } from 'react';

interface Props {
  scrollProgress: number;
  currentSection: string;
  idleOverlay: boolean;
}

export default function GlobalOverlays({ scrollProgress, currentSection }: Props) {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const ringPos = useRef({ x: 0, y: 0 });
  const mousePos = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top = `${e.clientY}px`;
      }
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animateRing = () => {
      ringPos.current.x = lerp(ringPos.current.x, mousePos.current.x, 0.12);
      ringPos.current.y = lerp(ringPos.current.y, mousePos.current.y, 0.12);
      if (ringRef.current) {
        ringRef.current.style.left = `${ringPos.current.x}px`;
        ringRef.current.style.top = `${ringPos.current.y}px`;
      }
      rafRef.current = requestAnimationFrame(animateRing);
    };

    const handleMouseEnterInteractive = () => setIsHovering(true);
    const handleMouseLeaveInteractive = () => setIsHovering(false);

    document.querySelectorAll('a, button, [data-interactive]').forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnterInteractive);
      el.addEventListener('mouseleave', handleMouseLeaveInteractive);
    });

    window.addEventListener('mousemove', handleMouseMove);
    rafRef.current = requestAnimationFrame(animateRing);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    let glitchTimer: ReturnType<typeof setTimeout>;
    const scheduleGlitch = () => {
      const delay = 8000 + Math.random() * 7000;
      glitchTimer = setTimeout(() => {
        const headings = document.querySelectorAll('.glitch-text');
        if (headings.length > 0) {
          const target = headings[Math.floor(Math.random() * headings.length)] as HTMLElement;
          target.classList.add('glitching');
          setTimeout(() => target.classList.remove('glitching'), 400);
        }
        scheduleGlitch();
      }, delay);
    };
    scheduleGlitch();
    return () => clearTimeout(glitchTimer);
  }, []);

  useEffect(() => {
    const handleNikshithTyping = (e: KeyboardEvent) => {
      const typed = sessionStorage.getItem('typed') || '';
      const newTyped = (typed + e.key).slice(-8);
      sessionStorage.setItem('typed', newTyped);
      if (newTyped.toLowerCase() === 'nikshith') {
        triggerConfetti();
        sessionStorage.setItem('typed', '');
      }
    };
    window.addEventListener('keydown', handleNikshithTyping);
    return () => window.removeEventListener('keydown', handleNikshithTyping);
  }, []);

  const triggerConfetti = () => {
    const colors = ['#00E5FF', '#FF6B2B', '#A855F7', '#ffffff'];
    for (let i = 0; i < 80; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-particle';
      el.style.cssText = `
        left: ${Math.random() * 100}vw;
        top: -10px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        width: ${4 + Math.random() * 6}px;
        height: ${4 + Math.random() * 6}px;
        animation-duration: ${2 + Math.random() * 3}s;
        animation-delay: ${Math.random() * 0.5}s;
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 5000);
    }
  };

  return (
    <>
      <div className="noise-overlay" />
      <div className="scanline-overlay" />
      <div
        className="scroll-progress-bar"
        style={{ height: `${scrollProgress}%` }}
      />
      <div
        ref={dotRef}
        className="custom-cursor-dot"
        style={{ transform: isHovering ? 'translate(-50%, -50%) scale(2)' : 'translate(-50%, -50%) scale(1)' }}
      />
      <div
        ref={ringRef}
        className="custom-cursor-ring"
        style={{
          width: isHovering ? '44px' : '28px',
          height: isHovering ? '44px' : '28px',
          borderColor: isHovering ? 'var(--accent)' : 'var(--primary)',
        }}
      />
      <div
        className="section-label"
        style={{ top: '50%', paddingLeft: '12px' }}
      >
        {currentSection}
      </div>
    </>
  );
}