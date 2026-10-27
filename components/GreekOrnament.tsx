'use client';

import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  color?: string;
}

// 1. Coroa de Louros (Laurel Wreath) - De IMG-20261023-WA0002 & WA0005
export function LaurelWreathIcon({ className = '', size = 24, color = '#F5CB5C' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Left branch */}
      <path
        d="M 22 42 C 12 40 6 30 7 20 C 7.5 13 12 8 18 5"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Left leaves */}
      <ellipse cx="14" cy="38" rx="3.5" ry="2" transform="rotate(-30 14 38)" fill={color} />
      <ellipse cx="9" cy="31" rx="3.5" ry="2" transform="rotate(-45 9 31)" fill={color} />
      <ellipse cx="7" cy="23" rx="3.5" ry="2" transform="rotate(-65 7 23)" fill={color} />
      <ellipse cx="9" cy="15" rx="3.5" ry="2" transform="rotate(-85 9 15)" fill={color} />
      <ellipse cx="14" cy="9" rx="3.5" ry="2" transform="rotate(-110 14 9)" fill={color} />
      <ellipse cx="19" cy="6" rx="3" ry="1.8" transform="rotate(-130 19 6)" fill={color} />

      {/* Right branch */}
      <path
        d="M 26 42 C 36 40 42 30 41 20 C 40.5 13 36 8 30 5"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Right leaves */}
      <ellipse cx="34" cy="38" rx="3.5" ry="2" transform="rotate(30 34 38)" fill={color} />
      <ellipse cx="39" cy="31" rx="3.5" ry="2" transform="rotate(45 39 31)" fill={color} />
      <ellipse cx="41" cy="23" rx="3.5" ry="2" transform="rotate(65 41 23)" fill={color} />
      <ellipse cx="39" cy="15" rx="3.5" ry="2" transform="rotate(85 39 15)" fill={color} />
      <ellipse cx="34" cy="9" rx="3.5" ry="2" transform="rotate(110 34 9)" fill={color} />
      <ellipse cx="29" cy="6" rx="3" ry="1.8" transform="rotate(130 29 6)" fill={color} />

      {/* Bottom ribbon knot */}
      <circle cx="24" cy="42" r="2.5" fill={color} />
    </svg>
  );
}

// 2. Elmo Espartano / Coríntio (Spartan Helmet) - De IMG-20261023-WA0002
export function SpartanHelmetIcon({ className = '', size = 24, color = '#F5CB5C' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Crest */}
      <path
        d="M 12 18 C 12 8 20 4 28 4 C 36 4 42 10 42 18 C 42 22 40 24 38 24 L 38 16 C 38 10 32 8 26 8 C 18 8 14 12 14 18 Z"
        fill={color}
      />
      {/* Main Dome */}
      <path
        d="M 14 18 C 14 10 22 8 28 8 C 36 8 38 14 38 20 L 38 28 C 38 34 34 38 32 40 L 26 40 L 26 32 L 22 32 L 22 40 L 16 38 C 14 34 14 26 14 18 Z"
        fill={color}
      />
      {/* T-shaped eye slit (Korinthos) */}
      <path d="M 18 24 L 28 24 L 28 28 L 18 28 Z" fill="#0B0B0B" />
      <path d="M 23 24 L 27 24 L 27 34 L 23 34 Z" fill="#0B0B0B" />
      {/* Cheek guards */}
      <path d="M 15 26 L 19 36 L 15 36 Z" fill={color} />
    </svg>
  );
}

// 3. Templo Panteão / Parthenon - De IMG-20261023-WA0005
export function ParthenonIcon({ className = '', size = 24, color = '#F5CB5C' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Triangular Pediment */}
      <polygon points="24,6 4,16 44,16" fill={color} />
      {/* Frieze & Architrave */}
      <rect x="6" y="16" width="36" height="4" fill={color} />
      {/* 4 Fluted Columns */}
      <rect x="8" y="22" width="4.5" height="18" rx="1" fill={color} />
      <rect x="17" y="22" width="4.5" height="18" rx="1" fill={color} />
      <rect x="26" y="22" width="4.5" height="18" rx="1" fill={color} />
      <rect x="35" y="22" width="4.5" height="18" rx="1" fill={color} />
      {/* Stylobate / Base (3 steps) */}
      <rect x="4" y="40" width="40" height="2.5" fill={color} />
      <rect x="2" y="42.5" width="44" height="2.5" fill={color} />
    </svg>
  );
}

// 4. Ânfora Grega de Cerâmica (Amphora Urn) - De IMG-20261023-WA0001, WA0002, WA0005
export function AmphoraIcon({ className = '', size = 24, color = '#F5CB5C' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Rim & Neck */}
      <path d="M 18 6 L 30 6 L 28 14 L 20 14 Z" fill={color} />
      <ellipse cx="24" cy="6" rx="7" ry="2" fill={color} />
      {/* Belly */}
      <path
        d="M 20 14 C 12 18 10 26 14 34 C 16 38 20 40 24 40 C 28 40 32 38 34 34 C 38 26 36 18 28 14 Z"
        fill={color}
      />
      {/* Foot / Base */}
      <rect x="20" y="40" width="8" height="4" rx="1" fill={color} />
      {/* Handles */}
      <path
        d="M 18 12 C 10 14 10 24 16 26"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M 30 12 C 38 14 38 24 32 26"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// 5. Raio de Zeus / Escudo (Zeus Thunderbolt Shield) - De IMG-20261023-WA0002
export function ZeusShieldIcon({ className = '', size = 24, color = '#F5CB5C' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Oval Roman Shield */}
      <path
        d="M 14 8 C 24 5 24 5 34 8 C 38 20 38 28 34 40 C 24 43 24 43 14 40 C 10 28 10 20 14 8 Z"
        stroke={color}
        strokeWidth="2.5"
        fill="#333533"
      />
      {/* Center Boss (Umbo) */}
      <circle cx="24" cy="24" r="5" fill={color} />
      {/* Lightning bolts */}
      <path
        d="M 24 10 L 22 20 L 26 21 L 21 34 L 27 23 L 23 22 Z"
        fill={color}
      />
    </svg>
  );
}

// 6. Coluna Jônica / Dórica Decorativa Lateral (Fluted Column Strip)
export function GreekColumnElement({ className = '', height = 400 }: { className?: string; height?: number }) {
  return (
    <div className={`relative flex flex-col items-center ${className}`} style={{ height }}>
      {/* Ionic Capital with volutes */}
      <div className="w-10 sm:w-12 h-8 bg-[#333533] border border-[#F5CB5C]/40 rounded-t-md relative flex items-center justify-between px-1 shadow-md">
        <div className="w-3.5 h-3.5 rounded-full border-2 border-[#F5CB5C] bg-[#0B0B0B]" />
        <div className="h-1 w-4 bg-[#F5CB5C]" />
        <div className="w-3.5 h-3.5 rounded-full border-2 border-[#F5CB5C] bg-[#0B0B0B]" />
      </div>

      {/* Fluted shaft */}
      <div className="w-7 sm:w-8 flex-1 fluted-column border-x border-[#F5CB5C]/30 shadow-inner" />

      {/* Base / Plinth */}
      <div className="w-10 sm:w-12 h-6 bg-[#333533] border border-[#F5CB5C]/40 rounded-b-md shadow-md" />
    </div>
  );
}

// 7. Friso Horizontal de Meandro Dourado (Greek Fret Banner)
export function GreekFrieze({ variant = 'gold', className = '' }: { variant?: 'gold' | 'dark'; className?: string }) {
  return (
    <div
      className={`w-full ${
        variant === 'gold' ? 'greek-meander-horizontal opacity-90' : 'greek-meander-horizontal-dark opacity-60'
      } ${className}`}
    />
  );
}
