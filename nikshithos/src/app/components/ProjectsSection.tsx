'use client';
import React, { useRef, useState, useEffect } from 'react';

interface Project {
  id: number;
  codename: string;
  title: string;
  status: 'ACTIVE' | 'COMPLETE' | 'FINALIST';
  clearance: string;
  description: string;
  tech: string[];
  progress: number;
  github: string;
  highlight?: string;
}

const PROJECTS: Project[] = [
  {
    id: 1,
    codename: 'URBAN-MCI-001',
    title: 'Urban MCI Command Center',
    status: 'FINALIST',
    clearance: 'TOP SECRET',
    description: 'Multi-agent RL environment for mass casualty incident response. Meta PyTorch × Scaler Grand Finale project. React dashboard with real-time triage visualization, resource allocation, and 4-agent coordination.',
    tech: ['PyTorch', 'React', 'RL', 'Python', 'Meta'],
    progress: 0.92,
    github: 'https://github.com/nik-nam-is-nani/Urban-MCI-Command-Center',
    highlight: 'META PYTORCH × SCALER FINALIST',
  },
  {
    id: 2,
    codename: 'CRISIS-TRIAGE-002',
    title: 'Crisis Triage Arena',
    status: 'ACTIVE',
    clearance: 'SECRET',
    description: '4-agent GRPO fine-tuning system using Qwen2.5-7B. Achieves 98.6% JSON parse rate across coordinated emergency response agents. Specialized roles: Triage, Dispatch, Resource, Comms.',
    tech: ['GRPO', 'Qwen2.5', 'HuggingFace', 'Python', 'Ray'],
    progress: 0.986,
    github: 'https://github.com/nik-nam-is-nani/CRISIS-TRIAGE-ARENA',
    highlight: '98.6% JSON PARSE RATE',
  },
  {
    id: 3,
    codename: 'SQL-STUDIO-003',
    title: 'AI SQL Studio',
    status: 'COMPLETE',
    clearance: 'CONFIDENTIAL',
    description: 'Natural language to SQL query generator with Chart.js visualization layer. Flask backend, React frontend. Handles complex joins, aggregations, and generates interactive charts from query results.',
    tech: ['Flask', 'React', 'SQL', 'Chart.js', 'Python'],
    progress: 1.0,
    github: 'https://github.com/nik-nam-is-nani/ai-query-engine',
  },
  {
    id: 4,
    codename: 'CARLA-SIM-004',
    title: 'Self-Driving Car Simulation',
    status: 'COMPLETE',
    clearance: 'CONFIDENTIAL',
    description: 'Autonomous vehicle navigation in CARLA simulator. CNN for visual perception, LiDAR point cloud processing, behavior cloning from expert demonstrations. Achieves collision-free highway driving.',
    tech: ['CARLA', 'CNN', 'LiDAR', 'Python', 'OpenCV'],
    progress: 0.87,
    github: 'https://github.com/nik-nam-is-nani/car_simulation_carla',
  },
  {
    id: 5,
    codename: 'DATA-ANALYZER-005',
    title: 'Data Analyzer Tool',
    status: 'COMPLETE',
    clearance: 'UNCLASSIFIED',
    description: 'Full-featured data analysis suite with automated EDA, statistical testing, and visualization generation. Pandas + Matplotlib + Seaborn pipeline with one-click report export.',
    tech: ['Pandas', 'Matplotlib', 'Seaborn', 'Python', 'NumPy'],
    progress: 0.95,
    github: 'https://github.com/nik-nam-is-nani/data_analyser',
  },
];

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#00E5FF',
  COMPLETE: '#A855F7',
  FINALIST: '#FF6B2B',
};

function ProjectCard({ project }: { project: Project }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [typewriterText, setTypewriterText] = useState('');
  const typewriterRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isHovered) {
      let i = 0;
      const type = () => {
        if (i <= project.description.length) {
          setTypewriterText(project.description.slice(0, i));
          i++;
          typewriterRef.current = setTimeout(type, 12);
        }
      };
      type();
    } else {
      if (typewriterRef.current) clearTimeout(typewriterRef.current);
      setTypewriterText('');
    }
    return () => { if (typewriterRef.current) clearTimeout(typewriterRef.current); };
  }, [isHovered, project.description]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setTilt({
      x: ((e.clientY - cy) / rect.height) * 10,
      y: ((e.clientX - cx) / rect.width) * -10,
    });
  };

  return (
    <div
      ref={cardRef}
      className="classified-card relative border overflow-hidden"
      style={{
        borderColor: isHovered ? STATUS_COLORS[project.status] : 'var(--muted)',
        background: 'var(--card)',
        transform: isHovered ? `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(8px)` : 'perspective(800px) rotateX(0) rotateY(0) translateZ(0)',
        transition: 'transform 0.15s ease, border-color 0.3s ease',
        boxShadow: isHovered ? `0 20px 60px ${STATUS_COLORS[project.status]}22, 0 0 0 1px ${STATUS_COLORS[project.status]}44` : 'none',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setTilt({ x: 0, y: 0 }); }}
      onMouseMove={handleMouseMove}
    >
      {/* CLASSIFIED overlay */}
      <div
        className="classified-overlay absolute inset-0 z-20 flex flex-col items-center justify-center gap-4"
        style={{
          background: 'rgba(3,3,3,0.92)',
          backdropFilter: 'blur(8px)',
          opacity: isHovered ? 0 : 1,
          transition: 'opacity 0.5s ease',
          pointerEvents: isHovered ? 'none' : 'all',
        }}
      >
        <div className="classified-stamp" style={{ opacity: isHovered ? 0 : 1 }}>
          <div
            className="font-display text-2xl font-black tracking-[0.3em] px-6 py-3"
            style={{
              border: `3px solid ${STATUS_COLORS[project.status]}`,
              color: STATUS_COLORS[project.status],
              transform: 'rotate(-8deg)',
              boxShadow: `0 0 20px ${STATUS_COLORS[project.status]}44`,
            }}
          >
            CLASSIFIED
          </div>
        </div>
        <div className="font-mono text-[10px] tracking-[0.4em] text-muted-foreground uppercase">
          {project.codename}
        </div>
        <div className="font-mono text-[9px] tracking-widest text-muted-foreground/50 uppercase">
          HOVER TO DECLASSIFY
        </div>
      </div>

      {/* Card content */}
      <div
        className="card-content p-6 space-y-4"
        style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.5s ease 0.2s' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="font-mono text-[9px] tracking-[0.3em] uppercase px-2 py-0.5"
                style={{
                  color: STATUS_COLORS[project.status],
                  border: `1px solid ${STATUS_COLORS[project.status]}`,
                  background: `${STATUS_COLORS[project.status]}11`,
                }}
              >
                {project.status}
              </span>
              <span className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">
                {project.clearance}
              </span>
            </div>
            <h3 className="font-display text-base font-bold tracking-tight text-foreground">
              {project.title}
            </h3>
          </div>
          <div className="font-mono text-[9px] tracking-widest text-muted-foreground/50 text-right flex-shrink-0">
            {project.codename}
          </div>
        </div>

        {project.highlight && (
          <div
            className="font-mono text-[10px] tracking-widest uppercase px-3 py-1.5"
            style={{
              color: STATUS_COLORS[project.status],
              background: `${STATUS_COLORS[project.status]}11`,
              border: `1px solid ${STATUS_COLORS[project.status]}44`,
            }}
          >
            ★ {project.highlight}
          </div>
        )}

        {/* Description */}
        <div className="font-mono text-xs leading-relaxed" style={{ color: 'var(--foreground)', opacity: 0.75, minHeight: '72px' }}>
          {typewriterText}
          {isHovered && typewriterText.length < project.description.length && (
            <span className="inline-block w-0.5 h-3 ml-0.5 align-middle" style={{ background: 'var(--primary)', animation: 'typewriter-blink 0.7s step-end infinite' }} />
          )}
        </div>

        {/* Tech tags */}
        <div className="flex flex-wrap gap-1.5">
          {project.tech.map(t => (
            <span
              key={t}
              className="font-mono text-[9px] tracking-wider uppercase px-2 py-0.5"
              style={{ color: 'var(--muted-foreground)', border: '1px solid var(--muted)', background: 'var(--muted)' }}
            >
              {t}
            </span>
          ))}
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">MISSION PROGRESS</span>
            <span className="font-mono text-[9px]" style={{ color: STATUS_COLORS[project.status] }}>
              {Math.round(project.progress * 100)}%
            </span>
          </div>
          <div className="mission-progress-bar">
            <div
              className="mission-progress-fill"
              style={{ transform: isHovered ? `scaleX(${project.progress})` : 'scaleX(0)' }}
            />
          </div>
        </div>

        {/* GitHub */}
        <a
          href={project.github}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase group"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <span className="group-hover:text-primary transition-colors duration-200">
            VIEW ON GITHUB
          </span>
          <span
            className="w-0 overflow-hidden group-hover:w-8 transition-all duration-300 whitespace-nowrap"
            style={{ color: 'var(--primary)' }}
          >
            →
          </span>
        </a>
      </div>
    </div>
  );
}

export default function ProjectsSection() {
  return (
    <section id="projects" className="py-20 px-6 md:px-12" style={{ background: 'var(--background)' }}>
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-12 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] tracking-[0.4em] text-muted-foreground uppercase">03 //</span>
            <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight text-foreground glitch-text" data-text="ACTIVE MISSIONS">
              ACTIVE MISSIONS
            </h2>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
            5 MISSIONS ON RECORD
          </div>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {PROJECTS.slice(0, 3).map(p => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {PROJECTS.slice(3).map(p => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </div>
    </section>
  );
}