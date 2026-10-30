/**
 * ScanBeforeEat API Client
 * Manages same-origin communication, CSRF tokens, session credentials, and error responses.
 */

let cachedCsrfToken = null;

export async function fetchCsrfToken() {
  try {
    const res = await fetch('/api/v1/auth/csrf-token', {
      credentials: 'include',
      cache: 'no-store'
    });
    const data = await res.json();
    if (data.success && data.csrfToken) {
      cachedCsrfToken = data.csrfToken;
    }
    return cachedCsrfToken;
  } catch (err) {
    console.error('Failed to fetch CSRF token:', err);
    return null;
  }
}

export async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('/') ? endpoint : `/api/v1/${endpoint}`;
  const method = (options.method || 'GET').toUpperCase();

  const headers = {
    'Accept': 'application/json',
    ...(options.headers || {})
  };

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    if (!cachedCsrfToken) {
      await fetchCsrfToken();
    }
    if (cachedCsrfToken) {
      headers['x-csrf-token'] = cachedCsrfToken;
    }
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
  }

  const response = await fetch(url, {
    ...options,
    method,
    headers,
    credentials: 'include'
  });

  // Extract new CSRF token if returned in JSON payload
  let data;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json();
    if (data.csrfToken) {
      cachedCsrfToken = data.csrfToken;
    }
  } else {
    data = await response.text();
  }

  // Automatic retry on CSRF token mismatch or stale token
  if (response.status === 403 && data?.error && typeof data.error === 'string' && data.error.toLowerCase().includes('csrf') && !options._isCsrfRetry) {
    cachedCsrfToken = data.csrfToken || null;
    if (!cachedCsrfToken) {
      await fetchCsrfToken();
    }
    return request(endpoint, { ...options, _isCsrfRetry: true });
  }

  if (!response.ok) {
    let errorMsg = data?.error || (typeof data === 'string' ? data : `HTTP ${response.status}`);
    if (data?.details && Array.isArray(data.details) && data.details.length > 0) {
      errorMsg = data.details.map(d => d.message).join('. ');
    }
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  auth: {
    getMe: () => request('/api/v1/auth/me'),
    login: (credentials) => request('/api/v1/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => request('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    logout: () => request('/api/v1/auth/logout', { method: 'POST' }),
    changePassword: (data) => request('/api/v1/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),
    deleteAccount: (data) => request('/api/v1/auth/delete-account', { method: 'DELETE', body: JSON.stringify(data) }),
    exportData: () => request('/api/v1/auth/export')
  },
  scans: {
    create: (scanData) => request('/api/v1/scans', { method: 'POST', body: JSON.stringify(scanData) }),
    get: (id) => request(`/api/v1/scans/${id}`),
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/api/v1/scans?${q}`);
    },
    updateIngredients: (id, text) => request(`/api/v1/scans/${id}/ingredients`, {
      method: 'PATCH',
      body: JSON.stringify({ confirmedIngredientsText: text })
    }),
    analyze: (id) => request(`/api/v1/scans/${id}/analyze`, { method: 'POST' }),
    getReport: (id) => request(`/api/v1/scans/${id}/report`),
    delete: (id) => request(`/api/v1/scans/${id}`, { method: 'DELETE' }),
    clearAll: () => request('/api/v1/scans/clear-all', { method: 'DELETE' }),
    compare: (scanIds) => request('/api/v1/scans/compare', { method: 'POST', body: JSON.stringify({ scanIds }) })
  },
  products: {
    lookupBarcode: (barcode) => request(`/api/v1/products/barcode/${encodeURIComponent(barcode)}`),
    get: (id) => request(`/api/v1/products/${id}`)
  },
  user: {
    getPreferences: () => request('/api/v1/users/preferences'),
    savePreferences: (pref) => request('/api/v1/users/preferences', { method: 'PUT', body: JSON.stringify(pref) }),
    updateProfile: (profile) => request('/api/v1/users/me', { method: 'PATCH', body: JSON.stringify(profile) })
  }
};

export default api;
