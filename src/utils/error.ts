export class AppError extends Error {
  code: string;
  isUserFacing: boolean;

  constructor(message: string, code: string, isUserFacing = true) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.isUserFacing = isUserFacing;
  }
}

export class InviteCodeError extends AppError {
  constructor(message: string) {
    super(message, 'INVITE_CODE_ERROR');
  }
}

export class AuthError extends AppError {
  constructor(message: string) {
    super(message, 'AUTH_ERROR');
  }
}

export class SubscriptionError extends AppError {
  constructor(message: string) {
    super(message, 'SUBSCRIPTION_ERROR');
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError && error.isUserFacing) {
    return error.message;
  }
  if (error instanceof Error) {
    // Map common Supabase errors to user-friendly messages
    if (error.message.includes('Invalid login credentials')) {
      return 'Incorrect email or password. Please try again.';
    }
    if (error.message.includes('User already registered')) {
      return 'An account with this email already exists.';
    }
    if (error.message.includes('Email not confirmed')) {
      return 'Please check your email to confirm your account.';
    }
    if (error.message.includes('Invalid or expired invite code')) {
      return 'This invite code is invalid or has expired. Ask your partner for a new one.';
    }
    if (error.message.includes('Cannot link with yourself')) {
      return "You can't link with your own account.";
    }
  }
  return 'Something went wrong. Please try again.';
}
