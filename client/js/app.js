import { api, fetchCsrfToken } from './api.js';
import { AppRouter } from './router.js?v=3';

// Application state singleton
const appState = {
  user: null,
  router: null
};

/**
 * Desktop Blocker Viewport Synchronizer (Section 3)
 * Provides programmatic dual verification in addition to CSS media queries
 */
function checkDesktopBlocker() {
  const blocker = document.getElementById('desktop-blocker');
  const appRoot = document.getElementById('app-root');
  const width = window.innerWidth;

  if (width >= 600) {
    if (blocker) blocker.style.display = 'flex';
    if (appRoot) appRoot.style.display = 'none';
  } else {
    if (blocker) blocker.style.display = 'none';
    if (appRoot) appRoot.style.display = 'flex';
  }
}

/**
 * Generate lightweight inline SVG QR Code placeholder
 */
function renderDesktopQr() {
  const qrContainer = document.getElementById('blocker-qr-svg');
  if (!qrContainer) return;

  // Visual geometric QR pattern representation
  qrContainer.innerHTML = `
    <svg viewBox="0 0 100 100" fill="var(--color-ink)">
      <!-- Finder top-left -->
      <rect x="5" y="5" width="30" height="30" rx="4" fill="none" stroke="currentColor" stroke-width="6"/>
      <rect x="13" y="13" width="14" height="14" rx="2" fill="currentColor"/>
      <!-- Finder top-right -->
      <rect x="65" y="5" width="30" height="30" rx="4" fill="none" stroke="currentColor" stroke-width="6"/>
      <rect x="73" y="13" width="14" height="14" rx="2" fill="currentColor"/>
      <!-- Finder bottom-left -->
      <rect x="5" y="65" width="30" height="30" rx="4" fill="none" stroke="currentColor" stroke-width="6"/>
      <rect x="13" y="73" width="14" height="14" rx="2" fill="currentColor"/>
      <!-- Data modules -->
      <rect x="42" y="8" width="8" height="8" fill="currentColor"/>
      <rect x="52" y="18" width="8" height="8" fill="currentColor"/>
      <rect x="42" y="28" width="8" height="8" fill="currentColor"/>
      <rect x="8" y="42" width="8" height="8" fill="currentColor"/>
      <rect x="18" y="52" width="8" height="8" fill="currentColor"/>
      <rect x="28" y="42" width="8" height="8" fill="currentColor"/>
      <rect x="42" y="42" width="16" height="16" rx="2" fill="var(--color-primary-active)"/>
      <rect x="65" y="42" width="8" height="8" fill="currentColor"/>
      <rect x="75" y="52" width="8" height="8" fill="currentColor"/>
      <rect x="85" y="42" width="8" height="8" fill="currentColor"/>
      <rect x="42" y="65" width="8" height="8" fill="currentColor"/>
      <rect x="52" y="75" width="8" height="8" fill="currentColor"/>
      <rect x="42" y="85" width="8" height="8" fill="currentColor"/>
      <rect x="65" y="65" width="12" height="12" fill="currentColor"/>
      <rect x="80" y="80" width="12" height="12" fill="currentColor"/>
    </svg>
  `;
}

// Initialize Application
async function initApp() {
  // 1. Initial Desktop Blocker check and bind window resize / orientation listeners
  checkDesktopBlocker();
  renderDesktopQr();
  window.addEventListener('resize', checkDesktopBlocker);
  window.addEventListener('orientationchange', checkDesktopBlocker);

  // Copy Link in Desktop Blocker
  const copyBtn = document.getElementById('copy-app-link-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(window.location.origin);
        copyBtn.textContent = 'Link Copied! ✓';
        setTimeout(() => {
          copyBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copy App Link
          `;
        }, 2000);
      } catch (e) {
        alert(window.location.origin);
      }
    });
  }

  // 2. Fetch Initial CSRF Token
  await fetchCsrfToken();

  // 3. Verify Active User Session
  try {
    const authRes = await api.auth.getMe();
    if (authRes.success && authRes.user) {
      appState.user = authRes.user;
    }
  } catch (err) {
    appState.user = null;
  }

  // 4. Initialize Router
  const router = new AppRouter(appState);
  appState.router = router;

  // 5. Bind Bottom Navigation Bar Click Handlers (handles .nav-item and .nav-scan-button)
  const navBar = document.getElementById('bottom-nav-bar');
  if (navBar) {
    navBar.addEventListener('click', (e) => {
      const button = e.target.closest('[data-tab]');
      if (button) {
        const tab = button.getAttribute('data-tab');
        if (tab) {
          router.navigate(tab);
        }
      }
    });
  }

  // Listen for direct URL hash changes (e.g. #scan-hub)
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace(/^#/, '');
    if (hash && hash !== router.currentView) {
      router.navigate(hash, {}, false);
    }
  });

  // Top header brand click
  const brandBtn = document.getElementById('header-brand-btn');
  if (brandBtn) {
    brandBtn.addEventListener('click', () => router.navigate(appState.user ? 'home' : 'onboarding'));
  }

  // Top header avatar click
  const avatarBtn = document.getElementById('header-avatar-btn');
  if (avatarBtn) {
    avatarBtn.addEventListener('click', () => router.navigate(appState.user ? 'profile' : 'login'));
  }

  // 6. Navigate to initial hash or default view
  const initialHash = window.location.hash.replace(/^#/, '');
  if (initialHash) {
    router.navigate(initialHash, {}, false);
  } else {
    router.navigate(appState.user ? 'home' : 'onboarding', {}, false);
  }

  // 7. Register PWA Service Worker
  if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
    try {
      const reg = await navigator.serviceWorker.register('/service-worker.js');
      console.log('✅ ServiceWorker registered with scope:', reg.scope);
    } catch (err) {
      console.warn('ServiceWorker registration skipped:', err.message);
    }
  }
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
