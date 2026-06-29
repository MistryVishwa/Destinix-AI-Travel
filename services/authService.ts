import { User } from '../types';

const CURRENT_USER_KEY = 'destinix_current_user';
const API_BASE = '/api';

export const register = async (name: string, email: string, password: string): Promise<User> => {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }

  const data = await response.json();
  const user = { ...data.user, token: data.token };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
};

export const login = async (email: string, password: string): Promise<User> => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Invalid credentials');
  }

  const data = await response.json();
  const user = { ...data.user, token: data.token };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
};

const getAuthHeaders = () => {
  const user = getCurrentUser();
  if (!user || !user.token) return {};
  return { 'Authorization': `Bearer ${user.token}`, 'Content-Type': 'application/json' };
};

export const updateProfile = async (userId: string, updates: Partial<User>): Promise<User> => {
  const response = await fetch(`${API_BASE}/user/profile`, {
    method: 'PUT',
    headers: getAuthHeaders() as any,
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    throw new Error('Failed to update profile');
  }

  const data = await response.json();
  
  // Update local session
  const currentUser = getCurrentUser();
  if (currentUser) {
    const newSession = { ...currentUser, ...data };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newSession));
    return newSession;
  }
  
  return data;
};

export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const forgotPassword = async (email: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  if (!response.ok) {
    throw new Error('Failed to send reset link');
  }
};
