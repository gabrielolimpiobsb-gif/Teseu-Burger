'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Zap,
  Volume2,
  VolumeX,
  Plus,
  Minus,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Info,
  Gift,
  Heart,
  X,
  Trophy,
  Flame,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

// Os 4 Doces Artesanais cadastrados na Teseu Burger
export interface SweetSymbol {
  id: string;
  name: string;
  subtitle: string;
  tag: string;
  icon: string;
  badge: string;
  color: string;
  accent: string;
}

export const SWEET_SYMBOLS: SweetSymbol[] = [
  {
    id: 'cookie-80g',
    name: 'Cookie Supremo',
    subtitle: 'Gotas de Chocolate Belga 80g',
    tag: 'COOKIE',
    icon: '🍪',
    badge: '★ OURO ★',
    color: '#991b1b',
    accent: '#fbbf24',
  },
  {
    id: 'brigadeiro-gourmet',
    name: 'Brigadeiro Gourmet',
    subtitle: 'Cacau Nobre 70% Feito na Casa',
    tag: 'BRIGADEIRO',
    icon: '🍫',
    badge: '★ VIP ★',
    color: '#451a03',
    accent: '#f59e0b',
  },
  {
    id: 'brownie-fudge',
    name: 'Brownie Supremo',
    subtitle: 'Casquinha Crocante & Fudge Artesanal',
    tag: 'BROWNIE',
    icon: '🥮',
    badge: '★ TOP ★',
    color: '#1c1917',
    accent: '#eab308',
  },
  {
    id: 'bombom-teseu',
    name: 'Bombom da Casa',
    subtitle: 'Recheio Cremoso Especial do Templo',
    tag: 'BOMBOM',
    icon: '🍬',
    badge: '★ RARO ★',
    color: '#831843',
    accent: '#f43f5e',
  },
];

interface TeseuFortuneProps {
  onClaimPrize?: (prize: SweetSymbol) => void;
  onOpenRules?: () => void;
}

export function TeseuFortune({ onClaimPrize, onOpenRules }: TeseuFortuneProps) {
  const router = useRouter();
  const { cartItems, addToCart, showToast, setIsCartOpen } = useCart();

  // Estados do Jogo:
  // attemptCount: 0 = inicial, 1 = 1ª tentativa feita, 2 = 2ª tentativa feita, 3 = 3ª tentativa (vitória garantida)
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [turboMode, setTurboMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Fases: 'idle' | 'spinning' | 'near-miss' | 'jackpot'
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'near-miss' | 'jackpot'>('idle');

  // Doce vencedor da 3ª rodada
  const [winningSweet, setWinningSweet] = useState<SweetSymbol>(SWEET_SYMBOLS[0]);

  // Mensagem de status na barra de jogo
  const [statusMessage, setStatusMessage] = useState<string>(
    'ALINHE 3 DOCES IGUAIS PARA GANHAR SEU BRINDE!'
  );

  // Estados visuais dos 3 cilindros clássicos de caça-níquel
  // Cada rolo exibe [superior, central (linha de ganho), inferior]
  const [reel1, setReel1] = useState<[SweetSymbol, SweetSymbol, SweetSymbol]>([
    SWEET_SYMBOLS[0],
    SWEET_SYMBOLS[1],
    SWEET_SYMBOLS[2],
  ]);
  const [reel2, setReel2] = useState<[SweetSymbol, SweetSymbol, SweetSymbol]>([
    SWEET_SYMBOLS[1],
    SWEET_SYMBOLS[2],
    SWEET_SYMBOLS[3],
  ]);
  const [reel3, setReel3] = useState<[SweetSymbol, SweetSymbol, SweetSymbol]>([
    SWEET_SYMBOLS[2],
    SWEET_SYMBOLS[0],
    SWEET_SYMBOLS[1],
  ]);

  // Indicador de rotação individual de cada rolo para efeito de desfoque
  const [spinningReels, setSpinningReels] = useState<[boolean, boolean, boolean]>([
    false,
    false,
    false,
  ]);

  // Indicador de desaceleração gradual (parando devagar)
  const [deceleratingReels, setDeceleratingReels] = useState<[boolean, boolean, boolean]>([
    false,
    false,
    false,
  ]);

  // Modo de Tensão / Suspense no 3º rolo quando os 2 primeiros já alinharam
  const [isSuspense, setIsSuspense] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeTimersRef = useRef<NodeJS.Timeout[]>([]);

  // Limpa todos os temporizadores ativos ao reiniciar ou desmontar
  const clearAllTimers = useCallback(() => {
    activeTimersRef.current.forEach((t) => clearTimeout(t));
    activeTimersRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  // Inicializa Web Audio API
  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Sintetizador de Som
  const playTone = useCallback(
    (freq: number, type: OscillatorType = 'sine', duration = 0.1, volume = 0.2) => {
      if (!soundEnabled) return;
      try {
        const ctx = getAudioCtx();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch {}
    },
    [getAudioCtx, soundEnabled]
  );

  // Clique mecânico de desaceleração das engrenagens
  const playDecelClick = useCallback(
    (pitch = 240) => {
      if (!soundEnabled) return;
      playTone(pitch, 'square', 0.05, 0.18);
    },
    [playTone, soundEnabled]
  );

  // Pulso cardíaco de suspense (tensão antes do 3º rolo travar)
  const playSuspensePulse = useCallback(
    (step: number) => {
      if (!soundEnabled) return;
      playTone(130 + step * 30, 'triangle', 0.12, 0.35);
      setTimeout(() => {
        playTone(580 + step * 70, 'sine', 0.08, 0.22);
      }, 70);
    },
    [playTone, soundEnabled]
  );

  // Som mecânico pesado de travamento do rolo (clunk)
  const playReelStopSound = useCallback(
    (reelIndex: number, isMatch = false) => {
      if (!soundEnabled) return;
      const baseFreq = isMatch ? 280 : 160 + reelIndex * 50;
      playTone(baseFreq, 'square', 0.15, 0.35);
      if (isMatch) {
        setTimeout(() => playTone(baseFreq * 1.5, 'sine', 0.12, 0.25), 60);
      }
    },
    [playTone, soundEnabled]
  );

  // Fanfarra clássica de Jackpot
  const playJackpotFanfare = useCallback(() => {
    if (!soundEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98, 2093.0];
    notes.forEach((freq, idx) => {
      setTimeout(() => playTone(freq, 'triangle', 0.35, 0.3), idx * 75);
    });
  }, [playTone, soundEnabled]);

  // Som de decepção / raspou na trave (near-miss)
  const playNearMissSound = useCallback(() => {
    if (!soundEnabled) return;
    playTone(380, 'sawtooth', 0.15, 0.25);
    setTimeout(() => playTone(300, 'sawtooth', 0.2, 0.25), 140);
    setTimeout(() => playTone(220, 'sawtooth', 0.35, 0.28), 300);
  }, [playTone, soundEnabled]);

  // Randomizador de doce
  const getRandomSweet = () =>
    SWEET_SYMBOLS[Math.floor(Math.random() * SWEET_SYMBOLS.length)];

  // DISPARO DO GIRO COM DESACELERAÇÃO REALISTA E SUSPENSE DE QUASE VITÓRIA
  const handleStartSpin = () => {
    if (phase === 'spinning' || attemptCount >= 3) return;

    clearAllTimers();

    const nextAttempt = attemptCount + 1;
    setAttemptCount(nextAttempt);
    setPhase('spinning');
    setIsSuspense(false);
    setStatusMessage('GIRANDO EM ALTA VELOCIDADE...');
    setSpinningReels([true, true, true]);
    setDeceleratingReels([false, false, false]);

    const speed = turboMode ? 0.65 : 1;

    // Doce alvo desta rodada (tanto na tentativa 1, 2 quanto na 3, os dois primeiros rolos vão cravar nele!)
    const chosenTarget = getRandomSweet();

    // Doce diferente para a tentativa 1 e 2 (para dar o near-miss)
    const otherSweet =
      SWEET_SYMBOLS.find((s) => s.id !== chosenTarget.id) || SWEET_SYMBOLS[1];

    const addTimer = (fn: () => void, ms: number) => {
      const t = setTimeout(fn, ms * speed);
      activeTimersRef.current.push(t);
      return t;
    };

    // FASE 1: EMBARALHAMENTO RÁPIDO DOS ROLOS (ALTA VELOCIDADE)
    const scrambleInterval = setInterval(() => {
      playTone(380 + Math.random() * 140, 'triangle', 0.03, 0.05);
      setReel1([getRandomSweet(), getRandomSweet(), getRandomSweet()]);
      setReel2([getRandomSweet(), getRandomSweet(), getRandomSweet()]);
      setReel3([getRandomSweet(), getRandomSweet(), getRandomSweet()]);
    }, 60);

    // FASE 2: ROLO 1 DESACELERANDO ("PARANDO DEVAGAR")
    addTimer(() => {
      setDeceleratingReels([true, false, false]);
      setStatusMessage('ROLO 1 DESACELERANDO...');
      playDecelClick(260);
    }, 700);

    addTimer(() => {
      setReel1([getRandomSweet(), getRandomSweet(), getRandomSweet()]);
      playDecelClick(240);
    }, 850);

    addTimer(() => {
      setReel1([getRandomSweet(), getRandomSweet(), getRandomSweet()]);
      playDecelClick(220);
    }, 1020);

    // ROLO 1 TRAVA NO ALVO
    addTimer(() => {
      setSpinningReels([false, true, true]);
      setDeceleratingReels([false, false, false]);
      setReel1([getRandomSweet(), chosenTarget, getRandomSweet()]);
      playReelStopSound(0, true);
      setStatusMessage(`🎯 1º ROLO TRAVADO: ${chosenTarget.name.toUpperCase()}!`);
    }, 1200);

    // FASE 3: ROLO 2 DESACELERANDO ("PARANDO DEVAGAR")
    addTimer(() => {
      setDeceleratingReels([false, true, false]);
      setStatusMessage('ROLO 2 DESACELERANDO...');
      playDecelClick(280);
    }, 1400);

    addTimer(() => {
      setReel2([getRandomSweet(), getRandomSweet(), getRandomSweet()]);
      playDecelClick(260);
    }, 1560);

    addTimer(() => {
      setReel2([getRandomSweet(), getRandomSweet(), getRandomSweet()]);
      playDecelClick(240);
    }, 1740);

    // ROLO 2 TRAVA NO MESMO ALVO (CRIA O SUSPENSE DE 2x IGUAIS!)
    addTimer(() => {
      setSpinningReels([false, false, true]);
      setDeceleratingReels([false, false, false]);
      setReel2([getRandomSweet(), chosenTarget, getRandomSweet()]);
      playReelStopSound(1, true);
    }, 1950);

    // FASE 4: MOMENTO CLÍMAX - O GRANDE SUSPENSE (TENSÃO MÁXIMA ANTES DO 3º ROLO!)
    addTimer(() => {
      setIsSuspense(true);
      setStatusMessage(`⚡ SUSPENSE! 2x ${chosenTarget.name.toUpperCase()} ALINHADOS! FALTA SÓ 1! ⚡`);
      playSuspensePulse(1);
    }, 2050);

    addTimer(() => playSuspensePulse(2), 2300);
    addTimer(() => playSuspensePulse(3), 2550);
    addTimer(() => playSuspensePulse(4), 2800);

    // FASE 5: ROLO 3 DESACELERA EM CÂMERA LENTA ("PARANDO BEM DEVAGAR")
    addTimer(() => {
      setDeceleratingReels([false, false, true]);
      setStatusMessage(`🔥 SEGURA O CORAÇÃO! ROLO 3 PARANDO... 🔥`);
      playDecelClick(220);
    }, 2900);

    addTimer(() => {
      setReel3([getRandomSweet(), getRandomSweet(), getRandomSweet()]);
      playDecelClick(200);
    }, 3120);

    addTimer(() => {
      setReel3([getRandomSweet(), getRandomSweet(), getRandomSweet()]);
      playDecelClick(180);
    }, 3380);

    addTimer(() => {
      // Quase parando...
      setReel3([getRandomSweet(), getRandomSweet(), getRandomSweet()]);
      playDecelClick(160);
    }, 3680);

    // FASE 6: TRAVAMENTO FINAL DO ROLO 3
    addTimer(() => {
      clearInterval(scrambleInterval);
      setSpinningReels([false, false, false]);
      setDeceleratingReels([false, false, false]);
      setIsSuspense(false);

      if (nextAttempt < 3) {
        // ==========================================
        // TENTATIVAS 1 E 2: O DRAMA DO "RASPOU NA TRAVE!"
        // O 3º rolo para no outro doce, mas o doce vencedor fica visível
        // na linha de cima ou de baixo mostrando que faltou quase nada!
        // ==========================================
        const topItem = nextAttempt === 1 ? chosenTarget : getRandomSweet();
        const bottomItem = nextAttempt === 2 ? chosenTarget : getRandomSweet();

        setReel3([topItem, otherSweet, bottomItem]);
        playReelStopSound(2, false);
        playNearMissSound();
        setPhase('near-miss');

        if (nextAttempt === 1) {
          setStatusMessage(
            `😱 RASPOU NA TRAVE! 2x ${chosenTarget.name.toUpperCase()} + 1x ${otherSweet.name.toUpperCase()}! Faltou 1 milímetro!`
          );
        } else {
          setStatusMessage(
            `💔 POR UM TRIZ! 2x ${chosenTarget.name.toUpperCase()}! Na 3ª tentativa a vitória é garantida!`
          );
        }
      } else {
        // ==========================================
        // TENTATIVA 3: VITÓRIA GARANTIDA! 3x IGUAIS NO CENTRO!
        // ==========================================
        setReel3([getRandomSweet(), chosenTarget, getRandomSweet()]);
        setWinningSweet(chosenTarget);
        playReelStopSound(2, true);
        playJackpotFanfare();
        setPhase('jackpot');
        setStatusMessage(
          `🎉 JACKPOT! 3x ${chosenTarget.name.toUpperCase()} 100% ALINHADOS! 🎉`
        );
      }
    }, 4020);
  };

  // Reiniciar jogo para jogar novamente
  const handleReset = () => {
    clearAllTimers();
    setIsSuspense(false);
    setAttemptCount(0);
    setPhase('idle');
    setStatusMessage('ALINHE 3 DOCES IGUAIS PARA GANHAR SEU BRINDE!');
    setSpinningReels([false, false, false]);
    setDeceleratingReels([false, false, false]);
    setReel1([SWEET_SYMBOLS[0], SWEET_SYMBOLS[1], SWEET_SYMBOLS[2]]);
    setReel2([SWEET_SYMBOLS[1], SWEET_SYMBOLS[2], SWEET_SYMBOLS[3]]);
    setReel3([SWEET_SYMBOLS[2], SWEET_SYMBOLS[0], SWEET_SYMBOLS[1]]);
  };

  // Resgatar brinde no Combo Casal
  const handleClaimReward = () => {
    if (onClaimPrize) {
      onClaimPrize(winningSweet);
      return;
    }

    const hasComboCasalInCart = cartItems.some(
      (item) => item.comboCasal || item.menuItemId === 'combo-casal'
    );

    if (hasComboCasalInCart) {
      addToCart({
        menuItemId: `brinde-${winningSweet.id}`,
        name: `Brinde Cortesia: ${winningSweet.name}`,
        unitPrice: 0,
        quantity: 1,
        totalPrice: 0,
        imageType: 'dessert',
        selectedToppings: [],
        isComboUpgrade: false,
        drawnSweetGift: winningSweet.name,
        notes: '1 Brinde cortesia vinculado à compra do Combo Casal',
      });
      showToast(`🎁 1 Brinde ${winningSweet.name} ativado no seu Combo Casal (R$ 0,00)!`);
      router.push('/carinho');
    } else {
      showToast(`🎰 1 Brinde "${winningSweet.name}" adicionado ao seu Combo Casal!`);
      router.push(`/produto/combo-casal?brinde=${encodeURIComponent(winningSweet.name)}`);
    }
  };

  const spinsLeft = Math.max(0, 3 - attemptCount);

  return (
    <div className="relative w-full max-w-[430px] mx-auto h-full max-h-[100dvh] rounded-3xl sm:rounded-[36px] bg-[#1a0404] border-2 sm:border-4 border-amber-500/80 shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden select-none font-sans flex flex-col justify-between">
      {/* 1. TOPO DA MÁQUINA RETRÔ EM METAL VERMELHO E CROMO */}
      <div className="relative z-20 pt-2 pb-1.5 px-3 bg-gradient-to-b from-[#450a0a] via-[#7f1d1d] to-[#450a0a] border-b-2 border-amber-400 shadow-md shrink-0">
        <div className="flex items-center justify-between text-[10px] text-amber-200/90 font-bold mb-0.5">
          <span className="flex items-center gap-1.5 uppercase font-mono tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>MÁQUINA RETRÔ TESEU</span>
          </span>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-black/50 text-amber-300 font-mono text-[9px] border border-amber-500/40">
              {attemptCount === 0
                ? '3 TENTATIVAS'
                : attemptCount === 1
                ? 'TENTATIVA 2 DE 3'
                : attemptCount === 2
                ? 'ÚLTIMA TENTATIVA'
                : 'JACKPOT CONCLUÍDO'}
            </span>
            {onOpenRules && (
              <button
                type="button"
                onClick={onOpenRules}
                className="text-amber-300 hover:text-white transition"
                title="Regras"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Título de Cassino Dourado Chanfrado */}
        <div className="text-center py-0.5">
          <h1
            className="text-lg sm:text-2xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-400 to-orange-600 leading-tight"
            style={{
              filter: 'drop-shadow(0 2px 0px #450a0a) drop-shadow(0 0 10px rgba(245,158,11,0.6))',
              WebkitTextStroke: '1px #78350f',
            }}
          >
            CAÇA-NÍQUEL DE DOCES
          </h1>
        </div>
      </div>

      {/* 2. VISOR CENTRAL COM OS 3 ROLOS CLÁSSICOS (CILINDROS VINTAGE CREME/MARFIM) */}
      <div className="relative z-10 flex-1 min-h-0 flex flex-col justify-center px-2 sm:px-3 py-1.5 bg-gradient-to-b from-[#2e0707] via-[#480c0c] to-[#200404] overflow-hidden">
        {/* Moldura de Aço Cromado do Visor */}
        <div className="relative w-full h-[95%] rounded-2xl bg-gradient-to-b from-slate-300 via-slate-100 to-slate-400 p-2 shadow-[inset_0_4px_12px_rgba(0,0,0,0.8),0_6px_20px_rgba(0,0,0,0.6)] flex flex-col justify-between overflow-hidden">
          {/* Vidro Interno com Sombreamento Cilíndrico 3D */}
          <div className="relative w-full h-full rounded-xl bg-[#2a0808] border-2 border-slate-700/60 overflow-hidden flex flex-col justify-between">
            {/* LINHA DE PAGAMENTO HORIZONTAL CENTRAL (WIN LINE) */}
            <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 z-30 h-16 sm:h-20 border-y-2 border-amber-400/80 bg-amber-400/10 flex items-center justify-between px-1.5 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
              <span className="text-[8px] font-black font-mono text-amber-300 bg-black/80 px-1 py-0.5 rounded border border-amber-400/60 shadow">
                ◀ 1
              </span>
              <span className="text-[7.5px] sm:text-[8px] font-black tracking-widest text-amber-200/90 uppercase bg-black/70 px-2 py-0.5 rounded-full border border-amber-400/40">
                LINHA DE PREMIAÇÃO (3x IGUAIS)
              </span>
              <span className="text-[8px] font-black font-mono text-amber-300 bg-black/80 px-1 py-0.5 rounded border border-amber-400/60 shadow">
                1 ▶
              </span>
            </div>

            {/* CONTAINER DOS 3 ROLOS CILÍNDRICOS */}
            <div className="relative flex-1 grid grid-cols-3 gap-1.5 p-1 bg-[#150202]">
              {/* ROLO 1 */}
              <div
                className={`relative h-full rounded-lg bg-[#efe4ce] border border-amber-900/40 flex flex-col justify-between py-1 px-1 shadow-[inset_0_10px_20px_rgba(0,0,0,0.7),inset_0_-10px_20px_rgba(0,0,0,0.7)] transition-all ${
                  spinningReels[0]
                    ? 'blur-[2px] opacity-85 scale-[0.98]'
                    : deceleratingReels[0]
                    ? 'blur-[0.5px] opacity-95 transition-all duration-150'
                    : 'blur-none opacity-100 scale-100'
                }`}
              >
                {/* Linha Superior */}
                <div className="h-[28%] flex flex-col items-center justify-center opacity-35 scale-90">
                  <span className="text-xl sm:text-2xl">{reel1[0].icon}</span>
                  <span className="text-[7px] font-bold text-neutral-700">{reel1[0].tag}</span>
                </div>
                {/* Linha Central (Linha de Premiação) */}
                <div
                  className={`h-[42%] rounded-lg flex flex-col items-center justify-center transition-all ${
                    phase === 'jackpot'
                      ? 'bg-amber-100 border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)] scale-105 z-20'
                      : isSuspense
                      ? 'bg-emerald-100/95 border-2 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.9)] scale-105 z-20'
                      : 'bg-white/80 border border-amber-800/20'
                  }`}
                >
                  <span className="text-3xl sm:text-4xl filter drop-shadow leading-none">
                    {reel1[1].icon}
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-black text-red-950 uppercase mt-0.5 tracking-tight">
                    {reel1[1].name.split(' ')[0]}
                  </span>
                  <span className="text-[6.5px] font-black text-amber-700 uppercase">
                    {isSuspense ? '✔ ALINHADO' : reel1[1].badge}
                  </span>
                </div>
                {/* Linha Inferior */}
                <div className="h-[28%] flex flex-col items-center justify-center opacity-35 scale-90">
                  <span className="text-xl sm:text-2xl">{reel1[2].icon}</span>
                  <span className="text-[7px] font-bold text-neutral-700">{reel1[2].tag}</span>
                </div>
              </div>

              {/* ROLO 2 */}
              <div
                className={`relative h-full rounded-lg bg-[#efe4ce] border border-amber-900/40 flex flex-col justify-between py-1 px-1 shadow-[inset_0_10px_20px_rgba(0,0,0,0.7),inset_0_-10px_20px_rgba(0,0,0,0.7)] transition-all ${
                  spinningReels[1]
                    ? 'blur-[2px] opacity-85 scale-[0.98]'
                    : deceleratingReels[1]
                    ? 'blur-[0.5px] opacity-95 transition-all duration-150'
                    : 'blur-none opacity-100 scale-100'
                }`}
              >
                {/* Linha Superior */}
                <div className="h-[28%] flex flex-col items-center justify-center opacity-35 scale-90">
                  <span className="text-xl sm:text-2xl">{reel2[0].icon}</span>
                  <span className="text-[7px] font-bold text-neutral-700">{reel2[0].tag}</span>
                </div>
                {/* Linha Central (Linha de Premiação) */}
                <div
                  className={`h-[42%] rounded-lg flex flex-col items-center justify-center transition-all ${
                    phase === 'jackpot'
                      ? 'bg-amber-100 border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)] scale-105 z-20'
                      : isSuspense
                      ? 'bg-emerald-100/95 border-2 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.9)] scale-105 z-20'
                      : 'bg-white/80 border border-amber-800/20'
                  }`}
                >
                  <span className="text-3xl sm:text-4xl filter drop-shadow leading-none">
                    {reel2[1].icon}
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-black text-red-950 uppercase mt-0.5 tracking-tight">
                    {reel2[1].name.split(' ')[0]}
                  </span>
                  <span className="text-[6.5px] font-black text-amber-700 uppercase">
                    {isSuspense ? '✔ ALINHADO' : reel2[1].badge}
                  </span>
                </div>
                {/* Linha Inferior */}
                <div className="h-[28%] flex flex-col items-center justify-center opacity-35 scale-90">
                  <span className="text-xl sm:text-2xl">{reel2[2].icon}</span>
                  <span className="text-[7px] font-bold text-neutral-700">{reel2[2].tag}</span>
                </div>
              </div>

              {/* ROLO 3 (O ROLO DO SUSPENSE!) */}
              <div
                className={`relative h-full rounded-lg bg-[#efe4ce] flex flex-col justify-between py-1 px-1 transition-all ${
                  isSuspense
                    ? 'border-2 border-yellow-300 ring-4 ring-yellow-400/90 shadow-[0_0_25px_rgba(250,204,21,1)] animate-pulse z-30'
                    : 'border border-amber-900/40 shadow-[inset_0_10px_20px_rgba(0,0,0,0.7),inset_0_-10px_20px_rgba(0,0,0,0.7)]'
                } ${
                  spinningReels[2]
                    ? 'blur-[2px] opacity-85 scale-[0.98]'
                    : deceleratingReels[2]
                    ? 'blur-[0.5px] opacity-95 transition-all duration-200'
                    : 'blur-none opacity-100 scale-100'
                }`}
              >
                {/* Badge Flutuante de Suspense */}
                {isSuspense && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-40 px-2 py-0.5 rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-yellow-300 text-black font-black text-[7px] uppercase tracking-wider shadow-xl animate-bounce border border-yellow-200 whitespace-nowrap">
                    ⚡ SUSPENSE! ⚡
                  </div>
                )}

                {/* Linha Superior */}
                <div className="h-[28%] flex flex-col items-center justify-center opacity-35 scale-90">
                  <span className="text-xl sm:text-2xl">{reel3[0].icon}</span>
                  <span className="text-[7px] font-bold text-neutral-700">{reel3[0].tag}</span>
                </div>
                {/* Linha Central (Linha de Premiação) */}
                <div
                  className={`h-[42%] rounded-lg flex flex-col items-center justify-center transition-all ${
                    phase === 'jackpot'
                      ? 'bg-amber-100 border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)] scale-105 z-20'
                      : phase === 'near-miss'
                      ? 'bg-red-100/90 border border-red-500/60'
                      : 'bg-white/80 border border-amber-800/20'
                  }`}
                >
                  <span className="text-3xl sm:text-4xl filter drop-shadow leading-none">
                    {reel3[1].icon}
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-black text-red-950 uppercase mt-0.5 tracking-tight">
                    {reel3[1].name.split(' ')[0]}
                  </span>
                  <span className="text-[6.5px] font-black text-amber-700 uppercase">
                    {reel3[1].badge}
                  </span>
                </div>
                {/* Linha Inferior */}
                <div className="h-[28%] flex flex-col items-center justify-center opacity-35 scale-90">
                  <span className="text-xl sm:text-2xl">{reel3[2].icon}</span>
                  <span className="text-[7px] font-bold text-neutral-700">{reel3[2].tag}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FAIXA DE STATUS / JACKPOT CELEBRATION BANNER */}
      <div className="relative z-20 bg-gradient-to-b from-[#3a0707] to-[#1c0303] border-t-2 border-amber-500 px-3 py-1.5 shrink-0">
        <div
          className={`px-3 py-1 rounded-xl border text-center transition-all ${
            phase === 'jackpot'
              ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black border-yellow-200 shadow-[0_0_20px_rgba(251,191,36,0.8)] animate-bounce font-black'
              : isSuspense
              ? 'bg-gradient-to-r from-red-600 via-amber-500 to-yellow-300 text-black border-yellow-200 shadow-[0_0_25px_rgba(251,191,36,1)] animate-pulse font-black'
              : phase === 'near-miss'
              ? 'bg-red-950/95 text-amber-200 border-red-600/80 shadow-[0_0_10px_rgba(185,28,28,0.5)] font-bold'
              : 'bg-black/80 text-amber-300 border-amber-500/30'
          }`}
        >
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider truncate">
            {statusMessage}
          </p>
        </div>

        {/* Card de Parabéns e Botão de Resgate quando Dá 3x Iguais */}
        {phase === 'jackpot' && (
          <div className="mt-1.5 p-2 bg-gradient-to-r from-red-950 via-zinc-900 to-red-950 border-2 border-amber-400 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{winningSweet.icon}</span>
              <div className="text-left">
                <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest block">
                  PARABÉNS! BRINDE CONQUISTADO:
                </span>
                <span className="text-xs font-black text-white">{winningSweet.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleClaimReward}
                className="flex-1 sm:flex-initial py-2 px-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow hover:brightness-110 transition flex items-center justify-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Resgatar no Combo</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="p-2 bg-black/60 border border-amber-400/40 text-amber-300 rounded-xl hover:bg-black transition"
                title="Girar Novamente"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. COCKPIT INFERIOR DE CONTROLES CLÁSSICOS */}
      <div className="relative z-20 bg-[#160202] border-t border-amber-500/40 shrink-0">
        {/* Mostradores (Combo | Rodadas | Valor Brinde) */}
        <div className="grid grid-cols-3 bg-black/90 py-1 px-2 border-b border-amber-500/30 text-center">
          <div className="flex flex-col items-center">
            <span className="text-[7px] sm:text-[8px] text-amber-400/80 uppercase font-bold">
              Combo Casal
            </span>
            <span className="text-[10px] sm:text-xs font-black text-white">R$ 79,90</span>
          </div>
          <div className="flex flex-col items-center border-x border-zinc-800">
            <span className="text-[7px] sm:text-[8px] text-amber-400/80 uppercase font-bold">
              Tentativas
            </span>
            <span className="text-[10px] sm:text-xs font-black text-amber-300">
              {spinsLeft} Restante{spinsLeft === 1 ? '' : 's'}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[7px] sm:text-[8px] text-amber-400/80 uppercase font-bold">
              Valor Brinde
            </span>
            <span className="text-[10px] sm:text-xs font-black text-emerald-400">
              100% GRÁTIS
            </span>
          </div>
        </div>

        {/* Cockpit com Botão TURBO, Botão Grande Redondo de Disparo e Som */}
        <div className="px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between bg-gradient-to-b from-[#6b1111] to-[#380606]">
          {/* Botão TURBO */}
          <button
            type="button"
            onClick={() => setTurboMode(!turboMode)}
            className={`flex flex-col items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border transition ${
              turboMode
                ? 'bg-amber-500/20 border-amber-300 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                : 'bg-red-950/60 border-amber-600/40 text-amber-500/60'
            }`}
            title="Modo Turbo"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="text-[7px] font-black uppercase mt-0.5">TURBO</span>
          </button>

          {/* Botão Decorativo Menos */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-950/60 border border-amber-600/30 flex items-center justify-center text-amber-500/50">
            <Minus className="w-3.5 h-3.5" />
          </div>

          {/* BOTÃO PRINCIPAL VERDE JADE COM ANEL CROMADO/DOURADO GIRATÓRIO */}
          <button
            type="button"
            onClick={phase === 'jackpot' ? handleReset : handleStartSpin}
            disabled={phase === 'spinning'}
            className={`relative -mt-3 sm:-mt-4 w-16 h-16 sm:w-18 sm:h-18 rounded-full p-1 transition-transform ${
              phase === 'spinning'
                ? 'opacity-70 cursor-not-allowed'
                : 'hover:scale-105 active:scale-95 cursor-pointer animate-pulse'
            }`}
            style={{
              background:
                'linear-gradient(180deg, #fef08a 0%, #d97706 50%, #78350f 100%)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.85), 0 0 18px rgba(16,185,129,0.5)',
            }}
          >
            <div
              className="w-full h-full rounded-full flex flex-col items-center justify-center border border-emerald-200/60"
              style={{
                background:
                  'radial-gradient(circle at 35% 30%, #34d399 0%, #059669 55%, #064e3b 100%)',
              }}
            >
              <Sparkles
                className={`w-5 h-5 text-yellow-200 ${
                  phase === 'spinning' ? 'animate-spin' : ''
                }`}
              />
              <span className="text-[8px] sm:text-[9px] font-black text-white uppercase tracking-wider mt-0.5">
                {phase === 'spinning'
                  ? 'GIRANDO'
                  : phase === 'jackpot'
                  ? 'NOVO'
                  : 'GIRAR'}
              </span>
            </div>
          </button>

          {/* Botão Decorativo Mais */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-950/60 border border-amber-600/30 flex items-center justify-center text-amber-500/50">
            <Plus className="w-3.5 h-3.5" />
          </div>

          {/* Botão de Som */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex flex-col items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-red-950/60 border border-amber-600/40 text-amber-300"
            title={soundEnabled ? 'Silenciar' : 'Ativar Som'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-red-400" />
            )}
            <span className="text-[7px] font-black uppercase mt-0.5">SOM</span>
          </button>
        </div>
      </div>
    </div>
  );
}
