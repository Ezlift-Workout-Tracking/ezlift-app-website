'use client';

import { OAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, getAuth, fetchSignInMethodsForEmail } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase/client';

export async function signInWithApple() {
  const auth = getAuth(firebaseApp);
  const provider = new OAuthProvider('apple.com');
  
  // Request essential scopes
  provider.addScope('email');
  provider.addScope('name');
  
  // Set custom parameters for better UX
  provider.setCustomParameters({ 
    locale: 'en_US'
  });

  try {
    // Prefer popup on desktop:
    const result = await signInWithPopup(auth, provider);
    return result;
  } catch (err: any) {
    console.log('Apple sign-in popup error:', err);
    // Fallback to redirect (Safari/iOS or popup blocked):
    if (err?.code === 'auth/popup-blocked' || 
        err?.code === 'auth/popup-closed-by-user' || 
        err?.code === 'auth/cancelled-popup-request' ||
        err?.name === 'FirebaseError') {
      console.log('Falling back to redirect for Apple sign-in');
      await signInWithRedirect(auth, provider);
      return null;
    }
    throw err;
  }
}

// Optional: call this after mount on the login page to complete redirects
export async function completeAppleRedirect() {
  const auth = getAuth(firebaseApp);
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      console.log('Apple redirect completed successfully:', result.user.email);
    }
    return result;
  } catch (error) {
    console.error('Error completing Apple redirect:', error);
    return null;
  }
}

// Handle account linking when user exists with different credential
export async function handleAccountExistsError(email: string) {
  const auth = getAuth(firebaseApp);
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email);
    return methods;
  } catch (error) {
    console.error('Error fetching sign-in methods:', error);
    return [];
  }
}

// Get user email with fallback for Apple private relay
export function getUserEmail(user: any) {
  // Primary email
  if (user?.email) return user.email;
  
  // Fallback to provider data for Apple private relay
  const appleProvider = user?.providerData?.find((p: any) => p.providerId === 'apple.com');
  if (appleProvider?.email) return appleProvider.email;
  
  // Last resort: any provider email
  return user?.providerData?.[0]?.email || '';
}
