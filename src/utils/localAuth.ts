import { User } from '@supabase/supabase-js';

const LOCAL_USER_KEY = 'nova_qr_local_session';
const LOCAL_USERS_DB_KEY = 'nova_qr_local_accounts';

export interface LocalAccount {
  id: string;
  email: string;
  fullName?: string;
  passwordHash?: string;
  createdAt: string;
}

/**
 * Generates a mock Supabase User object so all components (Navbar, ProfileView, cloudSync)
 * work seamlessly without changes.
 */
export function buildMockSupabaseUser(account: {
  id: string;
  email: string;
  fullName?: string;
  createdAt?: string;
}): User {
  const createdAt = account.createdAt || new Date().toISOString();
  return {
    id: account.id,
    app_metadata: {
      provider: 'email',
      providers: ['email'],
    },
    user_metadata: {
      full_name: account.fullName || account.email.split('@')[0],
      email: account.email,
    },
    aud: 'authenticated',
    confirmation_sent_at: createdAt,
    confirmed_at: createdAt,
    created_at: createdAt,
    updated_at: new Date().toISOString(),
    email: account.email,
    phone: '',
    role: 'authenticated',
    last_sign_in_at: new Date().toISOString(),
    identities: [
      {
        id: account.id,
        user_id: account.id,
        identity_data: {
          email: account.email,
          full_name: account.fullName,
        },
        provider: 'email',
        last_sign_in_at: new Date().toISOString(),
        created_at: createdAt,
        updated_at: new Date().toISOString(),
      },
    ],
    factors: [],
  } as unknown as User;
}

/**
 * Get the currently active local session if any
 */
export function getLocalUserSession(): User | null {
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && data.email) {
        return buildMockSupabaseUser(data);
      }
    }
  } catch (e) {
    console.error('Error reading local session:', e);
  }
  return null;
}

/**
 * Save active session
 */
export function setLocalUserSession(account: { id: string; email: string; fullName?: string; createdAt?: string } | null): void {
  try {
    if (!account) {
      localStorage.removeItem(LOCAL_USER_KEY);
    } else {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(account));
    }
  } catch (e) {
    console.error('Error saving local session:', e);
  }
}

/**
 * Get all registered accounts in local vault
 */
function getLocalAccounts(): LocalAccount[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_DB_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) return list;
    }
  } catch {
    // ignore
  }
  return [];
}

/**
 * Register account in local vault and log them in
 */
export function registerLocalAccount(email: string, fullName?: string): User {
  const cleanEmail = email.trim().toLowerCase();
  const accounts = getLocalAccounts();
  const existing = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

  let targetAccount: LocalAccount;

  if (existing) {
    targetAccount = {
      ...existing,
      fullName: fullName?.trim() || existing.fullName,
    };
    const updated = accounts.map((a) => (a.id === existing.id ? targetAccount : a));
    localStorage.setItem(LOCAL_USERS_DB_KEY, JSON.stringify(updated));
  } else {
    targetAccount = {
      id: 'local_usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      email: cleanEmail,
      fullName: fullName?.trim() || cleanEmail.split('@')[0],
      createdAt: new Date().toISOString(),
    };
    accounts.push(targetAccount);
    localStorage.setItem(LOCAL_USERS_DB_KEY, JSON.stringify(accounts));
  }

  setLocalUserSession(targetAccount);
  return buildMockSupabaseUser(targetAccount);
}

/**
 * Sign in locally with email
 */
export function signInLocalAccount(email: string, fullName?: string): User {
  return registerLocalAccount(email, fullName);
}

/**
 * Clear local session on sign out
 */
export function signOutLocalAccount(): void {
  setLocalUserSession(null);
}
