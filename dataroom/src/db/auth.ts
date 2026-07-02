import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getDB } from './db';
import type { User, AuthUser } from '@/types';

export async function registerUser(email: string, name: string, password: string): Promise<AuthUser> {
  const db = await getDB();
  const existing = await db.getFromIndex('users', 'by-email', email);
  if (existing) throw new Error('An account with this email already exists.');

  const passwordHash = await bcrypt.hash(password, 10);
  const user: User = {
    id: uuidv4(),
    email: email.trim().toLowerCase(),
    name: name.trim(),
    passwordHash,
    createdAt: Date.now(),
  };
  await db.put('users', user);
  return { id: user.id, email: user.email, name: user.name };
}

export async function loginUser(email: string, password: string): Promise<AuthUser> {
  const db = await getDB();
  const user = await db.getFromIndex('users', 'by-email', email.trim().toLowerCase());
  if (!user) throw new Error('No account found with this email.');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Incorrect password.');

  return { id: user.id, email: user.email, name: user.name };
}

const SESSION_KEY = 'dataroom_session';

export function saveSession(user: AuthUser): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function loadSession(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}
