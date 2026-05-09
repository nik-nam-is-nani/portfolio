'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import BootSequence from './BootSequence';
import HeroSection from './HeroSection';
import AboutSection from './AboutSection';
import ProjectsSection from './ProjectsSection';
import SkillsSection from './SkillsSection';
import AchievementSection from './AchievementSection';
import ContactSection from './ContactSection';
import GlobalOverlays from './GlobalOverlays';
import AppLogo from '@/components/ui/AppLogo';

export default function NikshithOSClient() {
  const [bootDone, setBootDone] = useState(false);
  const [vhsActive, setVhsActive] = useState(false);
  const [currentSection, setCurrentSection] = useState('BOOT');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [tabTitle, setTabTitle] = useState(true);
  const [idleOverlay, setIdleOverlay] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const konamiSeq = useRef<string[]>([]);
  const konamiCode = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

  const handleBootComplete = useCallback(() => {
    setVhsActive(true);
    setTimeout(() => {
      setVhsActive(false);
      setBootDone(true);
    }, 700);
  }, []);

  useEffect(() => {
    if (!bootDone) return;
    const titles = ['NikshithOS v1.0', '> AI/ML Engineer', '> PyTorch Hacker', '> RL Builder'];
    let idx = 0;
    const iv = setInterval(() => {
      idx = (idx + 1) % titles.length;
      setTabTitle(prev => !prev);
      document.title = titles[idx];
    }, 3000);
    return () => clearInterval(iv);
  }, [bootDone]);

  useEffect(() => {
    if (!bootDone) return;
    const handleScroll = () => {
      const el = document.documentElement;
      const prog = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setScrollProgress(prog);

      const sections = ['hero','about','projects','skills','achievement','contact'];
      for (const id of sections) {
        const el2 = document.getElementById(id);
        if (el2) {
          const rect = el2.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setCurrentSection(id.toUpperCase());
            break;
          }
        }
      }

      resetIdle();
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [bootDone]);

  const resetIdle = useCallback(() => {
    setIdleOverlay(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIdleOverlay(true), 30000);
  }, []);

  useEffect(() => {
    if (!bootDone) return;
    const events = ['mousemove','keydown','click','touchstart'];
    events.forEach(e => window.addEventListener(e, resetIdle, { passive: true }));
    resetIdle();
    return () => events.forEach(e => window.removeEventListener(e, resetIdle));
  }, [bootDone, resetIdle]);

  useEffect(() => {
    if (!bootDone) return;
    const handleKeydown = (e: KeyboardEvent) => {
      konamiSeq.current.push(e.key);
      if (konamiSeq.current.length > 10) konamiSeq.current.shift();
      if (JSON.stringify(konamiSeq.current) === JSON.stringify(konamiCode)) {
        triggerMatrixRain();
        konamiSeq.current = [];
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [bootDone]);

  const triggerMatrixRain = () => {
    const existing = document.getElementById('matrix-overlay');
    if (existing) return;
    const div = document.createElement('div');
    div.id = 'matrix-overlay';
    div.style.cssText = 'position:fixed;inset:0;z-index:99990;pointer-events:none;overflow:hidden;background:rgba(0,0,0,0.85);';
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.cssText = 'position:absolute;inset:0;';
    div.appendChild(canvas);
    document.body.appendChild(div);
    const ctx = canvas.getContext('2d')!;
    const cols = Math.floor(canvas.width / 16);
    const drops = Array(cols).fill(1);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()ｱｲｳｴｵｶｷｸｹｺ';
    const iv = setInterval(() => {
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle = '#00E5FF';
      ctx.font = '14px JetBrains Mono, monospace';
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * 16, y * 16);
        if (y * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    }, 33);
    setTimeout(() => { clearInterval(iv); div.remove(); }, 5000);
  };

  return (
    <>
      {!bootDone && <BootSequence onComplete={handleBootComplete} />}
      {vhsActive && <div className="vhs-transition" />}
      {bootDone && (
        <>
          <GlobalOverlays scrollProgress={scrollProgress} currentSection={currentSection} idleOverlay={idleOverlay} />
          <nav className="fixed top-0 left-0 right-0 z-[9000] flex items-center justify-between px-6 py-4" style={{ background: 'linear-gradient(to bottom, rgba(3,3,3,0.95) 0%, transparent 100%)' }}>
            <div className="flex items-center gap-3">
              <AppLogo size={28} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
              <span className="font-display text-sm font-bold tracking-widest text-primary hidden sm:block">NIKSHITH<span className="text-foreground/40">OS</span></span>
            </div>
            <div className="hidden md:flex items-center gap-8 font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
              {['hero','about','projects','skills','achievement','contact'].map(s => (
                <a key={s} href={`#${s}`} className="hover:text-primary transition-colors duration-300 relative group">
                  {s}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
            </div>
            <div className="font-mono text-[10px] text-primary/60 tracking-widest hidden sm:block">
              [{currentSection}]
            </div>
          </nav>
          <main>
            <HeroSection />
            <AboutSection />
            <ProjectsSection />
            <SkillsSection />
            <AchievementSection />
            <ContactSection />
          </main>
          <footer className="border-t border-muted py-8 px-6">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <AppLogo size={20} />
                <span className="font-mono text-[11px] text-muted-foreground tracking-widest">NIKSHITH_OS © 2026</span>
              </div>
              <div className="flex items-center gap-6 font-mono text-[11px] text-muted-foreground">
                <a href="https://github.com/nik-nam-is-nani" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">GitHub</a>
                <a href="mailto:nikshithkyathrigi2005@gmail.com" className="hover:text-primary transition-colors">Email</a>
                <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                <a href="#" className="hover:text-primary transition-colors">Terms</a>
              </div>
            </div>
          </footer>
          {idleOverlay && (
            <div className="fixed inset-0 z-[9500] pointer-events-none flex items-center justify-center">
              <div className="font-display text-2xl text-primary/30 tracking-[0.5em] uppercase idle-pulse">
                // SYSTEM IDLE //
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}