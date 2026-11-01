'use client';

import React, { useState } from 'react';

export type IngredientId =
  | 'pao-baixo'
  | 'pao-cima'
  | 'pao-australiano-baixo'
  | 'pao-australiano-cima'
  | 'carne-smash'
  | 'carne-dupla'
  | 'carne-160g'
  | 'frango-crispy'
  | 'veggie-patty'
  | 'queijo-cheddar'
  | 'queijo-prato'
  | 'gorgonzola'
  | 'alface'
  | 'tomate'
  | 'picles'
  | 'cebola-caramelizada'
  | 'cebola-roxa'
  | 'bacon-tiras'
  | 'farofa-bacon'
  | 'aneis-cebola'
  | 'molho-especial'
  | 'molho-verde'
  | 'molho-barbecue';

interface BurgerLayerGraphicProps {
  id: string;
  imagePath?: string;
  className?: string;
  width?: number;
  height?: number;
}

export function BurgerLayerGraphic({
  id,
  imagePath,
  className = '',
  width = 280,
  height = 90,
}: BurgerLayerGraphicProps) {
  const [imageFailed, setImageFailed] = useState(false);

  // If custom user image path is provided and hasn't failed to load, render <img>
  if (imagePath && !imageFailed) {
    return (
      <div className={`relative flex items-center justify-center ${className}`} style={{ width, height }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imagePath}
          alt={id}
          onError={() => setImageFailed(true)}
          className="max-w-full max-h-full object-contain filter drop-shadow-md select-none pointer-events-none"
        />
      </div>
    );
  }

  // High-fidelity fallback SVG graphics for each layer type
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width, height }}>
      {renderFallbackSvg(id, width, height)}
    </div>
  );
}

function renderFallbackSvg(id: string, width: number, height: number) {
  switch (id) {
    // ------------------------------------
    // 1. PÃES (BASE)
    // ------------------------------------
    case 'pao-baixo':
      return (
        <svg viewBox="0 0 240 80" className="w-full h-full filter drop-shadow-md" fill="none">
          <defs>
            <radialGradient id="bunBottomGrad" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#f7c882" />
              <stop offset="50%" stopColor="#d9822b" />
              <stop offset="100%" stopColor="#9e4e13" />
            </radialGradient>
          </defs>
          {/* Bottom Bun curved shape */}
          <path
            d="M 25 25 Q 120 18 215 25 Q 220 62 120 65 Q 20 62 25 25 Z"
            fill="url(#bunBottomGrad)"
            stroke="#873e0b"
            strokeWidth="1.5"
          />
          {/* Internal toasted crumb pattern */}
          <path d="M 35 25 Q 120 22 205 25" stroke="#fce2b1" strokeWidth="3" opacity="0.8" />
        </svg>
      );

    case 'pao-australiano-baixo':
      return (
        <svg viewBox="0 0 240 80" className="w-full h-full filter drop-shadow-md" fill="none">
          <path
            d="M 25 25 Q 120 18 215 25 Q 220 62 120 65 Q 20 62 25 25 Z"
            fill="#3a2318"
            stroke="#21120b"
            strokeWidth="1.5"
          />
          <path d="M 35 25 Q 120 22 205 25" stroke="#523223" strokeWidth="3" opacity="0.9" />
        </svg>
      );

    // ------------------------------------
    // 2. PÃES (TOPO COM GERGELIM)
    // ------------------------------------
    case 'pao-cima':
      return (
        <svg viewBox="0 0 240 100" className="w-full h-full filter drop-shadow-lg" fill="none">
          <defs>
            <radialGradient id="bunTopGrad" cx="50%" cy="25%" r="75%">
              <stop offset="0%" stopColor="#fcd390" />
              <stop offset="40%" stopColor="#e38c30" />
              <stop offset="90%" stopColor="#9e4e13" />
            </radialGradient>
          </defs>
          {/* Glossy golden dome */}
          <path
            d="M 20 70 C 18 15 222 15 220 70 C 220 80 20 80 20 70 Z"
            fill="url(#bunTopGrad)"
            stroke="#873e0b"
            strokeWidth="1.5"
          />
          {/* Sesame seeds (Gergelim dourado) */}
          {[
            { cx: 80, cy: 35, r: 15 },
            { cx: 120, cy: 30, r: -5 },
            { cx: 160, cy: 38, r: 25 },
            { cx: 100, cy: 45, r: 10 },
            { cx: 140, cy: 48, r: -15 },
            { cx: 65, cy: 55, r: 35 },
            { cx: 180, cy: 52, r: -20 },
            { cx: 115, cy: 60, r: 5 },
            { cx: 145, cy: 62, r: -30 },
          ].map((s, idx) => (
            <ellipse
              key={idx}
              cx={s.cx}
              cy={s.cy}
              rx="3.5"
              ry="1.8"
              fill="#fff9e6"
              stroke="#d49a37"
              strokeWidth="0.6"
              transform={`rotate(${s.r} ${s.cx} ${s.cy})`}
            />
          ))}
        </svg>
      );

    case 'pao-australiano-cima':
      return (
        <svg viewBox="0 0 240 100" className="w-full h-full filter drop-shadow-lg" fill="none">
          <path
            d="M 20 70 C 18 15 222 15 220 70 C 220 80 20 80 20 70 Z"
            fill="#382117"
            stroke="#21120b"
            strokeWidth="1.5"
          />
          <path d="M 45 45 Q 120 30 195 45" stroke="#5a3525" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />
        </svg>
      );

    // ------------------------------------
    // 3. CARNES & SMASH
    // ------------------------------------
    case 'carne-smash':
      return (
        <svg viewBox="0 0 240 70" className="w-full h-full filter drop-shadow-md" fill="none">
          <defs>
            <linearGradient id="smashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4a2511" />
              <stop offset="40%" stopColor="#301608" />
              <stop offset="85%" stopColor="#1a0b04" />
            </linearGradient>
          </defs>
          {/* Angus Smash patty with crispy jagged Maillard crust */}
          <path
            d="M 20 35 C 18 20 45 22 80 20 C 120 18 160 22 195 20 C 222 22 225 35 220 48 C 215 58 190 60 150 58 C 110 59 70 58 35 55 C 18 52 18 42 20 35 Z"
            fill="url(#smashGrad)"
            stroke="#120702"
            strokeWidth="1.5"
          />
          {/* Crust texture & grill marks */}
          <path d="M 50 32 Q 70 38 90 32 M 110 30 Q 130 36 150 30 M 170 32 Q 190 38 205 32" stroke="#120602" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        </svg>
      );

    case 'carne-dupla':
      return (
        <svg viewBox="0 0 240 85" className="w-full h-full filter drop-shadow-md" fill="none">
          {/* Bottom patty */}
          <path
            d="M 22 50 C 20 38 45 40 80 38 C 120 36 160 40 195 38 C 220 40 224 50 218 62 C 213 72 190 74 150 72 C 110 73 70 72 35 69 C 20 66 20 56 22 50 Z"
            fill="#301608"
            stroke="#120702"
            strokeWidth="1.2"
          />
          {/* Top patty */}
          <path
            d="M 20 22 C 18 10 45 12 80 10 C 120 8 160 12 195 10 C 222 12 225 22 220 35 C 215 45 190 47 150 45 C 110 46 70 45 35 42 C 18 39 18 29 20 22 Z"
            fill="#4a2511"
            stroke="#120702"
            strokeWidth="1.5"
          />
        </svg>
      );

    case 'carne-160g':
      return (
        <svg viewBox="0 0 240 80" className="w-full h-full filter drop-shadow-md" fill="none">
          <path
            d="M 18 35 C 16 16 45 18 80 16 C 120 14 160 18 195 16 C 224 18 226 35 222 55 C 216 68 190 70 150 68 C 110 69 70 68 35 65 C 16 62 16 48 18 35 Z"
            fill="#3d1e0d"
            stroke="#1a0b04"
            strokeWidth="2"
          />
        </svg>
      );

    case 'frango-crispy':
      return (
        <svg viewBox="0 0 240 75" className="w-full h-full filter drop-shadow-md" fill="none">
          <path
            d="M 20 35 C 22 20 60 18 120 18 C 180 18 220 22 222 38 C 222 54 180 62 120 62 C 60 62 18 52 20 35 Z"
            fill="#df8a28"
            stroke="#9c560d"
            strokeWidth="2"
          />
          {/* Panko flakes texture */}
          {[40, 70, 100, 130, 160, 190].map((x, i) => (
            <circle key={i} cx={x} cy={35 + (i % 2 === 0 ? 6 : -6)} r="3" fill="#fadc7a" />
          ))}
        </svg>
      );

    case 'veggie-patty':
      return (
        <svg viewBox="0 0 240 70" className="w-full h-full filter drop-shadow-md" fill="none">
          <path
            d="M 22 35 C 20 22 45 24 80 22 C 120 20 160 24 195 22 C 222 24 224 35 218 48 C 213 58 190 60 150 58 C 110 59 70 58 35 55 C 20 52 20 42 22 35 Z"
            fill="#5a6828"
            stroke="#343d14"
            strokeWidth="1.5"
          />
        </svg>
      );

    // ------------------------------------
    // 4. QUEIJOS DERRETIDOS
    // ------------------------------------
    case 'queijo-cheddar':
      return (
        <svg viewBox="0 0 240 70" className="w-full h-full filter drop-shadow-sm" fill="none">
          <defs>
            <linearGradient id="cheddarMelt" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffd033" />
              <stop offset="70%" stopColor="#f39c12" />
              <stop offset="100%" stopColor="#d35400" />
            </linearGradient>
          </defs>
          {/* Draping square melted cheddar slice with downward corners */}
          <path
            d="M 20 25 Q 120 22 220 25 Q 224 45 205 52 Q 185 40 160 48 Q 135 62 120 65 Q 105 62 80 48 Q 55 40 35 52 Q 16 45 20 25 Z"
            fill="url(#cheddarMelt)"
            stroke="#c0392b"
            strokeWidth="0.8"
          />
        </svg>
      );

    case 'queijo-prato':
      return (
        <svg viewBox="0 0 240 65" className="w-full h-full filter drop-shadow-sm" fill="none">
          <path
            d="M 22 25 Q 120 22 218 25 Q 222 44 200 48 Q 175 38 120 45 Q 65 38 40 48 Q 18 44 22 25 Z"
            fill="#f7e199"
            stroke="#d4b868"
            strokeWidth="1"
          />
        </svg>
      );

    case 'gorgonzola':
      return (
        <svg viewBox="0 0 240 60" className="w-full h-full filter drop-shadow-sm" fill="none">
          <path
            d="M 25 25 Q 120 20 215 25 Q 200 45 120 48 Q 40 45 25 25 Z"
            fill="#e8e7dc"
            stroke="#9ba395"
            strokeWidth="1"
          />
          <circle cx="80" cy="32" r="3" fill="#607d73" />
          <circle cx="140" cy="34" r="3.5" fill="#607d73" />
          <circle cx="170" cy="30" r="2.5" fill="#607d73" />
        </svg>
      );

    // ------------------------------------
    // 5. SALADAS & VEGETAIS
    // ------------------------------------
    case 'alface':
      return (
        <svg viewBox="0 0 240 65" className="w-full h-full filter drop-shadow-sm" fill="none">
          {/* Ruffled, wavy fresh green lettuce leaf */}
          <path
            d="M 12 35 C 18 20 40 22 55 35 C 70 20 95 24 110 38 C 125 22 150 20 165 36 C 180 22 205 24 228 35 C 235 48 215 58 190 52 C 165 60 145 52 120 58 C 95 52 75 60 50 52 C 25 58 8 48 12 35 Z"
            fill="#69b34c"
            stroke="#3f7529"
            strokeWidth="1.2"
          />
          {/* Leaf ribs */}
          <path d="M 40 38 Q 60 34 80 40 M 100 40 Q 125 36 150 40 M 170 38 Q 190 35 210 38" stroke="#8ce067" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'tomate':
      return (
        <svg viewBox="0 0 240 60" className="w-full h-full filter drop-shadow-sm" fill="none">
          {/* Two juicy red tomato slices */}
          <g transform="translate(35, 10)">
            <ellipse cx="45" cy="20" rx="36" ry="16" fill="#e63946" stroke="#a81a25" strokeWidth="1.2" />
            <ellipse cx="45" cy="20" rx="28" ry="11" fill="#d90429" />
            <circle cx="36" cy="18" r="2.5" fill="#ffb703" />
            <circle cx="54" cy="21" r="2.5" fill="#ffb703" />
          </g>
          <g transform="translate(115, 10)">
            <ellipse cx="45" cy="20" rx="36" ry="16" fill="#e63946" stroke="#a81a25" strokeWidth="1.2" />
            <ellipse cx="45" cy="20" rx="28" ry="11" fill="#d90429" />
            <circle cx="36" cy="18" r="2.5" fill="#ffb703" />
            <circle cx="54" cy="21" r="2.5" fill="#ffb703" />
          </g>
        </svg>
      );

    case 'picles':
      return (
        <svg viewBox="0 0 240 50" className="w-full h-full filter drop-shadow-sm" fill="none">
          {/* 3 Green artisan pickle slices */}
          <ellipse cx="65" cy="25" rx="26" ry="12" fill="#588157" stroke="#3a5a40" strokeWidth="1.2" transform="rotate(-6 65 25)" />
          <ellipse cx="120" cy="24" rx="28" ry="13" fill="#588157" stroke="#3a5a40" strokeWidth="1.2" />
          <ellipse cx="175" cy="25" rx="26" ry="12" fill="#588157" stroke="#3a5a40" strokeWidth="1.2" transform="rotate(8 175 25)" />
        </svg>
      );

    case 'cebola-caramelizada':
      return (
        <svg viewBox="0 0 240 50" className="w-full h-full filter drop-shadow-sm" fill="none">
          <path
            d="M 30 25 Q 70 15 110 26 Q 150 16 210 25 Q 180 38 120 36 Q 60 38 30 25 Z"
            fill="#592c18"
            stroke="#36170a"
            strokeWidth="1.2"
          />
          <path d="M 45 26 Q 80 20 120 28 Q 160 22 195 26" stroke="#874729" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'cebola-roxa':
      return (
        <svg viewBox="0 0 240 50" className="w-full h-full filter drop-shadow-sm" fill="none">
          <ellipse cx="75" cy="25" rx="35" ry="12" fill="none" stroke="#7209b7" strokeWidth="3" />
          <ellipse cx="150" cy="25" rx="38" ry="13" fill="none" stroke="#7209b7" strokeWidth="3" />
        </svg>
      );

    // ------------------------------------
    // 6. BACON & CROCÂNCIAS
    // ------------------------------------
    case 'bacon-tiras':
      return (
        <svg viewBox="0 0 240 55" className="w-full h-full filter drop-shadow-sm" fill="none">
          {/* Two wavy crispy bacon rashers */}
          <path
            d="M 25 22 Q 55 12 85 24 Q 115 12 145 24 Q 175 14 215 22"
            stroke="#800e13"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M 35 32 Q 65 22 95 34 Q 125 22 155 34 Q 185 24 205 32"
            stroke="#ad2831"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'farofa-bacon':
      return (
        <svg viewBox="0 0 240 45" className="w-full h-full filter drop-shadow-sm" fill="none">
          {/* Scattered crispy bacon crumble */}
          {[
            { cx: 40, cy: 22, r: 4 },
            { cx: 65, cy: 18, r: 5 },
            { cx: 90, cy: 25, r: 4.5 },
            { cx: 115, cy: 20, r: 5.5 },
            { cx: 140, cy: 26, r: 4 },
            { cx: 165, cy: 20, r: 5 },
            { cx: 190, cy: 24, r: 4.5 },
          ].map((c, i) => (
            <rect
              key={i}
              x={c.cx}
              y={c.cy}
              width={c.r * 2}
              height={c.r * 1.5}
              rx="1.5"
              fill="#5e0b0e"
              stroke="#800e13"
              strokeWidth="0.8"
            />
          ))}
        </svg>
      );

    case 'aneis-cebola':
      return (
        <svg viewBox="0 0 240 55" className="w-full h-full filter drop-shadow-sm" fill="none">
          <ellipse cx="75" cy="26" rx="35" ry="14" fill="#cf8a27" stroke="#87530c" strokeWidth="2.5" />
          <ellipse cx="75" cy="26" rx="24" ry="8" fill="#F8F6F0" opacity="0.3" />
          <ellipse cx="155" cy="26" rx="38" ry="15" fill="#cf8a27" stroke="#87530c" strokeWidth="2.5" />
          <ellipse cx="155" cy="26" rx="26" ry="9" fill="#F8F6F0" opacity="0.3" />
        </svg>
      );

    // ------------------------------------
    // 7. MOLHOS
    // ------------------------------------
    case 'molho-especial':
      return (
        <svg viewBox="0 0 240 45" className="w-full h-full filter drop-shadow-sm" fill="none">
          <path
            d="M 35 22 Q 60 30 85 20 Q 110 32 135 22 Q 160 30 185 20 Q 205 28 215 22"
            stroke="#e07a5f"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'molho-verde':
      return (
        <svg viewBox="0 0 240 45" className="w-full h-full filter drop-shadow-sm" fill="none">
          <path
            d="M 35 22 Q 60 30 85 20 Q 110 32 135 22 Q 160 30 185 20 Q 205 28 215 22"
            stroke="#40916c"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'molho-barbecue':
      return (
        <svg viewBox="0 0 240 45" className="w-full h-full filter drop-shadow-sm" fill="none">
          <path
            d="M 35 22 Q 60 30 85 20 Q 110 32 135 22 Q 160 30 185 20 Q 205 28 215 22"
            stroke="#3d0c02"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 240 50" className="w-full h-full" fill="none">
          <ellipse cx="120" cy="25" rx="80" ry="15" fill="#CD9C20" opacity="0.5" />
        </svg>
      );
  }
}
