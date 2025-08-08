export interface AuthError {
  code: string;
  message: string;
}

export const getErrorMessages = (error: any): string => {
  if (!error || !error.code) {
    return 'An unexpected error occurred. Please try again.';
  }

  const errorMap: Record<string, string> = {
    // Firebase Auth Errors
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password should be at least 6 characters long.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection and try again.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled.',
    'auth/account-exists-with-different-credential': 'An account already exists with the same email but different sign-in credentials.',
    'auth/requires-recent-login': 'Please log in again to complete this action.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    'auth/popup-blocked': 'Sign-in popup was blocked. Please allow popups for this site.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled.',
    'auth/unauthorized-domain': 'This domain is not authorized for sign-in.',
    'auth/invalid-action-code': 'Invalid password reset link. Please request a new one.',
    'auth/expired-action-code': 'Password reset link has expired. Please request a new one.',
    'auth/invalid-verification-code': 'Invalid verification code.',
    'auth/invalid-verification-id': 'Invalid verification ID.',
    'auth/missing-verification-code': 'Verification code is required.',
    'auth/missing-verification-id': 'Verification ID is required.',
    'auth/quota-exceeded': 'Service temporarily unavailable. Please try again later.',
    'auth/credential-already-in-use': 'This credential is already associated with another account.',
    'auth/timeout': 'Request timed out. Please try again.',
    'auth/invalid-phone-number': 'Invalid phone number format.',
    'auth/missing-phone-number': 'Phone number is required.',
    'auth/invalid-recaptcha-token': 'Invalid reCAPTCHA token.',
    'auth/missing-recaptcha-token': 'reCAPTCHA token is required.',
    'auth/invalid-tenant-id': 'Invalid tenant ID.',
    'auth/tenant-id-mismatch': 'Tenant ID mismatch.',
    'auth/unsupported-tenant-operation': 'This operation is not supported for this tenant.',
    'auth/invalid-login-credentials': 'Invalid login credentials.',
    'auth/user-token-expired': 'Your session has expired. Please log in again.',
    'auth/invalid-api-key': 'Invalid API key.',
    'auth/app-not-authorized': 'This app is not authorized to use Firebase Authentication.',
    'auth/user-mismatch': 'The provided user does not match the current user.',
  };

  return errorMap[error.code] || error.message || 'An unexpected error occurred. Please try again.';
};

export const isNetworkError = (error: any): boolean => {
  return error?.code === 'auth/network-request-failed' || 
         error?.code === 'auth/timeout' ||
         error?.code === 'auth/quota-exceeded';
};

export const isUserNotFoundError = (error: any): boolean => {
  return error?.code === 'auth/user-not-found';
};

export const isWrongPasswordError = (error: any): boolean => {
  return error?.code === 'auth/wrong-password' || 
         error?.code === 'auth/invalid-credential' ||
         error?.code === 'auth/invalid-login-credentials';
};

export const isEmailAlreadyInUseError = (error: any): boolean => {
  return error?.code === 'auth/email-already-in-use';
};

export const isWeakPasswordError = (error: any): boolean => {
  return error?.code === 'auth/weak-password';
};

export const isInvalidEmailError = (error: any): boolean => {
  return error?.code === 'auth/invalid-email';
};

export const isTooManyRequestsError = (error: any): boolean => {
  return error?.code === 'auth/too-many-requests';
};

export const isPopupBlockedError = (error: any): boolean => {
  return error?.code === 'auth/popup-blocked' || 
         error?.code === 'auth/popup-closed-by-user' ||
         error?.code === 'auth/cancelled-popup-request';
}; 