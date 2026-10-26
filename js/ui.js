/**
 * NEY — Helpers d'interface
 * Formatage, toasts, icônes et génération des mockups de vêtements en SVG.
 * Aucune image externe : tout est dessiné à la volée.
 */

/* -------------------------------------------------------------------------- */
/* Formatage                                                                   */
/* -------------------------------------------------------------------------- */

const priceFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

export function formatPrice(value) {
  const n = Number(value);
  return priceFormatter.format(Number.isFinite(n) ? n : 0);
}

export function formatDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return dateFormatter.format(date);
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* -------------------------------------------------------------------------- */
/* Couleurs                                                                    */
/* -------------------------------------------------------------------------- */

function normaliseHex(hex) {
  const value = String(hex || '').replace('#', '').trim();
  if (value.length === 3) {
    return value
      .split('')
      .map((c) => c + c)
      .join('');
  }
  return value.length === 6 ? value : 'f0e8d8';
}

/** Éclaircit (amount > 0) ou assombrit (amount < 0) une couleur hexadécimale. */
export function shade(hex, amount) {
  const base = normaliseHex(hex);
  const num = parseInt(base, 16);
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  const r = clamp(((num >> 16) & 255) + amount);
  const g = clamp(((num >> 8) & 255) + amount);
  const b = clamp((num & 255) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function isLight(hex) {
  const base = normaliseHex(hex);
  const num = parseInt(base, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62;
}

/* -------------------------------------------------------------------------- */
/* Mockups de vêtements (SVG)                                                  */
/* -------------------------------------------------------------------------- */

let gradientCounter = 0;

const GARMENT_LABELS = {
  tshirt: 'T-shirt',
  sweat: 'Sweat',
  hoodie: 'Hoodie',
  cap: 'Casquette',
  tote: 'Tote bag',
  mug: 'Mug',
};

/**
 * Génère le SVG d'un vêtement.
 * @param {string} type - tshirt | sweat | hoodie | cap | tote | mug
 * @param {{ color?: string, label?: string, className?: string }} options
 */
export function svgGarment(type, options = {}) {
  const color = options.color || '#f0e8d8';
  const stroke = shade(color, isLight(color) ? -46 : 34);
  const label = options.label || GARMENT_LABELS[type] || 'Vêtement';
  const className = options.className || 'preview-garment';

  gradientCounter += 1;
  const gid = `ny-grad-${gradientCounter}`;
  const light = shade(color, 10);
  const dark = shade(color, -14);

  const defs = `
    <defs>
      <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${light}" />
        <stop offset="55%" stop-color="${color}" />
        <stop offset="100%" stop-color="${dark}" />
      </linearGradient>
    </defs>`;

  const open = `<svg class="${className}" viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeHtml(
    label
  )}" preserveAspectRatio="xMidYMid meet">${defs}`;
  const fill = `url(#${gid})`;
  const line = `fill="none" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round"`;
  const soft = `fill="none" stroke="${stroke}" stroke-width="1.1" opacity="0.45"`;

  if (type === 'cap') {
    return `${open}
      <path d="M44 122C44 64 156 64 156 122Z" fill="${fill}" stroke="${stroke}" stroke-width="1.6" stroke-linejoin="round" />
      <path d="M40 122C64 146 136 146 160 122C162 134 138 152 100 152C62 152 38 134 40 122Z" fill="${shade(color, -24)}" stroke="${stroke}" stroke-width="1.6" stroke-linejoin="round" />
      <path d="M100 70V122" ${soft} />
      <path d="M74 78C66 92 62 106 61 120" ${soft} />
      <path d="M126 78C134 92 138 106 139 120" ${soft} />
      <circle cx="100" cy="70" r="4.5" fill="${shade(color, -30)}" />
      <path d="M52 130C70 146 130 146 148 130" ${soft} />
    </svg>`;
  }

  if (type === 'tote') {
    return `${open}
      <path d="M76 84C76 46 124 46 124 84" fill="none" stroke="${shade(color, -30)}" stroke-width="5" stroke-linecap="round" />
      <path d="M54 82H146L139 192H61Z" fill="${fill}" stroke="${stroke}" stroke-width="1.6" stroke-linejoin="round" />
      <path d="M54 92H146" ${soft} stroke-dasharray="4 4" />
      <path d="M80 82C80 54 120 54 120 82" ${soft} />
    </svg>`;
  }

  if (type === 'mug') {
    return `${open}
      <path d="M128 98C160 98 160 152 128 152" fill="none" stroke="${shade(color, -26)}" stroke-width="10" stroke-linecap="round" />
      <path d="M56 78H128V162C128 170 122 176 114 176H70C62 176 56 170 56 162Z" fill="${fill}" stroke="${stroke}" stroke-width="1.6" stroke-linejoin="round" />
      <ellipse cx="92" cy="78" rx="36" ry="9" fill="${shade(color, 16)}" stroke="${stroke}" stroke-width="1.6" />
      <path d="M58 88H126" ${soft} />
    </svg>`;
  }

  const bodyPath =
    'M62 40L40 48L26 102L50 112L58 92V192Q58 200 66 200H134Q142 200 142 192V92L150 112L174 102L160 48L138 40C132 56 116 62 100 62C84 62 68 56 62 40Z';

  const collar = `<path d="M62 40C68 56 84 62 100 62C116 62 132 56 138 40" ${line} />`;

  if (type === 'sweat') {
    return `${open}
      <path d="M62 40L40 48L21 148L48 159L58 104V192Q58 200 66 200H134Q142 200 142 192V104L152 159L179 148L160 48L138 40C132 56 116 62 100 62C84 62 68 56 62 40Z" fill="${fill}" stroke="${stroke}" stroke-width="1.6" stroke-linejoin="round" />
      ${collar}
      <path d="M23 149L47 160" fill="none" stroke="${shade(color, -22)}" stroke-width="9" stroke-linecap="round" />
      <path d="M153 160L177 149" fill="none" stroke="${shade(color, -22)}" stroke-width="9" stroke-linecap="round" />
      <rect x="58" y="186" width="84" height="13" fill="${shade(color, -16)}" />
      <path d="M58 186H142" ${soft} />
    </svg>`;
  }

  if (type === 'hoodie') {
    return `${open}
      <path d="M68 60C63 24 137 24 132 60L120 68H80Z" fill="${shade(color, -18)}" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round" />
      <path d="${bodyPath}" fill="${fill}" stroke="${stroke}" stroke-width="1.6" stroke-linejoin="round" />
      ${collar}
      <path d="M23 149L47 160" fill="none" stroke="${shade(color, -22)}" stroke-width="9" stroke-linecap="round" />
      <path d="M153 160L177 149" fill="none" stroke="${shade(color, -22)}" stroke-width="9" stroke-linecap="round" />
      <rect x="58" y="186" width="84" height="13" fill="${shade(color, -16)}" />
      <path d="M76 148H124L120 184H80Z" fill="none" stroke="${stroke}" stroke-width="1.4" stroke-linejoin="round" />
      <path d="M88 68V106" stroke="${shade(color, -34)}" stroke-width="3" stroke-linecap="round" />
      <path d="M112 68V106" stroke="${shade(color, -34)}" stroke-width="3" stroke-linecap="round" />
      <circle cx="88" cy="108" r="3.2" fill="${shade(color, -40)}" />
      <circle cx="112" cy="108" r="3.2" fill="${shade(color, -40)}" />
    </svg>`;
  }

  return `${open}
    <path d="${bodyPath}" fill="${fill}" stroke="${stroke}" stroke-width="1.6" stroke-linejoin="round" />
    ${collar}
    <path d="M58 186H142" ${soft} />
  </svg>`;
}

/* -------------------------------------------------------------------------- */
/* Icônes                                                                      */
/* -------------------------------------------------------------------------- */

const ICONS = {
  leaf: '<path d="M4 20c0-8 5-14 16-15 0 11-6 16-13 16" /><path d="M4 20c3-5 7-8 11-9" />',
  scissors:
    '<circle cx="6" cy="6" r="2.6" /><circle cx="6" cy="18" r="2.6" /><path d="M8.2 7.6 20 18" /><path d="M8.2 16.4 20 6" />',
  sparkles:
    '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8Z" /><path d="M18 15l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9Z" />',
  shield: '<path d="M12 3l7 3v6c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6Z" /><path d="M9 12l2 2 4-4" />',
  check: '<path d="M4.5 12.5l5 5 10-11" />',
  lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2.4" /><path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5" />',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="2.4" /><path d="M3.8 7l8.2 6 8.2-6" />',
  phone:
    '<path d="M6.5 3.5h3l1.4 3.6-2 1.4a11 11 0 0 0 5.6 5.6l1.4-2 3.6 1.4v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z" />',
  pin: '<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" /><circle cx="12" cy="10" r="2.6" />',
  clock: '<circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" />',
  search: '<circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" />',
  card: '<rect x="3" y="5.5" width="18" height="13" rx="2.4" /><path d="M3 10h18" /><path d="M6.5 14.5h3" />',
  bank: '<path d="M3.5 9.5 12 4.5l8.5 5" /><path d="M5.5 10v8M10 10v8M14 10v8M18.5 10v8" /><path d="M3.5 20.5h17" />',
  shop: '<path d="M4 9.5V19a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9.5" /><path d="M3 9.5 5 4.5h14l2 5a3 3 0 0 1-5.6 1.4A3 3 0 0 1 12 12a3 3 0 0 1-3.4-1.1A3 3 0 0 1 3 9.5Z" />',
  box: '<path d="M12 3l8 4v10l-8 4-8-4V7Z" /><path d="M4 7l8 4 8-4" /><path d="M12 11v10" />',
  arrow: '<path d="M4 12h15" /><path d="M13 6l6 6-6 6" />',
  user: '<circle cx="12" cy="8.5" r="3.6" /><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />',
  heart: '<path d="M12 20s-7-4.3-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.7-7 9-7 9Z" />',
};

export function icon(name, className = '') {
  const path = ICONS[name];
  if (!path) return '';
  const cls = className ? ` class="${className}"` : '';
  return `<svg${cls} viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}

/* -------------------------------------------------------------------------- */
/* Toasts                                                                      */
/* -------------------------------------------------------------------------- */

export function toast(message, type = 'info') {
  const stack = document.getElementById('toastStack');
  if (!stack) return;

  const node = document.createElement('div');
  node.className = `toast ${type}`;
  const mark = type === 'success' ? '✓' : type === 'error' ? '!' : '•';
  node.innerHTML = `<span class="t-mark" aria-hidden="true">${mark}</span><span>${escapeHtml(message)}</span>`;
  stack.appendChild(node);

  const remove = () => {
    node.classList.add('out');
    window.setTimeout(() => node.remove(), 320);
  };

  window.setTimeout(remove, 3800);
  node.addEventListener('click', remove);
}

/* -------------------------------------------------------------------------- */
/* Étoiles                                                                     */
/* -------------------------------------------------------------------------- */

export function starsHtml(rating) {
  const rounded = Math.round(Number(rating) * 2) / 2;
  let out = '';
  for (let i = 1; i <= 5; i += 1) {
    out += i <= rounded ? '★' : '☆';
  }
  return `<span class="stars" aria-hidden="true">${out}</span>`;
}

/* -------------------------------------------------------------------------- */
/* Divers                                                                      */
/* -------------------------------------------------------------------------- */

export function debounce(fn, delay = 200) {
  let timer = 0;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
}
