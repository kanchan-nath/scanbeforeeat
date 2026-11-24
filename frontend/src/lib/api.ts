import { getAuthCookie, setAuthCookie } from "./auth-cookie";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getAuthCookie();
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  plan: "free" | "monthly_pro" | "six_month_saver" | "annual_pro";
  scansLimit: number;
  scansUsed: number;
  remainingScans: number;
  allergens?: string[];
  authProvider?: string;
  firebaseUid?: string;
  photoUrl?: string;
  lastLoginAt?: string;
  token?: string;
}

export interface AdditiveMonograph {
  name: string;
  functionDesc: string;
  riskLevel: "low" | "moderate" | "high";
  clinicalEvidence: string;
}

export interface DeductionItem {
  title: string;
  points: number;
  reason: string;
}

export interface AlternativeItem {
  name: string;
  score: number;
  nova: number;
  note: string;
}

export interface ProductDetail {
  barcode: string;
  name: string;
  brand: string;
  category: string;
  healthScore: number;
  novaGroup: number;
  ingredientsText: string;
  additives: AdditiveMonograph[];
  allergens: string[];
  deductions: DeductionItem[];
  alternatives: AlternativeItem[];
}

export interface ScanResponse {
  product: ProductDetail;
  quota: {
    scansLimit: number;
    scansUsed: number;
    remainingScans: number;
  };
}

export interface DuelResponse {
  product1: ProductDetail;
  product2: ProductDetail;
  scoreDelta: number;
  winner: "product1" | "product2";
  verdict: string;
}

export async function syncUserWithServer(params: {
  id: string;
  email: string;
  displayName?: string;
  plan?: string;
  authProvider?: string;
  firebaseUid?: string;
  photoUrl?: string;
}): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/auth/sync`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    credentials: "include",
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error("Failed to sync user with server");
  const data = await res.json();
  if (data.token) {
    setAuthCookie(data.token);
  }
  return data;
}

export async function sendEmailOtp(email: string): Promise<{ success: boolean; message: string; isMock?: boolean; devOtp?: string }> {
  const res = await fetch(`${API_BASE}/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to send verification email");
  }
  return data;
}

export async function verifyEmailOtp(email: string, otp: string, displayName?: string): Promise<{ success: boolean; user: UserProfile; token?: string }> {
  const res = await fetch(`${API_BASE}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, otp, displayName }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to verify code");
  }
  const token = data.token || data.user?.token;
  if (token) {
    setAuthCookie(token);
  }
  return data;
}

export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/user/profile/${encodeURIComponent(userId)}`, {
    headers: authHeaders(),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch user profile");
  return res.json();
}

export async function updateUserPlan(userId: string, plan: string): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/user/plan`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    credentials: "include",
    body: JSON.stringify({ userId, plan }),
  });
  if (!res.ok) throw new Error("Failed to update user plan");
  return res.json();
}

export interface AiStatusResponse {
  nvidiaConfigured: boolean;
  model: string;
  textModel: string;
  fallbackReady: boolean;
  engine: string;
}

export async function fetchAiStatus(): Promise<AiStatusResponse> {
  const res = await fetch(`${API_BASE}/scan/ai-status`);
  if (!res.ok) throw new Error("Failed to fetch AI telemetry status");
  return res.json();
}

export async function extractAiAnalysis(params: {
  text?: string;
  image?: string;
  imageType?: string;
  nameHint?: string;
}): Promise<ProductDetail> {
  const res = await fetch(`${API_BASE}/scan/ai-extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "AI extraction failed. Please try again.");
  }
  return res.json();
}

export async function performScan(params: {
  userId: string;
  barcode?: string;
  rawText?: string;
  image?: string;
  imageType?: string;
  nameHint?: string;
}): Promise<ScanResponse> {
  const res = await fetch(`${API_BASE}/scan`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    credentials: "include",
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Scan failed or monthly quota exceeded");
  }
  return res.json();
}

export async function fetchProduct(barcode: string): Promise<ProductDetail> {
  const res = await fetch(`${API_BASE}/products/${encodeURIComponent(barcode)}`);
  if (!res.ok) throw new Error("Product lookup failed");
  return res.json();
}

export async function performDuel(barcode1: string, barcode2: string): Promise<DuelResponse> {
  const res = await fetch(`${API_BASE}/duel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ barcode1, barcode2 }),
  });
  if (!res.ok) throw new Error("Duel computation failed");
  return res.json();
}

export async function fetchScanHistory(userId: string) {
  const res = await fetch(`${API_BASE}/user/history/${encodeURIComponent(userId)}`, {
    headers: authHeaders(),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch scan history");
  return res.json();
}

export async function fetchUserAllergens(userId: string): Promise<string[]> {
  const res = await fetch(`${API_BASE}/user/allergens/${encodeURIComponent(userId)}`, {
    headers: authHeaders(),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch user allergens");
  return res.json();
}

export async function saveUserAllergens(userId: string, allergens: string[]) {
  const res = await fetch(`${API_BASE}/user/allergens`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    credentials: "include",
    body: JSON.stringify({ userId, allergens }),
  });
  if (!res.ok) throw new Error("Failed to save allergens");
  return res.json();
}

// Pantry API
export interface PantryItem {
  id: string;
  userId: string;
  productName: string;
  category: string;
  novaGroup: number;
  healthScore: number;
  expiryDate: string;
  quantity: number;
  addedAt: string;
}

export async function fetchPantryItems(userId: string): Promise<PantryItem[]> {
  const res = await fetch(`${API_BASE}/pantry/${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error("Failed to fetch pantry items");
  return res.json();
}

export async function addPantryItem(params: {
  userId: string;
  productName: string;
  category?: string;
  novaGroup?: number;
  healthScore?: number;
  expiryDate?: string;
  quantity?: number;
}): Promise<PantryItem> {
  const res = await fetch(`${API_BASE}/pantry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error("Failed to add pantry item");
  return res.json();
}

export async function deletePantryItem(id: string) {
  const res = await fetch(`${API_BASE}/pantry/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete pantry item");
  return res.json();
}

// Shopping List API
export interface ShoppingItem {
  id: string;
  userId: string;
  productName: string;
  category: string;
  checked: number;
  addedAt: string;
}

export async function fetchShoppingItems(userId: string): Promise<ShoppingItem[]> {
  const res = await fetch(`${API_BASE}/shopping-list/${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error("Failed to fetch shopping items");
  return res.json();
}

export async function addShoppingItem(params: {
  userId: string;
  productName: string;
  category?: string;
}): Promise<ShoppingItem> {
  const res = await fetch(`${API_BASE}/shopping-list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error("Failed to add shopping item");
  return res.json();
}

export async function toggleShoppingItem(id: string) {
  const res = await fetch(`${API_BASE}/shopping-list/${encodeURIComponent(id)}/toggle`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Failed to toggle shopping item");
  return res.json();
}

export async function deleteShoppingItem(id: string) {
  const res = await fetch(`${API_BASE}/shopping-list/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete shopping item");
  return res.json();
}

// Banned Additives
export interface BannedAdditive {
  id: string;
  userId: string;
  code: string;
  name: string;
  reason?: string;
  createdAt: string;
}

export async function fetchBannedAdditives(userId: string): Promise<BannedAdditive[]> {
  const res = await fetch(`${API_BASE}/banned-additives/${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error("Failed to fetch banned additives");
  return res.json();
}

export async function addBannedAdditive(params: {
  userId: string;
  code: string;
  name: string;
  reason?: string;
}) {
  const res = await fetch(`${API_BASE}/banned-additives`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error("Failed to add banned additive");
  return res.json();
}

export async function deleteBannedAdditive(id: string) {
  const res = await fetch(`${API_BASE}/banned-additives/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete banned additive");
  return res.json();
}

// Developer API Keys
export interface ApiKeyItem {
  id: string;
  userId: string;
  name: string;
  keyPrefix: string;
  rateLimit: number;
  createdAt: string;
  fullKey?: string;
}

export async function fetchApiKeys(userId: string): Promise<ApiKeyItem[]> {
  const res = await fetch(`${API_BASE}/developer/keys/${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error("Failed to fetch API keys");
  return res.json();
}

export async function createApiKey(params: { userId: string; name: string }): Promise<ApiKeyItem> {
  const res = await fetch(`${API_BASE}/developer/keys`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error("Failed to create API key");
  return res.json();
}

export async function deleteApiKey(id: string) {
  const res = await fetch(`${API_BASE}/developer/keys/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete API key");
  return res.json();
}

// Family Profiles
export interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  allergens: string[];
  avatar?: string;
  createdAt: string;
}

export async function fetchFamilyMembers(userId: string): Promise<FamilyMember[]> {
  const res = await fetch(`${API_BASE}/family/${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error("Failed to fetch family members");
  return res.json();
}

export async function addFamilyMember(params: {
  userId: string;
  name: string;
  relationship: string;
  allergens: string[];
}): Promise<FamilyMember> {
  const res = await fetch(`${API_BASE}/family`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error("Failed to add family member");
  return res.json();
}

export async function deleteFamilyMember(id: string) {
  const res = await fetch(`${API_BASE}/family/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete family member");
  return res.json();
}

// Saved Studies
export interface SavedStudy {
  id: string;
  userId: string;
  title: string;
  doi?: string;
  journal: string;
  year: number;
  summary?: string;
  savedAt: string;
}

export async function fetchSavedStudies(userId: string): Promise<SavedStudy[]> {
  const res = await fetch(`${API_BASE}/studies/saved/${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error("Failed to fetch saved studies");
  return res.json();
}

export async function saveStudy(params: {
  userId: string;
  title: string;
  doi?: string;
  journal?: string;
  year?: number;
  summary?: string;
}): Promise<SavedStudy> {
  const res = await fetch(`${API_BASE}/studies/saved`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error("Failed to save study");
  return res.json();
}

export async function deleteSavedStudy(id: string) {
  const res = await fetch(`${API_BASE}/studies/saved/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete study");
  return res.json();
}

// Toxicological Exposure Ledger
export async function fetchExposureLedger(userId: string) {
  const res = await fetch(`${API_BASE}/exposure/${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error("Failed to fetch exposure ledger");
  return res.json();
}

// Synergies & Clean Alternatives
export async function fetchSynergies(userId: string) {
  const res = await fetch(`${API_BASE}/synergies/${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error("Failed to fetch synergies");
  return res.json();
}

export async function fetchAlternatives(userId: string) {
  const res = await fetch(`${API_BASE}/alternatives/${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error("Failed to fetch alternatives");
  return res.json();
}

// Invoices & Tax Receipts
export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  date: string;
  description: string;
  amount: number;
  gstAmount: number;
  plan: string;
  status: string;
  paymentId?: string;
}

export async function fetchInvoices(userId: string): Promise<InvoiceItem[]> {
  const res = await fetch(`${API_BASE}/user/invoices/${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error("Failed to fetch invoices");
  return res.json();
}

export function getInvoicePdfUrl(id: string): string {
  return `${API_BASE}/invoices/${encodeURIComponent(id)}/pdf`;
}

// Payments & Checkout
export async function createCheckoutOrder(userId: string, plan: string) {
  const res = await fetch(`${API_BASE}/checkout/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, plan }),
  });
  if (!res.ok) throw new Error("Failed to create order");
  return res.json();
}

export async function verifyCheckoutPayment(params: {
  userId: string;
  plan: string;
  orderId: string;
  paymentId?: string;
  signature?: string;
}) {
  const res = await fetch(`${API_BASE}/checkout/verify-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error("Payment verification failed");
  return res.json();
}

// Payment Methods
export interface PaymentCardItem {
  id: string;
  userId: string;
  brand: string;
  last4: string;
  expiry: string;
  isDefault: number;
  name: string;
}

export async function fetchPaymentMethods(userId: string): Promise<PaymentCardItem[]> {
  const res = await fetch(`${API_BASE}/user/payment-methods/${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error("Failed to fetch payment methods");
  return res.json();
}

export async function addPaymentMethod(params: {
  userId: string;
  brand?: string;
  last4: string;
  expiry?: string;
  name?: string;
}): Promise<PaymentCardItem> {
  const res = await fetch(`${API_BASE}/user/payment-methods`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error("Failed to add payment method");
  return res.json();
}

export async function setDefaultPaymentMethod(id: string) {
  const res = await fetch(`${API_BASE}/user/payment-methods/${encodeURIComponent(id)}/default`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Failed to set default payment method");
  return res.json();
}

export async function deletePaymentMethod(id: string) {
  const res = await fetch(`${API_BASE}/user/payment-methods/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete payment method");
  return res.json();
}

// Health Profile
export interface UserHealthProfile {
  userId: string;
  dietaryProtocol: string;
  riskTolerance: string;
  dailyTarget: number;
  conditions: string[];
  weightKg: number;
}

export async function fetchHealthProfile(userId: string): Promise<UserHealthProfile> {
  const res = await fetch(`${API_BASE}/user/health-profile/${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error("Failed to fetch health profile");
  return res.json();
}

export async function updateHealthProfile(userId: string, data: Partial<UserHealthProfile>) {
  const res = await fetch(`${API_BASE}/user/health-profile/${encodeURIComponent(userId)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update health profile");
  return res.json();
}

// User Sessions
export interface UserSession {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  isCurrent: number;
  lastActiveAt: string;
}

export async function fetchSessions(userId: string): Promise<UserSession[]> {
  const res = await fetch(`${API_BASE}/user/sessions/${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error("Failed to fetch sessions");
  return res.json();
}

export async function deleteSession(id: string) {
  const res = await fetch(`${API_BASE}/user/sessions/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete session");
  return res.json();
}

export async function revokeAllSessions(userId: string) {
  const res = await fetch(`${API_BASE}/user/sessions/revoke-all`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error("Failed to revoke all sessions");
  return res.json();
}

// Notification Settings
export interface NotificationSettings {
  userId: string;
  allergenAlert: number;
  synergyAlert: number;
  weeklyDigest: number;
  newStudies: number;
  quotaAlert: number;
}

export async function fetchNotifications(userId: string): Promise<NotificationSettings> {
  const res = await fetch(`${API_BASE}/user/notifications/${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

export async function updateNotifications(userId: string, data: Partial<NotificationSettings>) {
  const res = await fetch(`${API_BASE}/user/notifications/${encodeURIComponent(userId)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update notifications");
  return res.json();
}

// Developer Webhooks & Analytics
export interface DeveloperWebhook {
  id: string;
  userId: string;
  url: string;
  events: string[];
  status: string;
  secret: string;
  createdAt: string;
}

export async function fetchWebhooks(userId: string): Promise<DeveloperWebhook[]> {
  const res = await fetch(`${API_BASE}/developer/webhooks/${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error("Failed to fetch webhooks");
  return res.json();
}

export async function createWebhook(params: { userId: string; url: string; events: string[] }) {
  const res = await fetch(`${API_BASE}/developer/webhooks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error("Failed to create webhook");
  return res.json();
}

export async function deleteWebhook(id: string) {
  const res = await fetch(`${API_BASE}/developer/webhooks/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete webhook");
  return res.json();
}

export async function testWebhookPing(id: string) {
  const res = await fetch(`${API_BASE}/developer/webhooks/${encodeURIComponent(id)}/test`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Webhook ping failed");
  return res.json();
}

export async function fetchDeveloperAnalytics(userId: string) {
  const res = await fetch(`${API_BASE}/developer/analytics/${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error("Failed to fetch developer analytics");
  return res.json();
}

// Flag Product
export async function submitFlaggedProduct(params: {
  userId?: string;
  barcode: string;
  productName: string;
  brand?: string;
  ingredientsText?: string;
}) {
  const res = await fetch(`${API_BASE}/audit/flag`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error("Failed to submit flagged product");
  return res.json();
}

// GDPR Takeout & Purge
export function getDataExportUrl(userId: string, format: "json" | "csv" = "json"): string {
  return `${API_BASE}/user/export/${encodeURIComponent(userId)}?format=${format}`;
}

export async function deleteUserAccount(userId: string) {
  const res = await fetch(`${API_BASE}/user/account/${encodeURIComponent(userId)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to purge user account");
  return res.json();
}
