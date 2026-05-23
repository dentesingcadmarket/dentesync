export function DentalIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="bgGlow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="laptopGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1f1f20" />
          <stop offset="100%" stopColor="#0a0a0a" />
        </linearGradient>
        <linearGradient id="screenGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="shirtGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
        <radialGradient id="floor" cx="50%" cy="100%" r="60%">
          <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="240" cy="60" r="80" fill="url(#bgGlow)" />
      <ellipse cx="200" cy="200" rx="120" ry="16" fill="url(#floor)" />

      {/* Tooth icon floating */}
      <g transform="translate(50, 30)" opacity="0.55">
        <path
          d="M20 4c-5 0-9 3-12 6-3-3-7-6-12-6-7 0-12 5-12 12 0 6 4 12 8 18 2 3 3 6 4 9 1 4 3 6 6 6s5-2 6-6c1-3 2-6 4-9 4-6 8-12 8-18 0-7-5-12-12-12z"
          transform="translate(12, 12)"
          fill="none"
          stroke="#2dd4bf"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>

      {/* Mini tooth decoration */}
      <g transform="translate(280, 130)" opacity="0.4">
        <circle cx="0" cy="0" r="14" fill="#2dd4bf" fillOpacity="0.1" />
        <path
          d="M-4 -3c-1.5 0-3 1-4 2-1-1-2.5-2-4-2-2 0-4 1.5-4 4 0 2 1.5 4 3 6 0.5 1 1 2 1.5 3 0.3 1 1 2 2 2s1.7-1 2-2c0.5-1 1-2 1.5-3 1.5-2 3-4 3-6 0-2.5-2-4-4-4z"
          fill="#2dd4bf"
        />
      </g>

      {/* Desk surface */}
      <rect x="40" y="175" width="240" height="6" rx="2" fill="#1f1f20" stroke="#2dd4bf" strokeOpacity="0.15" />

      {/* Laptop base */}
      <path d="M120 175 L220 175 L226 185 L114 185 Z" fill="url(#laptopGrad)" stroke="#2dd4bf" strokeOpacity="0.25" strokeWidth="0.8" />
      {/* Laptop screen */}
      <rect x="128" y="120" width="84" height="58" rx="3" fill="#0a0a0a" stroke="#2dd4bf" strokeOpacity="0.35" strokeWidth="1" />
      <rect x="132" y="124" width="76" height="50" rx="2" fill="url(#screenGrad)" opacity="0.85" />
      {/* Screen content lines */}
      <rect x="138" y="130" width="38" height="3" rx="1" fill="#fff" opacity="0.6" />
      <rect x="138" y="138" width="60" height="2" rx="1" fill="#fff" opacity="0.4" />
      <rect x="138" y="144" width="48" height="2" rx="1" fill="#fff" opacity="0.4" />
      <rect x="138" y="150" width="54" height="2" rx="1" fill="#fff" opacity="0.4" />
      <circle cx="195" cy="162" r="6" fill="#fff" opacity="0.7" />

      {/* Character body */}
      <g>
        {/* Chair shadow */}
        <rect x="68" y="155" width="36" height="20" rx="3" fill="#1f1f20" />

        {/* Torso/shirt */}
        <path
          d="M70 170 Q70 130 90 130 Q110 130 110 170 Z"
          fill="url(#shirtGrad)"
        />
        {/* Arm to laptop */}
        <path
          d="M105 150 Q125 155 132 165"
          stroke="url(#shirtGrad)"
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
        />
        {/* Hand */}
        <circle cx="132" cy="167" r="4" fill="#f4cfa0" />

        {/* Neck */}
        <rect x="86" y="118" width="10" height="12" fill="#f4cfa0" />

        {/* Head */}
        <circle cx="91" cy="108" r="14" fill="#f4cfa0" />
        {/* Hair */}
        <path
          d="M77 105 Q78 92 91 91 Q105 92 106 106 L102 106 Q103 96 91 96 Q81 97 81 106 Z"
          fill="#1f1f20"
        />
        {/* Eye */}
        <circle cx="95" cy="108" r="1.4" fill="#0a0a0a" />
        {/* Mouth */}
        <path d="M93 113 Q96 115 98 113" stroke="#0a0a0a" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        {/* Headset/glasses arc */}
        <path d="M83 100 Q91 86 100 100" stroke="#2dd4bf" strokeWidth="1.5" fill="none" />
        <circle cx="83" cy="104" r="2" fill="#2dd4bf" opacity="0.7" />

        {/* Coffee mug */}
        <rect x="48" y="160" width="14" height="15" rx="1.5" fill="#2dd4bf" />
        <path d="M62 164 L66 164 L66 170 L62 170" stroke="#2dd4bf" strokeWidth="1.5" fill="none" />
        <ellipse cx="55" cy="160" rx="7" ry="1.5" fill="#0a0a0a" opacity="0.4" />
        <path d="M52 156 Q55 152 58 156" stroke="#fff" strokeWidth="0.8" fill="none" opacity="0.5" />
      </g>

      {/* Floating dot accents */}
      <circle cx="40" cy="60" r="2" fill="#2dd4bf" opacity="0.6" />
      <circle cx="270" cy="40" r="3" fill="#2dd4bf" opacity="0.4" />
      <circle cx="295" cy="90" r="1.5" fill="#2563eb" opacity="0.6" />
    </svg>
  )
}
