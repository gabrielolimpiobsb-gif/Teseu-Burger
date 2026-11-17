'use client';

import React from 'react';
import { RetroSlotMachine, RETRO_SWEET_PRIZES } from './RetroSlotMachine';
import { SweetPrize } from '@/lib/data';

export type { SweetPrize };
export { RetroSlotMachine, RETRO_SWEET_PRIZES };

interface SweetCasinoRouletteProps {
  onClaimPrize?: (prize: SweetPrize) => void;
  initialPrize?: string | null;
  className?: string;
}

// Substituição completa da antiga roleta pela nova Máquina Caça-Níqueis Retrô Vermelha
export function SweetCasinoRoulette(props: SweetCasinoRouletteProps) {
  return <RetroSlotMachine {...props} />;
}

export default SweetCasinoRoulette;
