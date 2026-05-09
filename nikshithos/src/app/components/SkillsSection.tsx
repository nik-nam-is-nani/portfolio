'use client';
import React, { useEffect, useRef, useState } from 'react';

interface SkillNode {
  id: string;
  label: string;
  cluster: string;
  angle: number;
  orbitRadius: number;
  orbitSpeed: number;
  radius: number;
  color: string;
  isCenter?: boolean;
}

interface DrawnNode extends SkillNode {
  x: number;
  y: number;
}

const SKILL_CLUSTERS = [
  {
    name: 'AI/ML',
    color: '#00E5FF',
    centerX: 0.28,
    centerY: 0.32,
    skills: [
      'PyTorch','Transformers','HuggingFace','GRPO','PPO',
      'Ray RLlib','LLM Fine-Tuning','Qwen2.5','CARLA',
      'OpenCV','LangChain','Scikit-Learn','CUDA',
    ],
  },
  {
    name: 'Languages',
    color: '#FF6B2B',
    centerX: 0.72,
    centerY: 0.28,
    skills: [
      'Python','JavaScript','TypeScript','SQL',
      'C++','React','Next.js','Flask','FastAPI',
    ],
  },
  {
    name: 'Databases',
    color: '#A855F7',
    centerX: 0.72,
    centerY: 0.72,
    skills: [
      'PostgreSQL','MongoDB','Redis','SQLite',
      'Docker','Git','Linux','GitHub Actions','CUDA',
    ],
  },
  {
    name: 'Tools',
    color: '#22C55E',
    centerX: 0.28,
    centerY: 0.72,
    skills: [
      'Pandas','NumPy','Matplotlib','Seaborn',
      'Multi-Agent RL','Reinforcement Learning',
      'Data Analysis','Chart.js','TailwindCSS','EDA',
    ],
  },
];

const FULL_CLUSTER_NAMES: Record<string, string> = {
  'AI/ML': 'AI / ML',
  'Languages': 'Languages & Frameworks',
  'Databases': 'Databases & Cloud',
  'Tools': 'Tools & Concepts',
};

export default function SkillsSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<SkillNode[]>([]);
  const drawnRef = useRef<DrawnNode[]>([]);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const [hoveredNode, setHoveredNode] = useState<DrawnNode | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const buildNodes = () => {
      const nodes: SkillNode[] = [];
      SKILL_CLUSTERS.forEach(cluster => {
        nodes.push({
          id: cluster.name,
          label: cluster.name,
          cluster: cluster.name,
          angle: 0,
          orbitRadius: 0,
          orbitSpeed: 0,
          radius: 22,
          color: cluster.color,
          isCenter: true,
        });
        cluster.skills.forEach((skill, i) => {
          const totalSkills = cluster.skills.length;
          const ring = Math.floor(i / 5);
          const orbitRadius = 72 + ring * 52;
          const offsetAngle = (ring % 2 === 0 ? 0 : Math.PI / totalSkills);
          const initialAngle = ((i % 5) / Math.min(5, totalSkills)) * Math.PI * 2 + offsetAngle;
          const speed = (0.003 + Math.random() * 0.002) * (ring % 2 === 0 ? 1 : -1);
          nodes.push({
            id: `${cluster.name}-${skill}`,
            label: skill,
            cluster: cluster.name,
            angle: initialAngle,
            orbitRadius,
            orbitSpeed: speed,
            radius: 5 + Math.min(skill.length * 0.5, 6),
            color: cluster.color,
          });
        });
      });
      nodesRef.current = nodes;
    };

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      buildNodes();
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      mouseRef.current = { x: mx, y: my };

      let found: DrawnNode | null = null;
      drawnRef.current.forEach(n => {
        const dx = n.x - mx;
        const dy = n.y - my;
        if (Math.sqrt(dx * dx + dy * dy) < n.radius + 10) found = n;
      });
      setHoveredNode(found);
      if (found) setTooltipPos({ x: mx, y: my });
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      drawnRef.current.forEach(n => {
        if (n.isCenter) {
          const dx = n.x - mx;
          const dy = n.y - my;
          if (Math.sqrt(dx * dx + dy * dy) < n.radius + 10) {
            setSelectedCluster(prev => (prev === n.cluster ? null : n.cluster));
          }
        }
      });
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const nodes = nodesRef.current;
      const drawn: DrawnNode[] = [];

      // Advance angles
      nodes.forEach(n => {
        if (!n.isCenter) n.angle += n.orbitSpeed;
      });

      // Compute world positions
      const clusterCenters: Record<string, { x: number; y: number }> = {};
      SKILL_CLUSTERS.forEach(c => {
        clusterCenters[c.name] = { x: c.centerX * w, y: c.centerY * h };
      });

      nodes.forEach(n => {
        if (n.isCenter) {
          drawn.push({ ...n, x: clusterCenters[n.cluster].x, y: clusterCenters[n.cluster].y });
        } else {
          const cx = clusterCenters[n.cluster].x;
          const cy = clusterCenters[n.cluster].y;
          drawn.push({ ...n, x: cx + Math.cos(n.angle) * n.orbitRadius, y: cy + Math.sin(n.angle) * n.orbitRadius });
        }
      });
      drawnRef.current = drawn;

      // Draw faint inter-cluster lines
      SKILL_CLUSTERS.forEach((ca, i) => {
        SKILL_CLUSTERS.slice(i + 1).forEach(cb => {
          const na = drawn.find(n => n.id === ca.name);
          const nb = drawn.find(n => n.id === cb.name);
          if (!na || !nb) return;
          ctx.beginPath();
          ctx.moveTo(na.x, na.y);
          ctx.lineTo(nb.x, nb.y);
          ctx.strokeStyle = 'rgba(255,255,255,0.05)';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        });
      });

      // Draw orbit rings
      SKILL_CLUSTERS.forEach(cluster => {
        const cx = clusterCenters[cluster.name].x;
        const cy = clusterCenters[cluster.name].y;
        const isActive = selectedCluster === null || selectedCluster === cluster.name;
        const alpha = isActive ? 0.08 : 0.02;
        const ringSet = new Set(drawn.filter(n => n.cluster === cluster.name && !n.isCenter).map(n => n.orbitRadius));
        ringSet.forEach(r => {
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.strokeStyle = cluster.color + Math.round(alpha * 255).toString(16).padStart(2, '0');
          ctx.lineWidth = 0.5;
          ctx.setLineDash([3, 6]);
          ctx.stroke();
          ctx.setLineDash([]);
        });
      });

      // Draw spoke lines from center to each skill node
      SKILL_CLUSTERS.forEach(cluster => {
        const center = drawn.find(n => n.id === cluster.name);
        if (!center) return;
        const isActive = selectedCluster === null || selectedCluster === cluster.name;
        const alpha = isActive ? 0.18 : 0.04;
        drawn.filter(n => n.cluster === cluster.name && !n.isCenter).forEach(n => {
          ctx.beginPath();
          ctx.moveTo(center.x, center.y);
          ctx.lineTo(n.x, n.y);
          ctx.strokeStyle = cluster.color + Math.round(alpha * 255).toString(16).padStart(2, '0');
          ctx.lineWidth = 0.7;
          ctx.stroke();
        });
      });

      // Draw skill nodes with labels
      drawn.forEach(n => {
        const isActive = selectedCluster === null || selectedCluster === n.cluster;
        const isHov = hoveredNode?.id === n.id;
        const alpha = isActive ? 1 : 0.15;
        const r = n.radius * (isHov ? 1.6 : 1);

        if (n.isCenter) {
          // Pulse ring
          ctx.beginPath();
          ctx.arc(n.x, n.y, r + 10, 0, Math.PI * 2);
          ctx.strokeStyle = n.color + (isActive ? '44' : '11');
          ctx.lineWidth = 1;
          ctx.stroke();

          // Solid filled center circle
          ctx.beginPath();
          ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx.fillStyle = isActive ? n.color : n.color + '44';
          ctx.fill();

          // Label inside center
          ctx.font = `700 9px "JetBrains Mono", monospace`;
          ctx.fillStyle = '#000';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(n.label, n.x, n.y);
        } else {
          // Small skill dot
          ctx.beginPath();
          ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx.fillStyle = n.color + Math.round(alpha * 0.85 * 255).toString(16).padStart(2, '0');
          ctx.fill();

          // Glow halo
          ctx.beginPath();
          ctx.arc(n.x, n.y, r + 3, 0, Math.PI * 2);
          ctx.strokeStyle = n.color + Math.round(alpha * 0.25 * 255).toString(16).padStart(2, '0');
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Skill label — always visible
          const fontSize = isHov ? 10 : 8.5;
          ctx.font = `${isHov ? '600' : '400'} ${fontSize}px "JetBrains Mono", monospace`;

          const labelAlpha = isActive ? (isHov ? 1 : 0.82) : 0.12;
          ctx.fillStyle = n.color + Math.round(labelAlpha * 255).toString(16).padStart(2, '0');
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';

          // Position label below the dot
          const lx = n.x;
          const ly = n.y + r + 3;
          ctx.fillText(n.label, lx, ly);
        }
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
  }, [hoveredNode, selectedCluster]);

  return (
    <section
      id="skills"
      className="py-20 px-6 md:px-12 relative"
      style={{ background: 'var(--background)' }}
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <span className="font-mono text-[10px] tracking-[0.4em] text-muted-foreground uppercase">
            04 //
          </span>
          <h2
            className="font-display text-3xl md:text-5xl font-black tracking-tight text-foreground glitch-text"
            data-text="NEURAL MAP"
          >
            NEURAL MAP
          </h2>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-9 relative">
            <canvas
              ref={canvasRef}
              className="w-full"
              style={{ height: '560px', cursor: 'crosshair' }}
            />
            {hoveredNode && !hoveredNode.isCenter && (
              <div
                className="node-tooltip pointer-events-none"
                style={{
                  left: tooltipPos.x + 16,
                  top: tooltipPos.y - 10,
                  position: 'absolute',
                }}
              >
                {hoveredNode.label}
              </div>
            )}
          </div>

          <div className="lg:col-span-3 flex flex-col gap-4 justify-center">
            <div className="font-mono text-[10px] tracking-[0.4em] text-muted-foreground uppercase mb-1">
              CLUSTER LEGEND
            </div>
            {SKILL_CLUSTERS.map(cluster => (
              <button
                key={cluster.name}
                onClick={() =>
                  setSelectedCluster(prev =>
                    prev === cluster.name ? null : cluster.name
                  )
                }
                className="flex items-start gap-3 text-left group transition-all duration-200"
                style={{
                  opacity:
                    selectedCluster === null || selectedCluster === cluster.name
                      ? 1
                      : 0.3,
                }}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-125"
                  style={{
                    background: cluster.color,
                    boxShadow: `0 0 8px ${cluster.color}88`,
                  }}
                />
                <div>
                  <div
                    className="font-mono text-[10px] tracking-widest uppercase"
                    style={{ color: cluster.color }}
                  >
                    {FULL_CLUSTER_NAMES[cluster.name]}
                  </div>
                  <div className="font-mono text-[9px] text-muted-foreground">
                    {cluster.skills.length} skills — orbiting
                  </div>
                </div>
              </button>
            ))}

            <div className="mt-4 pt-4 border-t border-muted font-mono text-[9px] text-muted-foreground/60 leading-relaxed">
              Click cluster to isolate.<br />
              Skills orbit in real-time.<br />
              Hover any node for detail.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}