'use client';
import React, { useEffect, useRef, useState } from 'react';

interface SkillNode {
  id: string;
  label: string;
  cluster: string;
  x: number; y: number;
  vx: number; vy: number;
  radius: number;
  color: string;
  isCenter?: boolean;
}

const SKILL_CLUSTERS = [
  {
    name: 'AI/ML',
    color: '#00E5FF',
    centerX: 0.3, centerY: 0.35,
    skills: ['PyTorch','Transformers','HuggingFace','GRPO','PPO','Ray RLlib','LLM Fine-Tuning','Qwen2.5','CARLA','OpenCV','LangChain','Scikit-Learn','CUDA'],
  },
  {
    name: 'Languages & Frameworks',
    color: '#FF6B2B',
    centerX: 0.7, centerY: 0.3,
    skills: ['Python','JavaScript','TypeScript','SQL','C++','React','Next.js','Flask','FastAPI'],
  },
  {
    name: 'Databases & Cloud',
    color: '#A855F7',
    centerX: 0.7, centerY: 0.7,
    skills: ['PostgreSQL','MongoDB','Redis','SQLite','Docker','Git','Linux','GitHub Actions','CUDA'],
  },
  {
    name: 'Tools & Concepts',
    color: '#22C55E',
    centerX: 0.3, centerY: 0.7,
    skills: ['Pandas','NumPy','Matplotlib','Seaborn','Multi-Agent RL','Reinforcement Learning','Data Analysis','Chart.js','TailwindCSS','EDA'],
  },
];

export default function SkillsSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<SkillNode[]>([]);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const [hoveredNode, setHoveredNode] = useState<SkillNode | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const rotationRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initNodes(canvas);
    };

    const initNodes = (c: HTMLCanvasElement) => {
      const nodes: SkillNode[] = [];
      SKILL_CLUSTERS.forEach(cluster => {
        // Center node
        nodes.push({
          id: cluster.name,
          label: cluster.name,
          cluster: cluster.name,
          x: cluster.centerX * c.width,
          y: cluster.centerY * c.height,
          vx: 0, vy: 0,
          radius: 18,
          color: cluster.color,
          isCenter: true,
        });
        cluster.skills.forEach((skill, i) => {
          const angle = (i / cluster.skills.length) * Math.PI * 2 + Math.random() * 0.3;
          const dist = 60 + Math.random() * 50;
          nodes.push({
            id: `${cluster.name}-${skill}`,
            label: skill,
            cluster: cluster.name,
            x: cluster.centerX * c.width + Math.cos(angle) * dist,
            y: cluster.centerY * c.height + Math.sin(angle) * dist,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            radius: 6 + Math.random() * 4,
            color: cluster.color,
          });
        });
      });
      nodesRef.current = nodes;
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      mouseRef.current = { x: mx, y: my };

      let found: SkillNode | null = null;
      nodesRef.current.forEach(n => {
        const dx = n.x - mx;
        const dy = n.y - my;
        if (Math.sqrt(dx*dx + dy*dy) < n.radius + 8) {
          found = n;
        }
      });
      setHoveredNode(found);
      if (found) setTooltipPos({ x: mx, y: my });
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      nodesRef.current.forEach(n => {
        if (n.isCenter) {
          const dx = n.x - mx;
          const dy = n.y - my;
          if (Math.sqrt(dx*dx + dy*dy) < n.radius + 8) {
            setSelectedCluster(prev => prev === n.cluster ? null : n.cluster);
          }
        }
      });
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      rotationRef.current += 0.002;
      const nodes = nodesRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Drift nodes
      nodes.forEach(n => {
        if (!n.isCenter) {
          n.x += n.vx;
          n.y += n.vy;
          n.vx *= 0.995;
          n.vy *= 0.995;
          if (Math.random() < 0.01) {
            n.vx += (Math.random() - 0.5) * 0.3;
            n.vy += (Math.random() - 0.5) * 0.3;
          }
        }
        // Mouse repulsion
        const dx = n.x - mx;
        const dy = n.y - my;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 80 && !n.isCenter) {
          n.vx += (dx / dist) * 0.5;
          n.vy += (dy / dist) * 0.5;
        }
      });

      // Draw connections
      SKILL_CLUSTERS.forEach(cluster => {
        const center = nodes.find(n => n.id === cluster.name);
        if (!center) return;
        nodes.filter(n => n.cluster === cluster.name && !n.isCenter).forEach(n => {
          const isSelected = selectedCluster === null || selectedCluster === cluster.name;
          const alpha = isSelected ? 0.25 : 0.06;
          ctx.beginPath();
          ctx.moveTo(center.x, center.y);
          ctx.lineTo(n.x, n.y);
          ctx.strokeStyle = `${cluster.color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        });
      });

      // Draw inter-cluster faint connections
      SKILL_CLUSTERS.forEach((ca, i) => {
        SKILL_CLUSTERS.slice(i+1).forEach(cb => {
          const na = nodes.find(n => n.id === ca.name);
          const nb = nodes.find(n => n.id === cb.name);
          if (!na || !nb) return;
          ctx.beginPath();
          ctx.moveTo(na.x, na.y);
          ctx.lineTo(nb.x, nb.y);
          ctx.strokeStyle = 'rgba(255,255,255,0.04)';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        });
      });

      // Draw nodes
      nodes.forEach(n => {
        const isActive = selectedCluster === null || selectedCluster === n.cluster;
        const isHov = hoveredNode?.id === n.id;
        const alpha = isActive ? 1 : 0.2;
        const r = n.radius * (isHov ? 1.5 : 1);

        if (n.isCenter) {
          // Outer ring
          ctx.beginPath();
          ctx.arc(n.x, n.y, r + 8, 0, Math.PI * 2);
          ctx.strokeStyle = `${n.color}33`;
          ctx.lineWidth = 1;
          ctx.stroke();
          // Rotating indicator
          const rx = n.x + Math.cos(rotationRef.current) * (r + 8);
          const ry = n.y + Math.sin(rotationRef.current) * (r + 8);
          ctx.beginPath();
          ctx.arc(rx, ry, 2, 0, Math.PI * 2);
          ctx.fillStyle = n.color;
          ctx.fill();
        }

        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 2.5);
        grad.addColorStop(0, n.color + Math.round(alpha * 255).toString(16).padStart(2, '0'));
        grad.addColorStop(0.5, n.color + Math.round(alpha * 0.4 * 255).toString(16).padStart(2, '0'));
        grad.addColorStop(1, n.color + '00');
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = n.isCenter ? n.color : (n.color + Math.round(alpha * 0.9 * 255).toString(16).padStart(2, '0'));
        ctx.fill();

        if (n.isCenter || isHov) {
          ctx.font = `${n.isCenter ? '700' : '400'} ${n.isCenter ? 10 : 9}px "JetBrains Mono", monospace`;
          ctx.fillStyle = n.isCenter ? '#000' : n.color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          if (n.isCenter) ctx.fillText(n.label.split(' ')[0], n.x, n.y);
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
    <section id="skills" className="py-20 px-6 md:px-12 relative" style={{ background: 'var(--background)' }}>
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <span className="font-mono text-[10px] tracking-[0.4em] text-muted-foreground uppercase">04 //</span>
          <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight text-foreground glitch-text" data-text="NEURAL MAP">
            NEURAL MAP
          </h2>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-9 relative">
            <canvas
              ref={canvasRef}
              className="w-full"
              style={{ height: '520px', cursor: 'crosshair' }}
            />
            {hoveredNode && (
              <div
                className="node-tooltip pointer-events-none"
                style={{ left: tooltipPos.x + 16, top: tooltipPos.y - 10, position: 'absolute' }}
              >
                {hoveredNode.isCenter ? `CLUSTER: ${hoveredNode.label}` : hoveredNode.label}
              </div>
            )}
          </div>

          <div className="lg:col-span-3 flex flex-col gap-3 justify-center">
            <div className="font-mono text-[10px] tracking-[0.4em] text-muted-foreground uppercase mb-2">
              CLUSTER LEGEND
            </div>
            {SKILL_CLUSTERS.map(cluster => (
              <button
                key={cluster.name}
                onClick={() => setSelectedCluster(prev => prev === cluster.name ? null : cluster.name)}
                className="flex items-start gap-3 text-left group transition-all duration-200"
                style={{ opacity: selectedCluster === null || selectedCluster === cluster.name ? 1 : 0.35 }}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-125"
                  style={{ background: cluster.color, boxShadow: `0 0 8px ${cluster.color}88` }}
                />
                <div>
                  <div className="font-mono text-[10px] tracking-widest uppercase" style={{ color: cluster.color }}>
                    {cluster.name}
                  </div>
                  <div className="font-mono text-[9px] text-muted-foreground">
                    {cluster.skills.length} skills
                  </div>
                </div>
              </button>
            ))}
            <div className="mt-4 pt-4 border-t border-muted font-mono text-[9px] text-muted-foreground/60 leading-relaxed">
              Click cluster node to filter.<br />
              Hover nodes for details.<br />
              Graph drifts in real-time.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}