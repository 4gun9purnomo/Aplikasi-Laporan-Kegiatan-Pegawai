import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getStoredUsers, addStoredLog } from '../services/storage';

interface AuthContextType {
  currentUser: User | null;
  login: (usernameOrNip: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'stabn_lkp_current_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [currentUser]);

  const login = async (usernameOrNip: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const trimmedInput = usernameOrNip.trim();
    const users = getStoredUsers();

    const user = users.find(
      (u) => (u.username.toLowerCase() === trimmedInput.toLowerCase() || u.nip === trimmedInput)
    );

    if (!user) {
      return { success: false, message: 'Username atau NIP tidak terdaftar dalam sistem.' };
    }

    if (!user.status) {
      return { success: false, message: 'Akun Anda dinonaktifkan oleh Pengelola. Silakan hubungi bagian kepegawaian.' };
    }

    if (user.password_hash !== password) {
      return { success: false, message: 'Password yang Anda masukkan salah.' };
    }

    setCurrentUser(user);
    addStoredLog({
      user_id: user.id,
      username: user.username,
      nama: user.nama,
      aktivitas: 'Login ke sistem aplikasi',
    });

    return { success: true };
  };

  const logout = () => {
    if (currentUser) {
      addStoredLog({
        user_id: currentUser.id,
        username: currentUser.username,
        nama: currentUser.nama,
        aktivitas: 'Logout dari sistem',
      });
    }
    setCurrentUser(null);
  };

  const switchUser = (userId: string) => {
    const users = getStoredUsers();
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      addStoredLog({
        user_id: found.id,
        username: found.username,
        nama: found.nama,
        aktivitas: `Ganti sesi ke ${found.nama} (${found.role})`,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, switchUser }}>
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
