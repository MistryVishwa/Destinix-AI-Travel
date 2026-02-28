
import { User } from '../types';

const USERS_KEY = 'destinix_users';
const CURRENT_USER_KEY = 'destinix_current_user';

// Mock password hashing (in real life, use a real backend)
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Mock JWT generation
const generateToken = (email: string) => {
  return btoa(`header.${JSON.stringify({ email, exp: Date.now() + 3600000 })}.signature`);
};

export const register = async (name: string, email: string, password: string): Promise<User> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  
  if (users.find((u: any) => u.email === email)) {
    throw new Error('Email already registered');
  }

  const hashedPassword = await hashPassword(password);
  const newUser = { 
    id: Math.random().toString(36).substr(2, 9), 
    name, 
    email, 
    password: hashedPassword,
    phone: '',
    address: '',
    preferences: [],
    avatar: '',
    savedPackages: [],
    priceAlerts: []
  };
  
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  const userPublic: User = { 
    id: newUser.id, 
    name: newUser.name, 
    email: newUser.email, 
    phone: newUser.phone,
    address: newUser.address,
    preferences: newUser.preferences,
    avatar: newUser.avatar,
    savedPackages: newUser.savedPackages,
    priceAlerts: newUser.priceAlerts,
    token: generateToken(email) 
  };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userPublic));
  
  return userPublic;
};

export const login = async (email: string, password: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 800));

  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const user = users.find((u: any) => u.email === email);
  
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const hashedPassword = await hashPassword(password);
  if (user.password !== hashedPassword) {
    throw new Error('Invalid email or password');
  }

  const userPublic: User = { 
    id: user.id, 
    name: user.name, 
    email: user.email,
    phone: user.phone || '',
    address: user.address || '',
    preferences: user.preferences || [],
    avatar: user.avatar || '',
    savedPackages: user.savedPackages || [],
    priceAlerts: user.priceAlerts || [],
    token: generateToken(email) 
  };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userPublic));
  
  return userPublic;
};

export const updateProfile = async (userId: string, updates: Partial<User>): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const userIndex = users.findIndex((u: any) => u.id === userId);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  // Update in the "database"
  const updatedUser = { ...users[userIndex], ...updates };
  users[userIndex] = updatedUser;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  // Update current session
  const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || '{}');
  const newSession = { ...currentUser, ...updates };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newSession));

  return newSession;
};

export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const forgotPassword = async (email: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  if (!users.find((u: any) => u.email === email)) {
    throw new Error('Email not found');
  }
};
