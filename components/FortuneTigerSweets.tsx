'use client';

import React from 'react';
import { TeseuFortune, SweetSymbol, SWEET_SYMBOLS } from '@/components/TeseuFortune';

export { TeseuFortune, SWEET_SYMBOLS };
export type { SweetSymbol };

export function FortuneTigerSweets(props: any) {
  return <TeseuFortune {...props} />;
}

export default FortuneTigerSweets;
