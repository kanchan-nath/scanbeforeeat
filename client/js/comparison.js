import { renderProductThumbnail } from './icons.js';

/**
 * Product Comparison View Renderer
 * Compares 2-3 products side-by-side with nutrition, scores, and ingredient contrasts.
 */

export function renderComparison(comparisonData, containerEl, onBack) {
  const items = comparisonData.items || [];

  const html = `
    <div class="comparison-view-wrapper">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;">
        <button type="button" class="btn btn-outline btn-sm" id="comparison-back-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
          Back
        </button>
        <span class="badge badge-info">${items.length} Products Compared</span>
      </div>

      <h1 style="font-size: 1.4rem; margin-bottom: 0.35rem;">Product Comparison</h1>
      <p style="font-size: 0.85rem; color: var(--color-ink-muted); margin-bottom: 1.25rem;">
        Side-by-side educational profile across scanned packaged items.
      </p>

      <!-- Side-by-side cards carousel/grid -->
      <div style="display: grid; grid-template-columns: repeat(${items.length}, 1fr); gap: 0.75rem; margin-bottom: 1.5rem; overflow-x: auto;">
        ${items.map(item => `
          <div class="card" style="padding: 1rem; text-align: center;">
            <div style="margin: 0 auto 0.5rem; display: flex; justify-content: center;">
              ${renderProductThumbnail(item.imageUrl, 52, item.name, '10px', item.brand || item.category)}
            </div>
            <h4 style="font-size: 0.875rem; margin-bottom: 0.2rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(item.name)}">
              ${escapeHtml(item.name)}
            </h4>
            <p style="font-size: 0.75rem; color: var(--color-ink-muted); margin-bottom: 0.5rem;">${escapeHtml(item.brand || 'Unbranded')}</p>
            <div style="font-size: 1.25rem; font-weight: 800; color: var(--color-primary-active);">${item.score !== null ? `${item.score}/100` : '—'}</div>
            <span class="badge badge-safe" style="font-size: 0.625rem; margin-top: 0.25rem;">${escapeHtml(item.verdict)}</span>
          </div>
        `).join('')}
      </div>

      <!-- Comparative Specifications Table -->
      <div class="card" style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 1rem; margin-bottom: 0.75rem;">Nutritional & Ingredient Metrics</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem;">
          <thead>
            <tr style="border-bottom: 2px solid var(--color-border); text-align: left;">
              <th style="padding: 0.5rem 0.25rem;">Metric</th>
              ${items.map(it => `<th style="padding: 0.5rem 0.25rem; text-align: right;">${escapeHtml(it.name.split(' ')[0])}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid var(--color-surface-dim);">
              <td style="padding: 0.5rem 0.25rem; font-weight: 600;">Ingredients Count</td>
              ${items.map(it => `<td style="padding: 0.5rem 0.25rem; text-align: right;">${it.ingredientCount}</td>`).join('')}
            </tr>
            <tr style="border-bottom: 1px solid var(--color-surface-dim);">
              <td style="padding: 0.5rem 0.25rem; font-weight: 600;">Allergens Noted</td>
              ${items.map(it => `<td style="padding: 0.5rem 0.25rem; text-align: right;">${it.allergens.length}</td>`).join('')}
            </tr>
            <tr style="border-bottom: 1px solid var(--color-surface-dim);">
              <td style="padding: 0.5rem 0.25rem; font-weight: 600;">Energy (kcal)</td>
              ${items.map(it => `<td style="padding: 0.5rem 0.25rem; text-align: right;">${it.nutrition?.energyKcal || '—'}</td>`).join('')}
            </tr>
            <tr style="border-bottom: 1px solid var(--color-surface-dim);">
              <td style="padding: 0.5rem 0.25rem; font-weight: 600;">Sugars (g)</td>
              ${items.map(it => `<td style="padding: 0.5rem 0.25rem; text-align: right;">${it.nutrition?.sugarG || '—'}</td>`).join('')}
            </tr>
            <tr style="border-bottom: 1px solid var(--color-surface-dim);">
              <td style="padding: 0.5rem 0.25rem; font-weight: 600;">Sodium (mg)</td>
              ${items.map(it => `<td style="padding: 0.5rem 0.25rem; text-align: right;">${it.nutrition?.sodiumMg || '—'}</td>`).join('')}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  containerEl.innerHTML = html;

  const backBtn = containerEl.querySelector('#comparison-back-btn');
  if (backBtn && onBack) {
    backBtn.addEventListener('click', onBack);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default renderComparison;
