import { api } from './api.js';
import { icons, renderProductThumbnail } from './icons.js';

/**
 * Scan History Manager & View
 */
export class HistoryView {
  constructor(containerEl, onNavigate) {
    this.containerEl = containerEl;
    this.onNavigate = onNavigate;
    this.currentPage = 1;
    this.currentSearch = '';
    this.currentMethod = '';
    this.currentVerdict = '';
    this.selectedScanIds = new Set();
  }

  async load() {
    this.renderContainer();
    await this.fetchAndRenderList();
  }

  renderContainer() {
    this.containerEl.innerHTML = `
      <div class="history-page-wrapper">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
          <h1 style="font-size: 1.4rem;">Scan History</h1>
          <div style="display: flex; gap: 0.5rem;">
            <button type="button" class="btn btn-outline btn-sm" id="history-export-btn" title="Export my scan history">
              Export
            </button>
            <button type="button" class="btn btn-danger btn-sm" id="history-clear-all-btn" title="Clear all scans">
              Clear All
            </button>
          </div>
        </div>

        <!-- Search & Filter Controls -->
        <div class="card" style="padding: 0.85rem; margin-bottom: 1rem;">
          <div style="position: relative; margin-bottom: 0.65rem;">
            <input type="text" id="history-search-input" class="input-text" placeholder="Search product or brand..." style="padding-left: 2.2rem; font-size: 0.875rem;" value="${escapeHtml(this.currentSearch)}" />
            <svg style="position: absolute; left: 10px; top: 11px; width: 16px; height: 16px; stroke: var(--color-ink-muted);" viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>

          <div style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.25rem;">
            <select id="history-filter-method" class="input-text" style="font-size: 0.8rem; padding: 0.4rem 0.6rem; min-height: 36px; width: auto;">
              <option value="">All Methods</option>
              <option value="camera" ${this.currentMethod === 'camera' ? 'selected' : ''}>Camera</option>
              <option value="upload" ${this.currentMethod === 'upload' ? 'selected' : ''}>Upload</option>
              <option value="barcode" ${this.currentMethod === 'barcode' ? 'selected' : ''}>Barcode</option>
              <option value="manual" ${this.currentMethod === 'manual' ? 'selected' : ''}>Manual</option>
            </select>

            <select id="history-filter-verdict" class="input-text" style="font-size: 0.8rem; padding: 0.4rem 0.6rem; min-height: 36px; width: auto;">
              <option value="">All Verdicts</option>
              <option value="Generally reasonable in context" ${this.currentVerdict.includes('reasonable') ? 'selected' : ''}>Reasonable</option>
              <option value="Consider moderation" ${this.currentVerdict.includes('moderation') ? 'selected' : ''}>Moderation</option>
              <option value="Review specific ingredients or dietary needs" ${this.currentVerdict.includes('Review') ? 'selected' : ''}>Review</option>
            </select>
          </div>
        </div>

        <!-- Floating Comparison Toolbar (appears when 2+ items selected) -->
        <div id="comparison-toolbar" style="display: none; position: sticky; top: var(--header-height); z-index: 90; background: var(--color-card-dark); color: #fff; border-radius: var(--radius-md); padding: 0.75rem 1rem; margin-bottom: 1rem; align-items: center; justify-content: space-between; box-shadow: var(--shadow-lg);">
          <span id="comparison-count" style="font-size: 0.85rem; font-weight: 600;">2 selected</span>
          <button type="button" class="btn btn-primary btn-sm" id="trigger-compare-btn">Compare Now</button>
        </div>

        <!-- Results List -->
        <div id="history-items-container">
          <div style="text-align: center; padding: 2rem; color: var(--color-ink-muted);">Loading scans...</div>
        </div>

        <!-- Pagination -->
        <div id="history-pagination" style="display: flex; justify-content: center; gap: 0.5rem; margin-top: 1.25rem;"></div>
      </div>
    `;

    // Bind Search Input debounce
    const searchInput = this.containerEl.querySelector('#history-search-input');
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        this.currentSearch = e.target.value.trim();
        this.currentPage = 1;
        this.fetchAndRenderList();
      }, 300);
    });

    // Bind Filter Selects
    this.containerEl.querySelector('#history-filter-method').addEventListener('change', (e) => {
      this.currentMethod = e.target.value;
      this.currentPage = 1;
      this.fetchAndRenderList();
    });

    this.containerEl.querySelector('#history-filter-verdict').addEventListener('change', (e) => {
      this.currentVerdict = e.target.value;
      this.currentPage = 1;
      this.fetchAndRenderList();
    });

    // Clear All
    this.containerEl.querySelector('#history-clear-all-btn').addEventListener('click', async () => {
      if (confirm('Are you sure you want to delete all saved scan history? This action cannot be undone.')) {
        try {
          await api.scans.clearAll();
          this.fetchAndRenderList();
        } catch (err) {
          alert(`Failed to clear history: ${err.message}`);
        }
      }
    });

    // Export
    this.containerEl.querySelector('#history-export-btn').addEventListener('click', () => {
      window.location.href = '/api/v1/auth/export';
    });

    // Compare Toolbar Button
    this.containerEl.querySelector('#trigger-compare-btn').addEventListener('click', async () => {
      const ids = Array.from(this.selectedScanIds);
      if (ids.length < 2) return;
      try {
        const compRes = await api.scans.compare(ids);
        if (compRes.success && compRes.comparison) {
          this.onNavigate('comparison', { comparison: compRes.comparison });
        }
      } catch (err) {
        alert(err.message);
      }
    });
  }

  async fetchAndRenderList() {
    const itemsContainer = this.containerEl.querySelector('#history-items-container');
    const paginationContainer = this.containerEl.querySelector('#history-pagination');

    try {
      const res = await api.scans.list({
        search: this.currentSearch,
        scanMethod: this.currentMethod,
        verdict: this.currentVerdict,
        page: this.currentPage,
        limit: 10
      });

      const scans = res.scans || [];
      const pagination = res.pagination || { total: 0, totalPages: 1 };

      if (scans.length === 0) {
        itemsContainer.innerHTML = `
          <div class="card" style="text-align: center; padding: 2.5rem 1rem;">
            <div style="display: flex; justify-content: center; margin-bottom: 0.75rem; color: var(--color-ink-muted);">
              ${icons.search(40)}
            </div>
            <h3 style="margin-bottom: 0.25rem;">No scans found</h3>
            <p style="font-size: 0.85rem; color: var(--color-ink-muted); margin-bottom: 1rem;">
              ${this.currentSearch || this.currentMethod || this.currentVerdict ? 'No products match your current filters.' : 'You have not scanned any products yet.'}
            </p>
            <button type="button" class="btn btn-primary btn-sm" id="empty-scan-btn">Start First Scan</button>
          </div>
        `;
        const emptyBtn = itemsContainer.querySelector('#empty-scan-btn');
        if (emptyBtn) emptyBtn.addEventListener('click', () => this.onNavigate('scan-hub'));
        paginationContainer.innerHTML = '';
        return;
      }

      itemsContainer.innerHTML = scans.map(s => {
        const isSelected = this.selectedScanIds.has(s.id);
        const verdictBadgeClass = s.overall_verdict?.includes('reasonable') ? 'badge-safe'
          : s.overall_verdict?.includes('moderation') ? 'badge-caution'
          : 'badge-warning';

        return `
          <div class="card" style="padding: 0.9rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.75rem;" data-scan-id="${s.id}">
            <!-- Selection Checkbox for comparison -->
            <input type="checkbox" class="scan-select-checkbox" data-id="${s.id}" ${isSelected ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--color-primary-active); flex-shrink: 0;" />

            <!-- Product Thumbnail (Vector Icon) -->
            ${renderProductThumbnail(s.product_image_url, 48, s.product_name || 'Scanned Product', '8px', s.product_category || s.product_brand)}

            <!-- Info -->
            <div style="flex: 1; min-width: 0;">
              <h4 style="font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 0.15rem;">
                ${escapeHtml(s.product_name || 'Scanned Ingredients')}
              </h4>
              <p style="font-size: 0.75rem; color: var(--color-ink-muted); margin-bottom: 0.35rem;">
                ${escapeHtml(s.product_brand || 'Packaged Product')} • ${s.created_at ? new Date(s.created_at).toLocaleDateString() : ''}
              </p>
              <div style="display: flex; gap: 0.35rem; align-items: center;">
                <span class="badge ${verdictBadgeClass}" style="font-size: 0.625rem;">
                  ${escapeHtml(s.overall_verdict || 'Processed')}
                </span>
                ${s.overall_score !== null ? `
                  <span style="font-size: 0.75rem; font-weight: 700; color: var(--color-ink);">
                    ${s.overall_score}/100
                  </span>
                ` : ''}
              </div>
            </div>

            <!-- Actions -->
            <div style="display: flex; flex-direction: column; gap: 0.35rem; align-items: flex-end;">
              <button type="button" class="btn btn-outline btn-sm view-report-btn" data-id="${s.id}" style="padding: 0.3rem 0.6rem; font-size: 0.775rem;">
                View
              </button>
              <button type="button" class="btn btn-ghost btn-sm delete-scan-btn" data-id="${s.id}" title="Delete" style="color: var(--color-warning); padding: 0.2rem;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        `;
      }).join('');

      // Bind item click events
      itemsContainer.querySelectorAll('.view-report-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          this.onNavigate('report', { scanId: id });
        });
      });

      itemsContainer.querySelectorAll('.delete-scan-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          if (confirm('Delete this scan record?')) {
            await api.scans.delete(id);
            this.selectedScanIds.delete(Number(id));
            this.fetchAndRenderList();
          }
        });
      });

      // Bind Checkboxes for Comparison
      itemsContainer.querySelectorAll('.scan-select-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
          const id = Number(e.target.getAttribute('data-id'));
          if (e.target.checked) {
            if (this.selectedScanIds.size >= 3) {
              alert('You can compare a maximum of 3 products at a time.');
              e.target.checked = false;
              return;
            }
            this.selectedScanIds.add(id);
          } else {
            this.selectedScanIds.delete(id);
          }
          this.updateComparisonToolbar();
        });
      });

      // Pagination Controls
      if (pagination.totalPages > 1) {
        let pagHtml = '';
        for (let p = 1; p <= pagination.totalPages; p++) {
          pagHtml += `
            <button type="button" class="btn ${p === this.currentPage ? 'btn-primary' : 'btn-outline'} btn-sm pagination-btn" data-page="${p}">
              ${p}
            </button>
          `;
        }
        paginationContainer.innerHTML = pagHtml;

        paginationContainer.querySelectorAll('.pagination-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            this.currentPage = Number(btn.getAttribute('data-page'));
            this.fetchAndRenderList();
          });
        });
      } else {
        paginationContainer.innerHTML = '';
      }

      this.updateComparisonToolbar();
    } catch (err) {
      itemsContainer.innerHTML = `
        <div class="card" style="color: var(--color-warning); padding: 1.5rem; text-align: center;">
          Failed to load history: ${err.message}
        </div>
      `;
    }
  }

  updateComparisonToolbar() {
    const toolbar = this.containerEl.querySelector('#comparison-toolbar');
    const countEl = this.containerEl.querySelector('#comparison-count');
    if (!toolbar) return;

    if (this.selectedScanIds.size >= 2) {
      toolbar.style.display = 'flex';
      countEl.textContent = `${this.selectedScanIds.size} products selected for comparison`;
    } else {
      toolbar.style.display = 'none';
    }
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

export default HistoryView;
