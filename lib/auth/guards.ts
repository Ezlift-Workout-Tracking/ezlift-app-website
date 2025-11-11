import { redirect } from 'next/navigation';
import { getSessionToken, getUserInfo } from '@/lib/auth/session';

export interface User {
  id: string;
  email: string;
  name?: string;
}

export const requireUser = async (): Promise<User> => {
  const token = await getSessionToken();
  const userInfo = await getUserInfo();

  if (!token || !userInfo) {
    redirect('/login');
  }

  return userInfo;
};

export const requireUserOrRedirect = async (redirectTo: string): Promise<User> => {
  const token = await getSessionToken();
  const userInfo = await getUserInfo();

  if (!token || !userInfo) {
    redirect(redirectTo);
  }

  return userInfo;
};

export const getUser = async (): Promise<User | null> => {
  const token = await getSessionToken();
  const userInfo = await getUserInfo();

  if (!token || !userInfo) {
    return null;
  }

  return userInfo;
};

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getSessionToken();
  const userInfo = await getUserInfo();
  
  return !!(token && userInfo);
};

export const requireAuth = async () => {
  if (!(await isAuthenticated())) {
    redirect('/login');
  }
};

export const requireGuest = async () => {
  if (await isAuthenticated()) {
    redirect('/app');
  }
}; 