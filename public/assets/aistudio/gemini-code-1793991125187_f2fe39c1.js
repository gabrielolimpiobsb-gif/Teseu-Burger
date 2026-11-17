import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Zap,
  Volume2,
  VolumeX,
  Plus,
  Minus,
  CheckCircle2,
  RotateCcw,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

// Os 4 Doces Artesanais da Teseu Burger + Símbolo WILD
const SWEET_SYMBOLS = [
  {
    id: 'cookie-80g',
    name: 'Cookie Supremo 80g',
    subtitle: 'Gotas de Chocolate Belga Artesanal',
    icon: '🍪',
    badge: 'OURO',
    bg: 'from-amber-700 via-yellow-600 to-amber-900',
  },
  {
    id: 'brigadeiro-gourmet',
    name: 'Brigadeiro Gourmet',
    subtitle: 'Cacau Nobre 70% Feito na Casa',
    icon: '🍫',
    badge: 'VIP',
    bg: 'from-red-800 via-red-600 to-red-950',
  },
  {
    id: 'brownie-fudge',
    name: 'Brownie de Fudge',
    subtitle: 'Casquinha Crocante & Chocolate Intenso',
    icon: '🥮',
    badge: 'TOP',
    bg: 'from-purple-900 via-fuchsia-800 to-indigo-950',
  },
  {
    id: 'bombom-teseu',
    name: 'Bombom de Esparta',
    subtitle: 'Recheio Cremoso Especial Teseu',
    icon: '🍬',
    badge: 'RARO',
    bg: 'from-emerald-800 via-teal-600 to-emerald-950',
  },
];

const WILD_SYMBOL = {
  id: 'wild-teseu',
  name: 'WILD TESEU',
  icon: '⚔️',
  isWild: true,
};

const LEFT_PAYLINES = [2, 3, 1, 6, 7, 4, 5, 10, 8, 9];
const RIGHT_PAYLINES = [2, 4, 1, 6, 8, 3, 5, 10, 7, 9];

export default function TeseuFortuneClone({ onClaimPrize, onBack }) {
  // Estados do Jogo
  const [spinsLeft, setSpinsLeft] = useState(3);
  const [turboMode, setTurboMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Fases da animação: 'idle' | 'spinning-all' | 'beam-x10' | 'board-win' | 'big-win-modal'
  const [phase, setPhase] = useState('idle');
  const [wonSweet, setWonSweet] = useState(SWEET_SYMBOLS[0]);

  // Controle da Escalada do Medalhão: 1 = GRANDE (Azul), 2 = MEGA (Verde), 3 = SUPER MEGA (Vermelho/Ouro)
  const [winTier, setWinTier] = useState(1);
  const [counterValue, setCounterValue] = useState(0);
  const [canClaimNow, setCanClaimNow] = useState(false);

  // Estado visual das 3 colunas (3-4-3)
  const [leftCol, setLeftCol] = useState([
    SWEET_SYMBOLS[0],
    SWEET_SYMBOLS[1],
    SWEET_SYMBOLS[2],
  ]);
  const [midCol, setMidCol] = useState([
    SWEET_SYMBOLS[1],
    WILD_SYMBOL,
    SWEET_SYMBOLS[0],
    SWEET_SYMBOLS[3],
  ]);
  const [rightCol, setRightCol] = useState([
    SWEET_SYMBOLS[2],
    SWEET_SYMBOLS[0],
    SWEET_SYMBOLS[1],
  ]);

  const audioCtxRef = useRef(null);
  const canvasRef = useRef(null);

  // Inicializa Web Audio API
  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Efeitos Sonoros Sintetizados (Sem precisar de arquivos MP3 externos)
  const playTone = useCallback(
    (freq, type = 'sine', duration = 0.12, volume = 0.2) => {
      if (!soundEnabled) return;
      try {
        const ctx = getAudioCtx();
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
      } catch (e) {}
    },
    [soundEnabled]
  );

  // Som de Impacto quando muda de GRANDE -> MEGA -> SUPER MEGA
  const playTierExplosionSound = useCallback(
    (tierLevel) => {
      if (!soundEnabled) return;
      const baseNotes =
        tierLevel === 1
          ? [392, 493.88, 587.33, 783.99]
          : tierLevel === 2
          ? [440, 554.37, 659.25, 880]
          : [523.25, 659.25, 783.99, 1046.5, 1318.5];

      baseNotes.forEach((f, idx) => {
        setTimeout(() => playTone(f, 'triangle', 0.45, 0.28), idx * 65);
      });
    },
    [playTone, soundEnabled]
  );

  // Chuva contínua de Moedas Douradas e Doces em Canvas durante o Medalhão
  useEffect(() => {
    if (phase !== 'big-win-modal') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let animId;
    const coins = Array.from({ length: 55 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      vy: Math.random() * 5 + 3.5,
      vx: (Math.random() - 0.5) * 2.5,
      size: Math.random() * 12 + 8,
      rot: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      type: Math.random() > 0.25 ? 'coin' : 'spark',
    }));

    const renderCoins = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      coins.forEach((c) => {
        c.y += c.vy;
        c.x += c.vx;
        c.rot += c.vRot;
        if (c.y > canvas.height + 30) {
          c.y = -25;
          c.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate((c.rot * Math.PI) / 180);

        if (c.type === 'coin') {
          // Desenha moeda imperial dourada com furo quadrado (igual ao vídeo)
          ctx.beginPath();
          ctx.arc(0, 0, c.size / 2, 0, Math.PI * 2);
          ctx.fillStyle = '#fbbf24';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#fef08a';
          ctx.stroke();

          ctx.fillStyle = '#78350f';
          ctx.fillRect(-c.size / 6, -c.size / 6, c.size / 3, c.size / 3);
        } else {
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(-c.size / 3, -c.size / 3, c.size / 1.5, c.size / 1.5);
        }
        ctx.restore();
      });
      animId = requestAnimationFrame(renderCoins);
    };

    animId = requestAnimationFrame(renderCoins);
    return () => cancelAnimationFrame(animId);
  }, [phase]);

  // Dispara a Coreografia Completa "RODAR ATÉ GANHAR" (Igual ao vídeo 00:00 -> 00:32)
  const handleStartSpin = () => {
    if (phase !== 'idle' || spinsLeft <= 0) return;

    setSpinsLeft((prev) => prev - 1);
    setCanClaimNow(false);
    setCounterValue(0);
    setWinTier(1);

    // Sorteia qual dos 4 doces será o prêmio desta rodada
    const chosenSweet =
      SWEET_SYMBOLS[Math.floor(Math.random() * SWEET_SYMBOLS.length)];
    setWonSweet(chosenSweet);

    const speedMultiplier = turboMode ? 0.55 : 1;

    // FASE 1: Todas as 3 colunas giram (00:00 - 00:02)
    setPhase('spinning-all');
    const scrambleInterval = setInterval(() => {
      playTone(320 + Math.random() * 180, 'triangle', 0.04, 0.12);
      setLeftCol([
        SWEET_SYMBOLS[Math.floor(Math.random() * 4)],
        SWEET_SYMBOLS[Math.floor(Math.random() * 4)],
        SWEET_SYMBOLS[Math.floor(Math.random() * 4)],
      ]);
      setMidCol([
        SWEET_SYMBOLS[Math.floor(Math.random() * 4)],
        WILD_SYMBOL,
        SWEET_SYMBOLS[Math.floor(Math.random() * 4)],
        SWEET_SYMBOLS[Math.floor(Math.random() * 4)],
      ]);
      setRightCol([
        SWEET_SYMBOLS[Math.floor(Math.random() * 4)],
        SWEET_SYMBOLS[Math.floor(Math.random() * 4)],
        SWEET_SYMBOLS[Math.floor(Math.random() * 4)],
      ]);
    }, 95);

    // FASE 2: Colunas 1 e 3 travam com o mesmo doce + Coluna 2 acende Feixe de Luz x10 (00:02 - 00:05)
    setTimeout(() => {
      setLeftCol([chosenSweet, chosenSweet, chosenSweet]);
      setRightCol([chosenSweet, chosenSweet, chosenSweet]);
      playTone(180, 'square', 0.18, 0.3);
      setPhase('beam-x10');
    }, 1500 * speedMultiplier);

    // FASE 3: Coluna Central crava os WILD + Doce escolhido (00:05 - 00:06)
    setTimeout(() => {
      clearInterval(scrambleInterval);
      setMidCol([chosenSweet, WILD_SYMBOL, WILD_SYMBOL, chosenSweet]);
      playTone(523.25, 'triangle', 0.35, 0.35);
      setPhase('board-win');
    }, 3900 * speedMultiplier);

    // FASE 4: Abre o Medalhão Gigante com Escalada Tripla (00:07 em diante)
    setTimeout(() => {
      setPhase('big-win-modal');
      startMedallionCounter(speedMultiplier);
    }, 4800 * speedMultiplier);
  };

  // Anima o contador numérico de 0,00 até 108,00 trocando GRANDE -> MEGA -> SUPER MEGA
  const startMedallionCounter = (speedMultiplier) => {
    const totalDuration = 7200 * speedMultiplier;
    const startTime = performance.now();
    const targetScore = 108.0; // Mesmo número icônico de encerramento do vídeo (108,00)
    let currentTierTriggered = 1;
    playTierExplosionSound(1);

    const stepCounter = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);
      const currentVal = progress * targetScore;
      setCounterValue(currentVal);

      // Som de moeda subindo
      if (Math.random() > 0.35 && progress < 1) {
        playTone(850 + progress * 500, 'sine', 0.035, 0.08);
      }

      // Evolui para MEGA GANHO ao passar de 40,00
      if (currentVal >= 40 && currentTierTriggered < 2) {
        currentTierTriggered = 2;
        setWinTier(2);
        playTierExplosionSound(2);
      }

      // Evolui para SUPER MEGA GANHO ao passar de 61,00
      if (currentVal >= 61 && currentTierTriggered < 3) {
        currentTierTriggered = 3;
        setWinTier(3);
        playTierExplosionSound(3);
      }

      if (progress < 1) {
        requestAnimationFrame(stepCounter);
      } else {
        setCounterValue(targetScore);
        setCanClaimNow(true);
        playTierExplosionSound(3);
      }
    };

    requestAnimationFrame(stepCounter);
  };

  return (
    <div className="relative w-full max-w-[420px] mx-auto h-[780px] rounded-[34px] bg-[#2a0808] border-4 border-amber-500/80 shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden select-none font-sans flex flex-col justify-between">
      {/* =====================================================================
          1. TOPO IMPERIAL "RODAR ATÉ GANHAR" (Igual ao topo do vídeo)
      ====================================================================== */}
      <div className="relative z-20 pt-2 pb-1.5 px-3 bg-gradient-to-b from-[#450a0a] via-[#7f1d1d] to-[#450a0a] border-b-2 border-amber-400 shadow-lg">
        <div className="flex items-center justify-between text-[11px] text-amber-200/90 font-bold mb-0.5">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Teseu Fortune</span>
          </button>
          <span className="font-mono text-[10px] opacity-80">COMBO CASAL VIP</span>
        </div>

        {/* Letreiro Dourado Chanfrado "RODAR ATÉ GANHAR" */}
        <div className="text-center py-0.5">
          <h1
            className="text-xl sm:text-2xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-400 to-orange-600"
            style={{
              filter: 'drop-shadow(0 2px 0px #450a0a) drop-shadow(0 0 10px rgba(245,158,11,0.6))',
              WebkitTextStroke: '1px #78350f',
            }}
          >
            RODAR ATÉ GANHAR
          </h1>
        </div>
      </div>

      {/* =====================================================================
          2. GRADE DE CILINDROS ASSIMÉTRICA 3-4-3 + FEIXE DE LUZ CENTRAL x10
      ====================================================================== */}
      <div className="relative z-10 flex-1 flex items-center justify-between px-1.5 py-2 bg-gradient-to-b from-[#3b0a0a] via-[#5c1111] to-[#2e0707] overflow-hidden">
        {/* Coluna de Números de Linhas à Esquerda */}
        <div className="flex flex-col justify-around h-full py-2 px-1 bg-[#450a0a]/90 rounded-l-lg border-y border-l border-amber-500/40">
          {LEFT_PAYLINES.map((num, i) => (
            <span
              key={i}
              className="text-[9px] font-black text-amber-300 leading-none"
            >
              {num}
            </span>
          ))}
        </div>

        {/* CONTAINER DAS 3 COLUNAS (3 - 4 - 3) */}
        <div className="relative flex-1 h-full grid grid-cols-3 gap-1.5 px-1.5 items-center">
          {/* COLUNA 1 (3 Casas) */}
          <div
            className={`h-[92%] rounded-xl bg-[#f5e6c8] border-2 border-amber-500 p-1.5 flex flex-col justify-between shadow-inner transition-all duration-300 ${
              phase === 'beam-x10' ? 'brightness-50' : ''
            }`}
          >
            {leftCol.map((item, idx) => (
              <div
                key={idx}
                className={`h-[31%] rounded-lg bg-gradient-to-b ${
                  item.bg || 'from-amber-600 to-amber-900'
                } border border-amber-300 flex flex-col items-center justify-center shadow-md ${
                  phase === 'spinning-all' ? 'animate-pulse blur-[0.8px]' : ''
                }`}
              >
                <span className="text-3xl filter drop-shadow">{item.icon}</span>
                <span className="text-[8px] font-black text-amber-200 uppercase tracking-tighter mt-0.5">
                  {item.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>

          {/* COLUNA 2 CENTRAL (4 Casas + Feixe de Luz x10 igual ao segundo 00:03 do vídeo) */}
          <div
            className={`relative h-full rounded-xl bg-[#fff3d6] border-2 p-1.5 flex flex-col justify-between transition-all duration-300 ${
              phase === 'beam-x10'
                ? 'border-yellow-200 shadow-[0_0_45px_12px_rgba(250,204,21,0.95)] z-30 scale-[1.03]'
                : 'border-amber-400 shadow-inner'
            }`}
          >
            {/* Feixe de Luz Incandescente + Selo x10 Flutuante */}
            {phase === 'beam-x10' && (
              <div className="pointer-events-none absolute inset-0 z-30 rounded-xl bg-gradient-to-b from-yellow-300/60 via-amber-400/30 to-yellow-300/60 flex items-center justify-center animate-pulse">
                <div className="w-20 h-20 rounded-full bg-amber-500/30 border-2 border-yellow-200 backdrop-blur-xs flex items-center justify-center shadow-[0_0_30px_rgba(254,240,138,1)] animate-bounce">
                  <span
                    className="text-3xl font-black italic text-yellow-100"
                    style={{ WebkitTextStroke: '1.5px #92400e' }}
                  >
                    x10
                  </span>
                </div>
              </div>
            )}

            {midCol.map((item, idx) => (
              <div
                key={idx}
                className={`h-[23.5%] rounded-lg ${
                  item.isWild
                    ? 'bg-gradient-to-r from-red-700 via-amber-500 to-red-700 border-2 border-yellow-200'
                    : `bg-gradient-to-b ${item.bg || 'from-amber-600 to-amber-900'} border border-amber-300`
                } flex flex-col items-center justify-center shadow ${
                  phase === 'spinning-all' || phase === 'beam-x10'
                    ? 'blur-[0.8px] animate-pulse'
                    : ''
                }`}
              >
                <span className="text-2xl leading-none">{item.icon}</span>
                <span className="text-[8px] font-black text-white uppercase tracking-wider">
                  {item.isWild ? 'WILD' : item.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>

          {/* COLUNA 3 (3 Casas) */}
          <div
            className={`h-[92%] rounded-xl bg-[#f5e6c8] border-2 border-amber-500 p-1.5 flex flex-col justify-between shadow-inner transition-all duration-300 ${
              phase === 'beam-x10' ? 'brightness-50' : ''
            }`}
          >
            {rightCol.map((item, idx) => (
              <div
                key={idx}
                className={`h-[31%] rounded-lg bg-gradient-to-b ${
                  item.bg || 'from-amber-600 to-amber-900'
                } border border-amber-300 flex flex-col items-center justify-center shadow-md ${
                  phase === 'spinning-all' ? 'animate-pulse blur-[0.8px]' : ''
                }`}
              >
                <span className="text-3xl filter drop-shadow">{item.icon}</span>
                <span className="text-[8px] font-black text-amber-200 uppercase tracking-tighter mt-0.5">
                  {item.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Coluna de Números de Linhas à Direita */}
        <div className="flex flex-col justify-around h-full py-2 px-1 bg-[#450a0a]/90 rounded-r-lg border-y border-r border-amber-500/40">
          {RIGHT_PAYLINES.map((num, i) => (
            <span
              key={i}
              className="text-[9px] font-black text-amber-300 leading-none"
            >
              {num}
            </span>
          ))}
        </div>
      </div>

      {/* =====================================================================
          3. FAIXA MARQUEE + PALCO DO GUERREIRO TESEU (Substituindo o Touro)
      ====================================================================== */}
      <div className="relative z-20 bg-gradient-to-b from-[#3b0707] to-[#1a0303] border-t-2 border-amber-500">
        {/* Faixa de Pergaminho Vermelho e Dourado */}
        <div className="mx-3 -mt-3 px-4 py-1 rounded-full bg-gradient-to-r from-red-900 via-red-700 to-red-900 border-2 border-amber-400 shadow-lg text-center overflow-hidden">
          <p className="text-[11px] font-black uppercase tracking-wider text-yellow-200 truncate">
            {phase === 'beam-x10'
              ? '🔥 SUPER MULTIPLICADOR TESEU ATIVADO! 🔥'
              : '⚔️ FUNCIONALIDADE TESEU DA SORTE! ⚔️'}
          </p>
        </div>

        {/* Palco Iluminado com o Mascote Teseu e Tesouro de Doces */}
        <div className="relative h-28 flex flex-col items-center justify-end overflow-hidden pt-2">
          {/* Aura Dourada de Fundo */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.45)_0%,transparent_70%)]" />

          {/* Guerreiro Espartano Teseu (De Óculos Escuros Estilo Chefão igual ao vídeo) */}
          <div
            className={`relative z-10 flex flex-col items-center transition-transform duration-300 ${
              phase === 'beam-x10' || phase === 'board-win'
                ? 'scale-110 -translate-y-1'
                : ''
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-700 border-2 border-yellow-100 shadow-[0_0_25px_rgba(245,158,11,0.8)] flex items-center justify-center text-3xl">
              🪖
            </div>
            <span className=" -mt-2 px-2.5 py-0.5 rounded-full bg-zinc-950 text-amber-400 border border-amber-400 text-[9px] font-black uppercase tracking-widest shadow">
              TESEU BURGER
            </span>
          </div>

          {/* Monte de Barras de Ouro e Doces na Base do Palco */}
          <div className="w-full flex items-center justify-between px-4 pb-1 text-lg opacity-90">
            <span>🪙🍪🪙</span>
            <span>🍫🪙🍬</span>
          </div>
        </div>
      </div>

      {/* =====================================================================
          4. BARRA DE STATUS PRETA + COCKPIT DE GIRO (Botão Verde Jade Central)
      ====================================================================== */}
      <div className="relative z-20 bg-[#1f0404] border-t border-amber-500/40">
        {/* Mostradores (Combo | Rodadas | Brinde) */}
        <div className="grid grid-cols-3 bg-black/80 py-2 px-3 border-b border-amber-500/30 text-center">
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-amber-400/80 uppercase font-bold">
              Combo Casal
            </span>
            <span className="text-xs font-black text-white">R$ 79,90</span>
          </div>
          <div className="flex flex-col items-center border-x border-zinc-800">
            <span className="text-[9px] text-amber-400/80 uppercase font-bold">
              Rodadas Grátis
            </span>
            <span className="text-xs font-black text-amber-300">
              {spinsLeft} Restantes
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-amber-400/80 uppercase font-bold">
              Valor Brinde
            </span>
            <span className="text-xs font-black text-emerald-400">
              100% GRÁTIS
            </span>
          </div>
        </div>

        {/* Cockpit Inferior com Botão TURBO, Botão Central VERDE JADE e Controles */}
        <div className="px-5 py-3 flex items-center justify-between bg-gradient-to-b from-[#6b1111] to-[#380606]">
          {/* Botão TURBO */}
          <button
            type="button"
            onClick={() => setTurboMode(!turboMode)}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-full border-2 transition ${
              turboMode
                ? 'bg-amber-500/20 border-amber-300 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                : 'bg-red-950/60 border-amber-600/40 text-amber-500/60'
            }`}
          >
            <Zap className="w-4 h-4 fill-current" />
            <span className="text-[8px] font-black uppercase mt-0.5">TURBO</span>
          </button>

          {/* Botão Decorativo Menos */}
          <div className="w-9 h-9 rounded-full bg-red-950/60 border border-amber-600/30 flex items-center justify-center text-amber-500/50">
            <Minus className="w-4 h-4" />
          </div>

          {/* BOTÃO PRINCIPAL VERDE JADE COM ADORNO DOURADO (Idêntico ao vídeo) */}
          <button
            type="button"
            onClick={handleStartSpin}
            disabled={phase !== 'idle' || spinsLeft <= 0}
            className={`relative -mt-5 w-20 h-20 rounded-full p-1.5 transition-transform ${
              phase !== 'idle' || spinsLeft <= 0
                ? 'opacity-70 cursor-not-allowed'
                : 'hover:scale-105 active:scale-95 cursor-pointer'
            }`}
            style={{
              background:
                'linear-gradient(180deg, #fef08a 0%, #d97706 50%, #78350f 100%)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.85), 0 0 20px rgba(16,185,129,0.5)',
            }}
          >
            <div
              className="w-full h-full rounded-full flex flex-col items-center justify-center border-2 border-emerald-200/60"
              style={{
                background:
                  'radial-gradient(circle at 35% 30%, #34d399 0%, #059669 55%, #064e3b 100%)',
              }}
            >
              <Sparkles
                className={`w-6 h-6 text-yellow-200 ${
                  phase !== 'idle' ? 'animate-spin' : ''
                }`}
              />
              <span className="text-[9px] font-black text-white uppercase tracking-wider mt-0.5">
                {phase === 'idle' ? 'GIRAR' : '...'}
              </span>
            </div>
          </button>

          {/* Botão Decorativo Mais */}
          <div className="w-9 h-9 rounded-full bg-red-950/60 border border-amber-600/30 flex items-center justify-center text-amber-500/50">
            <Plus className="w-4 h-4" />
          </div>

          {/* Botão de Áudio */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-red-950/60 border-2 border-amber-600/40 text-amber-300"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4 text-red-400" />
            )}
            <span className="text-[8px] font-black uppercase mt-0.5">SOM</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          5. OVERLAY FULLSCREEN DE VITÓRIA (GRANDE -> MEGA -> SUPER MEGA GANHO)
             Clona exatamente os segundos 00:07 a 00:32 do vídeo!
      ====================================================================== */}
      {phase === 'big-win-modal' && (
        <div
          className={`absolute inset-0 z-50 flex flex-col items-center justify-between py-6 px-4 transition-colors duration-500 ${
            winTier === 1
              ? 'bg-gradient-to-b from-indigo-950 via-purple-900 to-slate-950'
              : winTier === 2
              ? 'bg-gradient-to-b from-emerald-950 via-teal-800 to-emerald-950'
              : 'bg-gradient-to-b from-red-950 via-amber-900 to-red-950'
          }`}
        >
          {/* Canvas de Moedas Voando */}
          <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-0 z-10 w-full h-full"
          />

          {/* Raios Solares Girando atrás do Medalhão */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-40">
            <div className="w-[550px] h-[550px] rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(254,240,138,0.5)_20deg,transparent_40deg,rgba(254,240,138,0.5)_60deg,transparent_80deg,rgba(254,240,138,0.5)_100deg,transparent_120deg,rgba(254,240,138,0.5)_140deg,transparent_160deg,rgba(254,240,138,0.5)_180deg,transparent_200deg,rgba(254,240,138,0.5)_220deg,transparent_240deg,rgba(254,240,138,0.5)_260deg,transparent_280deg,rgba(254,240,138,0.5)_300deg,transparent_320deg,rgba(254,240,138,0.5)_340deg,transparent_360deg)] animate-spin" />
          </div>

          <div className="relative z-20 text-center">
            <span className="px-3 py-1 rounded-full bg-black/50 border border-amber-400 text-amber-300 text-[10px] font-black uppercase tracking-widest">
              Combo Casal • Teseu Burger
            </span>
          </div>

          {/* MEDALHÃO IMPERIAL CENTRAL (Com Telhado Dourado no Nível 3 igual ao segundo 00:21) */}
          <div className="relative z-20 flex flex-col items-center my-auto">
            {/* Telhado Imperial Dourado (Aparece no SUPER MEGA GANHO) */}
            {winTier === 3 && (
              <div className="w-64 h-12 -mb-4 z-30 rounded-t-3xl bg-gradient-to-b from-yellow-200 via-amber-400 to-amber-700 border-2 border-yellow-100 shadow-2xl flex items-center justify-center animate-bounce">
                <span className="text-xs font-black text-red-950 uppercase tracking-widest">
                  👑 IMPÉRIO TESEU 👑
                </span>
              </div>
            )}

            {/* Círculo do Medalhão */}
            <div
              key={winTier}
              className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full p-3.5 flex flex-col items-center justify-center text-center shadow-[0_0_70px_rgba(251,191,36,0.9)] animate-scale-up"
              style={{
                background:
                  'linear-gradient(135deg, #fef08a 0%, #f59e0b 35%, #b91c1c 70%, #fbbf24 100%)',
              }}
            >
              <div className="w-full h-full rounded-full bg-[radial-gradient(circle_at_center,#fef08a_0%,#f59e0b_55%,#7c2d12_100%)] border-4 border-red-800 flex flex-col items-center justify-center p-4 shadow-inner">
                {/* Título que evolui: GRANDE -> MEGA -> SUPER MEGA */}
                <h2
                  className="text-2xl sm:text-3xl font-black uppercase leading-none tracking-tight text-cyan-300 drop-shadow-[0_4px_0_#1e3a8a]"
                  style={{
                    WebkitTextStroke: '1.5px #1e3a8a',
                  }}
                >
                  {winTier === 1 && 'GRANDE BRINDE'}
                  {winTier === 2 && 'MEGA BRINDE'}
                  {winTier === 3 && 'SUPER MEGA BRINDE'}
                </h2>

                {/* Contador Numérico Subindo igual ao vídeo (Ex: 108,00) */}
                <div
                  className="text-4xl sm:text-5xl font-black text-yellow-100 my-2 tracking-tighter"
                  style={{
                    filter: 'drop-shadow(0 4px 0px #7f1d1d)',
                    WebkitTextStroke: '1.5px #991b1b',
                  }}
                >
                  {counterValue.toFixed(2).replace('.', ',')}
                </div>

                {/* Revelação do Doce Artesanal Ganho */}
                <div className="mt-1 flex flex-col items-center bg-red-950/85 px-4 py-2 rounded-2xl border border-amber-300 shadow-lg">
                  <span className="text-3xl">{wonSweet.icon}</span>
                  <span className="text-xs font-black text-amber-300 uppercase mt-0.5">
                    {wonSweet.name}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Botões de Ação Final (Resgatar Doce ou Girar Próxima Rodada) */}
          <div className="relative z-30 w-full space-y-2.5">
            {canClaimNow ? (
              <>
                <button
                  type="button"
                  onClick={() => onClaimPrize && onClaimPrize(wonSweet)}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-red-950 font-black text-sm uppercase tracking-wider shadow-[0_10px_25px_rgba(0,0,0,0.6)] hover:brightness-110 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Resgatar {wonSweet.name} no Combo!
                </button>

                {spinsLeft > 0 && (
                  <button
                    type="button"
                    onClick={() => setPhase('idle')}
                    className="w-full py-2.5 px-4 rounded-xl bg-black/70 border border-amber-400/50 text-amber-300 font-bold text-xs uppercase tracking-wider hover:bg-black transition flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Usar Outra Rodada (Restam {spinsLeft})
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setCounterValue(108.0);
                  setWinTier(3);
                  setCanClaimNow(true);
                }}
                className="w-full py-3 rounded-xl bg-black/50 border border-white/20 text-white/90 text-xs font-bold uppercase tracking-widest"
              >
                Toque para pular contagem...
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}