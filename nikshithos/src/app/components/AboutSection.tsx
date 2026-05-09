'use client';
import React, { useEffect, useRef, useState } from 'react';

const ML_JOKES = [
  "Why did the neural network go to therapy? It had too many hidden layers.",
  "How do ML engineers fix bugs? They retrain themselves.",
  "What\'s a machine learning model\'s favorite movie? The Gradient Descent of Man.",
  "Why was the dataset nervous? Because it had too many outliers.",
  "What do you call a lazy ML engineer? Someone who uses AutoML.",
  "Why don't overfitted models have friends? They can't generalize.",
  "How does a data scientist flirt? 'I've been training to meet you.'",
  "What\'s a transformer\'s favorite song? \'Attention Is All You Need.'",
  "Why did the random forest win the talent show? It had the most trees.",
  "What's a reinforcement learning agent's life motto? Trial, error, and reward.",
];

const COMMANDS: Record<string, string> = {
  help: `Available commands:
  help         — Show this menu
  whoami       — Who is Nikshith?
  skills       — Technical skill stack
  projects     — Active mission list
  achievement  — Meta PyTorch × Scaler finalist
  education    — Academic background
  certifications — Professional certifications
  contact      — Get in touch
  joke         — Random ML joke
  matrix       — Activate matrix mode
  clear        — Clear terminal
  sudo hire nikshith — The most important command`,

  whoami: `NIKSHITH KYATHERIGI
  ─────────────────────────────────────────
  Role     : AI/ML Engineer · Multi-Agent RL Builder
  Location : Kurnool, Andhra Pradesh, India
  Status   : Actively building, learning, shipping
  Mission  : Building AI systems that respond to real-world crises
  Passion  : Reinforcement learning, LLM fine-tuning, emergency AI
  GitHub   : github.com/nikshithkyathrigi`,

  skills: `TECHNICAL STACK
  ─────────────────────────────────────────
  AI/ML      : PyTorch, Transformers, HuggingFace, Ray RLlib
               GRPO, PPO, LLM Fine-Tuning, Qwen2.5, CARLA
  Languages  : Python, JavaScript, TypeScript, SQL, C++
  Frameworks : React, Next.js, Flask, FastAPI, TailwindCSS
  Databases  : PostgreSQL, MongoDB, Redis, SQLite
  Cloud/DevOps: Docker, Git, Linux, GitHub Actions
  Tools      : Pandas, NumPy, Matplotlib, OpenCV, LangChain`,

  projects: `ACTIVE MISSIONS (5 CLASSIFIED PROJECTS)
  ─────────────────────────────────────────
  [1] Urban MCI Command Center — Meta PyTorch × Scaler Finalist
  [2] Crisis Triage Arena — 4-agent GRPO fine-tuning, 98.6% JSON
  [3] AI SQL Studio — Natural language to SQL + Chart.js viz
  [4] Self-Driving Car Simulation — CARLA, CNN, LiDAR
  [5] Data Analyzer Tool — Pandas + Matplotlib analysis suite
  
  Type 'sudo declassify <n>' or scroll to PROJECTS section.`,

  achievement: `ACHIEVEMENT UNLOCKED
  ─────────────────────────────────────────
  🏆 META PYTORCH × SCALER GRAND FINALE FINALIST
  Event    : Meta PyTorch × Scaler Hackathon
  Round    : Grand Finale
  Date     : April 2025
  Location : Bangalore, India
  Project  : Urban MCI Command Center
             (Multi-agent RL for mass casualty incident response)`,

  education: `EDUCATION
  ─────────────────────────────────────────
  B.Tech Computer Science (AI/ML Specialization)
  Expected Graduation: 2027
  Focus: Reinforcement Learning, Deep Learning, NLP
  
  Self-Taught: 2021 – Present
  Built 5+ production ML systems from scratch
  Open source contributor | Hackathon competitor`,

  certifications: `CERTIFICATIONS
  ─────────────────────────────────────────
  [1] Deloitte Australia — Data Analytics
      Platform: Forage Virtual Experience
      Completed: July 2025
  
  [2] Tata Group — Data Visualisation
      Platform: Forage Virtual Experience
      Completed: July 2025`,

  contact: `CONTACT CHANNELS
  ─────────────────────────────────────────
  Email    : nikshithkyathrigi2005@gmail.com
  GitHub   : github.com/nikshithkyathrigi
  HuggingFace: huggingface.co/nikshith
  LinkedIn : linkedin.com/in/nikshith-kyatherigi
  Location : Kurnool, AP, India
  
  Scroll to CONTACT section for interactive interface.`,

  matrix: `Activating matrix mode...`,

  clear: '__CLEAR__',

  'sudo hire nikshith': `sudo: Elevated privileges granted.
  ─────────────────────────────────────────
  ✅ HIRE REQUEST SUBMITTED SUCCESSFULLY
  
  Processing candidate: Nikshith Kyatherigi
  Skills match: 98.6% (exceeds threshold)
  Availability: Immediately
  
  Next steps:
  → Email: nikshithkyathrigi2005@gmail.com
  → GitHub: github.com/nikshithkyathrigi
  
  "Best decision you'll make today." — sudo`,
};

const TIMELINE = [
  { year: '2021', label: 'BOOT', desc: 'Started coding journey. Python, data structures, algorithms.', color: 'var(--primary)' },
  { year: '2022', label: 'COMPILE', desc: 'First ML models. Linear regression to neural nets. Fell in love with PyTorch.', color: 'var(--accent)' },
  { year: '2023', label: 'DEPLOY', desc: 'Built first full-stack AI application. SQL + Flask + React stack.', color: 'var(--accent2)' },
  { year: '2024', label: 'SCALE', desc: 'Multi-agent RL research begins. CARLA simulation. GRPO fine-tuning experiments.', color: 'var(--primary)' },
  { year: '2025', label: 'ACHIEVE', desc: 'Meta PyTorch × Scaler Grand Finale Finalist. Crisis Triage Arena: 98.6% JSON parse.', color: 'var(--accent)' },
  { year: '2026', label: 'EXPAND', desc: 'Pushing boundaries of emergency response AI. LLM agents for real-world deployment.', color: 'var(--accent2)' },
  { year: '2027', label: 'GRADUATE', desc: 'B.Tech completion. Full-time AI engineering. Building systems that save lives.', color: 'var(--primary)', future: true },
];

export default function AboutSection() {
  const [terminalLines, setTerminalLines] = useState<{ type: 'input' | 'output'; text: string }[]>([
    { type: 'output', text: 'NikshithOS Terminal v1.0.0 — Type "help" to begin.' },
    { type: 'output', text: '─────────────────────────────────────────────────' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [jokeIndex, setJokeIndex] = useState(0);
  const terminalBodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [terminalLines]);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    const newLines: { type: 'input' | 'output'; text: string }[] = [
      ...terminalLines,
      { type: 'input', text: `visitor@nikshithos:~$ ${cmd}` },
    ];

    if (trimmed === 'clear') {
      setTerminalLines([{ type: 'output', text: 'Terminal cleared. Type "help" for commands.' }]);
      return;
    }

    if (trimmed === 'joke') {
      const joke = ML_JOKES[jokeIndex % ML_JOKES.length];
      setJokeIndex(prev => prev + 1);
      newLines.push({ type: 'output', text: `ML Joke #${(jokeIndex % 10) + 1}:\n${joke}` });
    } else if (trimmed === 'matrix') {
      newLines.push({ type: 'output', text: COMMANDS.matrix });
      setTimeout(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true });
        // Trigger matrix via konami shortcut approximation
        const div = document.createElement('div');
        div.id = 'matrix-overlay-terminal';
        div.style.cssText = 'position:fixed;inset:0;z-index:99990;pointer-events:none;overflow:hidden;background:rgba(0,0,0,0.85);';
        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        canvas.style.cssText = 'position:absolute;inset:0;';
        div.appendChild(canvas); document.body.appendChild(div);
        const ctx2 = canvas.getContext('2d')!;
        const cols = Math.floor(canvas.width / 16);
        const drops = Array(cols).fill(1);
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$ｱｲｳｴｵ';
        const iv = setInterval(() => {
          ctx2.fillStyle = 'rgba(0,0,0,0.05)'; ctx2.fillRect(0,0,canvas.width,canvas.height);
          ctx2.fillStyle = '#00E5FF'; ctx2.font = '14px monospace';
          drops.forEach((y, i) => {
            const c = chars[Math.floor(Math.random() * chars.length)];
            ctx2.fillText(c, i * 16, y * 16);
            if (y * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
          });
        }, 33);
        setTimeout(() => { clearInterval(iv); div.remove(); }, 5000);
        void event;
      }, 300);
    } else if (COMMANDS[trimmed]) {
      const output = COMMANDS[trimmed];
      newLines.push({ type: 'output', text: output });
    } else if (trimmed === '') {
      // do nothing
    } else {
      newLines.push({ type: 'output', text: `bash: ${cmd}: command not found. Type "help" for available commands.` });
    }

    setTerminalLines(newLines);
    setInputValue('');
  };

  return (
    <section id="about" className="py-20 px-6 md:px-12 relative" style={{ background: 'var(--background)' }}>
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <span className="font-mono text-[10px] tracking-[0.4em] text-muted-foreground uppercase">02 //</span>
          <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight text-foreground glitch-text" data-text="ABOUT.SH">
            ABOUT.SH
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Terminal */}
          <div className="terminal-window flex flex-col" style={{ height: '520px' }}>
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'rgba(0,229,255,0.2)' }}>
              <span className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
              <span className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
              <span className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
              <span className="font-mono text-[10px] tracking-widest text-muted-foreground ml-3 uppercase">
                nikshithos — bash — 80×24
              </span>
            </div>

            {/* Terminal body */}
            <div
              ref={terminalBodyRef}
              className="flex-1 overflow-y-auto p-4 space-y-1"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', lineHeight: '1.6' }}
              onClick={() => inputRef.current?.focus()}
            >
              {terminalLines.map((line, i) => (
                <div key={i}>
                  {line.text.split('\n').map((l, j) => (
                    <div
                      key={j}
                      style={{
                        color: line.type === 'input' ? 'var(--primary)' : 'var(--foreground)',
                        opacity: line.type === 'output' ? 0.85 : 1,
                        whiteSpace: 'pre',
                      }}
                    >
                      {l}
                    </div>
                  ))}
                </div>
              ))}
              {/* Input line */}
              <div className="flex items-center gap-0" style={{ color: 'var(--primary)' }}>
                <span className="font-mono text-xs">visitor@nikshithos:~$&nbsp;</span>
                <input
                  ref={inputRef}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleCommand(inputValue);
                  }}
                  className="flex-1 bg-transparent outline-none font-mono text-xs"
                  style={{ color: 'var(--primary)', caretColor: 'var(--primary)' }}
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>
            </div>
          </div>

          {/* Bio + Timeline */}
          <div className="flex flex-col gap-6 justify-between">
            <div className="space-y-4">
              <p className="font-mono text-sm leading-relaxed" style={{ color: 'var(--foreground)', opacity: 0.8 }}>
                I build AI systems that solve real emergencies. Currently focused on multi-agent reinforcement learning for mass casualty incident response — coordinating 4 specialized LLM agents to triage, dispatch, and manage crisis resources in real-time.
              </p>
              <p className="font-mono text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                Meta PyTorch × Scaler Grand Finale Finalist (April 2025, Bangalore). 98.6% JSON parse rate on Qwen2.5 fine-tuned with GRPO across 4 parallel agents. That number isn&apos;t a benchmark — it&apos;s a life-saving metric.
              </p>
            </div>

            {/* Timeline */}
            <div className="space-y-0">
              <div className="font-mono text-[10px] tracking-[0.4em] text-muted-foreground uppercase mb-4">
                SYSTEM LOG // 2021–2027
              </div>
              {TIMELINE.map((item, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 transition-transform duration-300 group-hover:scale-150"
                      style={{
                        background: item.future ? 'transparent' : item.color,
                        border: item.future ? `1px solid ${item.color}` : 'none',
                        boxShadow: `0 0 6px ${item.color}88`,
                      }}
                    />
                    {i < TIMELINE.length - 1 && (
                      <div className="w-px flex-1 mt-1" style={{ background: 'var(--muted)', minHeight: '24px' }} />
                    )}
                  </div>
                  <div className="pb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-xs font-bold tracking-widest" style={{ color: item.color }}>
                        {item.year}
                      </span>
                      <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                        [{item.label}]
                      </span>
                    </div>
                    <p className="font-mono text-xs mt-0.5" style={{ color: item.future ? 'var(--muted-foreground)' : 'var(--foreground)', opacity: item.future ? 0.5 : 0.75 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}