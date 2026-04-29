import 'package:supabase_flutter/supabase_flutter.dart';

/// Convert technical auth errors to user-friendly messages.
String friendlyAuthError(Object error) {
  if (error is AuthApiException) {
    final message = error.message.toLowerCase();
    final code = error.code?.toLowerCase() ?? '';

    if (message.contains('invalid login credentials') ||
        code == 'invalid_credentials') {
      return 'Wrong email or password. Please try again.';
    }
    if (message.contains('email not confirmed')) {
      return 'Please verify your email first. Check your inbox for the confirmation link.';
    }
    if (message.contains('user already registered') ||
        message.contains('already been registered')) {
      return 'An account with this email already exists. Try signing in instead.';
    }
    if (message.contains('password') && message.contains('weak')) {
      return 'Password is too weak. Use at least 6 characters with a mix of letters and numbers.';
    }
    if (message.contains('password') && message.contains('short')) {
      return 'Password must be at least 6 characters.';
    }
    if (message.contains('invalid email') ||
        message.contains('email_address_invalid')) {
      return 'Please enter a valid email address.';
    }
    if (message.contains('rate limit') ||
        code == 'over_email_send_rate_limit') {
      return 'Too many attempts. Please wait a few minutes and try again.';
    }
    if (message.contains('otp') || message.contains('token has expired')) {
      return 'This code has expired. Please request a new one.';
    }
  }

  if (error is AuthException) {
    final message = error.message.toLowerCase();
    if (message.contains('cancelled') || message.contains('canceled')) {
      return 'Sign in cancelled.';
    }
    if (message.contains('network') || message.contains('connection')) {
      return 'No internet connection. Please check your network and try again.';
    }
  }

  if (error is PostgrestException) {
    final message = error.message.toLowerCase();
    if (message.contains('already in this household')) {
      return "You're already in this household!";
    }
    if (message.contains('household already has 2 partners')) {
      return 'This household is already full (2 partners maximum).';
    }
    if (message.contains('household not found')) {
      return 'Invalid invite link. Please ask for a new one.';
    }
  }

  final errorString = error.toString().toLowerCase();
  if (errorString.contains('socketexception') ||
      errorString.contains('handshake') ||
      errorString.contains('connection')) {
    return 'No internet connection. Please check your network.';
  }

  return 'Something went wrong. Please try again.';
}
