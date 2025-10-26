/**
 * Logo Alviar blanc en SVG pour l'export Excel
 * Design professionnel avec logo blanc sur fond sombre
 */
export const ALVIAR_LOGO_WHITE_SVG = `
<svg width="200" height="60" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="whiteGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#f8fafc;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="textWhiteGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f1f5f9;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background sombre -->
  <rect width="200" height="60" fill="#1e293b" stroke="#334155" stroke-width="1" rx="8"/>
  
  <!-- Icône principale - Boucherie/Abattoir stylisée en blanc -->
  <g transform="translate(15, 10)">
    <!-- Couteau de boucher -->
    <path d="M5 5 L25 25 L20 30 L0 10 Z" fill="url(#whiteGradient)" stroke="#ffffff" stroke-width="1"/>
    <!-- Manche du couteau -->
    <rect x="0" y="8" width="8" height="4" fill="#ffffff" rx="2"/>
    <!-- Lame brillante -->
    <path d="M5 5 L25 25 L22 28 L2 8 Z" fill="#ffffff" opacity="0.8"/>
  </g>
  
  <!-- Texte ALVIAR en blanc -->
  <text x="50" y="25" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="url(#textWhiteGradient)">
    ALVIAR
  </text>
  
  <!-- Sous-titre en blanc -->
  <text x="50" y="40" font-family="Arial, sans-serif" font-size="10" font-weight="600" fill="#cbd5e1">
    ENTREPRISE ALGÉRIENNE DE VIANDES ROUGES
  </text>
  
  <!-- Éléments décoratifs blancs -->
  <circle cx="170" cy="15" r="3" fill="#ffffff" opacity="0.8"/>
  <circle cx="175" cy="25" r="2" fill="#f1f5f9" opacity="0.9"/>
  <circle cx="180" cy="35" r="2.5" fill="#ffffff" opacity="0.7"/>
  
  <!-- Ligne décorative blanche -->
  <line x1="50" y1="45" x2="190" y2="45" stroke="url(#whiteGradient)" stroke-width="2" opacity="0.8"/>
</svg>
`;

/**
 * Logo Alviar en SVG pour l'export Excel
 * Design professionnel digne d'une grande entreprise mondiale
 */
export const ALVIAR_LOGO_SVG = `
<svg width="200" height="60" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="alviarGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#60a5fa;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background avec effet de profondeur -->
  <rect width="200" height="60" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" rx="8"/>
  
  <!-- Icône principale - Boucherie/Abattoir stylisée -->
  <g transform="translate(15, 10)">
    <!-- Couteau de boucher -->
    <path d="M5 5 L25 25 L20 30 L0 10 Z" fill="url(#alviarGradient)" stroke="#1e40af" stroke-width="1"/>
    <!-- Manche du couteau -->
    <rect x="0" y="8" width="8" height="4" fill="#8b5cf6" rx="2"/>
    <!-- Lame brillante -->
    <path d="M5 5 L25 25 L22 28 L2 8 Z" fill="#ffffff" opacity="0.3"/>
  </g>
  
  <!-- Texte ALVIAR -->
  <text x="50" y="25" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="url(#textGradient)">
    ALVIAR
  </text>
  
  <!-- Sous-titre -->
  <text x="50" y="40" font-family="Arial, sans-serif" font-size="10" font-weight="600" fill="#64748b">
    ENTREPRISE ALGÉRIENNE DE VIANDES ROUGES
  </text>
  
  <!-- Éléments décoratifs -->
  <circle cx="170" cy="15" r="3" fill="#3b82f6" opacity="0.6"/>
  <circle cx="175" cy="25" r="2" fill="#60a5fa" opacity="0.8"/>
  <circle cx="180" cy="35" r="2.5" fill="#1e40af" opacity="0.7"/>
  
  <!-- Ligne décorative -->
  <line x1="50" y1="45" x2="190" y2="45" stroke="url(#alviarGradient)" stroke-width="2" opacity="0.6"/>
</svg>
`;

/**
 * Logo Alviar compact pour les en-têtes
 */
export const ALVIAR_LOGO_COMPACT_SVG = `
<svg width="120" height="40" viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="compactGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Icône -->
  <g transform="translate(8, 8)">
    <path d="M3 3 L15 15 L12 18 L0 6 Z" fill="url(#compactGradient)"/>
    <rect x="0" y="5" width="6" height="3" fill="#8b5cf6" rx="1"/>
  </g>
  
  <!-- Texte -->
  <text x="30" y="18" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#1e40af">
    ALVIAR
  </text>
  <text x="30" y="30" font-family="Arial, sans-serif" font-size="8" font-weight="600" fill="#64748b">
    VIANDES ROUGES
  </text>
</svg>
`;

/**
 * Génère le logo en base64 pour l'utilisation dans Excel
 */
export const getAlviarLogoBase64 = (): string => {
    const svg = ALVIAR_LOGO_SVG;
    const base64 = btoa(unescape(encodeURIComponent(svg)));
    return `data:image/svg+xml;base64,${base64}`;
};

/**
 * Génère le logo compact en base64
 */
export const getAlviarLogoCompactBase64 = (): string => {
    const svg = ALVIAR_LOGO_COMPACT_SVG;
    const base64 = btoa(unescape(encodeURIComponent(svg)));
    return `data:image/svg+xml;base64,${base64}`;
};
