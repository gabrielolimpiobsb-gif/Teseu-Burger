'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Sparkles, Volume2, VolumeX, Trophy, CheckCircle2, RotateCcw } from 'lucide-react';
import { SWEET_PRIZES, SweetPrize } from '@/lib/data';
export type { SweetPrize };

// Monta 8 fatias intercalando os 4 doces
const WHEEL_SLICES: SweetPrize[] = [...SWEET_PRIZES, ...SWEET_PRIZES];
const SLICE_COUNT = WHEEL_SLICES.length;
const SLICE_ANGLE = 360 / SLICE_COUNT;

interface SweetCasinoRouletteProps {
  onClaimPrize?: (prize: SweetPrize) => void;
  initialPrize?: string | null;
  className?: string;
}

export function SweetCasinoRoulette({
  onClaimPrize,
  initialPrize,
  className = '',
}: SweetCasinoRouletteProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [flapperAngle, setFlapperAngle] = useState(0);
  const [wonPrize, setWonPrize] = useState<SweetPrize | null>(() => {
    if (!initialPrize) return null;
    return SWEET_PRIZES.find((p) => p.name === initialPrize || p.id === initialPrize) || null;
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasSpun, setHasSpun] = useState(Boolean(initialPrize));
  const [ledPhase, setLedPhase] = useState(0);
  const [claimed, setClaimed] = useState(Boolean(initialPrize));

  const audioCtxRef = useRef<AudioContext | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastPegIndexRef = useRef(0);
  const isSpinningRef = useRef(false);

  // Alterna as luzes de LED ao redor da roleta
  useEffect(() => {
    const interval = setInterval(() => {
      setLedPhase((prev) => (prev + 1) % 2);
    }, isSpinning ? 110 : 450);
    return () => clearInterval(interval);
  }, [isSpinning]);

  // Inicializa o sintetizador Web Audio API sem precisar de arquivos MP3 externos
  const getAudioContext = () => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Som mecânico do pino batendo na paleta da roleta
  const playTickSound = useCallback((speedFactor = 1) => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Frequência varia levemente com a velocidade para realismo acústico
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520 + speedFactor * 180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.035);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Ignora restrições do navegador
    }
  }, [soundEnabled]);

  // Fanfarra de vitória estilo Cassino / Jackpot
  const playWinSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98]; // Acorde Dó Maior Brilhante
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.075;

        osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.22, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0008, startTime + 0.65);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.7);
      });
    } catch {
      // Ignora restrições do navegador
    }
  }, [soundEnabled]);

  // Explosão de confetes dourados em Canvas
  const fireGoldConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = Array.from({ length: 90 }).map(() => ({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.7) * 16,
      size: Math.random() * 8 + 4,
      color: ['#fbbf24', '#f59e0b', '#fef08a', '#ffffff', '#ef4444'][
        Math.floor(Math.random() * 5)
      ],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 12,
      gravity: 0.28,
      alpha: 1,
    }));

    const renderParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;

      particles.forEach((p) => {
        if (p.alpha <= 0.02) return;
        active = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.vRot;
        p.alpha -= 0.012;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      if (active) requestAnimationFrame(renderParticles);
    };

    requestAnimationFrame(renderParticles);
  };

  // Lógica principal de giro com física frame-a-frame via requestAnimationFrame
  const spinWheel = () => {
    if (isSpinningRef.current || hasSpun) return;

    // Desbloqueia o AudioContext no primeiro gesto do usuário
    getAudioContext();

    isSpinningRef.current = true;
    setIsSpinning(true);
    setWonPrize(null);
    setClaimed(false);

    // Escolhe a fatia vencedora (0 a 7)
    const winningSliceIndex = Math.floor(Math.random() * SLICE_COUNT);
    const fullSpins = (7 + Math.floor(Math.random() * 3)) * 360;

    // Ângulo central da fatia no topo (12h) + leve variação orgânica para realismo
    const sliceCenter = winningSliceIndex * SLICE_ANGLE + SLICE_ANGLE / 2;
    const organicOffset = (Math.random() - 0.5) * (SLICE_ANGLE * 0.45);
    const targetModAngle = (360 - sliceCenter + organicOffset) % 360;

    const currentMod = rotation % 360;
    const deltaAngle = fullSpins + ((targetModAngle - currentMod + 360) % 360);

    const startRotation = rotation;
    const duration = 6200; // 6.2 segundos de suspense
    const startTime = performance.now();

    // Curva Quintic Ease-Out: rápida no início e desaceleração longa e dramática no final
    const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);

    const animateSpin = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuint(progress);
      const currentAngle = startRotation + deltaAngle * eased;

      setRotation(currentAngle);

      // Detecta colisão com os pinos a cada 45 graus para som e física da agulha
      const currentPegIndex = Math.floor(currentAngle / SLICE_ANGLE);
      if (currentPegIndex !== lastPegIndexRef.current) {
        lastPegIndexRef.current = currentPegIndex;
        const speedFactor = 1 - progress;
        playTickSound(speedFactor);

        // Deflexão física da agulha no topo
        setFlapperAngle(-28 * Math.max(0.25, speedFactor));
        setTimeout(() => setFlapperAngle(0), 65);
      }

      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        isSpinningRef.current = false;
        setIsSpinning(false);
        setHasSpun(true);
        setFlapperAngle(0);
        const prize = WHEEL_SLICES[winningSliceIndex];
        setWonPrize(prize);
        playWinSound();
        fireGoldConfetti();
      }
    };

    requestAnimationFrame(animateSpin);
  };

  const handleClaim = () => {
    if (!wonPrize) return;
    setClaimed(true);
    if (onClaimPrize) {
      onClaimPrize(wonPrize);
    }
  };

  const handleResetSpin = () => {
    if (isSpinning) return;
    setHasSpun(false);
    setWonPrize(null);
    setClaimed(false);
  };

  // Utilitário para criar arcos SVG das fatias
  const createSlicePath = (index: number) => {
    const startAngle = (index * SLICE_ANGLE - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * SLICE_ANGLE - 90) * (Math.PI / 180);
    const r = 150;
    const x1 = 150 + r * Math.cos(startAngle);
    const y1 = 150 + r * Math.sin(startAngle);
    const x2 = 150 + r * Math.cos(endAngle);
    const y2 = 150 + r * Math.sin(endAngle);

    return `M 150 150 L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
  };

  return (
    <div
      className={`relative w-full max-w-lg mx-auto overflow-hidden rounded-3xl bg-[#09090b] border-2 border-amber-500/40 shadow-[0_0_70px_-15px_rgba(245,158,11,0.4)] p-5 sm:p-7 text-white select-none font-sans ${className}`}
    >
      {/* Canvas de Partículas de Vitória */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-40 w-full h-full"
      />

      {/* Glow de Fundo Cassino */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-red-600/15 rounded-full blur-3xl" />

      {/* Topo / Header com GRÁTIS em verde super visível */}
      <div className="relative z-10 flex items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-[11px] sm:text-xs font-bold uppercase tracking-widest shadow-inner">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-300" />
            <span>Roleta de Luxo</span>
          </div>

          {/* Destaque "GRÁTIS" em verde vibrante */}
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-950/90 border-2 border-emerald-400 text-emerald-400 font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_16px_rgba(52,211,153,0.6)] animate-pulse">
            ★ 100% GRÁTIS ★
          </span>
        </div>

        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-amber-400 transition cursor-pointer shrink-0"
          title={soundEnabled ? 'Silenciar sons' : 'Ativar sons'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      <div className="relative z-10 text-center mb-4 sm:mb-5">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow">
          GIRE E GANHE SEU DOCE <span className="text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.9)]">GRÁTIS!</span>
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-sm mx-auto">
          Este combo garante 1 sobremesa artesanal <strong className="text-emerald-400 font-bold uppercase">grátis</strong>. Toque no centro para testar sua sorte!
        </p>
      </div>

      {/* Container da Roleta */}
      <div className="relative mx-auto w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 flex items-center justify-center my-2">
        {/* Agulha / Flapper Físico no Topo (12 Horas) com deflexão física */}
        <div
          className="absolute -top-4 sm:-top-5 left-1/2 z-30 origin-top transition-transform duration-75"
          style={{
            transform: `translateX(-50%) rotate(${flapperAngle}deg)`,
          }}
        >
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-b from-amber-200 to-amber-600 border-2 border-zinc-900 shadow-lg flex items-center justify-center">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-zinc-900" />
          </div>
          <div
            className="mx-auto -mt-1 sm:-mt-1.5 w-0 h-0 
            border-l-[10px] sm:border-l-[11px] border-l-transparent 
            border-r-[10px] sm:border-r-[11px] border-r-transparent 
            border-t-[22px] sm:border-t-[26px] border-t-red-600 filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]"
          />
        </div>

        {/* Aro Externo Metálico Dourado com Luzes LED de Cassino */}
        <div className="absolute inset-0 rounded-full p-3 sm:p-3.5 bg-gradient-to-b from-amber-300 via-amber-600 to-yellow-900 shadow-[0_0_40px_rgba(245,158,11,0.35),inset_0_2px_6px_rgba(255,255,255,0.6)]">
          <div className="w-full h-full rounded-full bg-zinc-950 p-1.5 shadow-inner relative">
            {/* 16 Lâmpadas LED ao redor do aro */}
            {Array.from({ length: 16 }).map((_, i) => {
              const angle = (i * 360) / 16;
              const isLit = (i + ledPhase) % 2 === 0;
              return (
                <div
                  key={i}
                  className="absolute w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-150"
                  style={{
                    left: `${50 + 48 * Math.cos((angle * Math.PI) / 180)}%`,
                    top: `${50 + 48 * Math.sin((angle * Math.PI) / 180)}%`,
                    backgroundColor: isLit ? '#fef08a' : '#78350f',
                    boxShadow: isLit
                      ? '0 0 10px 2px rgba(254, 240, 138, 0.95)'
                      : 'none',
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Roda Giratória em SVG de Alta Precisão */}
        <div
          className="relative w-[87%] h-[87%] rounded-full overflow-hidden shadow-[inset_0_0_25px_rgba(0,0,0,0.85)]"
          style={{
            transform: `rotate(${rotation}deg)`,
          }}
        >
          <svg viewBox="0 0 300 300" className="w-full h-full">
            <defs>
              <radialGradient id="wheelVignette" cx="50%" cy="50%" r="50%">
                <stop offset="65%" stopColor="rgba(0,0,0,0)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
              </radialGradient>
            </defs>

            {WHEEL_SLICES.map((slice, index) => {
              const midAngle = index * SLICE_ANGLE + SLICE_ANGLE / 2;
              return (
                <g key={index}>
                  {/* Fatia da Roleta */}
                  <path
                    d={createSlicePath(index)}
                    fill={slice.color}
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                  />

                  {/* Ícone e Nome do Doce alinhados ao raio */}
                  <g
                    transform={`translate(150, 150) rotate(${midAngle}) translate(0, -92)`}
                  >
                    <text
                      x="0"
                      y="-8"
                      textAnchor="middle"
                      fontSize="24"
                      className="select-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                    >
                      {slice.icon}
                    </text>
                    <text
                      x="0"
                      y="14"
                      fill="#fef08a"
                      fontSize="8.5"
                      fontWeight="800"
                      textAnchor="middle"
                      className="uppercase tracking-wider font-sans select-none"
                    >
                      {slice.name.split(' ')[0]}
                    </text>
                    <text
                      x="0"
                      y="24"
                      fill="#ffffff"
                      fontSize="7"
                      fontWeight="600"
                      textAnchor="middle"
                      opacity="0.9"
                      className="font-sans select-none"
                    >
                      {slice.name.split(' ').slice(1).join(' ')}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Sombra Radial Interna para profundidade 3D */}
            <circle cx="150" cy="150" r="150" fill="url(#wheelVignette)" />

            {/* Pinos Metálicos (Pegs) nas divisórias da borda */}
            {WHEEL_SLICES.map((_, index) => {
              const pegAngle = (index * SLICE_ANGLE - 90) * (Math.PI / 180);
              const px = 150 + 141 * Math.cos(pegAngle);
              const py = 150 + 141 * Math.sin(pegAngle);
              return (
                <circle
                  key={index}
                  cx={px}
                  cy={py}
                  r="3.8"
                  fill="#fef08a"
                  stroke="#78350f"
                  strokeWidth="1.5"
                />
              );
            })}
          </svg>
        </div>

        {/* Botão Central 3D de Giro */}
        <button
          type="button"
          onClick={spinWheel}
          disabled={isSpinning || (hasSpun && !wonPrize)}
          className={`absolute z-20 w-18 h-18 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center font-black text-xs uppercase tracking-wider transition-all duration-200 border-4 border-amber-200 shadow-[0_8px_25px_rgba(0,0,0,0.85)] ${
            isSpinning
              ? 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed'
              : hasSpun
              ? 'bg-gradient-to-b from-amber-400 to-amber-700 text-zinc-950 hover:scale-105 active:scale-95 cursor-pointer'
              : 'bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 text-zinc-950 hover:scale-105 active:scale-95 cursor-pointer animate-pulse'
          }`}
        >
          <span className="text-[8px] font-black tracking-wider text-emerald-400 bg-emerald-950/80 px-1 rounded uppercase">GRÁTIS</span>
          <span className="text-xs sm:text-sm font-black leading-none mt-0.5">
            {isSpinning ? '...' : hasSpun ? 'GIRADO' : 'GIRAR'}
          </span>
        </button>
      </div>

      {/* Legenda rápida das 4 opções de brinde (quando ainda não girou) */}
      {!wonPrize && (
        <div className="mt-4 sm:mt-5 grid grid-cols-2 gap-2 text-left">
          {SWEET_PRIZES.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/80 border border-zinc-800/80"
            >
              <span className="text-xl sm:text-2xl shrink-0">{item.icon}</span>
              <div className="leading-tight min-w-0">
                <p className="text-[11px] sm:text-xs font-bold text-amber-300 truncate">{item.name}</p>
                <p className="text-[9px] sm:text-[10px] text-zinc-400 truncate">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Card Animado de Revelação do Prêmio Ganho */}
      {wonPrize && (
        <div className="relative z-30 mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-amber-500/20 via-zinc-900 to-zinc-950 border-2 border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.35)] text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="inline-flex items-center gap-1.5 text-amber-300 text-[11px] sm:text-xs font-black uppercase tracking-widest mb-1">
            <Trophy className="w-4 h-4 text-amber-400" />
            Parabéns! Você Ganhou:
          </div>

          <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto my-2 flex items-center justify-center">
            {wonPrize.image ? (
              <Image
                src={wonPrize.image}
                alt={wonPrize.name}
                width={80}
                height={80}
                className="object-contain w-full h-full drop-shadow-[0_4px_10px_rgba(245,158,11,0.5)] animate-bounce"
                unoptimized
              />
            ) : (
              <div className="text-4xl sm:text-5xl animate-bounce drop-shadow">
                {wonPrize.icon}
              </div>
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-black text-white">{wonPrize.name}</h3>
          <p className="text-xs text-amber-200/90 mb-3">{wonPrize.subtitle}</p>

          <button
            type="button"
            onClick={handleClaim}
            className={`w-full py-3 sm:py-3.5 px-5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              claimed
                ? 'bg-emerald-500 text-black border-2 border-emerald-400'
                : 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-zinc-950 hover:brightness-110 active:scale-[0.99]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            <span>{claimed ? 'Brinde Garantido no Pedido! ✓' : 'Adicionar Brinde ao Meu Pedido'}</span>
          </button>

          <div className="mt-2.5 flex items-center justify-center gap-1 text-[10px] text-zinc-400">
            <span>Quer tentar novamente?</span>
            <button
              type="button"
              onClick={handleResetSpin}
              className="text-amber-400 hover:text-amber-300 underline font-semibold flex items-center gap-0.5 ml-1 cursor-pointer"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Girar de novo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SweetCasinoRoulette;
