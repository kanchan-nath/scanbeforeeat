import { api } from './api.js';
import { startCamera, stopCamera, captureFrame } from './camera.js';
import { recognizeText } from './ocr.js?v=3';
import { startBarcodeScanner, stopBarcodeScanner } from './barcode.js';
import { renderReport } from './report.js';
import { HistoryView } from './history.js';
import { renderComparison } from './comparison.js';

export class AppRouter {
  constructor(appState) {
    this.appState = appState;
    this.currentView = null;
    this.viewContainer = document.getElementById('view-content');
    this.navBar = document.getElementById('bottom-nav-bar');
    this.header = document.getElementById('app-header');

    // Working scan state
    this.activeScanData = {
      scanMethod: 'manual',
      productId: null,
      rawOcrText: '',
      confirmedIngredientsText: '',
      productName: '',
      brand: '',
      category: '',
      barcode: '',
      imageUrl: '',
      nutritionData: null,
      confidence: 90
    };

    window.addEventListener('popstate', (e) => {
      const route = e.state?.route || 'home';
      const params = e.state?.params || {};
      this.navigate(route, params, false);
    });
  }

  navigate(route, params = {}, pushHistory = true) {
    // Teardown camera / scanner streams if leaving scanner screens
    if (this.currentView === 'camera-scanner') stopCamera();
    if (this.currentView === 'barcode-scanner') stopBarcodeScanner();

    // Route guards
    const publicRoutes = ['onboarding', 'login', 'register', 'terms', 'privacy'];
    if (!this.appState.user && !publicRoutes.includes(route)) {
      route = 'login';
    }

    if (this.appState.user && (route === 'login' || route === 'register')) {
      route = 'home';
    }

    this.currentView = route;
    if (pushHistory) {
      window.history.pushState({ route, params }, '', `#${route}`);
    }

    this.updateNavigationUI(route);

    // Route Dispatcher
    switch (route) {
      case 'onboarding':
        this.renderOnboarding();
        break;
      case 'login':
        this.renderLogin();
        break;
      case 'register':
        this.renderRegister();
        break;
      case 'home':
        this.renderHome();
        break;
      case 'scan-hub':
        this.renderScanHub();
        break;
      case 'camera-scanner':
        this.renderCameraScanner();
        break;
      case 'upload-scanner':
        this.renderUploadScanner();
        break;
      case 'barcode-scanner':
        this.renderBarcodeScanner();
        break;
      case 'manual-entry':
        this.renderManualEntry();
        break;
      case 'ocr-correction':
        this.renderOcrCorrection();
        break;
      case 'analysis-progress':
        this.renderAnalysisProgress(params);
        break;
      case 'report':
        this.renderReportView(params);
        break;
      case 'history':
        this.renderHistory();
        break;
      case 'comparison':
        this.renderComparisonView(params);
        break;
      case 'profile':
        this.renderProfile();
        break;
      case 'privacy':
      case 'terms':
        this.renderLegal(route);
        break;
      default:
        this.renderHome();
    }

    window.scrollTo(0, 0);
  }

  updateNavigationUI(route) {
    const isPublic = ['onboarding', 'login', 'register'].includes(route);
    if (this.navBar) {
      this.navBar.style.display = isPublic ? 'none' : 'flex';
      this.navBar.querySelectorAll('.nav-item').forEach(item => {
        const tab = item.getAttribute('data-tab');
        if (tab === route) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }

    if (this.header) {
      this.header.style.display = 'flex';
    }
  }

  /* =========================================================================
     1. Onboarding View
     ========================================================================= */
  renderOnboarding() {
    this.viewContainer.innerHTML = `
      <div style="text-align: center; padding: 2.5rem 1rem 1.5rem;">
        <div style="width: 72px; height: 72px; border-radius: 20px; background: var(--color-primary); margin: 0 auto 1.5rem; display: flex; align-items: center; justify-content: center; font-size: 2.4rem; box-shadow: 0 8px 24px rgba(168, 217, 47, 0.4);">
          🥗
        </div>
        <h1 style="font-size: 1.85rem; margin-bottom: 0.75rem;">Know What's Inside Your Food</h1>
        <p style="font-size: 0.95rem; color: var(--color-ink-secondary); margin-bottom: 2rem; line-height: 1.5;">
          Understand complex ingredient labels, additives, scientific research, and health considerations before you eat.
        </p>

        <div style="display: flex; flex-direction: column; gap: 1rem; text-align: left; margin-bottom: 2.5rem;">
          <div class="card" style="display: flex; gap: 0.85rem; align-items: flex-start; padding: 1rem;">
            <span style="font-size: 1.5rem;">📷</span>
            <div>
              <h4 style="font-size: 0.95rem;">Scan or Photograph Labels</h4>
              <p style="font-size: 0.825rem; margin-top: 0.2rem;">Client-side OCR extracts printed ingredient lists directly on your phone.</p>
            </div>
          </div>
          <div class="card" style="display: flex; gap: 0.85rem; align-items: flex-start; padding: 1rem;">
            <span style="font-size: 1.5rem;">🧠</span>
            <div>
              <h4 style="font-size: 0.95rem;">Evidence-Based Intelligence</h4>
              <p style="font-size: 0.825rem; margin-top: 0.2rem;">Get verified ingredient functions, benefits, and cautions backed by WHO and FSSAI standards.</p>
            </div>
          </div>
          <div class="card" style="display: flex; gap: 0.85rem; align-items: flex-start; padding: 1rem;">
            <span style="font-size: 1.5rem;">🔒</span>
            <div>
              <h4 style="font-size: 0.95rem;">Private & Transparent</h4>
              <p style="font-size: 0.825rem; margin-top: 0.2rem;">No fabricated percentages, no selling of private health data, full control to export or delete anytime.</p>
            </div>
          </div>
        </div>

        <button type="button" class="btn btn-primary btn-block" id="onboard-get-started-btn">
          Get Started
        </button>
        <button type="button" class="btn btn-ghost btn-block" id="onboard-login-btn" style="margin-top: 0.5rem;">
          Already have an account? Sign In
        </button>
      </div>
    `;

    this.viewContainer.querySelector('#onboard-get-started-btn').addEventListener('click', () => {
      this.navigate('register');
    });
    this.viewContainer.querySelector('#onboard-login-btn').addEventListener('click', () => {
      this.navigate('login');
    });
  }

  /* =========================================================================
     2. Login View
     ========================================================================= */
  renderLogin() {
    this.viewContainer.innerHTML = `
      <div style="padding: 1.5rem 0.5rem;">
        <h1 style="font-size: 1.65rem; margin-bottom: 0.35rem;">Sign In</h1>
        <p style="font-size: 0.9rem; color: var(--color-ink-muted); margin-bottom: 1.5rem;">
          Welcome back to ScanBeforeEat.
        </p>

        <form id="login-form">
          <div class="form-group">
            <label class="form-label" for="login-email">Email Address</label>
            <input type="email" id="login-email" class="input-text" required placeholder="name@example.com" autocomplete="email" />
          </div>
          <div class="form-group">
            <label class="form-label" for="login-password">Password</label>
            <input type="password" id="login-password" class="input-text" required placeholder="••••••••" autocomplete="current-password" />
          </div>

          <div id="login-error-msg" style="display: none; color: var(--color-warning); font-size: 0.85rem; margin-bottom: 1rem;"></div>

          <button type="submit" class="btn btn-primary btn-block" style="margin-bottom: 0.75rem;">
            Sign In
          </button>
        </form>

        <div style="text-align: center; margin: 1.25rem 0 0.75rem; font-size: 0.85rem; color: var(--color-ink-muted);">
          — OR TRY DEMO ACCOUNT —
        </div>

        <button type="button" class="btn btn-outline btn-block" id="demo-login-btn">
          Sign In as Demo Explorer
        </button>

        <div style="text-align: center; margin-top: 1.75rem; font-size: 0.9rem;">
          Don't have an account? <a href="#register" id="link-to-register" style="color: var(--color-primary-active); font-weight: 700;">Sign Up</a>
        </div>
      </div>
    `;

    const form = this.viewContainer.querySelector('#login-form');
    const errorMsg = this.viewContainer.querySelector('#login-error-msg');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorMsg.style.display = 'none';
      const email = form.querySelector('#login-email').value.trim();
      const password = form.querySelector('#login-password').value;

      try {
        const res = await api.auth.login({ email, password });
        if (res.success && res.user) {
          this.appState.user = res.user;
          this.navigate('home');
        }
      } catch (err) {
        errorMsg.textContent = err.message || 'Login failed. Please check your credentials.';
        errorMsg.style.display = 'block';
      }
    });

    this.viewContainer.querySelector('#demo-login-btn').addEventListener('click', async () => {
      try {
        const res = await api.auth.login({ email: 'demo@scanbeforeeat.local', password: 'DemoUser@1234' });
        if (res.success && res.user) {
          this.appState.user = res.user;
          this.navigate('home');
        }
      } catch (err) {
        errorMsg.textContent = err.message;
        errorMsg.style.display = 'block';
      }
    });

    this.viewContainer.querySelector('#link-to-register').addEventListener('click', (e) => {
      e.preventDefault();
      this.navigate('register');
    });
  }

  /* =========================================================================
     3. Register View
     ========================================================================= */
  renderRegister() {
    this.viewContainer.innerHTML = `
      <div style="padding: 1.5rem 0.5rem;">
        <h1 style="font-size: 1.65rem; margin-bottom: 0.35rem;">Create Account</h1>
        <p style="font-size: 0.9rem; color: var(--color-ink-muted); margin-bottom: 1.5rem;">
          Start scanning and understanding food labels.
        </p>

        <form id="register-form">
          <div class="form-group">
            <label class="form-label" for="reg-name">Your Name</label>
            <input type="text" id="reg-name" class="input-text" placeholder="e.g. Maya Patel" autocomplete="name" />
          </div>
          <div class="form-group">
            <label class="form-label" for="reg-email">Email Address</label>
            <input type="email" id="reg-email" class="input-text" required placeholder="name@example.com" autocomplete="email" />
          </div>
          <div class="form-group">
            <label class="form-label" for="reg-password">Password (min. 8 characters)</label>
            <input type="password" id="reg-password" class="input-text" required placeholder="••••••••" autocomplete="new-password" />
          </div>

          <div id="reg-error-msg" style="display: none; color: var(--color-warning); font-size: 0.85rem; margin-bottom: 1rem;"></div>

          <button type="submit" class="btn btn-primary btn-block">
            Create Account
          </button>
        </form>

        <div style="text-align: center; margin-top: 1.75rem; font-size: 0.9rem;">
          Already have an account? <a href="#login" id="link-to-login" style="color: var(--color-primary-active); font-weight: 700;">Sign In</a>
        </div>
      </div>
    `;

    const form = this.viewContainer.querySelector('#register-form');
    const errorMsg = this.viewContainer.querySelector('#reg-error-msg');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorMsg.style.display = 'none';
      const displayName = form.querySelector('#reg-name').value.trim();
      const email = form.querySelector('#reg-email').value.trim();
      const password = form.querySelector('#reg-password').value;

      try {
        const res = await api.auth.register({ displayName, email, password });
        if (res.success && res.user) {
          this.appState.user = res.user;
          this.navigate('home');
        }
      } catch (err) {
        errorMsg.textContent = err.message || 'Registration failed.';
        errorMsg.style.display = 'block';
      }
    });

    this.viewContainer.querySelector('#link-to-login').addEventListener('click', (e) => {
      e.preventDefault();
      this.navigate('login');
    });
  }

  /* =========================================================================
     4. Home Dashboard View
     ========================================================================= */
  async renderHome() {
    const user = this.appState.user || {};
    const greeting = user.displayName ? `Hi, ${user.displayName.split(' ')[0]}` : 'Welcome';

    this.viewContainer.innerHTML = `
      <div class="home-wrapper">
        <div style="margin-bottom: 1.25rem;">
          <p style="font-size: 0.85rem; color: var(--color-ink-muted);">${greeting}</p>
          <h1 style="font-size: 1.5rem;">Know what's inside your food.</h1>
        </div>

        <!-- Main Hero Scan Card -->
        <div class="card-dark" style="margin-bottom: 1.5rem; position: relative; overflow: hidden;">
          <div style="position: absolute; right: -10px; bottom: -10px; font-size: 6rem; opacity: 0.12; pointer-events: none;">
            🔍
          </div>
          <span class="badge badge-safe" style="margin-bottom: 0.5rem; font-size: 0.7rem;">
            Food Ingredient Intelligence
          </span>
          <h2 style="font-size: 1.25rem; margin-bottom: 0.35rem; color: #fff;">
            Scan an ingredient label
          </h2>
          <p style="font-size: 0.875rem; margin-bottom: 1.25rem; line-height: 1.4;">
            Instantly decode additives, allergens, nutritional density, and research evidence.
          </p>

          <button type="button" class="btn btn-primary btn-block" id="hero-scan-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/></svg>
            Scan Ingredients Now
          </button>
        </div>

        <!-- Quick Action Grid -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.65rem; margin-bottom: 1.75rem;">
          <button type="button" class="card" id="quick-barcode-btn" style="padding: 0.85rem 0.5rem; text-align: center; border: 1px solid var(--color-border); cursor: pointer;">
            <div style="font-size: 1.4rem; margin-bottom: 0.25rem;">📊</div>
            <div style="font-size: 0.775rem; font-weight: 700; color: var(--color-ink);">Scan Barcode</div>
          </button>
          <button type="button" class="card" id="quick-upload-btn" style="padding: 0.85rem 0.5rem; text-align: center; border: 1px solid var(--color-border); cursor: pointer;">
            <div style="font-size: 1.4rem; margin-bottom: 0.25rem;">📁</div>
            <div style="font-size: 0.775rem; font-weight: 700; color: var(--color-ink);">Upload Photo</div>
          </button>
          <button type="button" class="card" id="quick-manual-btn" style="padding: 0.85rem 0.5rem; text-align: center; border: 1px solid var(--color-border); cursor: pointer;">
            <div style="font-size: 1.4rem; margin-bottom: 0.25rem;">✍️</div>
            <div style="font-size: 0.775rem; font-weight: 700; color: var(--color-ink);">Type Text</div>
          </button>
        </div>

        <!-- Recent Scans Section -->
        <div style="margin-bottom: 1.75rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <h2>Recent Scans</h2>
            <a href="#history" id="home-view-all-history" style="font-size: 0.85rem; color: var(--color-primary-active); font-weight: 700;">View all</a>
          </div>
          <div id="home-recent-scans-container">
            <div style="text-align: center; padding: 1.5rem; color: var(--color-ink-muted);">Loading recent scans...</div>
          </div>
        </div>

        <!-- Educational Insight Card -->
        <div class="card" style="background: var(--color-surface-dim); border: none;">
          <h3 style="font-size: 0.95rem; margin-bottom: 0.35rem;">💡 Label Reading Tip</h3>
          <p style="font-size: 0.825rem; line-height: 1.4; color: var(--color-ink-secondary);">
            Ingredients are listed by regulatory law in descending order of weight. The first 3 to 5 items make up the vast bulk of what you are eating!
          </p>
        </div>
      </div>
    `;

    // Bind Hero and Action buttons
    this.viewContainer.querySelector('#hero-scan-btn').addEventListener('click', () => this.navigate('scan-hub'));
    this.viewContainer.querySelector('#quick-barcode-btn').addEventListener('click', () => this.navigate('barcode-scanner'));
    this.viewContainer.querySelector('#quick-upload-btn').addEventListener('click', () => this.navigate('upload-scanner'));
    this.viewContainer.querySelector('#quick-manual-btn').addEventListener('click', () => this.navigate('manual-entry'));
    this.viewContainer.querySelector('#home-view-all-history').addEventListener('click', (e) => {
      e.preventDefault();
      this.navigate('history');
    });

    // Fetch Recent Scans
    try {
      const res = await api.scans.list({ limit: 3 });
      const recentContainer = this.viewContainer.querySelector('#home-recent-scans-container');
      const scans = res.scans || [];

      if (scans.length === 0) {
        recentContainer.innerHTML = `
          <div class="card" style="text-align: center; padding: 1.5rem 1rem;">
            <p style="font-size: 0.85rem; color: var(--color-ink-muted); margin-bottom: 0.5rem;">No scans yet.</p>
            <button type="button" class="btn btn-outline btn-sm" id="home-first-scan-btn">Scan First Product</button>
          </div>
        `;
        recentContainer.querySelector('#home-first-scan-btn').addEventListener('click', () => this.navigate('scan-hub'));
      } else {
        recentContainer.innerHTML = scans.map(s => {
          const verdictBadgeClass = s.overall_verdict?.includes('reasonable') ? 'badge-safe'
            : s.overall_verdict?.includes('moderation') ? 'badge-caution'
            : 'badge-warning';

          return `
            <div class="card home-scan-card" data-id="${s.id}" style="padding: 0.85rem; margin-bottom: 0.65rem; display: flex; align-items: center; gap: 0.75rem; cursor: pointer;">
              ${s.product_image_url ? `
                <img src="${escapeHtml(s.product_image_url)}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 8px; flex-shrink: 0;" />
              ` : `
                <div style="width: 44px; height: 44px; border-radius: 8px; background: var(--color-surface-dim); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0;">
                  🥗
                </div>
              `}
              <div style="flex: 1; min-width: 0;">
                <h4 style="font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 0.15rem;">
                  ${escapeHtml(s.product_name || 'Scanned Product')}
                </h4>
                <p style="font-size: 0.75rem; color: var(--color-ink-muted);">
                  ${escapeHtml(s.product_brand || 'Packaged item')} • ${new Date(s.created_at).toLocaleDateString()}
                </p>
              </div>
              <span class="badge ${verdictBadgeClass}" style="font-size: 0.625rem; flex-shrink: 0;">
                ${escapeHtml(s.overall_verdict || 'Ready')}
              </span>
            </div>
          `;
        }).join('');

        recentContainer.querySelectorAll('.home-scan-card').forEach(card => {
          card.addEventListener('click', () => {
            const id = card.getAttribute('data-id');
            this.navigate('report', { scanId: id });
          });
        });
      }
    } catch (err) {
      console.error('Failed to load recent scans:', err);
    }
  }

  /* =========================================================================
     5. Scan Hub Options
     ========================================================================= */
  renderScanHub() {
    this.viewContainer.innerHTML = `
      <div style="padding: 1rem 0;">
        <h1 style="font-size: 1.5rem; margin-bottom: 0.35rem;">Choose Scanning Mode</h1>
        <p style="font-size: 0.875rem; color: var(--color-ink-muted); margin-bottom: 1.5rem;">
          Select how you want to capture the food product's ingredient details.
        </p>

        <div style="display: flex; flex-direction: column; gap: 0.85rem;">
          <div class="card scan-option-card" id="opt-camera" style="cursor: pointer; display: flex; gap: 1rem; align-items: center; padding: 1.25rem;">
            <div style="width: 50px; height: 50px; border-radius: 12px; background: var(--color-primary-subtle); display: flex; align-items: center; justify-content: center; font-size: 1.6rem;">
              📷
            </div>
            <div>
              <h3 style="font-size: 1rem; margin-bottom: 0.2rem;">Camera Label Scanner</h3>
              <p style="font-size: 0.825rem; color: var(--color-ink-secondary);">Aim camera at printed ingredient text for instant OCR reading.</p>
            </div>
          </div>

          <div class="card scan-option-card" id="opt-barcode" style="cursor: pointer; display: flex; gap: 1rem; align-items: center; padding: 1.25rem;">
            <div style="width: 50px; height: 50px; border-radius: 12px; background: var(--color-info-bg); display: flex; align-items: center; justify-content: center; font-size: 1.6rem;">
              📊
            </div>
            <div>
              <h3 style="font-size: 1rem; margin-bottom: 0.2rem;">Barcode Scanner</h3>
              <p style="font-size: 0.825rem; color: var(--color-ink-secondary);">Scan retail packaging barcode for instant product information.</p>
            </div>
          </div>

          <div class="card scan-option-card" id="opt-upload" style="cursor: pointer; display: flex; gap: 1rem; align-items: center; padding: 1.25rem;">
            <div style="width: 50px; height: 50px; border-radius: 12px; background: var(--color-surface-dim); display: flex; align-items: center; justify-content: center; font-size: 1.6rem;">
              🖼️
            </div>
            <div>
              <h3 style="font-size: 1rem; margin-bottom: 0.2rem;">Upload Existing Photo</h3>
              <p style="font-size: 0.825rem; color: var(--color-ink-secondary);">Select an existing food label photograph from your gallery.</p>
            </div>
          </div>

          <div class="card scan-option-card" id="opt-manual" style="cursor: pointer; display: flex; gap: 1rem; align-items: center; padding: 1.25rem;">
            <div style="width: 50px; height: 50px; border-radius: 12px; background: #FFF3CD; display: flex; align-items: center; justify-content: center; font-size: 1.6rem;">
              ✍️
            </div>
            <div>
              <h3 style="font-size: 1rem; margin-bottom: 0.2rem;">Enter or Paste Ingredients</h3>
              <p style="font-size: 0.825rem; color: var(--color-ink-secondary);">Type or paste ingredient text manually if packaging is curved or blurry.</p>
            </div>
          </div>
        </div>
      </div>
    `;

    this.viewContainer.querySelector('#opt-camera').addEventListener('click', () => this.navigate('camera-scanner'));
    this.viewContainer.querySelector('#opt-barcode').addEventListener('click', () => this.navigate('barcode-scanner'));
    this.viewContainer.querySelector('#opt-upload').addEventListener('click', () => this.navigate('upload-scanner'));
    this.viewContainer.querySelector('#opt-manual').addEventListener('click', () => this.navigate('manual-entry'));
  }

  /* =========================================================================
     6. Camera Scanner View (Tesseract.js OCR Pipeline)
     ========================================================================= */
  async renderCameraScanner() {
    this.viewContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <button type="button" class="btn btn-outline btn-sm" id="cam-cancel-btn">Cancel</button>
          <span style="font-size: 0.85rem; font-weight: 700;">Scan Ingredient Label</span>
          <button type="button" class="btn btn-outline btn-sm" id="cam-switch-btn" title="Switch Camera">🔄</button>
        </div>

        <div class="camera-container" id="camera-box">
          <video id="camera-preview" class="camera-video" playsinline muted autoplay></video>
          <div class="viewfinder-frame">
            <div class="viewfinder-corner corner-tl"></div>
            <div class="viewfinder-corner corner-tr"></div>
            <div class="viewfinder-corner corner-bl"></div>
            <div class="viewfinder-corner corner-br"></div>
            <div class="scanning-laser-line"></div>
          </div>
        </div>

        <p style="font-size: 0.8rem; text-align: center; color: var(--color-ink-muted);">
          Align the ingredient list inside the box. Ensure good lighting and flat packaging.
        </p>

        <div id="ocr-progress-box" style="display: none; background: var(--color-surface); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--color-border); text-align: center;">
          <div style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.35rem;" id="ocr-status-text">Processing image...</div>
          <div style="height: 6px; background: var(--color-surface-dim); border-radius: 4px; overflow: hidden;">
            <div id="ocr-progress-bar" style="width: 10%; height: 100%; background: var(--color-primary-active); transition: width 200ms;"></div>
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem; margin-top: 0.5rem;">
          <button type="button" class="btn btn-primary btn-block" id="cam-capture-btn" style="min-height: 52px; font-size: 1.05rem;">
            📸 Capture & Read Text
          </button>
        </div>
        <div style="text-align: center; margin-top: 0.65rem;">
          <button type="button" class="btn btn-sm btn-ghost" id="cam-upload-btn" style="font-size: 0.85rem; color: var(--color-ink-muted);">
            📁 Or select a photo from your gallery
          </button>
        </div>
      </div>
    `;

    const videoEl = this.viewContainer.querySelector('#camera-preview');
    const cancelBtn = this.viewContainer.querySelector('#cam-cancel-btn');
    const switchBtn = this.viewContainer.querySelector('#cam-switch-btn');
    const captureBtn = this.viewContainer.querySelector('#cam-capture-btn');
    const uploadAltBtn = this.viewContainer.querySelector('#cam-upload-btn');
    const progressBox = this.viewContainer.querySelector('#ocr-progress-box');
    const statusText = this.viewContainer.querySelector('#ocr-status-text');
    const progressBar = this.viewContainer.querySelector('#ocr-progress-bar');

    cancelBtn.addEventListener('click', () => {
      stopCamera();
      this.navigate('scan-hub');
    });

    uploadAltBtn?.addEventListener('click', () => {
      stopCamera();
      this.navigate('upload-scanner');
    });

    try {
      await startCamera(videoEl, 'environment');
    } catch (err) {
      alert(err.message);
      this.navigate('upload-scanner');
      return;
    }

    switchBtn.addEventListener('click', async () => {
      try {
        await startCamera(videoEl, 'user');
      } catch (e) {}
    });

    captureBtn.addEventListener('click', async () => {
      try {
        captureBtn.disabled = true;
        progressBox.style.display = 'block';
        statusText.textContent = 'Freezing frame...';

        const canvas = captureFrame(videoEl);
        stopCamera();

        statusText.textContent = 'Extracting text with OCR...';
        const ocrResult = await recognizeText(canvas, (percent, status) => {
          progressBar.style.width = `${Math.max(5, percent)}%`;
          statusText.textContent = status || `Reading label: ${percent}%`;
        });

        const detectedText = (ocrResult.normalizedText && ocrResult.normalizedText.length >= 5)
          ? ocrResult.normalizedText
          : (ocrResult.rawText || '').trim();

        if (!detectedText || detectedText.length < 3) {
          progressBox.innerHTML = `
            <div style="color: var(--color-ink-muted); font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem;">
              ⚠️ Could not detect readable text in this frame. Ensure the ingredient list is in focus and well lit.
            </div>
            <div style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 0.5rem;">
              <button type="button" class="btn btn-outline btn-sm" id="cam-retry-btn">Try Again</button>
              <button type="button" class="btn btn-primary btn-sm" id="cam-manual-btn">Type Ingredients</button>
            </div>
          `;
          progressBox.querySelector('#cam-retry-btn')?.addEventListener('click', async () => {
            progressBox.style.display = 'none';
            captureBtn.disabled = false;
            try {
              await startCamera(videoEl, 'environment');
            } catch (e) {}
          });
          progressBox.querySelector('#cam-manual-btn')?.addEventListener('click', () => {
            this.navigate('manual-entry');
          });
          return;
        }

        this.activeScanData.scanMethod = 'camera';
        this.activeScanData.rawOcrText = ocrResult.rawText;
        this.activeScanData.confirmedIngredientsText = detectedText;
        this.activeScanData.confidence = ocrResult.confidence;

        this.navigate('ocr-correction');
      } catch (err) {
        progressBox.innerHTML = `
          <div style="color: var(--color-danger); font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem;">
            OCR failed: ${err.message}
          </div>
          <div style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 0.5rem;">
            <button type="button" class="btn btn-outline btn-sm" id="cam-err-retry-btn">Try Again</button>
            <button type="button" class="btn btn-primary btn-sm" id="cam-err-manual-btn">Enter Manually</button>
          </div>
        `;
        progressBox.querySelector('#cam-err-retry-btn')?.addEventListener('click', async () => {
          progressBox.style.display = 'none';
          captureBtn.disabled = false;
          try {
            await startCamera(videoEl, 'environment');
          } catch (e) {}
        });
        progressBox.querySelector('#cam-err-manual-btn')?.addEventListener('click', () => {
          this.navigate('manual-entry');
        });
      }
    });
  }

  /* =========================================================================
     7. Upload Scanner View
     ========================================================================= */
  renderUploadScanner() {
    this.viewContainer.innerHTML = `
      <div style="padding: 1rem 0;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
          <button type="button" class="btn btn-outline btn-sm" id="upload-cancel-btn">Back</button>
          <span style="font-size: 0.85rem; font-weight: 700;">Upload Label Photo</span>
        </div>

        <div class="card" style="text-align: center; padding: 2rem 1.25rem; border: 2px dashed var(--color-border-dark); margin-bottom: 1.25rem;">
          <div style="font-size: 3rem; margin-bottom: 0.5rem;">📁</div>
          <h3 style="font-size: 1.1rem; margin-bottom: 0.35rem;">Select Photo from Device</h3>
          <p style="font-size: 0.85rem; color: var(--color-ink-muted); margin-bottom: 1.25rem;">
            Choose a photo of the ingredients list from your library or camera roll.
          </p>
          <input type="file" id="file-input" accept="image/*" style="display: none;" />
          <button type="button" class="btn btn-primary" id="choose-file-btn">
            Choose Photo
          </button>
        </div>

        <div id="upload-preview-box" style="display: none; margin-bottom: 1.25rem;">
          <img id="upload-img-preview" style="max-height: 240px; width: 100%; object-fit: contain; border-radius: 12px; border: 1px solid var(--color-border);" />
        </div>

        <div id="upload-progress-box" style="display: none; background: var(--color-surface); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--color-border); text-align: center;">
          <div style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.35rem;" id="upload-status-text">Processing image...</div>
          <div style="height: 6px; background: var(--color-surface-dim); border-radius: 4px; overflow: hidden;">
            <div id="upload-progress-bar" style="width: 10%; height: 100%; background: var(--color-primary-active); transition: width 200ms;"></div>
          </div>
        </div>
      </div>
    `;

    const cancelBtn = this.viewContainer.querySelector('#upload-cancel-btn');
    const fileInput = this.viewContainer.querySelector('#file-input');
    const chooseBtn = this.viewContainer.querySelector('#choose-file-btn');
    const previewBox = this.viewContainer.querySelector('#upload-preview-box');
    const imgPreview = this.viewContainer.querySelector('#upload-img-preview');
    const progressBox = this.viewContainer.querySelector('#upload-progress-box');
    const statusText = this.viewContainer.querySelector('#upload-status-text');
    const progressBar = this.viewContainer.querySelector('#upload-progress-bar');

    cancelBtn.addEventListener('click', () => this.navigate('scan-hub'));
    chooseBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const imgUrl = URL.createObjectURL(file);
      imgPreview.src = imgUrl;
      previewBox.style.display = 'block';
      chooseBtn.style.display = 'none';
      progressBox.style.display = 'block';

      try {
        const img = new Image();
        img.src = imgUrl;
        await img.decode();

        statusText.textContent = 'Running OCR on uploaded label...';
        const ocrResult = await recognizeText(img, (percent, status) => {
          progressBar.style.width = `${Math.max(5, percent)}%`;
          statusText.textContent = status || `Reading image: ${percent}%`;
        });

        if (!ocrResult.normalizedText || ocrResult.normalizedText.length < 5) {
          alert('Could not detect readable ingredient text in this photo. Please enter text manually.');
          this.navigate('manual-entry');
          return;
        }

        this.activeScanData.scanMethod = 'upload';
        this.activeScanData.rawOcrText = ocrResult.rawText;
        this.activeScanData.confirmedIngredientsText = ocrResult.normalizedText;
        this.activeScanData.confidence = ocrResult.confidence;

        this.navigate('ocr-correction');
      } catch (err) {
        alert(`OCR failed: ${err.message}`);
        this.navigate('manual-entry');
      }
    });
  }

  /* =========================================================================
     8. Barcode Scanner View (@zxing/browser)
     ========================================================================= */
  async renderBarcodeScanner() {
    this.viewContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <button type="button" class="btn btn-outline btn-sm" id="barcode-cancel-btn">Back</button>
          <span style="font-size: 0.85rem; font-weight: 700;">Scan Barcode</span>
          <div style="width: 32px;"></div>
        </div>

        <div class="camera-container" style="height: 320px;">
          <video id="barcode-video-preview" class="camera-video" playsinline muted autoplay></video>
          <div class="viewfinder-frame" style="top: 25%; bottom: 25%; left: 8%; right: 8%;">
            <div class="viewfinder-corner corner-tl"></div>
            <div class="viewfinder-corner corner-tr"></div>
            <div class="viewfinder-corner corner-bl"></div>
            <div class="viewfinder-corner corner-br"></div>
            <div class="scanning-laser-line"></div>
          </div>
        </div>

        <p style="font-size: 0.8rem; text-align: center; color: var(--color-ink-muted);">
          Point camera directly at product barcode (EAN / UPC).
        </p>

        <div id="barcode-lookup-loader" style="display: none; text-align: center; padding: 1rem; color: var(--color-ink-muted);">
          Looking up product in Open Food Facts database...
        </div>

        <div class="card" style="padding: 1rem; margin-top: 0.5rem;">
          <div style="font-size: 0.825rem; font-weight: 700; margin-bottom: 0.5rem;">Camera not focusing? Type barcode manually:</div>
          <div style="display: flex; gap: 0.5rem;">
            <input type="text" id="manual-barcode-input" class="input-text" placeholder="e.g. 8901234567890" style="font-size: 0.875rem;" />
            <button type="button" class="btn btn-primary btn-sm" id="manual-barcode-submit">Lookup</button>
          </div>
        </div>
      </div>
    `;

    const videoEl = this.viewContainer.querySelector('#barcode-video-preview');
    const cancelBtn = this.viewContainer.querySelector('#barcode-cancel-btn');
    const lookupLoader = this.viewContainer.querySelector('#barcode-lookup-loader');
    const manualInput = this.viewContainer.querySelector('#manual-barcode-input');
    const manualSubmit = this.viewContainer.querySelector('#manual-barcode-submit');

    cancelBtn.addEventListener('click', () => {
      stopBarcodeScanner();
      this.navigate('scan-hub');
    });

    const handleBarcodeDetected = async (barcode) => {
      stopBarcodeScanner();
      lookupLoader.style.display = 'block';

      try {
        const res = await api.products.lookupBarcode(barcode);
        lookupLoader.style.display = 'none';

        if (res.found && res.product) {
          const prod = res.product;
          this.activeScanData.scanMethod = 'barcode';
          this.activeScanData.productId = prod.id || null;
          this.activeScanData.barcode = prod.barcode;
          this.activeScanData.productName = prod.name;
          this.activeScanData.brand = prod.brand;
          this.activeScanData.category = prod.category;
          this.activeScanData.imageUrl = prod.imageUrl;
          this.activeScanData.nutritionData = prod.nutritionData;
          this.activeScanData.confirmedIngredientsText = prod.ingredientsText || '';

          if (prod.ingredientsText && prod.ingredientsText.trim().length > 5) {
            this.navigate('ocr-correction');
          } else {
            alert(`Found product "${prod.name}", but the ingredient label was not recorded in the catalogue. Please type or photograph the ingredients.`);
            this.navigate('manual-entry');
          }
        } else {
          alert(`Barcode ${barcode} was not found in the catalogue. You can photograph or type the ingredient label directly!`);
          this.navigate('manual-entry');
        }
      } catch (err) {
        lookupLoader.style.display = 'none';
        alert(`Product lookup error: ${err.message}`);
        this.navigate('manual-entry');
      }
    };

    manualSubmit.addEventListener('click', () => {
      const code = manualInput.value.trim();
      if (code.length >= 8) {
        handleBarcodeDetected(code);
      } else {
        alert('Please enter a valid 8 to 14 digit barcode.');
      }
    });

    try {
      await startBarcodeScanner(videoEl, handleBarcodeDetected);
    } catch (err) {
      alert(`Unable to start barcode scanner: ${err.message}`);
    }
  }

  /* =========================================================================
     9. Manual Ingredient Entry View
     ========================================================================= */
  renderManualEntry() {
    this.viewContainer.innerHTML = `
      <div style="padding: 1rem 0;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
          <button type="button" class="btn btn-outline btn-sm" id="manual-cancel-btn">Back</button>
          <span style="font-size: 0.85rem; font-weight: 700;">Enter Ingredients</span>
        </div>

        <form id="manual-entry-form">
          <div class="form-group">
            <label class="form-label" for="manual-prod-name">Product Name (Optional)</label>
            <input type="text" id="manual-prod-name" class="input-text" placeholder="e.g. Whole Wheat Digestive Biscuits" value="${escapeHtml(this.activeScanData.productName)}" />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div class="form-group">
              <label class="form-label" for="manual-brand">Brand</label>
              <input type="text" id="manual-brand" class="input-text" placeholder="e.g. NutriBake" value="${escapeHtml(this.activeScanData.brand)}" />
            </div>
            <div class="form-group">
              <label class="form-label" for="manual-category">Category</label>
              <input type="text" id="manual-category" class="input-text" placeholder="e.g. Bakery" value="${escapeHtml(this.activeScanData.category)}" />
            </div>
          </div>

          <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
              <label class="form-label" for="manual-ingredients-text" style="margin-bottom: 0;">Ingredient List *</label>
              <button type="button" class="btn btn-outline btn-sm" id="btn-prefill-demo" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;">
                Try Sample Text
              </button>
            </div>
            <textarea id="manual-ingredients-text" class="textarea-text" placeholder="Paste or type ingredients as printed on packaging... e.g. Whole wheat flour, sugar, palm oil, cocoa powder, milk solids, raising agents (INS 500ii), salt, emulsifier (INS 322 soy lecithin)." required>${escapeHtml(this.activeScanData.confirmedIngredientsText)}</textarea>
          </div>

          <button type="submit" class="btn btn-primary btn-block" style="margin-top: 0.5rem;">
            Continue to Verification
          </button>
        </form>
      </div>
    `;

    const cancelBtn = this.viewContainer.querySelector('#manual-cancel-btn');
    const form = this.viewContainer.querySelector('#manual-entry-form');
    const prefillBtn = this.viewContainer.querySelector('#btn-prefill-demo');
    const textarea = this.viewContainer.querySelector('#manual-ingredients-text');

    cancelBtn.addEventListener('click', () => this.navigate('scan-hub'));

    prefillBtn.addEventListener('click', () => {
      form.querySelector('#manual-prod-name').value = 'ChocoCrunch Whole Wheat Biscuits';
      form.querySelector('#manual-brand').value = 'NutriBake';
      form.querySelector('#manual-category').value = 'Biscuits & Bakery';
      textarea.value = 'Whole Wheat Flour (52%), Sugar, Edible Vegetable Oil (Palm Oil), Cocoa Solids (4.5%), Milk Solids, Invert Sugar Syrup, Raising Agents (INS 500(ii), INS 503(ii)), Iodised Salt, Emulsifier (INS 322(i) Soy Lecithin), Natural Caramel Colour (INS 150d).';
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = textarea.value.trim();
      if (text.length < 5) {
        alert('Please enter at least 1 or 2 ingredients.');
        return;
      }

      this.activeScanData.scanMethod = 'manual';
      this.activeScanData.productName = form.querySelector('#manual-prod-name').value.trim();
      this.activeScanData.brand = form.querySelector('#manual-brand').value.trim();
      this.activeScanData.category = form.querySelector('#manual-category').value.trim();
      this.activeScanData.confirmedIngredientsText = text;

      this.navigate('ocr-correction');
    });
  }

  /* =========================================================================
     10. OCR Review & Mandatory User Confirmation
     ========================================================================= */
  renderOcrCorrection() {
    this.viewContainer.innerHTML = `
      <div style="padding: 1rem 0;">
        <h1 style="font-size: 1.4rem; margin-bottom: 0.35rem;">Review & Confirm Ingredients</h1>
        <p style="font-size: 0.85rem; color: var(--color-ink-muted); margin-bottom: 1rem;">
          OCR text may contain scanning errors. Please verify or correct the ingredients before submitting for AI intelligence analysis.
        </p>

        <div class="card" style="margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <span style="font-size: 0.825rem; font-weight: 700;">Editable Ingredient Text</span>
            ${this.activeScanData.confidence ? `
              <span class="badge badge-safe" style="font-size: 0.65rem;">
                OCR Confidence: ~${this.activeScanData.confidence}%
              </span>
            ` : ''}
          </div>
          <textarea id="correction-textarea" class="textarea-text" style="min-height: 140px;">${escapeHtml(this.activeScanData.confirmedIngredientsText)}</textarea>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.65rem;">
          <button type="button" class="btn btn-primary btn-block" id="confirm-and-analyze-btn">
            🔬 Analyze with AI Intelligence
          </button>
          <button type="button" class="btn btn-outline btn-block" id="correction-retake-btn">
            Retake / Re-enter Label
          </button>
        </div>
      </div>
    `;

    const textarea = this.viewContainer.querySelector('#correction-textarea');
    const analyzeBtn = this.viewContainer.querySelector('#confirm-and-analyze-btn');
    const retakeBtn = this.viewContainer.querySelector('#correction-retake-btn');

    retakeBtn.addEventListener('click', () => this.navigate('scan-hub'));

    analyzeBtn.addEventListener('click', async () => {
      const confirmedText = textarea.value.trim();
      if (!confirmedText) {
        alert('Ingredient text cannot be empty.');
        return;
      }

      this.activeScanData.confirmedIngredientsText = confirmedText;
      analyzeBtn.disabled = true;

      // 1. Create scan in backend
      try {
        const scanPayload = {
          scanMethod: this.activeScanData.scanMethod || 'manual',
          productId: this.activeScanData.productId || undefined,
          confirmedIngredientsText: confirmedText,
          rawOcrText: this.activeScanData.rawOcrText,
          extractionConfidence: this.activeScanData.confidence,
          productName: this.activeScanData.productName,
          brand: this.activeScanData.brand,
          category: this.activeScanData.category,
          barcode: this.activeScanData.barcode,
          productImageUrl: this.activeScanData.imageUrl,
          nutritionData: this.activeScanData.nutritionData
        };

        const createRes = await api.scans.create(scanPayload);
        const scanId = createRes.scan.id;

        // Navigate to progress view which triggers analysis
        this.navigate('analysis-progress', { scanId });
      } catch (err) {
        alert(`Failed to save scan: ${err.message}`);
        analyzeBtn.disabled = false;
      }
    });
  }

  /* =========================================================================
     11. Analysis Progress Screen (Radar Pulse)
     ========================================================================= */
  async renderAnalysisProgress({ scanId }) {
    this.viewContainer.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem;">
        <div class="radar-pulse-wrapper">
          <div class="radar-circle"></div>
          <div class="radar-circle"></div>
          <div class="radar-core">🧬</div>
        </div>

        <h2 style="font-size: 1.4rem; margin-bottom: 0.5rem;" id="analysis-step-title">Analyzing Ingredients...</h2>
        <p style="font-size: 0.875rem; color: var(--color-ink-muted); max-width: 320px; margin: 0 auto;" id="analysis-step-desc">
          Querying food additive databases and synthesizing public health science...
        </p>
      </div>
    `;

    const titleEl = this.viewContainer.querySelector('#analysis-step-title');
    const descEl = this.viewContainer.querySelector('#analysis-step-desc');

    const steps = [
      { title: 'Identifying Additives & E-Numbers...', desc: 'Verifying technological functions against regulatory classifications.' },
      { title: 'Evaluating Nutritional Context...', desc: 'Calculating educational profile score and reviewing whole-food foundations.' },
      { title: 'Checking Authoritative Citations...', desc: 'Cross-referencing WHO, FSSAI, and peer-reviewed safety reviews.' }
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx++;
      if (steps[stepIdx]) {
        titleEl.textContent = steps[stepIdx].title;
        descEl.textContent = steps[stepIdx].desc;
      }
    }, 1800);

    try {
      const res = await api.scans.analyze(scanId);
      clearInterval(interval);
      if (res.success && res.report) {
        this.navigate('report', { scanId, report: res.report });
      } else {
        throw new Error('Analysis response was incomplete.');
      }
    } catch (err) {
      clearInterval(interval);
      alert(`AI Analysis error: ${err.message}`);
      this.navigate('home');
    }
  }

  /* =========================================================================
     12. Detailed Report View
     ========================================================================= */
  async renderReportView({ scanId, report = null }) {
    this.viewContainer.innerHTML = `<div style="text-align: center; padding: 2rem;">Loading report...</div>`;

    let reportData = report;
    if (!reportData && scanId) {
      try {
        const res = await api.scans.getReport(scanId);
        reportData = res.report;
      } catch (err) {
        this.viewContainer.innerHTML = `
          <div class="card" style="color: var(--color-warning); padding: 1.5rem; text-align: center;">
            Failed to load report: ${err.message}
            <div style="margin-top: 1rem;">
              <button type="button" class="btn btn-outline btn-sm" id="report-err-back">Back</button>
            </div>
          </div>
        `;
        this.viewContainer.querySelector('#report-err-back').addEventListener('click', () => this.navigate('history'));
        return;
      }
    }

    renderReport(reportData, this.viewContainer, {
      onBack: () => this.navigate('history'),
      onCompare: (id) => this.navigate('history'),
      onDelete: async (id) => {
        if (confirm('Delete this scan and report permanently?')) {
          await api.scans.delete(id);
          this.navigate('history');
        }
      }
    });
  }

  /* =========================================================================
     13. Scan History View
     ========================================================================= */
  renderHistory() {
    const historyView = new HistoryView(this.viewContainer, (route, params) => {
      this.navigate(route, params);
    });
    historyView.load();
  }

  /* =========================================================================
     14. Product Comparison View
     ========================================================================= */
  renderComparisonView({ comparison }) {
    renderComparison(comparison, this.viewContainer, () => this.navigate('history'));
  }

  /* =========================================================================
     15. Profile & Privacy Settings View
     ========================================================================= */
  async renderProfile() {
    const user = this.appState.user || {};

    this.viewContainer.innerHTML = `
      <div style="padding: 1rem 0;">
        <h1 style="font-size: 1.5rem; margin-bottom: 0.35rem;">Account & Settings</h1>
        <p style="font-size: 0.85rem; color: var(--color-ink-muted); margin-bottom: 1.25rem;">
          Manage your personal details, dietary sensitivities, and privacy controls.
        </p>

        <!-- User Information Card -->
        <div class="card" style="margin-bottom: 1.25rem;">
          <h3 style="font-size: 1rem; margin-bottom: 0.75rem;">Profile Info</h3>
          <p style="font-size: 0.85rem; margin-bottom: 0.25rem;"><strong>Name:</strong> ${escapeHtml(user.displayName || 'Not provided')}</p>
          <p style="font-size: 0.85rem; margin-bottom: 0.75rem;"><strong>Email:</strong> ${escapeHtml(user.email || '—')}</p>
          <p style="font-size: 0.75rem; color: var(--color-ink-muted);">Member since: ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}</p>
        </div>

        <!-- Dietary Preferences Card -->
        <div class="card" style="margin-bottom: 1.25rem;">
          <h3 style="font-size: 1rem; margin-bottom: 0.5rem;">Dietary Sensitivities</h3>
          <p style="font-size: 0.8rem; color: var(--color-ink-muted); margin-bottom: 0.75rem;">
            Check ingredients you want prominently flagged on reports:
          </p>
          <form id="dietary-pref-form">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.85rem; margin-bottom: 1rem;">
              <label><input type="checkbox" name="allergens" value="Gluten" /> Gluten</label>
              <label><input type="checkbox" name="allergens" value="Milk / Dairy" /> Milk / Dairy</label>
              <label><input type="checkbox" name="allergens" value="Soy" /> Soy</label>
              <label><input type="checkbox" name="allergens" value="Peanuts" /> Peanuts</label>
              <label><input type="checkbox" name="allergens" value="Tree Nuts" /> Tree Nuts</label>
              <label><input type="checkbox" name="allergens" value="Eggs" /> Eggs</label>
            </div>
            <button type="submit" class="btn btn-outline btn-sm">Save Preferences</button>
          </form>
        </div>

        <!-- Privacy & Export Controls -->
        <div class="card" style="margin-bottom: 1.25rem;">
          <h3 style="font-size: 1rem; margin-bottom: 0.5rem;">Data Privacy Controls</h3>
          <p style="font-size: 0.8rem; color: var(--color-ink-muted); margin-bottom: 0.75rem;">
            ScanBeforeEat does not sell your data or train AI models on personal reports.
          </p>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <a href="/api/v1/auth/export" class="btn btn-secondary btn-sm" style="text-align: center;">
              📥 Export All My Data (JSON)
            </a>
            <button type="button" class="btn btn-outline btn-sm" id="btn-view-privacy">
              Read Privacy Policy
            </button>
          </div>
        </div>

        <!-- Sign Out & Danger Zone -->
        <div style="display: flex; flex-direction: column; gap: 0.65rem;">
          <button type="button" class="btn btn-outline btn-block" id="btn-logout">
            Sign Out
          </button>
          <button type="button" class="btn btn-danger btn-block btn-sm" id="btn-delete-account" style="margin-top: 0.5rem;">
            Delete Account Permanently
          </button>
        </div>
      </div>
    `;

    // Load saved preferences
    try {
      const prefRes = await api.user.getPreferences();
      const savedAllergens = prefRes.preferences?.allergens || [];
      this.viewContainer.querySelectorAll('input[name="allergens"]').forEach(cb => {
        if (savedAllergens.includes(cb.value)) cb.checked = true;
      });
    } catch (e) {}

    // Save preferences
    this.viewContainer.querySelector('#dietary-pref-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const selected = Array.from(this.viewContainer.querySelectorAll('input[name="allergens"]:checked')).map(cb => cb.value);
      try {
        await api.user.savePreferences({ allergens: selected });
        alert('Preferences saved successfully.');
      } catch (err) {
        alert(err.message);
      }
    });

    // Logout
    this.viewContainer.querySelector('#btn-logout').addEventListener('click', async () => {
      await api.auth.logout();
      this.appState.user = null;
      this.navigate('login');
    });

    // Delete Account
    this.viewContainer.querySelector('#btn-delete-account').addEventListener('click', async () => {
      const pwd = prompt('Enter your password to confirm permanent account deletion:');
      if (pwd) {
        try {
          await api.auth.deleteAccount({ password: pwd });
          this.appState.user = null;
          alert('Account deleted.');
          this.navigate('onboarding');
        } catch (err) {
          alert(err.message);
        }
      }
    });

    this.viewContainer.querySelector('#btn-view-privacy').addEventListener('click', () => {
      this.navigate('privacy');
    });
  }

  /* =========================================================================
     16. Legal & Scientific Disclaimer View
     ========================================================================= */
  renderLegal(type) {
    this.viewContainer.innerHTML = `
      <div style="padding: 1rem 0;">
        <button type="button" class="btn btn-outline btn-sm" id="legal-back-btn" style="margin-bottom: 1rem;">
          Back
        </button>
        <h1 style="font-size: 1.4rem; margin-bottom: 0.5rem;">
          ${type === 'privacy' ? 'Privacy Policy' : 'Terms & Scientific Disclaimers'}
        </h1>
        <div class="card" style="font-size: 0.85rem; line-height: 1.5; color: var(--color-ink-secondary);">
          <h4 style="color: var(--color-ink); margin-bottom: 0.25rem;">Educational Information Notice</h4>
          <p style="margin-bottom: 0.85rem;">
            ScanBeforeEat provides educational ingredient context synthesized from publicly available food regulations (FSSAI, WHO, FDA, EFSA). It does NOT constitute medical diagnoses or clinical advice.
          </p>
          <h4 style="color: var(--color-ink); margin-bottom: 0.25rem;">Data Privacy & Security</h4>
          <p style="margin-bottom: 0.85rem;">
            We do not sell personal data. Scanned ingredient text is evaluated via secure backend APIs without personal identification. You retain full rights to delete your history or export your records at any time.
          </p>
        </div>
      </div>
    `;

    this.viewContainer.querySelector('#legal-back-btn').addEventListener('click', () => this.navigate('profile'));
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

export default AppRouter;
