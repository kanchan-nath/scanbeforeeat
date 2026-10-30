/**
 * Clean SVG Vector Icons and Product Thumbnail Component
 * Replaces missing/broken images and raw emojis with sleek, accessible vector icons.
 */

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const icons = {
  /**
   * Packaged Food / Item Vector Icon
   */
  foodPackage(size = 24, strokeColor = 'currentColor', strokeWidth = 2) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 12v10"/></svg>`;
  },

  /**
   * Brand Leaf / Nutrition Logo Vector Icon
   */
  leaf(size = 24, strokeColor = 'currentColor', strokeWidth = 2.2) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.5 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`;
  },

  /**
   * Barcode Scanner Vector Icon
   */
  barcode(size = 24, strokeColor = 'currentColor', strokeWidth = 2) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 5v14"/><path d="M8 5v14"/><path d="M12 5v14"/><path d="M17 5v14"/><path d="M21 5v14"/></svg>`;
  },

  /**
   * Camera Scanner Vector Icon
   */
  camera(size = 24, strokeColor = 'currentColor', strokeWidth = 2) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`;
  },

  /**
   * Image / Gallery Upload Vector Icon
   */
  upload(size = 24, strokeColor = 'currentColor', strokeWidth = 2) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`;
  },

  /**
   * Manual / Pencil Edit Vector Icon
   */
  pencil(size = 24, strokeColor = 'currentColor', strokeWidth = 2) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`;
  },

  /**
   * Brain / Evidence Science Vector Icon
   */
  brain(size = 24, strokeColor = 'currentColor', strokeWidth = 2) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M12 5v14"/></svg>`;
  },

  /**
   * Lightbulb / Tip Vector Icon
   */
  lightbulb(size = 24, strokeColor = 'currentColor', strokeWidth = 2) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`;
  },

  /**
   * Privacy / Shield Lock Vector Icon
   */
  lock(size = 24, strokeColor = 'currentColor', strokeWidth = 2) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
  },

  /**
   * Download / Export Vector Icon
   */
  download(size = 24, strokeColor = 'currentColor', strokeWidth = 2) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
  },

  /**
   * Search / Inspection Vector Icon
   */
  search(size = 24, strokeColor = 'currentColor', strokeWidth = 2) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`;
  },

  /**
   * Refresh / Switch Camera Vector Icon
   */
  refresh(size = 24, strokeColor = 'currentColor', strokeWidth = 2) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>`;
  },

  /**
   * Cookie / Biscuit / Bakery Vector Icon
   */
  cookie(size = 24, strokeColor = 'currentColor', strokeWidth = 2) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><circle cx="8.5" cy="8.5" r="1.2" fill="${strokeColor}"/><circle cx="7" cy="14" r="1.2" fill="${strokeColor}"/><circle cx="12" cy="16" r="1.2" fill="${strokeColor}"/><circle cx="15.5" cy="12.5" r="1.2" fill="${strokeColor}"/></svg>`;
  },

  /**
   * Drink / Beverage Vector Icon
   */
  drink(size = 24, strokeColor = 'currentColor', strokeWidth = 2) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>`;
  }
};

/**
 * Determine the most suitable vector icon based on product name and category
 */
export function getProductVectorIcon(name = '', category = '', size = 20) {
  const query = `${name || ''} ${category || ''}`.toLowerCase();
  if (
    query.includes('biscuit') ||
    query.includes('cookie') ||
    query.includes('wafer') ||
    query.includes('parle') ||
    query.includes('bakery') ||
    query.includes('bread') ||
    query.includes('cake') ||
    query.includes('toast') ||
    query.includes('oreo')
  ) {
    return icons.cookie(size);
  }
  if (
    query.includes('drink') ||
    query.includes('beverage') ||
    query.includes('juice') ||
    query.includes('tea') ||
    query.includes('coffee') ||
    query.includes('soda') ||
    query.includes('water') ||
    query.includes('milk') ||
    query.includes('cola')
  ) {
    return icons.drink(size);
  }
  if (
    query.includes('salad') ||
    query.includes('fresh') ||
    query.includes('green') ||
    query.includes('leaf') ||
    query.includes('organic')
  ) {
    return icons.leaf(size);
  }
  return icons.foodPackage(size);
}

/**
 * Render a reliable Product Thumbnail using sleek vector icons instead of broken images.
 */
export function renderProductThumbnail(imageUrl, size = 48, alt = 'Product', borderRadius = '8px', category = '') {
  const iconSize = Math.max(18, Math.round(size * 0.48));
  const vectorSvg = getProductVectorIcon(alt, category, iconSize);

  return `
    <div class="product-thumb-box" style="width: ${size}px; height: ${size}px; border-radius: ${borderRadius}; background: var(--color-surface-dim); border: 1px solid var(--color-border); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--color-primary-active);" aria-label="${escapeHtml(alt || 'Product')}">
      ${vectorSvg}
    </div>
  `;
}
