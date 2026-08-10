export type UserRole = "super_admin" | "admin";

export interface AppUser {
  username: string;
  passwordHash: string; // SHA-256 hex
  role: UserRole;
  displayName: string;
}

export interface Session {
  username: string;
  role: UserRole;
  displayName: string;
  loginAt: number;
}

const USERS_KEY   = "vt_users";
const SESSION_KEY = "vt_admin_session";

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// Default credentials seeded on first run:
//   superadmin / Vimal@Super2024
//   admin      / Vimal@Admin2024
//
// To add a new user via browser console:
//   const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('password'));
//   const hash = [...new Uint8Array(h)].map(b=>b.toString(16).padStart(2,'0')).join('');
//   const users = JSON.parse(localStorage.getItem('vt_users') || '[]');
//   users.push({ username:'newuser', passwordHash: hash, role:'admin', displayName:'New User' });
//   localStorage.setItem('vt_users', JSON.stringify(users));

const SEED_USERS = [
  { username: "superadmin", password: "Vimal@Super2024", role: "super_admin" as UserRole, displayName: "Super Admin" },
  { username: "admin",      password: "Vimal@Admin2024", role: "admin"      as UserRole, displayName: "Admin"       },
];

export async function seedUsers(): Promise<void> {
  if (localStorage.getItem(USERS_KEY)) return;
  const users: AppUser[] = await Promise.all(
    SEED_USERS.map(async u => ({
      username:     u.username,
      passwordHash: await sha256(u.password),
      role:         u.role,
      displayName:  u.displayName,
    }))
  );
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getUsers(): AppUser[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); }
  catch { return []; }
}

export async function attemptLogin(username: string, password: string): Promise<Session | null> {
  const hash  = await sha256(password);
  const users = getUsers();
  const user  = users.find(u =>
    u.username.toLowerCase() === username.toLowerCase() && u.passwordHash === hash
  );
  if (!user) return null;
  const session: Session = {
    username:    user.username,
    role:        user.role,
    displayName: user.displayName,
    loginAt:     Date.now(),
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}
