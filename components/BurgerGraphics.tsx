'use client';

import React from 'react';

interface BurgerGraphicProps {
  type?: 'classic' | 'fury' | 'melt' | 'bacon' | 'combo' | 'fries' | 'shake' | 'dessert' | 'onion' | 'nuggets';
  className?: string;
  size?: number;
  highlightLayer?: string | null;
}

export function BurgerGraphic({ type = 'classic', className = '', size = 200 }: BurgerGraphicProps) {
  switch (type) {
    case 'classic':
      return (
        <svg
          viewBox="0 0 240 240"
          className={className}
          style={{ width: size, height: size, filter: 'drop-shadow(0 20px 24px rgba(0,0,0,0.65))' }}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="bunTopClassic" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#f3b469" />
              <stop offset="45%" stopColor="#d9822b" />
              <stop offset="90%" stopColor="#9e4e13" />
            </radialGradient>
            <linearGradient id="pattyGradClassic" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4a2511" />
              <stop offset="50%" stopColor="#2b1408" />
              <stop offset="100%" stopColor="#1a0b04" />
            </linearGradient>
            <linearGradient id="cheddarGradClassic" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffd033" />
              <stop offset="80%" stopColor="#f39c12" />
              <stop offset="100%" stopColor="#d35400" />
            </linearGradient>
          </defs>

          {/* Plate / Shadow glow */}
          <ellipse cx="120" cy="210" rx="95" ry="18" fill="rgba(0,0,0,0.5)" filter="blur(6px)" />

          {/* Bottom Bun */}
          <path
            d="M 45 180 Q 120 174 195 180 Q 200 208 120 208 Q 40 208 45 180 Z"
            fill="#cf7f28"
            stroke="#91490d"
            strokeWidth="1.5"
          />

          {/* Pickles & Sauce */}
          <ellipse cx="80" cy="178" rx="22" ry="8" fill="#588157" stroke="#3a5a40" strokeWidth="1" />
          <ellipse cx="150" cy="177" rx="24" ry="8" fill="#588157" stroke="#3a5a40" strokeWidth="1" />
          {/* Sauce dribble */}
          <path d="M 95 178 Q 105 188 115 178 Q 125 186 135 177" stroke="#e63946" strokeWidth="4" strokeLinecap="round" />

          {/* Bottom Patty */}
          <path
            d="M 32 165 C 32 158 50 162 80 160 C 110 159 140 163 170 160 C 195 158 208 165 206 174 C 204 182 185 184 150 183 C 110 184 65 183 35 176 C 30 171 31 168 32 165 Z"
            fill="url(#pattyGradClassic)"
          />
          {/* Sear marks */}
          <path d="M 45 172 Q 85 176 125 171 Q 165 175 195 170" stroke="#120602" strokeWidth="2" strokeDasharray="4 3" />

          {/* Cheddar Layer 1 */}
          <path
            d="M 35 155 Q 120 148 205 155 L 202 164 Q 180 174 165 162 Q 130 180 110 164 Q 85 176 60 162 L 35 160 Z"
            fill="url(#cheddarGradClassic)"
          />

          {/* Top Patty */}
          <path
            d="M 34 140 C 34 133 60 137 90 134 C 125 133 155 137 185 134 C 205 132 208 139 206 148 C 204 156 180 157 145 156 C 105 156 60 157 36 150 C 33 145 33 142 34 140 Z"
            fill="url(#pattyGradClassic)"
          />

          {/* Cheddar Layer 2 Dripping */}
          <path
            d="M 38 134 Q 120 128 202 134 Q 192 154 175 142 Q 155 168 140 140 Q 120 170 95 138 Q 70 160 55 137 Z"
            fill="url(#cheddarGradClassic)"
          />

          {/* Red Onion rings */}
          <path d="M 60 128 Q 120 122 180 128" stroke="#8338ec" strokeWidth="4" strokeLinecap="round" />
          <path d="M 85 125 Q 120 121 155 125" stroke="#ff006e" strokeWidth="2.5" strokeLinecap="round" />

          {/* Crisp Lettuce */}
          <path
            d="M 28 122 Q 40 114 55 123 Q 75 110 95 122 Q 120 108 145 122 Q 170 110 190 122 Q 205 114 212 122 Q 200 132 175 127 Q 145 135 120 127 Q 95 135 65 127 Q 40 132 28 122 Z"
            fill="#52b788"
            stroke="#2d6a4f"
            strokeWidth="1.5"
          />

          {/* Top Brioche Bun */}
          <path
            d="M 35 120 C 35 55 75 32 120 32 C 165 32 205 55 205 120 C 205 124 190 126 120 126 C 50 126 35 124 35 120 Z"
            fill="url(#bunTopClassic)"
          />
          {/* Bun Highlight Glaze */}
          <path
            d="M 60 65 Q 120 48 180 65 Q 160 52 120 45 Q 80 52 60 65 Z"
            fill="rgba(255, 255, 255, 0.35)"
            filter="blur(2px)"
          />

          {/* Sesame Seeds */}
          <g fill="#fff5eb" opacity="0.95">
            <ellipse cx="85" cy="65" rx="3.5" ry="2" transform="rotate(-15 85 65)" />
            <ellipse cx="115" cy="52" rx="3.5" ry="2" transform="rotate(5 115 52)" />
            <ellipse cx="145" cy="62" rx="3.5" ry="2" transform="rotate(25 145 62)" />
            <ellipse cx="75" cy="85" rx="3.5" ry="2" transform="rotate(-30 75 85)" />
            <ellipse cx="102" cy="78" rx="3.5" ry="2" transform="rotate(-5 102 78)" />
            <ellipse cx="135" cy="76" rx="3.5" ry="2" transform="rotate(15 135 76)" />
            <ellipse cx="165" cy="82" rx="3.5" ry="2" transform="rotate(35 165 82)" />
            <ellipse cx="90" cy="100" rx="3.5" ry="2" transform="rotate(-10 90 100)" />
            <ellipse cx="120" cy="98" rx="3.5" ry="2" transform="rotate(10 120 98)" />
            <ellipse cx="150" cy="99" rx="3.5" ry="2" transform="rotate(20 150 99)" />
          </g>
        </svg>
      );

    case 'fury':
      return (
        <svg
          viewBox="0 0 240 240"
          className={className}
          style={{ width: size, height: size, filter: 'drop-shadow(0 20px 24px rgba(0,0,0,0.65))' }}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="bunTopFury" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#f5bb76" />
              <stop offset="50%" stopColor="#db872d" />
              <stop offset="100%" stopColor="#96440c" />
            </radialGradient>
            <linearGradient id="greenFurySauce" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#74c69d" />
              <stop offset="60%" stopColor="#40916c" />
              <stop offset="100%" stopColor="#1b4332" />
            </linearGradient>
            <linearGradient id="baconGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#780000" />
              <stop offset="30%" stopColor="#c1121f" />
              <stop offset="60%" stopColor="#fdf0d5" />
              <stop offset="100%" stopColor="#660708" />
            </linearGradient>
          </defs>

          <ellipse cx="120" cy="212" rx="95" ry="18" fill="rgba(0,0,0,0.5)" filter="blur(6px)" />

          {/* Bottom Bun */}
          <path d="M 45 182 Q 120 176 195 182 Q 200 208 120 208 Q 40 208 45 182 Z" fill="#cf7f28" stroke="#91490d" strokeWidth="1.5" />

          {/* Patty 1 */}
          <path d="M 32 165 C 32 158 70 162 120 160 C 170 162 208 165 206 174 C 204 182 170 184 120 183 C 70 184 31 168 32 165 Z" fill="#2b1408" />

          {/* Bacon Strips waving */}
          <path d="M 30 158 Q 50 148 85 162 Q 120 146 160 160 Q 190 148 210 160 L 208 168 Q 185 156 155 168 Q 115 154 80 170 L 30 164 Z" fill="url(#baconGrad)" />

          {/* Gouda Cheese melt */}
          <path d="M 36 150 Q 120 144 204 150 L 195 162 Q 165 174 145 156 Q 115 172 90 156 L 36 155 Z" fill="#fdf0d5" />

          {/* Patty 2 */}
          <path d="M 34 138 C 34 132 80 136 120 134 C 160 136 206 138 205 146 C 203 154 165 155 120 154 C 75 155 33 144 34 138 Z" fill="#240f05" />

          {/* GREEN FURY SIGNATURE SAUCE OVERFLOW */}
          <path
            d="M 38 132 Q 120 126 202 132 Q 190 162 175 138 Q 155 178 135 138 Q 110 176 90 136 Q 65 168 50 136 Z"
            fill="url(#greenFurySauce)"
          />
          {/* Herb bits */}
          <circle cx="85" cy="148" r="1.5" fill="#1b4332" />
          <circle cx="100" cy="155" r="1.5" fill="#1b4332" />
          <circle cx="140" cy="152" r="1.5" fill="#1b4332" />
          <circle cx="165" cy="146" r="1.5" fill="#1b4332" />

          {/* Bacon Crumbs */}
          <rect x="70" y="130" width="6" height="4" rx="1" fill="#780000" transform="rotate(15 70 130)" />
          <rect x="130" y="132" width="7" height="3" rx="1" fill="#780000" transform="rotate(-10 130 132)" />
          <rect x="160" y="130" width="5" height="4" rx="1" fill="#780000" transform="rotate(25 160 130)" />

          {/* Top Bun */}
          <path d="M 35 120 C 35 55 75 32 120 32 C 165 32 205 55 205 120 C 205 124 190 126 120 126 C 50 126 35 124 35 120 Z" fill="url(#bunTopFury)" />
          <path d="M 60 65 Q 120 48 180 65 Q 160 52 120 45 Q 80 52 60 65 Z" fill="rgba(255, 255, 255, 0.35)" filter="blur(2px)" />

          {/* Black & White Sesame Seeds */}
          <g fill="#212529">
            <ellipse cx="95" cy="62" rx="3" ry="1.8" transform="rotate(20 95 62)" />
            <ellipse cx="145" cy="72" rx="3" ry="1.8" transform="rotate(-15 145 72)" />
            <ellipse cx="115" cy="85" rx="3" ry="1.8" transform="rotate(5 115 85)" />
          </g>
          <g fill="#fff5eb">
            <ellipse cx="75" cy="78" rx="3.5" ry="2" transform="rotate(-25 75 78)" />
            <ellipse cx="125" cy="58" rx="3.5" ry="2" transform="rotate(10 125 58)" />
            <ellipse cx="160" cy="82" rx="3.5" ry="2" transform="rotate(30 160 82)" />
          </g>
        </svg>
      );

    case 'melt':
      return (
        <svg
          viewBox="0 0 240 240"
          className={className}
          style={{ width: size, height: size, filter: 'drop-shadow(0 20px 24px rgba(0,0,0,0.65))' }}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="bunTopMelt" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#f3b469" />
              <stop offset="50%" stopColor="#d9822b" />
              <stop offset="100%" stopColor="#9e4e13" />
            </radialGradient>
            <linearGradient id="cheddarCascade" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffea00" />
              <stop offset="40%" stopColor="#ffaa00" />
              <stop offset="90%" stopColor="#e85d04" />
              <stop offset="100%" stopColor="#dc2f02" />
            </linearGradient>
          </defs>

          <ellipse cx="120" cy="215" rx="100" ry="20" fill="rgba(0,0,0,0.6)" filter="blur(6px)" />

          {/* Cheddar Pool on the base */}
          <ellipse cx="120" cy="202" rx="85" ry="12" fill="url(#cheddarCascade)" />

          {/* Bottom Bun */}
          <path d="M 45 180 Q 120 174 195 180 Q 200 208 120 208 Q 40 208 45 180 Z" fill="#cf7f28" />

          {/* Patty 1 */}
          <path d="M 32 165 Q 120 160 206 165 C 206 175 170 184 120 183 C 70 184 32 175 32 165 Z" fill="#2b1408" />

          {/* Caramelized Onions */}
          <path d="M 50 162 Q 90 156 130 164 Q 170 156 190 162" stroke="#5a2a18" strokeWidth="5" strokeLinecap="round" />
          <path d="M 70 160 Q 110 154 150 160" stroke="#7f391b" strokeWidth="3" strokeLinecap="round" />

          {/* Patty 2 */}
          <path d="M 34 138 Q 120 134 206 138 C 206 148 165 155 120 154 C 75 155 34 148 34 138 Z" fill="#240f05" />

          {/* MASSIVE CASCADE OF MOLTEN CHEDDAR DRIPPING PAST BOTH PATTIES */}
          <path
            d="M 36 130 Q 120 120 204 130 C 200 165 180 195 175 160 C 160 210 140 185 130 155 C 120 215 100 190 85 160 C 65 210 45 175 36 145 Z"
            fill="url(#cheddarCascade)"
          />

          {/* Bacon bits in the cheese */}
          <rect x="55" y="165" width="8" height="5" rx="1" fill="#660708" transform="rotate(20 55 165)" />
          <rect x="110" y="175" width="9" height="5" rx="1" fill="#660708" transform="rotate(-15 110 175)" />
          <rect x="155" y="170" width="8" height="5" rx="1" fill="#660708" transform="rotate(30 155 170)" />

          {/* Top Bun */}
          <path d="M 35 120 C 35 55 75 32 120 32 C 165 32 205 55 205 120 C 205 124 190 126 120 126 C 50 126 35 124 35 120 Z" fill="url(#bunTopMelt)" />
          <path d="M 60 65 Q 120 48 180 65 Q 160 52 120 45 Q 80 52 60 65 Z" fill="rgba(255, 255, 255, 0.35)" filter="blur(2px)" />

          {/* Cheddar dripping from the top bun edge */}
          <path d="M 90 124 Q 95 138 100 125" fill="#ffaa00" />
          <path d="M 135 124 Q 142 144 148 125" fill="#ffaa00" />
          <path d="M 165 124 Q 170 136 175 125" fill="#ffaa00" />

          {/* Sesame Seeds */}
          <g fill="#fff5eb">
            <ellipse cx="85" cy="65" rx="3.5" ry="2" transform="rotate(-15 85 65)" />
            <ellipse cx="115" cy="52" rx="3.5" ry="2" transform="rotate(5 115 52)" />
            <ellipse cx="145" cy="62" rx="3.5" ry="2" transform="rotate(25 145 62)" />
            <ellipse cx="102" cy="78" rx="3.5" ry="2" transform="rotate(-5 102 78)" />
            <ellipse cx="135" cy="76" rx="3.5" ry="2" transform="rotate(15 135 76)" />
          </g>
        </svg>
      );

    case 'fries':
      return (
        <svg
          viewBox="0 0 200 200"
          className={className}
          style={{ width: size, height: size, filter: 'drop-shadow(0 15px 20px rgba(0,0,0,0.5))' }}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse cx="100" cy="180" rx="70" ry="14" fill="rgba(0,0,0,0.4)" filter="blur(4px)" />

          {/* Fries Bag / Carton Retro Red */}
          <path d="M 45 95 L 60 180 L 140 180 L 155 95 Q 100 115 45 95 Z" fill="#D91E18" stroke="#991512" strokeWidth="2" />
          <path d="M 60 110 L 140 110 L 135 170 L 65 170 Z" fill="#F5EFE6" opacity="0.15" />
          <text x="100" y="145" textAnchor="middle" fill="#F5EFE6" fontSize="11" fontWeight="900" fontFamily="sans-serif">
            RIOT
          </text>

          {/* Golden Fries sticking out */}
          <g stroke="#f39c12" strokeWidth="1" strokeLinejoin="round">
            <rect x="65" y="35" width="12" height="75" rx="2" fill="#f1c40f" transform="rotate(-15 65 35)" />
            <rect x="80" y="25" width="13" height="85" rx="2" fill="#ffd000" transform="rotate(-5 80 25)" />
            <rect x="98" y="20" width="12" height="90" rx="2" fill="#f39c12" transform="rotate(4 98 20)" />
            <rect x="115" y="28" width="13" height="82" rx="2" fill="#ffd000" transform="rotate(12 115 28)" />
            <rect x="130" y="42" width="12" height="68" rx="2" fill="#f1c40f" transform="rotate(22 130 42)" />
            {/* Layer 2 fries */}
            <rect x="74" y="50" width="11" height="60" rx="2" fill="#f39c12" transform="rotate(-8 74 50)" />
            <rect x="108" y="48" width="11" height="62" rx="2" fill="#f1c40f" transform="rotate(8 108 48)" />
          </g>
          {/* Salt / Paprika grains */}
          <circle cx="85" cy="45" r="1.5" fill="#e63946" />
          <circle cx="105" cy="38" r="1.5" fill="#e63946" />
          <circle cx="120" cy="52" r="1.5" fill="#e63946" />
        </svg>
      );

    case 'shake':
      return (
        <svg
          viewBox="0 0 200 200"
          className={className}
          style={{ width: size, height: size, filter: 'drop-shadow(0 15px 20px rgba(0,0,0,0.5))' }}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse cx="100" cy="185" rx="50" ry="10" fill="rgba(0,0,0,0.4)" filter="blur(4px)" />
          {/* Glass */}
          <path d="M 60 70 L 72 175 Q 100 182 128 175 L 140 70 Z" fill="rgba(255,255,255,0.2)" stroke="#fff" strokeWidth="2" />
          {/* Shake Liquid */}
          <path d="M 63 78 L 74 172 Q 100 178 126 172 L 137 78 Q 100 86 63 78 Z" fill="#d4a373" />
          {/* Drizzle swirl inside glass */}
          <path d="M 75 90 Q 110 110 85 130 Q 120 150 110 170" stroke="#7f4f24" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
          {/* Whipped Cream Top */}
          <path d="M 58 70 Q 70 50 85 62 Q 100 40 115 58 Q 130 48 142 70 Q 100 75 58 70 Z" fill="#fffdfa" />
          <circle cx="100" cy="40" r="10" fill="#D91E18" /> {/* Cherry */}
          {/* Straw retro striped */}
          <line x1="115" y1="55" x2="145" y2="15" stroke="#D91E18" strokeWidth="6" strokeLinecap="round" />
          <line x1="115" y1="55" x2="145" y2="15" stroke="#FFF" strokeWidth="6" strokeDasharray="6 6" strokeLinecap="round" />
        </svg>
      );

    case 'dessert':
      return (
        <svg
          viewBox="0 0 200 200"
          className={className}
          style={{ width: size, height: size, filter: 'drop-shadow(0 15px 20px rgba(0,0,0,0.5))' }}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse cx="100" cy="160" rx="70" ry="16" fill="rgba(0,0,0,0.4)" filter="blur(4px)" />
          {/* Warm Giant Cookie */}
          <ellipse cx="100" cy="130" rx="65" ry="32" fill="#c68b59" stroke="#8c5827" strokeWidth="2" />
          {/* Melting Nutella Center */}
          <ellipse cx="100" cy="128" rx="30" ry="15" fill="#3d1e06" />
          <path d="M 90 128 Q 100 148 110 128" fill="#3d1e06" />
          {/* Chocolate Chunks */}
          <rect x="65" y="120" width="10" height="8" rx="2" fill="#2b1404" transform="rotate(12 65 120)" />
          <rect x="125" y="125" width="11" height="9" rx="2" fill="#2b1404" transform="rotate(-15 125 125)" />
          <rect x="75" y="135" width="8" height="7" rx="2" fill="#2b1404" transform="rotate(-8 75 135)" />
          <rect x="110" y="140" width="9" height="7" rx="2" fill="#2b1404" transform="rotate(22 110 140)" />
        </svg>
      );

    default:
      return <BurgerGraphic type="classic" className={className} size={size} />;
  }
}
