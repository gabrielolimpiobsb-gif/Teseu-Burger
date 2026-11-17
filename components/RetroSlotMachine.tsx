'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  CheckCircle2,
  Sparkles,
  Trophy,
  RotateCcw,
  ArrowLeft,
  Flame,
} from 'lucide-react';
import { SweetPrize as BaseSweetPrize } from '@/lib/data';

export interface RetroSweetPrize extends BaseSweetPrize {
  tag: string;
  code: string;
}

export const RETRO_SWEET_PRIZES: RetroSweetPrize[] = [
  {
    id: 'cookie-supremo',
    tag: 'HOUSE OF COOKIE',
    name: 'Cookie Artesanal',
    subtitle: 'Gotas de Chocolate Belga 80g',
    icon: '🍪',
    code: '01',
    color: '#1e1b4b',
    accent: '#f59e0b',
    image: '/doce-cookie.png',
  },
  {
    id: 'brigadeiro-gourmet',
    tag: 'HOUSE OF CACAU',
    name: 'Brigadeiro Gourmet',
    subtitle: 'Cacau 70% & Granulado Nobre',
    icon: '🍫',
    code: '02',
    color: '#7f1d1d',
    accent: '#fbbf24',
    image: '/doce-ambrosia.png',
  },
  {
    id: 'brownie-intenso',
    tag: 'HOUSE OF FUDGE',
    name: 'Brownie Supremo',
    subtitle: 'Casquinha Crocante & Meio Amargo',
    icon: '🥮',
    code: '03',
    color: '#0f172a',
    accent: '#f59e0b',
    image: '/doce-brownie.png',
  },
  {
    id: 'bombom-especial',
    tag: 'HOUSE OF SWEET',
    name: 'Bombom da Casa',
    subtitle: 'Recheio Cremoso Artesanal',
    icon: '🍬',
    code: '04',
    color: '#881337',
    accent: '#fde047',
    image: '/doce-torta.png',
  },
];

// Altura de cada selo dentro do cilindro (em px)
const ITEM_HEIGHT = 136;
const REEL_REPEAT = 12;
const REEL_STRIP = Array.from({ length: REEL_REPEAT }).flatMap(() => RETRO_SWEET_PRIZES);
const MAX_SPINS = 3;

interface RetroSlotMachineProps {
  onClaimPrize?: (prize: BaseSweetPrize) => void;
  initialPrize?: string | null;
  className?: string;
  onBackToCombo?: () => void;
}

export function RetroSlotMachine({
  onClaimPrize,
  initialPrize,
  className = '',
  onBackToCombo,
}: RetroSlotMachineProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [leverPulled, setLeverPulled] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<RetroSweetPrize | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sistema de 3 Rodadas com Liberdade de Escolha
  const [spinsLeft, setSpinsLeft] = useState<number>(() => (initialPrize ? 2 : MAX_SPINS));
  const [rolledHistory, setRolledHistory] = useState<RetroSweetPrize[]>(() => {
    if (!initialPrize) return [];
    const found = RETRO_SWEET_PRIZES.find(
      (p) => p.name === initialPrize || p.id === initialPrize
    );
    return found ? [found] : [];
  });
  const [currentPrize, setCurrentPrize] = useState<RetroSweetPrize | null>(() => {
    if (!initialPrize) return null;
    return (
      RETRO_SWEET_PRIZES.find(
        (p) => p.name === initialPrize || p.id === initialPrize
      ) || null
    );
  });
  const [claimedPrize, setClaimedPrize] = useState<RetroSweetPrize | null>(() => {
    if (!initialPrize) return null;
    return (
      RETRO_SWEET_PRIZES.find(
        (p) => p.name === initialPrize || p.id === initialPrize
      ) || null
    );
  });

  // Posição vertical (translateY) dos 3 cilindros
  const [reelOffsets, setReelOffsets] = useState<[number, number, number]>([
    0,
    -ITEM_HEIGHT,
    -ITEM_HEIGHT * 2,
  ]);
  const [reelSpinningState, setReelSpinningState] = useState<[boolean, boolean, boolean]>([
    false,
    false,
    false,
  ]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Inicializa o sintetizador Web Audio API nativo
  const getAudioContext = () => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Som mecânico da alavanca sendo puxada
  const playLeverSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.12);
      osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.26);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.27);
    } catch {
      // ignore
    }
  }, [soundEnabled]);

  // Clique rápido das engrenagens dos rolos girando
  const playReelTick = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(680, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.025);

      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch {
      // ignore
    }
  }, [soundEnabled]);

  // Som pesado de trava ("Clunk") quando cada cilindro para na posição
  const playReelStopSound = useCallback(
    (reelIndex: number) => {
      if (!soundEnabled) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        const baseFreq = 110 + reelIndex * 35;
        osc.type = 'square';
        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.11);

        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.13);
      } catch {
        // ignore
      }
    },
    [soundEnabled]
  );

  // Fanfarra de Jackpot quando os 3 selos se alinham
  const playJackpotSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.085;

        osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.55);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.6);
      });
    } catch {
      // ignore
    }
  }, [soundEnabled]);

  // Explosão de confetes dourados e rubis na tela
  const fireConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = Array.from({ length: 85 }).map(() => ({
      x: canvas.width / 2,
      y: canvas.height * 0.45,
      vx: (Math.random() - 0.5) * 15,
      vy: (Math.random() - 0.8) * 15,
      size: Math.random() * 8 + 4,
      color: ['#fbbf24', '#f59e0b', '#fef08a', '#dc2626', '#34d399', '#ffffff'][
        Math.floor(Math.random() * 6)
      ],
      rot: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 12,
      gravity: 0.26,
      alpha: 1,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;
      particles.forEach((p) => {
        if (p.alpha <= 0.02) return;
        active = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rot += p.vRot;
        p.alpha -= 0.012;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });
      if (active) requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  };

  // Lógica principal das 3 rodadas:
  // A cada giro, 1 rodada é gasta e os 3 rolos cravam 1 dos 4 doces artesanais (Jackpot!).
  // O usuário pode resgatar na hora ou girar novamente se ainda tiver rodadas restantes.
  const triggerSpin = () => {
    if (isSpinning || spinsLeft <= 0) return;

    setSelectedPreview(null);
    setLeverPulled(true);
    playLeverSound();

    setTimeout(() => setLeverPulled(false), 550);

    setIsSpinning(true);
    setSpinsLeft((prev) => Math.max(0, prev - 1));
    setReelSpinningState([true, true, true]);

    // Sorteia um dos 4 doces (com rotação justa ou aleatória)
    const winningIndex = Math.floor(Math.random() * RETRO_SWEET_PRIZES.length);
    const prize = RETRO_SWEET_PRIZES[winningIndex];

    const targetIndices: [number, number, number] = [
      (REEL_REPEAT - 4) * RETRO_SWEET_PRIZES.length + winningIndex,
      (REEL_REPEAT - 3) * RETRO_SWEET_PRIZES.length + winningIndex,
      (REEL_REPEAT - 2) * RETRO_SWEET_PRIZES.length + winningIndex,
    ];

    const durations = [2300, 3400, 4700]; // Parada escalonada dos 3 cilindros
    const startTime = performance.now();
    let lastTickStep = 0;
    const stoppedReels = [false, false, false];

    const easeOutBack = (t: number) => {
      const c1 = 1.15;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    };

    const animateReels = (now: number) => {
      const elapsed = now - startTime;
      const newOffsets: [number, number, number] = [0, 0, 0];
      let anyStillSpinning = false;

      for (let i = 0; i < 3; i++) {
        const progress = Math.min(elapsed / durations[i], 1);
        const eased = easeOutBack(progress);
        const targetY = -targetIndices[i] * ITEM_HEIGHT;
        newOffsets[i] = targetY * eased;

        if (progress < 1) {
          anyStillSpinning = true;
        } else if (!stoppedReels[i]) {
          stoppedReels[i] = true;
          playReelStopSound(i);
          setReelSpinningState((prev) => {
            const copy: [boolean, boolean, boolean] = [...prev];
            copy[i] = false;
            return copy;
          });
        }
      }

      const currentTickStep = Math.floor(Math.abs(newOffsets[2]) / (ITEM_HEIGHT * 0.65));
      if (currentTickStep !== lastTickStep && elapsed < durations[2]) {
        lastTickStep = currentTickStep;
        playReelTick();
      }

      setReelOffsets(newOffsets);

      if (anyStillSpinning) {
        requestAnimationFrame(animateReels);
      } else {
        setIsSpinning(false);
        setCurrentPrize(prize);
        setRolledHistory((prev) => [...prev, prize]);
        playJackpotSound();
        fireConfetti();
      }
    };

    requestAnimationFrame(animateReels);
  };

  // Reivindica o doce escolhido para o Combo Casal
  const handleClaim = (prizeToClaim: RetroSweetPrize) => {
    setClaimedPrize(prizeToClaim);
    if (onClaimPrize) {
      onClaimPrize({
        id: prizeToClaim.id,
        name: prizeToClaim.name,
        subtitle: prizeToClaim.subtitle,
        icon: prizeToClaim.icon,
        color: prizeToClaim.color,
        accent: prizeToClaim.accent,
        image: prizeToClaim.image,
      });
    }
  };

  // Se o usuário selecionou uma rodada passada para inspecionar/escolher
  const handleSelectPastRoll = (prize: RetroSweetPrize) => {
    if (isSpinning) return;
    setCurrentPrize(prize);
  };

  return (
    <div
      className={`relative w-full max-w-xl mx-auto py-3.5 sm:py-6 px-2.5 sm:px-6 rounded-2xl sm:rounded-3xl bg-[#041d15] border-2 border-emerald-900/60 shadow-2xl overflow-hidden select-none font-sans ${className}`}
    >
      {/* Cortina de Veludo Verde Escuro ao Fundo */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, #02120c 0px, #072c1f 35px, #031810 70px)',
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.85)_100%)]" />

      {/* Canvas para explosão de confetes */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-50 w-full h-full"
      />

      {/* TOPO: INDICADOR DE RODADAS & CONTROLE DE ESCOLHA */}
      <div className="relative z-20 mb-3 sm:mb-4">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
          {onBackToCombo && (
            <button
              type="button"
              onClick={onBackToCombo}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-zinc-700 text-zinc-300 text-[11px] font-bold hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Combo</span>
            </button>
          )}

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/90 border border-amber-500/50 text-amber-300 text-[11px] sm:text-xs font-black uppercase tracking-wider shadow">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Rodadas Restantes: {spinsLeft} de {MAX_SPINS}</span>
          </div>
        </div>

        {/* Pílulas das 3 Rodadas (Slots de Rodadas) */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {[0, 1, 2].map((roundIdx) => {
            const rolled = rolledHistory[roundIdx];
            const isCurrent = currentPrize?.id === rolled?.id && rolled !== undefined;
            const isClaimed = claimedPrize?.id === rolled?.id && rolled !== undefined;

            return (
              <button
                key={roundIdx}
                type="button"
                disabled={!rolled || isSpinning}
                onClick={() => rolled && handleSelectPastRoll(rolled)}
                className={`py-1.5 px-2 rounded-xl text-left border transition-all text-xs flex flex-col justify-between ${
                  rolled
                    ? isClaimed
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-1 ring-emerald-400 shadow-sm cursor-pointer'
                      : isCurrent
                      ? 'bg-amber-500/25 border-amber-400 text-amber-200 ring-1 ring-amber-300 shadow-sm cursor-pointer'
                      : 'bg-zinc-900/90 border-zinc-700 text-zinc-300 hover:border-amber-400/60 cursor-pointer'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-600 cursor-default'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                    Rodada {roundIdx + 1}
                  </span>
                  {isClaimed && (
                    <span className="text-[8px] bg-emerald-500 text-zinc-950 px-1 rounded font-black">
                      ESCOLHIDO
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-0.5 truncate">
                  <span className="text-base">{rolled ? rolled.icon : '🎲'}</span>
                  <span className="text-[10px] sm:text-[11px] font-bold truncate">
                    {rolled ? rolled.name.split(' ')[0] : 'Pendente'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* GABINETE DA MÁQUINA + ALAVANCA LATERAL */}
      <div className="relative z-20 flex items-center justify-center pr-5 xs:pr-7 sm:pr-10">
        {/* CORPO DO GABINETE VERMELHO ESMALTADO COM ACABAMENTO 3D */}
        <div
          className="relative w-full max-w-[340px] xs:max-w-[360px] sm:max-w-[390px] rounded-t-[44px] xs:rounded-t-[50px] sm:rounded-t-[60px] rounded-b-[20px] sm:rounded-b-[28px] p-2.5 xs:p-3 sm:p-5"
          style={{
            background:
              'linear-gradient(145deg, #d91b22 0%, #a80f16 45%, #5c0408 100%)',
            boxShadow: `
              0 25px 60px rgba(0,0,0,0.9),
              inset 0 4px 12px rgba(255,255,255,0.6),
              inset 6px 0 16px rgba(255,140,140,0.3),
              inset -8px -10px 22px rgba(35,0,0,0.85)
            `,
            border: '2px solid #7f1d1d',
          }}
        >
          {/* FRISO SUPERIOR CROMADO */}
          <div
            className="rounded-t-[34px] xs:rounded-t-[40px] sm:rounded-t-[48px] rounded-b-[14px] sm:rounded-b-[20px] p-2 xs:p-2.5 sm:p-4"
            style={{
              background: 'linear-gradient(180deg, #b80f16 0%, #7d080d 100%)',
              boxShadow:
                'inset 0 6px 14px rgba(255,255,255,0.4), 0 5px 12px rgba(0,0,0,0.6)',
            }}
          >
            {/* MOLDURA CROMADA DO VISOR */}
            <div
              className="rounded-xl sm:rounded-2xl p-1.5 sm:p-2.5"
              style={{
                background:
                  'linear-gradient(135deg, #f4f4f5 0%, #71717a 25%, #e4e4e7 50%, #27272a 78%, #d4d4d8 100%)',
                boxShadow:
                  '0 8px 24px rgba(0,0,0,0.85), inset 0 2px 4px rgba(255,255,255,0.95)',
              }}
            >
              {/* JANELA DO VISOR DOS 3 CILINDROS */}
              <div
                className="relative h-[130px] xs:h-[148px] sm:h-[168px] rounded-lg bg-zinc-950 p-1.5 sm:p-2 overflow-hidden shadow-[inset_0_14px_30px_rgba(0,0,0,0.95)] border border-zinc-800"
              >
                {/* Linha vermelha central de pagamento (Payline) */}
                <div className="pointer-events-none absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[2px] bg-red-600/40 z-30" />

                {/* 3 Rolos Cilíndricos */}
                <div className="grid grid-cols-3 gap-1 sm:gap-2 h-full">
                  {[0, 1, 2].map((reelIdx) => (
                    <div
                      key={reelIdx}
                      className="relative h-full rounded-md overflow-hidden border-x-2 border-zinc-900"
                      style={{ backgroundColor: '#ebd9b4' }}
                    >
                      <div
                        className={`w-full will-change-transform ${
                          reelSpinningState[reelIdx] ? 'blur-[0.6px]' : ''
                        }`}
                        style={{
                          transform: `translateY(${reelOffsets[reelIdx] + (reelIdx === 0 ? 6 : 6)}px)`,
                        }}
                      >
                        {REEL_STRIP.map((sweet, idx) => (
                          <div
                            key={idx}
                            style={{ height: `${ITEM_HEIGHT}px` }}
                            className="w-full flex flex-col items-center justify-center px-1 py-1.5 border-b border-amber-900/15"
                          >
                            <div className="w-full h-[98px] xs:h-[105px] sm:h-[114px] rounded bg-[#fbf3e4] border border-[#b91c1c]/40 shadow-sm flex flex-col items-center justify-between p-1">
                              <div className="w-full bg-[#b91c1c] text-[#fbf3e4] text-[7px] sm:text-[8px] font-black tracking-widest uppercase text-center py-0.5 rounded-t-sm shadow-xs">
                                {sweet.tag}
                              </div>
                              <div className="my-auto flex flex-col items-center">
                                <span className="text-2xl xs:text-3xl sm:text-4xl">
                                  {sweet.icon}
                                </span>
                              </div>
                              <div className="w-full border-t border-[#b91c1c]/30 pt-0.5 text-center">
                                <p className="text-[8px] sm:text-[9.5px] font-black uppercase tracking-tighter text-[#991b1b] leading-none truncate">
                                  {sweet.name}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Efeito 3D de tambor cilíndrico */}
                      <div
                        className="pointer-events-none absolute inset-0 z-20"
                        style={{
                          background:
                            'linear-gradient(180deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.25) 20%, rgba(255,255,255,0.22) 50%, rgba(0,0,0,0.25) 80%, rgba(0,0,0,0.88) 100%)',
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* BANCADA DE CONTROLE CROMADA */}
          <div
            className="mt-2.5 sm:mt-3 px-2 sm:px-3 py-2 sm:py-3 rounded-xl flex items-center justify-between gap-1.5"
            style={{
              background:
                'linear-gradient(180deg, #6e060a 0%, #990d13 45%, #5e0508 100%)',
              boxShadow:
                'inset 0 3px 6px rgba(0,0,0,0.65), 0 2px 3px rgba(255,255,255,0.25)',
            }}
          >
            {/* 4 Botões Quadrados Cromados para Inspecionar os Doces */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              {RETRO_SWEET_PRIZES.map((item) => {
                const isSelected = selectedPreview?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setSelectedPreview(isSelected ? null : item)
                    }
                    title={item.name}
                    className={`w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 rounded-md p-[2px] transition-transform active:translate-y-0.5 cursor-pointer ${
                      isSelected ? 'translate-y-0.5 ring-2 ring-amber-300' : ''
                    }`}
                    style={{
                      background:
                        'linear-gradient(145deg, #ffffff 0%, #71717a 50%, #27272a 100%)',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.7)',
                    }}
                  >
                    <div
                      className="w-full h-full rounded-[4px] flex items-center justify-center text-xs sm:text-base"
                      style={{
                        background:
                          'linear-gradient(180deg, #e4e4e7 0%, #a1a1aa 50%, #71717a 100%)',
                      }}
                    >
                      {item.icon}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Botão Cromado de Som (Mudo / Ativo) */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Silenciar Áudio' : 'Ativar Efeitos Sonoros'}
              className="w-6 h-6 xs:w-7 xs:h-7 rounded-full p-[2px] cursor-pointer"
              style={{
                background:
                  'linear-gradient(145deg, #f4f4f5, #52525b, #18181b)',
                boxShadow: '0 3px 6px rgba(0,0,0,0.8)',
              }}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-b from-zinc-300 to-zinc-600 flex items-center justify-center text-zinc-900">
                {soundEnabled ? (
                  <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                ) : (
                  <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-800" />
                )}
              </div>
            </button>

            {/* Botão Redondo Cromado de Disparo (SPIN) */}
            <button
              type="button"
              onClick={triggerSpin}
              disabled={isSpinning || spinsLeft <= 0}
              className={`w-11 h-9 xs:w-12 xs:h-10 sm:w-14 sm:h-11 rounded-full p-1 transition-all ${
                isSpinning || spinsLeft <= 0
                  ? 'opacity-60 cursor-not-allowed'
                  : 'hover:brightness-110 active:translate-y-1 cursor-pointer'
              }`}
              style={{
                background:
                  'linear-gradient(145deg, #ffffff 0%, #71717a 45%, #18181b 100%)',
                boxShadow: '0 6px 10px rgba(0,0,0,0.85)',
              }}
            >
              <div
                className="w-full h-full rounded-full flex items-center justify-center font-black text-[9px] sm:text-[10px] tracking-wider text-zinc-900 uppercase"
                style={{
                  background:
                    'radial-gradient(circle at 35% 30%, #ffffff 0%, #d4d4d8 40%, #52525b 100%)',
                }}
              >
                {isSpinning ? '...' : spinsLeft > 0 ? `GIRO (${spinsLeft})` : 'FIM'}
              </div>
            </button>
          </div>

          {/* Modal / Card de Prévia do Doce ao Clicar nos Botões de Inspeção */}
          {selectedPreview && !isSpinning && (
            <div className="mt-2.5 p-3 rounded-xl bg-zinc-950/95 border border-amber-400/60 shadow-xl text-center animate-fade-in">
              <div className="flex items-center justify-between text-left">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedPreview.icon}</span>
                  <div>
                    <h5 className="text-xs font-black uppercase text-amber-300">
                      {selectedPreview.name}
                    </h5>
                    <p className="text-[10px] text-zinc-400">
                      {selectedPreview.subtitle}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPreview(null)}
                  className="text-zinc-400 hover:text-white text-xs px-2 py-1"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* GAVETA INFERIOR DE PRÊMIOS E ESCOLHA (DISPENSER CROMADO) */}
          <div
            className="mt-2.5 sm:mt-3 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex flex-col items-center justify-center relative"
            style={{
              background: 'linear-gradient(180deg, #87090e 0%, #630509 100%)',
              boxShadow:
                'inset 0 4px 12px rgba(0,0,0,0.75), 0 2px 2px rgba(255,255,255,0.2)',
              border: '1px solid #450a0a',
            }}
          >
            {/* Abertura Cromada Retrô */}
            <div
              className="w-32 xs:w-36 sm:w-44 h-8 xs:h-9 sm:h-11 rounded-md sm:rounded-lg p-1 sm:p-1.5"
              style={{
                background:
                  'linear-gradient(135deg, #f4f4f5 0%, #52525b 45%, #e4e4e7 70%, #18181b 100%)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.8)',
              }}
            >
              <div className="w-full h-full rounded bg-zinc-950 shadow-[inset_0_3px_8px_rgba(0,0,0,1)] flex items-center justify-center overflow-hidden">
                <span className="text-[8px] xs:text-[8.5px] sm:text-[9.5px] font-black tracking-widest uppercase text-amber-400">
                  {isSpinning
                    ? 'SORTEANDO RODADA...'
                    : currentPrize
                    ? '★ DOCE SORTEADO ★'
                    : spinsLeft > 0
                    ? `PUXE A ALAVANCA (${spinsLeft}X)`
                    : 'RODADAS ESGOTADAS'}
                </span>
              </div>
            </div>

            {/* CARD DO DOCE SORTEADO COM OPÇÃO DE RESGATAR OU GIRAR NOVAMENTE */}
            {currentPrize && !isSpinning && (
              <div className="w-full mt-2.5 sm:mt-3 p-3 sm:p-4 rounded-xl bg-[#fbf3e4] text-zinc-900 border-2 border-amber-500 shadow-2xl text-center animate-fade-in">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#b91c1c] text-[#fbf3e4] text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1 shadow-sm">
                  <Trophy className="w-3 h-3 text-amber-300" />
                  Sorteio da Máquina Retrô
                </div>

                <div className="text-3xl sm:text-4xl my-1">{currentPrize.icon}</div>

                <h3 className="text-sm sm:text-base font-black uppercase text-[#7f1d1d] leading-tight">
                  {currentPrize.name}
                </h3>
                <p className="text-[11px] text-zinc-600 font-medium mb-1">
                  {currentPrize.subtitle}
                </p>

                <div className="inline-flex items-center gap-1 bg-emerald-100 border border-emerald-400 text-emerald-800 text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full mb-2.5 uppercase">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Brinde Incluso no Combo Casal (R$ 0,00)
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <button
                    type="button"
                    onClick={() => handleClaim(currentPrize)}
                    className="w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg bg-gradient-to-r from-[#b91c1c] via-[#dc2626] to-[#991b1b] text-white font-black text-xs uppercase tracking-wider shadow hover:brightness-110 active:scale-[0.99] transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Quero Este Brinde no Combo!
                  </button>

                  {spinsLeft > 0 && (
                    <button
                      type="button"
                      onClick={triggerSpin}
                      className="w-full py-2 px-3 rounded-lg bg-zinc-900 text-amber-300 font-bold text-[11px] uppercase tracking-wider hover:bg-zinc-800 active:scale-[0.99] transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Tentar Outro Doce (Restam {spinsLeft}{' '}
                      {spinsLeft === 1 ? 'rodada' : 'rodadas'})
                    </button>
                  )}

                  {/* Se tem mais de 1 doce no histórico, permite escolher qualquer um dos anteriores */}
                  {rolledHistory.length > 1 && (
                    <div className="pt-2 border-t border-amber-900/20 text-left">
                      <span className="text-[9px] font-bold text-zinc-600 uppercase block mb-1">
                        Ou escolha entre os doces sorteados:
                      </span>
                      <div className="flex items-center gap-1 flex-wrap">
                        {rolledHistory.map((h, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setCurrentPrize(h)}
                            className={`px-2 py-1 rounded text-[10px] font-bold border transition flex items-center gap-1 cursor-pointer ${
                              currentPrize.id === h.id
                                ? 'bg-[#b91c1c] text-white border-[#b91c1c]'
                                : 'bg-white/80 text-zinc-800 border-zinc-300 hover:border-zinc-500'
                            }`}
                          >
                            <span>{h.icon}</span>
                            <span>{h.name.split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Aviso quando ainda não girou nenhuma vez */}
            {!currentPrize && !isSpinning && (
              <div className="mt-3 text-center px-2 py-1">
                <p className="text-[11px] text-amber-200/90 font-medium leading-relaxed">
                  Puxe a alavanca lateral ou aperte o botão redondo <strong>SPIN</strong> para usar suas {spinsLeft} rodadas!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ALAVANCA MECÂNICA CROMADA COM BOLA VERMELHA */}
        <div className="relative h-50 xs:h-56 sm:h-64 w-7 xs:w-8 sm:w-12 flex flex-col items-center justify-end -ml-1 select-none shrink-0">
          <div
            onClick={triggerSpin}
            title={spinsLeft > 0 ? 'Puxar Alavanca' : 'Sem rodadas restantes'}
            className={`origin-bottom transition-all duration-300 ease-in-out ${
              isSpinning || spinsLeft <= 0 ? 'cursor-not-allowed opacity-70' : 'cursor-pointer group'
            }`}
            style={{
              transform: leverPulled
                ? 'translateY(55px) scaleY(0.55) rotate(14deg)'
                : 'translateY(0px) scaleY(1) rotate(5deg)',
            }}
          >
            {/* Bola Vermelha Brilhante no Topo da Alavanca */}
            <div
              className="w-7 h-7 xs:w-8 xs:h-8 sm:w-12 sm:h-12 rounded-full -mb-1.5 sm:-mb-2 mx-auto relative z-20 transition-transform group-hover:scale-110 shadow-lg"
              style={{
                background:
                  'radial-gradient(circle at 32% 30%, #ff8a8a 0%, #dc2626 30%, #991b1b 70%, #450a0a 100%)',
                boxShadow: '0 6px 14px rgba(0,0,0,0.8)',
              }}
            />

            {/* Haste Metálica Cromada */}
            <div
              className="w-2 xs:w-2.5 sm:w-3.5 h-28 xs:h-32 sm:h-40 mx-auto rounded-full"
              style={{
                background:
                  'linear-gradient(90deg, #52525b 0%, #fafafa 45%, #27272a 85%, #a1a1aa 100%)',
                boxShadow: '3px 5px 10px rgba(0,0,0,0.75)',
              }}
            />
          </div>

          {/* Base Cilíndrica Cromada */}
          <div
            className="w-5 xs:w-6 sm:w-10 h-10 xs:h-12 sm:h-16 rounded-r-lg sm:rounded-r-xl -mt-2 sm:-mt-3 relative z-10"
            style={{
              background:
                'linear-gradient(180deg, #e4e4e7 0%, #71717a 35%, #27272a 75%, #a1a1aa 100%)',
              boxShadow:
                '4px 8px 16px rgba(0,0,0,0.85), inset -2px 2px 4px rgba(255,255,255,0.7)',
              borderLeft: '2px solid #18181b',
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default RetroSlotMachine;
