import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../data/seedData';
import { storageService } from '../services/storageService';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole;
  isDemoMode: boolean;
  loginAs: (user: User) => void;
  loginWithEmail: (email: string, role?: UserRole) => Promise<boolean>;
  switchRole: (role: UserRole) => void;
  logout: () => void;
  demoUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('lablink_current_user_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // fallback
    }
    // Start unauthenticated so user gets the Login Page first
    return null;
  });

  const [isDemoMode] = useState<boolean>(true);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('lablink_current_user_v1', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('lablink_current_user_v1');
    }
  }, [currentUser]);

  const loginAs = (user: User) => {
    setCurrentUser(user);
    storageService.addAuditLog(
      user.uid,
      user.name,
      user.role,
      'USER_LOGIN',
      user.uid,
      'user',
      `Logged in as demo user: ${user.name} (${user.role})`
    );
  };

  const loginWithEmail = async (email: string, preferredRole: UserRole = 'student'): Promise<boolean> => {
    // Check if user exists in seed users
    const allUsers = storageService.getUsers();
    const existing = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (existing) {
      setCurrentUser(existing);
      return true;
    }

    // Auto-create user for hackathon demonstration
    const newUser: User = {
      uid: `user-${Date.now()}`,
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      email,
      role: preferredRole,
      department: preferredRole === 'student' ? 'Artificial Intelligence & Data Science' : 'Computer Science and Engineering',
      createdAt: new Date().toISOString(),
    };

    setCurrentUser(newUser);
    return true;
  };

  const switchRole = (newRole: UserRole) => {
    // Pick the primary user for this role
    const matched = INITIAL_USERS.find((u) => u.role === newRole) || {
      uid: `demo-${newRole}`,
      name: `Demo ${newRole.charAt(0).toUpperCase() + newRole.slice(1)}`,
      email: `${newRole}@campus.edu`,
      role: newRole,
      department: 'Engineering Division',
      createdAt: new Date().toISOString(),
    };

    loginAs(matched);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || 'student',
        isDemoMode,
        loginAs,
        loginWithEmail,
        switchRole,
        logout,
        demoUsers: INITIAL_USERS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
