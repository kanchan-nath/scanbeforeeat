/**
 * Report Screen Renderer
 * Renders structured scientific analysis, educational score gauge, accordion ingredient cards,
 * long-term timeline, disease evidence, and citations.
 */

import { renderProductThumbnail } from './icons.js';

export function renderReport(reportData, containerEl, onAction = {}) {
  const r = reportData.report_json || reportData;
  const product = r.product || {};
  const score = r.overallAssessment?.score;
  const verdict = r.overallAssessment?.verdict || 'Review specific ingredients';
  const explanation = r.overallAssessment?.explanation || [];
  const allergens = r.allergenWarnings || [];
  const ingredients = r.ingredients || [];
  const nutrition = r.nutritionSummary || {};
  const longTerm = r.longTermEvidence || [];
  const diseaseRisk = r.diseaseRiskEvidence || [];
  const sources = r.sources || [];
  const disclaimer = r.disclaimer || 'Educational information only; not a medical diagnosis.';

  // Determine verdict badge class
  let verdictBadgeClass = 'badge-info';
  if (verdict.includes('reasonable')) verdictBadgeClass = 'badge-safe';
  else if (verdict.includes('moderation')) verdictBadgeClass = 'badge-caution';
  else if (verdict.includes('caution') || verdict.includes('dietary')) verdictBadgeClass = 'badge-warning';

  const html = `
    <div class="report-view-wrapper">
      <!-- Back / Nav Action Bar -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
        <button type="button" class="btn btn-outline btn-sm" id="report-back-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
          Back
        </button>
        <div style="display: flex; gap: 0.5rem;">
          <button type="button" class="btn btn-secondary btn-sm" id="report-compare-btn" title="Compare with another scan">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>
            Compare
          </button>
          <button type="button" class="btn btn-danger btn-sm" id="report-delete-btn" title="Delete scan">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>
      </div>

      <!-- Product Header -->
      <div class="card" style="margin-bottom: 1rem;">
        <div style="display: flex; gap: 1rem; align-items: center;">
          ${renderProductThumbnail(reportData.product_image_url, 72, product.name || reportData.product_name, '12px', product.category || reportData.product_category || product.brand || reportData.product_brand)}
          <div>
            <span class="badge badge-info" style="margin-bottom: 0.35rem; font-size: 0.7rem;">
              ${escapeHtml(product.category || reportData.product_category || 'Packaged Food')}
            </span>
            <h1 style="font-size: 1.25rem; margin-bottom: 0.25rem;">
              ${escapeHtml(product.name || reportData.product_name || 'Analyzed Product')}
            </h1>
            <p style="font-size: 0.85rem; color: var(--color-ink-muted);">
              ${product.brand || reportData.product_brand ? `Brand: <strong>${escapeHtml(product.brand || reportData.product_brand)}</strong> • ` : ''}
              ${reportData.created_at ? new Date(reportData.created_at).toLocaleDateString() : 'Recent scan'}
            </p>
          </div>
        </div>
      </div>

      <!-- Overall Assessment & Educational Score Card -->
      <div class="score-gauge-card" style="margin-bottom: 1.25rem;">
        <div class="score-circle" style="--score-val: ${score !== null ? score : 50};">
          <div class="score-circle-inner">
            <span class="score-number">${score !== null ? score : '—'}</span>
            <span class="score-label">${score !== null ? '/ 100' : 'Score'}</span>
          </div>
        </div>
        <div style="flex: 1;">
          <span class="badge ${verdictBadgeClass}" style="margin-bottom: 0.4rem;">
            ${escapeHtml(verdict)}
          </span>
          <p style="font-size: 0.85rem; color: #D2D7D4; line-height: 1.4;">
            ${explanation[0] ? escapeHtml(explanation[0]) : 'Educational product profile evaluated across verified ingredients.'}
          </p>
        </div>
      </div>

      <!-- Allergen Notices if present -->
      ${allergens.length > 0 ? `
        <div class="card" style="background: var(--color-warning-bg); border-color: #F8D3CE; margin-bottom: 1.25rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <h3 style="color: var(--color-warning); font-size: 0.95rem;">Allergen Statements</h3>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
            ${allergens.map(a => `<span class="badge badge-warning">${escapeHtml(a)}</span>`).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Ingredient-by-Ingredient Breakdown Accordion -->
      <div style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <h2>Ingredients Analysis (${ingredients.length})</h2>
          <span style="font-size: 0.8rem; color: var(--color-ink-muted);">Tap to inspect details</span>
        </div>

        <div class="ingredients-accordion">
          ${ingredients.map((ing, idx) => {
            const ingRatingClass = ing.rating === 'generally_recognized_as_safe' ? 'badge-safe'
              : ing.rating === 'potential_allergen' ? 'badge-warning'
              : ing.rating === 'requires_caution' ? 'badge-warning'
              : ing.rating === 'context_dependent' ? 'badge-caution'
              : 'badge-info';

            const ratingReadable = (ing.rating || 'Standard')
              .replace(/_/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase());

            return `
              <div class="ingredient-card ${idx === 0 ? 'open' : ''}" data-idx="${idx}">
                <div class="ingredient-header">
                  <div class="ingredient-title-group">
                    <span class="ingredient-name">
                      ${escapeHtml(ing.normalizedName || ing.originalText)}
                      ${ing.insNumber ? `<span style="font-size: 0.8rem; font-weight: normal; color: var(--color-ink-muted);">(${escapeHtml(ing.insNumber)})</span>` : ''}
                    </span>
                    <span class="ingredient-category-tag">
                      ${escapeHtml(ing.category ? ing.category.replace(/_/g, ' ') : 'Food Constituent')}
                    </span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 0.6rem;">
                    <span class="badge ${ingRatingClass}" style="font-size: 0.675rem;">
                      ${escapeHtml(ratingReadable)}
                    </span>
                    <svg class="ingredient-chevron" viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
                <div class="ingredient-body">
                  <div class="ingredient-detail-section">
                    <div class="ingredient-detail-label">Why is it used? (Technological Function)</div>
                    <p>${escapeHtml(ing.function || 'Constituent manufacturing ingredient.')}</p>
                  </div>

                  ${ing.benefits && ing.benefits.length > 0 ? `
                    <div class="ingredient-detail-section">
                      <div class="ingredient-detail-label">Potential Benefits</div>
                      ${ing.benefits.map(b => `
                        <p style="margin-bottom: 0.35rem;">
                          • ${escapeHtml(b.description)}
                          <span class="badge badge-safe" style="font-size: 0.65rem; margin-left: 0.25rem;">Evidence: ${escapeHtml(b.evidenceQuality)}</span>
                        </p>
                      `).join('')}
                    </div>
                  ` : ''}

                  ${ing.concerns && ing.concerns.length > 0 ? `
                    <div class="ingredient-detail-section">
                      <div class="ingredient-detail-label">Potential Considerations & Risks</div>
                      ${ing.concerns.map(c => `
                        <p style="margin-bottom: 0.35rem; color: #4E5751;">
                          ⚠️ <strong>${escapeHtml(c.targetPopulation || 'General')}:</strong> ${escapeHtml(c.description)}
                          <span style="display: block; font-size: 0.775rem; color: var(--color-ink-muted);">Risk Dependency: ${escapeHtml(c.riskDependency || 'Dose-dependent')}</span>
                        </p>
                      `).join('')}
                    </div>
                  ` : ''}

                  ${ing.otherUses && ing.otherUses.length > 0 ? `
                    <div class="ingredient-detail-section">
                      <div class="ingredient-detail-label">Other Applications Outside This Food</div>
                      ${ing.otherUses.map(u => `
                        <p style="font-size: 0.8rem; margin-bottom: 0.25rem;">
                          🏭 <strong>${escapeHtml(u.category ? u.category.replace(/_/g, ' ') : 'Industry')}:</strong> ${escapeHtml(u.exampleUse)} — <em>${escapeHtml(u.notes)}</em>
                        </p>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Declared Nutrition Facts Section if available -->
      ${nutrition.dataAvailable && nutrition.observedValues && nutrition.observedValues.length > 0 ? `
        <div class="card" style="margin-bottom: 1.5rem;">
          <h3 style="margin-bottom: 0.75rem;">Nutritional Context</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
            <thead>
              <tr style="border-bottom: 1px solid var(--color-border); text-align: left;">
                <th style="padding: 0.5rem 0; color: var(--color-ink-muted); font-size: 0.775rem; text-transform: uppercase;">Nutrient</th>
                <th style="padding: 0.5rem 0; text-align: right; color: var(--color-ink-muted); font-size: 0.775rem; text-transform: uppercase;">Declared Value</th>
              </tr>
            </thead>
            <tbody>
              ${nutrition.observedValues.map(n => `
                <tr style="border-bottom: 1px solid var(--color-surface-dim);">
                  <td style="padding: 0.5rem 0; font-weight: 600;">${escapeHtml(n.nutrient)}</td>
                  <td style="padding: 0.5rem 0; text-align: right; font-weight: 700;">${escapeHtml(n.value)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      <!-- Long-Term Consumption Considerations -->
      <div class="card" style="margin-bottom: 1.5rem;">
        <h3 style="margin-bottom: 0.75rem;">Repeated Consumption Timeline</h3>
        <p style="font-size: 0.825rem; color: var(--color-ink-muted); margin-bottom: 1rem;">
          Scientific synthesis of how chronic dietary patterns interact with overall metabolism:
        </p>
        <div style="display: flex; flex-direction: column; gap: 0.85rem;">
          ${longTerm.map(lt => {
            const stageLabel = (lt.stage || 'Consumption Pattern')
              .replace(/_/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase());
            return `
              <div style="border-left: 3px solid var(--color-primary-active); padding-left: 0.75rem;">
                <div style="font-weight: 700; font-size: 0.85rem; color: var(--color-ink);">
                  ${escapeHtml(stageLabel)}
                  <span class="badge badge-safe" style="font-size: 0.65rem; margin-left: 0.35rem;">Evidence: ${escapeHtml(lt.evidenceQuality)}</span>
                </div>
                <p style="font-size: 0.825rem; margin-top: 0.2rem;">${escapeHtml(lt.evidenceSummary)}</p>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Disease Associations & No Fabricated Probabilities Notice -->
      <div class="card" style="margin-bottom: 1.5rem;">
        <h3 style="margin-bottom: 0.75rem;">Disease-Related Research Context</h3>
        ${diseaseRisk.map(dr => `
          <div style="margin-bottom: 0.85rem;">
            <div style="font-weight: 700; font-size: 0.9rem; color: var(--color-ink);">${escapeHtml(dr.condition)}</div>
            <p style="font-size: 0.85rem; margin: 0.25rem 0;">${escapeHtml(dr.summary)}</p>
            <p style="font-size: 0.775rem; color: var(--color-ink-muted); font-style: italic;">
              ${escapeHtml(dr.distinctionNote)}
            </p>
            <div style="background: var(--color-surface-dim); padding: 0.4rem 0.65rem; border-radius: 8px; font-size: 0.775rem; margin-top: 0.35rem; color: var(--color-ink-secondary);">
              📊 <strong>Probability Notice:</strong> ${escapeHtml(dr.probabilityExplanation || 'No reliable percentage is available for this specific ingredient and consumption pattern.')}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Citations & Limitations -->
      <div class="card" style="background: var(--color-surface-dim); border: none; margin-bottom: 1.5rem;">
        <h4 style="font-size: 0.875rem; margin-bottom: 0.5rem; text-transform: uppercase; color: var(--color-ink-muted);">Authoritative Sources & Regulations</h4>
        <ul style="padding-left: 1.25rem; font-size: 0.8rem; color: var(--color-ink-secondary); margin-bottom: 0.85rem;">
          ${sources.map(s => `
            <li style="margin-bottom: 0.25rem;">
              <strong>${escapeHtml(s.organization)}</strong>: ${escapeHtml(s.title)} (${escapeHtml(s.year || 'Current')})
              ${s.url ? `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer" style="color: var(--color-info); text-decoration: underline; margin-left: 0.25rem;">[Link]</a>` : ''}
            </li>
          `).join('')}
        </ul>
        <p style="font-size: 0.75rem; color: var(--color-ink-muted); line-height: 1.4;">
          <strong>Disclaimer:</strong> ${escapeHtml(disclaimer)}
        </p>
      </div>
    </div>
  `;

  containerEl.innerHTML = html;

  // Bind accordion click handlers
  containerEl.querySelectorAll('.ingredient-header').forEach(header => {
    header.addEventListener('click', () => {
      const parent = header.closest('.ingredient-card');
      parent.classList.toggle('open');
    });
  });

  // Bind action buttons
  const backBtn = containerEl.querySelector('#report-back-btn');
  if (backBtn && onAction.onBack) {
    backBtn.addEventListener('click', onAction.onBack);
  }

  const compareBtn = containerEl.querySelector('#report-compare-btn');
  if (compareBtn && onAction.onCompare) {
    compareBtn.addEventListener('click', () => onAction.onCompare(reportData.scan_id || reportData.id));
  }

  const deleteBtn = containerEl.querySelector('#report-delete-btn');
  if (deleteBtn && onAction.onDelete) {
    deleteBtn.addEventListener('click', () => onAction.onDelete(reportData.scan_id || reportData.id));
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

export default renderReport;
