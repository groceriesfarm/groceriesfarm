import { auth } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  Auth,
} from 'firebase/auth';

// Get admin email from environment - only this email can access admin panel
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@groceries-farm.com';

export interface AuthUser extends User {
  isAdmin?: boolean;
}

// Sign in with email and password
export const loginWithEmail = async (email: string, password: string): Promise<AuthUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user as AuthUser;
    
    // Check if user is admin
    user.isAdmin = email === ADMIN_EMAIL;
    
    if (!user.isAdmin) {
      // Not admin - sign out immediately
      await logoutUser();
      throw new Error('Only admin account can access this panel');
    }
    
    return user;
  } catch (error: any) {
    console.error('Login error:', error.message);
    throw error;
  }
};

// Sign out
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Logout error:', error.message);
    throw error;
  }
};

// Listen to auth state changes
export const onAuthChange = (callback: (user: AuthUser | null) => void): (() => void) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      const authUser = user as AuthUser;
      authUser.isAdmin = user.email === ADMIN_EMAIL;
      callback(authUser);
    } else {
      callback(null);
    }
  });
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Check if current user is admin
export const isCurrentUserAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.email === ADMIN_EMAIL;
};

// Get admin email (for reference)
export const getAdminEmail = (): string => {
  return ADMIN_EMAIL;
};
